-- 1. Remove anon (signed-out) grants: every policy is TO authenticated.
DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
           WHERE n.nspname='public' AND c.relkind='r'
  LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t.relname);
  END LOOP;
END $$;

-- 2. Secure stock posting
CREATE OR REPLACE FUNCTION public.post_stock_transaction(
  _org uuid,
  _item uuid,
  _store uuid,
  _type stock_txn_type,
  _quantity numeric,
  _unit_cost numeric DEFAULT NULL,
  _reason text DEFAULT NULL,
  _department uuid DEFAULT NULL,
  _destination_store uuid DEFAULT NULL,
  _related uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  perm text;
  sign int;
  qty numeric;
  cost numeric;
  bal public.stock_balances%ROWTYPE;
  new_qty numeric;
  new_avg numeric;
  ref text;
  new_id uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT public.in_org(_org) THEN RAISE EXCEPTION 'Not authorised for this organization'; END IF;
  IF _quantity IS NULL OR _quantity = 0 THEN RAISE EXCEPTION 'Quantity must be non-zero'; END IF;

  perm := CASE _type
    WHEN 'RECEIPT' THEN 'stock.receive'
    WHEN 'RETURN' THEN 'stock.receive'
    WHEN 'ISSUE' THEN 'stock.issue'
    WHEN 'TRANSFER_OUT' THEN 'stock.transfer'
    WHEN 'TRANSFER_IN' THEN 'stock.transfer'
    ELSE 'stock.adjust' END;
  IF NOT public.has_permission(perm) THEN
    RAISE EXCEPTION 'You do not have permission to post % transactions', _type;
  END IF;

  sign := CASE _type
    WHEN 'RECEIPT' THEN 1 WHEN 'RETURN' THEN 1 WHEN 'TRANSFER_IN' THEN 1 WHEN 'OPENING_BALANCE' THEN 1
    WHEN 'ISSUE' THEN -1 WHEN 'TRANSFER_OUT' THEN -1 WHEN 'BREAKAGE' THEN -1 WHEN 'LOSS' THEN -1
    ELSE 1 END;  -- ADJUSTMENT / STOCKTAKE_ADJUSTMENT / REVERSAL use the sign of _quantity

  qty := sign * _quantity;  -- signed movement

  -- verify the item and store belong to the organization
  IF NOT EXISTS (SELECT 1 FROM public.items WHERE id = _item AND organization_id = _org) THEN
    RAISE EXCEPTION 'Unknown item for this organization';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.stores WHERE id = _store AND organization_id = _org) THEN
    RAISE EXCEPTION 'Unknown store for this organization';
  END IF;

  SELECT * INTO bal FROM public.stock_balances
   WHERE organization_id = _org AND store_id = _store AND item_id = _item FOR UPDATE;

  cost := COALESCE(_unit_cost, bal.average_cost,
                   (SELECT default_unit_cost FROM public.items WHERE id = _item), 0);

  new_qty := COALESCE(bal.quantity, 0) + qty;
  IF new_qty < 0 THEN
    RAISE EXCEPTION 'Insufficient stock: % available, % requested', COALESCE(bal.quantity,0), abs(qty);
  END IF;

  IF qty > 0 THEN
    new_avg := CASE WHEN new_qty = 0 THEN cost
      ELSE ((COALESCE(bal.quantity,0) * COALESCE(bal.average_cost,0)) + (qty * cost)) / new_qty END;
  ELSE
    new_avg := COALESCE(bal.average_cost, cost);
  END IF;

  ref := public.next_transaction_reference(_org, CASE _type
    WHEN 'RECEIPT' THEN 'GRN' WHEN 'ISSUE' THEN 'ISS' WHEN 'TRANSFER_OUT' THEN 'TRF'
    WHEN 'TRANSFER_IN' THEN 'TRF' WHEN 'RETURN' THEN 'RET' WHEN 'REVERSAL' THEN 'REV'
    WHEN 'OPENING_BALANCE' THEN 'OPB' ELSE 'ADJ' END);

  INSERT INTO public.stock_ledger (
    organization_id, transaction_reference, transaction_type, item_id, store_id, department_id,
    quantity, unit_cost, total_value, balance_after, destination_store_id, user_id, reason,
    related_transaction_id, transaction_date)
  VALUES (_org, ref, _type, _item, _store, _department, qty, cost, abs(qty) * cost, new_qty,
          _destination_store, uid, _reason, _related, now())
  RETURNING id INTO new_id;

  IF bal.id IS NULL THEN
    INSERT INTO public.stock_balances (organization_id, store_id, item_id, quantity, average_cost, total_value)
    VALUES (_org, _store, _item, new_qty, new_avg, new_qty * new_avg);
  ELSE
    UPDATE public.stock_balances
       SET quantity = new_qty, average_cost = new_avg, total_value = new_qty * new_avg, updated_at = now()
     WHERE id = bal.id;
  END IF;

  INSERT INTO public.audit_logs (organization_id, user_id, action, entity_type, entity_id, after_data)
  VALUES (_org, uid, 'STOCK_' || _type::text, 'stock_ledger', new_id,
          jsonb_build_object('reference', ref, 'quantity', qty, 'balance_after', new_qty, 'unit_cost', cost));

  RETURN new_id;
END $$;

REVOKE ALL ON FUNCTION public.post_stock_transaction(uuid,uuid,uuid,stock_txn_type,numeric,numeric,text,uuid,uuid,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.post_stock_transaction(uuid,uuid,uuid,stock_txn_type,numeric,numeric,text,uuid,uuid,uuid) TO authenticated, service_role;

-- 3. Reversal only - never edit history
CREATE OR REPLACE FUNCTION public.reverse_stock_transaction(_transaction uuid, _reason text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t public.stock_ledger%ROWTYPE;
BEGIN
  SELECT * INTO t FROM public.stock_ledger WHERE id = _transaction;
  IF t.id IS NULL THEN RAISE EXCEPTION 'Transaction not found'; END IF;
  IF NOT public.in_org(t.organization_id) THEN RAISE EXCEPTION 'Not authorised for this organization'; END IF;
  IF NOT public.has_permission('stock.adjust') THEN RAISE EXCEPTION 'You do not have permission to reverse transactions'; END IF;
  IF EXISTS (SELECT 1 FROM public.stock_ledger WHERE related_transaction_id = _transaction AND transaction_type = 'REVERSAL') THEN
    RAISE EXCEPTION 'This transaction has already been reversed';
  END IF;
  RETURN public.post_stock_transaction(
    t.organization_id, t.item_id, t.store_id, 'REVERSAL', -t.quantity, t.unit_cost,
    COALESCE(_reason, 'Reversal of ' || t.transaction_reference), t.department_id, NULL, t.id);
END $$;

REVOKE ALL ON FUNCTION public.reverse_stock_transaction(uuid,text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.reverse_stock_transaction(uuid,text) TO authenticated, service_role;

-- 4. Server-side audit trail for master data
CREATE OR REPLACE FUNCTION public.log_entity_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE org uuid; act text; eid uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    org := (to_jsonb(OLD) ->> 'organization_id')::uuid; act := 'DELETE'; eid := (to_jsonb(OLD) ->> 'id')::uuid;
  ELSE
    org := (to_jsonb(NEW) ->> 'organization_id')::uuid; act := TG_OP; eid := (to_jsonb(NEW) ->> 'id')::uuid;
  END IF;
  IF TG_TABLE_NAME = 'organizations' THEN org := eid; END IF;

  INSERT INTO public.audit_logs (organization_id, user_id, action, entity_type, entity_id, before_data, after_data)
  VALUES (org, auth.uid(), act, TG_TABLE_NAME, eid,
          CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
          CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END);
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END $$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['items','departments','stores','categories','suppliers','units_of_measure','organizations','user_roles']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_audit_%1$s ON public.%1$I', t);
    EXECUTE format('CREATE TRIGGER trg_audit_%1$s AFTER INSERT OR UPDATE OR DELETE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.log_entity_change()', t);
  END LOOP;
END $$;