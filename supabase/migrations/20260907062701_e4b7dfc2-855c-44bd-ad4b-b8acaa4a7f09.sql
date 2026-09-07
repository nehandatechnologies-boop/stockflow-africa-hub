
-- ============ ENUMS ============
CREATE TYPE public.doc_status AS ENUM ('DRAFT','SUBMITTED','APPROVED','PARTIALLY_APPROVED','REJECTED','PARTIALLY_RECEIVED','RECEIVED','PARTIALLY_ISSUED','ISSUED','IN_TRANSIT','COMPLETED','CANCELLED');
CREATE TYPE public.incident_type AS ENUM ('BREAKAGE','DAMAGE','EXPIRED','SPOILT','THEFT','UNEXPLAINED_LOSS','OTHER');
CREATE TYPE public.coupon_status AS ENUM ('AVAILABLE','ISSUED','REDEEMED','CANCELLED','EXPIRED','LOST');
CREATE TYPE public.asset_status AS ENUM ('ACTIVE','IN_REPAIR','DAMAGED','LOST','DISPOSED','TRANSFERRED');

-- ============ ORG SETTINGS ============
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS valuation_method text NOT NULL DEFAULT 'WEIGHTED_AVERAGE',
  ADD COLUMN IF NOT EXISTS allow_negative_stock boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS fiscal_year_start_month int NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'starter';

ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS preferred_supplier_id uuid REFERENCES public.suppliers(id),
  ADD COLUMN IF NOT EXISTS notes text;

-- ============ REFERENCE NUMBER TRIGGER ============
CREATE OR REPLACE FUNCTION public.assign_document_number()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE col text := TG_ARGV[0]; prefix text := TG_ARGV[1]; cur text; rec jsonb;
BEGIN
  rec := to_jsonb(NEW);
  cur := rec ->> col;
  IF cur IS NULL OR cur = '' THEN
    rec := jsonb_set(rec, ARRAY[col], to_jsonb(public.next_transaction_reference((rec->>'organization_id')::uuid, prefix)));
    NEW := jsonb_populate_record(NEW, rec);
  END IF;
  RETURN NEW;
END $$;

-- ============ PROCUREMENT ============
CREATE TABLE public.purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  po_number text,
  supplier_id uuid REFERENCES public.suppliers(id),
  order_date date NOT NULL DEFAULT current_date,
  expected_date date,
  requested_by uuid REFERENCES public.profiles(id),
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamptz,
  rejection_reason text,
  status public.doc_status NOT NULL DEFAULT 'DRAFT',
  total_amount numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, po_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_orders TO authenticated;
GRANT ALL ON public.purchase_orders TO service_role;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  purchase_order_id uuid NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.items(id),
  quantity numeric NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL DEFAULT 0,
  received_quantity numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_order_items TO authenticated;
GRANT ALL ON public.purchase_order_items TO service_role;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.goods_received_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  grn_number text,
  purchase_order_id uuid REFERENCES public.purchase_orders(id),
  supplier_id uuid REFERENCES public.suppliers(id),
  store_id uuid NOT NULL REFERENCES public.stores(id),
  received_date date NOT NULL DEFAULT current_date,
  received_by uuid REFERENCES public.profiles(id),
  checked_by uuid REFERENCES public.profiles(id),
  status public.doc_status NOT NULL DEFAULT 'DRAFT',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, grn_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goods_received_notes TO authenticated;
GRANT ALL ON public.goods_received_notes TO service_role;
ALTER TABLE public.goods_received_notes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.grn_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  grn_id uuid NOT NULL REFERENCES public.goods_received_notes(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.items(id),
  ordered_quantity numeric NOT NULL DEFAULT 0,
  received_quantity numeric NOT NULL CHECK (received_quantity >= 0),
  rejected_quantity numeric NOT NULL DEFAULT 0,
  unit_cost numeric NOT NULL DEFAULT 0,
  batch_number text,
  expiry_date date,
  condition text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.grn_items TO authenticated;
GRANT ALL ON public.grn_items TO service_role;
ALTER TABLE public.grn_items ENABLE ROW LEVEL SECURITY;

-- ============ REQUISITIONS ============
CREATE TABLE public.requisitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  requisition_number text,
  department_id uuid REFERENCES public.departments(id),
  source_store_id uuid REFERENCES public.stores(id),
  destination_store_id uuid REFERENCES public.stores(id),
  requested_by uuid REFERENCES public.profiles(id),
  required_date date,
  purpose text,
  priority text NOT NULL DEFAULT 'normal',
  status public.doc_status NOT NULL DEFAULT 'DRAFT',
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, requisition_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.requisitions TO authenticated;
GRANT ALL ON public.requisitions TO service_role;
ALTER TABLE public.requisitions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.requisition_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  requisition_id uuid NOT NULL REFERENCES public.requisitions(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.items(id),
  requested_quantity numeric NOT NULL CHECK (requested_quantity > 0),
  approved_quantity numeric,
  issued_quantity numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.requisition_items TO authenticated;
GRANT ALL ON public.requisition_items TO service_role;
ALTER TABLE public.requisition_items ENABLE ROW LEVEL SECURITY;

-- ============ TRANSFERS ============
CREATE TABLE public.stock_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  transfer_number text,
  source_store_id uuid NOT NULL REFERENCES public.stores(id),
  destination_store_id uuid NOT NULL REFERENCES public.stores(id),
  status public.doc_status NOT NULL DEFAULT 'DRAFT',
  requested_by uuid REFERENCES public.profiles(id),
  approved_by uuid REFERENCES public.profiles(id),
  dispatched_at timestamptz,
  received_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, transfer_number),
  CHECK (source_store_id <> destination_store_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_transfers TO authenticated;
GRANT ALL ON public.stock_transfers TO service_role;
ALTER TABLE public.stock_transfers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.stock_transfer_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  transfer_id uuid NOT NULL REFERENCES public.stock_transfers(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.items(id),
  requested_quantity numeric NOT NULL CHECK (requested_quantity > 0),
  dispatched_quantity numeric NOT NULL DEFAULT 0,
  received_quantity numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_transfer_items TO authenticated;
GRANT ALL ON public.stock_transfer_items TO service_role;
ALTER TABLE public.stock_transfer_items ENABLE ROW LEVEL SECURITY;

-- ============ RETURNS ============
CREATE TABLE public.stock_returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  return_number text,
  from_store_id uuid REFERENCES public.stores(id),
  to_store_id uuid NOT NULL REFERENCES public.stores(id),
  item_id uuid NOT NULL REFERENCES public.items(id),
  quantity numeric NOT NULL CHECK (quantity > 0),
  condition text,
  reason text,
  returned_by uuid REFERENCES public.profiles(id),
  status public.doc_status NOT NULL DEFAULT 'DRAFT',
  posted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, return_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_returns TO authenticated;
GRANT ALL ON public.stock_returns TO service_role;
ALTER TABLE public.stock_returns ENABLE ROW LEVEL SECURITY;

-- ============ BREAKAGES & LOSSES ============
CREATE TABLE public.stock_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  reference text,
  store_id uuid NOT NULL REFERENCES public.stores(id),
  item_id uuid NOT NULL REFERENCES public.items(id),
  quantity numeric NOT NULL CHECK (quantity > 0),
  incident_type public.incident_type NOT NULL DEFAULT 'BREAKAGE',
  description text,
  reported_by uuid REFERENCES public.profiles(id),
  status public.doc_status NOT NULL DEFAULT 'SUBMITTED',
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamptz,
  rejection_reason text,
  attachment_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, reference)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_incidents TO authenticated;
GRANT ALL ON public.stock_incidents TO service_role;
ALTER TABLE public.stock_incidents ENABLE ROW LEVEL SECURITY;

-- ============ STOCKTAKE ============
CREATE TABLE public.stocktakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  reference text,
  store_id uuid NOT NULL REFERENCES public.stores(id),
  status public.doc_status NOT NULL DEFAULT 'DRAFT',
  started_by uuid REFERENCES public.profiles(id),
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, reference)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stocktakes TO authenticated;
GRANT ALL ON public.stocktakes TO service_role;
ALTER TABLE public.stocktakes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.stocktake_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  stocktake_id uuid NOT NULL REFERENCES public.stocktakes(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.items(id),
  system_quantity numeric NOT NULL DEFAULT 0,
  physical_quantity numeric,
  unit_cost numeric NOT NULL DEFAULT 0,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (stocktake_id, item_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stocktake_items TO authenticated;
GRANT ALL ON public.stocktake_items TO service_role;
ALTER TABLE public.stocktake_items ENABLE ROW LEVEL SECURITY;

-- ============ FUEL ============
CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  registration_number text NOT NULL,
  name text,
  department_id uuid REFERENCES public.departments(id),
  status public.entity_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, registration_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.fuel_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  coupon_number text,
  vehicle_id uuid REFERENCES public.vehicles(id),
  driver_name text,
  department_id uuid REFERENCES public.departments(id),
  fuel_type text NOT NULL DEFAULT 'diesel',
  litres numeric NOT NULL DEFAULT 0,
  value numeric NOT NULL DEFAULT 0,
  issue_date date,
  redemption_date date,
  fuel_station text,
  odometer_reading numeric,
  authorized_by uuid REFERENCES public.profiles(id),
  issued_by uuid REFERENCES public.profiles(id),
  status public.coupon_status NOT NULL DEFAULT 'AVAILABLE',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, coupon_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fuel_coupons TO authenticated;
GRANT ALL ON public.fuel_coupons TO service_role;
ALTER TABLE public.fuel_coupons ENABLE ROW LEVEL SECURITY;

-- ============ ASSETS ============
CREATE TABLE public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_number text,
  name text NOT NULL,
  category_id uuid REFERENCES public.categories(id),
  serial_number text,
  purchase_date date,
  purchase_cost numeric NOT NULL DEFAULT 0,
  supplier_id uuid REFERENCES public.suppliers(id),
  location text,
  department_id uuid REFERENCES public.departments(id),
  assigned_to uuid REFERENCES public.profiles(id),
  condition text,
  warranty_expiry date,
  status public.asset_status NOT NULL DEFAULT 'ACTIVE',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, asset_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assets TO authenticated;
GRANT ALL ON public.assets TO service_role;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.asset_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  notes text,
  performed_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.asset_events TO authenticated;
GRANT ALL ON public.asset_events TO service_role;
ALTER TABLE public.asset_events ENABLE ROW LEVEL SECURITY;

-- ============ NOTIFICATIONS & ATTACHMENTS ============
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  category text NOT NULL DEFAULT 'general',
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  uploaded_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.attachments TO authenticated;
GRANT ALL ON public.attachments TO service_role;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- ============ INDEXES ============
CREATE INDEX idx_po_org ON public.purchase_orders(organization_id, status);
CREATE INDEX idx_poi_po ON public.purchase_order_items(purchase_order_id);
CREATE INDEX idx_grn_org ON public.goods_received_notes(organization_id, status);
CREATE INDEX idx_grni_grn ON public.grn_items(grn_id);
CREATE INDEX idx_req_org ON public.requisitions(organization_id, status);
CREATE INDEX idx_reqi_req ON public.requisition_items(requisition_id);
CREATE INDEX idx_trf_org ON public.stock_transfers(organization_id, status);
CREATE INDEX idx_trfi_trf ON public.stock_transfer_items(transfer_id);
CREATE INDEX idx_ret_org ON public.stock_returns(organization_id, status);
CREATE INDEX idx_inc_org ON public.stock_incidents(organization_id, status);
CREATE INDEX idx_stk_org ON public.stocktakes(organization_id, status);
CREATE INDEX idx_stki_stk ON public.stocktake_items(stocktake_id);
CREATE INDEX idx_fuel_org ON public.fuel_coupons(organization_id, status);
CREATE INDEX idx_assets_org ON public.assets(organization_id, status);
CREATE INDEX idx_notif_user ON public.notifications(user_id, read_at);
CREATE INDEX idx_attach_entity ON public.attachments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_ledger_org_date ON public.stock_ledger(organization_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_item_store ON public.stock_ledger(item_id, store_id);
CREATE INDEX IF NOT EXISTS idx_balances_org ON public.stock_balances(organization_id, store_id);

-- ============ RLS POLICIES ============
-- header documents: read within org, write with matching permission
CREATE POLICY po_select ON public.purchase_orders FOR SELECT TO authenticated USING (public.in_org(organization_id) OR public.is_supreme_admin());
CREATE POLICY po_insert ON public.purchase_orders FOR INSERT TO authenticated WITH CHECK (public.in_org(organization_id) AND public.has_permission('procurement.create'));
CREATE POLICY po_update ON public.purchase_orders FOR UPDATE TO authenticated USING (public.in_org(organization_id) AND public.has_permission('procurement.create')) WITH CHECK (public.in_org(organization_id));
CREATE POLICY po_delete ON public.purchase_orders FOR DELETE TO authenticated USING (public.in_org(organization_id) AND public.has_permission('procurement.create') AND status = 'DRAFT');

CREATE POLICY poi_select ON public.purchase_order_items FOR SELECT TO authenticated USING (public.in_org(organization_id) OR public.is_supreme_admin());
CREATE POLICY poi_write ON public.purchase_order_items FOR ALL TO authenticated USING (public.in_org(organization_id) AND public.has_permission('procurement.create')) WITH CHECK (public.in_org(organization_id) AND public.has_permission('procurement.create'));

CREATE POLICY grn_select ON public.goods_received_notes FOR SELECT TO authenticated USING (public.in_org(organization_id) OR public.is_supreme_admin());
CREATE POLICY grn_insert ON public.goods_received_notes FOR INSERT TO authenticated WITH CHECK (public.in_org(organization_id) AND public.has_permission('stock.receive'));
CREATE POLICY grn_update ON public.goods_received_notes FOR UPDATE TO authenticated USING (public.in_org(organization_id) AND public.has_permission('stock.receive') AND status = 'DRAFT') WITH CHECK (public.in_org(organization_id));
CREATE POLICY grn_delete ON public.goods_received_notes FOR DELETE TO authenticated USING (public.in_org(organization_id) AND public.has_permission('stock.receive') AND status = 'DRAFT');

CREATE POLICY grni_select ON public.grn_items FOR SELECT TO authenticated USING (public.in_org(organization_id) OR public.is_supreme_admin());
CREATE POLICY grni_write ON public.grn_items FOR ALL TO authenticated USING (public.in_org(organization_id) AND public.has_permission('stock.receive')) WITH CHECK (public.in_org(organization_id) AND public.has_permission('stock.receive'));

CREATE POLICY req_select ON public.requisitions FOR SELECT TO authenticated USING (public.in_org(organization_id) OR public.is_supreme_admin());
CREATE POLICY req_insert ON public.requisitions FOR INSERT TO authenticated WITH CHECK (public.in_org(organization_id) AND public.has_permission('requisition.create'));
CREATE POLICY req_update ON public.requisitions FOR UPDATE TO authenticated USING (public.in_org(organization_id) AND public.has_permission('requisition.create') AND status IN ('DRAFT','SUBMITTED')) WITH CHECK (public.in_org(organization_id));
CREATE POLICY req_delete ON public.requisitions FOR DELETE TO authenticated USING (public.in_org(organization_id) AND public.has_permission('requisition.create') AND status = 'DRAFT');

CREATE POLICY reqi_select ON public.requisition_items FOR SELECT TO authenticated USING (public.in_org(organization_id) OR public.is_supreme_admin());
CREATE POLICY reqi_write ON public.requisition_items FOR ALL TO authenticated USING (public.in_org(organization_id) AND public.has_permission('requisition.create')) WITH CHECK (public.in_org(organization_id) AND public.has_permission('requisition.create'));

CREATE POLICY trf_select ON public.stock_transfers FOR SELECT TO authenticated USING (public.in_org(organization_id) OR public.is_supreme_admin());
CREATE POLICY trf_insert ON public.stock_transfers FOR INSERT TO authenticated WITH CHECK (public.in_org(organization_id) AND public.has_permission('stock.transfer'));
CREATE POLICY trf_update ON public.stock_transfers FOR UPDATE TO authenticated USING (public.in_org(organization_id) AND public.has_permission('stock.transfer') AND status = 'DRAFT') WITH CHECK (public.in_org(organization_id));
CREATE POLICY trf_delete ON public.stock_transfers FOR DELETE TO authenticated USING (public.in_org(organization_id) AND public.has_permission('stock.transfer') AND status = 'DRAFT');

CREATE POLICY trfi_select ON public.stock_transfer_items FOR SELECT TO authenticated USING (public.in_org(organization_id) OR public.is_supreme_admin());
CREATE POLICY trfi_write ON public.stock_transfer_items FOR ALL TO authenticated USING (public.in_org(organization_id) AND public.has_permission('stock.transfer')) WITH CHECK (public.in_org(organization_id) AND public.has_permission('stock.transfer'));

CREATE POLICY ret_select ON public.stock_returns FOR SELECT TO authenticated USING (public.in_org(organization_id) OR public.is_supreme_admin());
CREATE POLICY ret_insert ON public.stock_returns FOR INSERT TO authenticated WITH CHECK (public.in_org(organization_id) AND public.has_permission('stock.receive'));
CREATE POLICY ret_update ON public.stock_returns FOR UPDATE TO authenticated USING (public.in_org(organization_id) AND public.has_permission('stock.receive') AND status = 'DRAFT') WITH CHECK (public.in_org(organization_id));
CREATE POLICY ret_delete ON public.stock_returns FOR DELETE TO authenticated USING (public.in_org(organization_id) AND public.has_permission('stock.receive') AND status = 'DRAFT');

CREATE POLICY inc_select ON public.stock_incidents FOR SELECT TO authenticated USING (public.in_org(organization_id) OR public.is_supreme_admin());
CREATE POLICY inc_insert ON public.stock_incidents FOR INSERT TO authenticated WITH CHECK (public.in_org(organization_id) AND public.has_permission('inventory.view'));
CREATE POLICY inc_update ON public.stock_incidents FOR UPDATE TO authenticated USING (public.in_org(organization_id) AND public.has_permission('inventory.view') AND status = 'SUBMITTED') WITH CHECK (public.in_org(organization_id));

CREATE POLICY stk_select ON public.stocktakes FOR SELECT TO authenticated USING (public.in_org(organization_id) OR public.is_supreme_admin());
CREATE POLICY stk_insert ON public.stocktakes FOR INSERT TO authenticated WITH CHECK (public.in_org(organization_id) AND public.has_permission('stocktake.create'));
CREATE POLICY stk_update ON public.stocktakes FOR UPDATE TO authenticated USING (public.in_org(organization_id) AND public.has_permission('stocktake.create') AND status = 'DRAFT') WITH CHECK (public.in_org(organization_id));
CREATE POLICY stk_delete ON public.stocktakes FOR DELETE TO authenticated USING (public.in_org(organization_id) AND public.has_permission('stocktake.create') AND status = 'DRAFT');

CREATE POLICY stki_select ON public.stocktake_items FOR SELECT TO authenticated USING (public.in_org(organization_id) OR public.is_supreme_admin());
CREATE POLICY stki_write ON public.stocktake_items FOR ALL TO authenticated USING (public.in_org(organization_id) AND public.has_permission('stocktake.create')) WITH CHECK (public.in_org(organization_id) AND public.has_permission('stocktake.create'));

CREATE POLICY veh_select ON public.vehicles FOR SELECT TO authenticated USING (public.in_org(organization_id) OR public.is_supreme_admin());
CREATE POLICY veh_write ON public.vehicles FOR ALL TO authenticated USING (public.in_org(organization_id) AND public.has_permission('fuel.manage')) WITH CHECK (public.in_org(organization_id) AND public.has_permission('fuel.manage'));

CREATE POLICY fuel_select ON public.fuel_coupons FOR SELECT TO authenticated USING (public.in_org(organization_id) OR public.is_supreme_admin());
CREATE POLICY fuel_write ON public.fuel_coupons FOR ALL TO authenticated USING (public.in_org(organization_id) AND public.has_permission('fuel.manage')) WITH CHECK (public.in_org(organization_id) AND public.has_permission('fuel.manage'));

CREATE POLICY ast_select ON public.assets FOR SELECT TO authenticated USING (public.in_org(organization_id) OR public.is_supreme_admin());
CREATE POLICY ast_write ON public.assets FOR ALL TO authenticated USING (public.in_org(organization_id) AND public.has_permission('assets.manage')) WITH CHECK (public.in_org(organization_id) AND public.has_permission('assets.manage'));

CREATE POLICY aste_select ON public.asset_events FOR SELECT TO authenticated USING (public.in_org(organization_id) OR public.is_supreme_admin());
CREATE POLICY aste_insert ON public.asset_events FOR INSERT TO authenticated WITH CHECK (public.in_org(organization_id) AND public.has_permission('assets.manage'));

CREATE POLICY notif_select ON public.notifications FOR SELECT TO authenticated USING (public.in_org(organization_id) AND (user_id IS NULL OR user_id = auth.uid()));
CREATE POLICY notif_update ON public.notifications FOR UPDATE TO authenticated USING (public.in_org(organization_id) AND user_id = auth.uid()) WITH CHECK (public.in_org(organization_id) AND user_id = auth.uid());
CREATE POLICY notif_insert ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.in_org(organization_id));

CREATE POLICY att_select ON public.attachments FOR SELECT TO authenticated USING (public.in_org(organization_id) OR public.is_supreme_admin());
CREATE POLICY att_insert ON public.attachments FOR INSERT TO authenticated WITH CHECK (public.in_org(organization_id) AND uploaded_by = auth.uid());
CREATE POLICY att_delete ON public.attachments FOR DELETE TO authenticated USING (public.in_org(organization_id) AND uploaded_by = auth.uid());

-- ============ TRIGGERS: numbering, updated_at, audit ============
CREATE TRIGGER n_po BEFORE INSERT ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.assign_document_number('po_number','PO');
CREATE TRIGGER n_grn BEFORE INSERT ON public.goods_received_notes FOR EACH ROW EXECUTE FUNCTION public.assign_document_number('grn_number','GRN');
CREATE TRIGGER n_req BEFORE INSERT ON public.requisitions FOR EACH ROW EXECUTE FUNCTION public.assign_document_number('requisition_number','REQ');
CREATE TRIGGER n_trf BEFORE INSERT ON public.stock_transfers FOR EACH ROW EXECUTE FUNCTION public.assign_document_number('transfer_number','TRF');
CREATE TRIGGER n_ret BEFORE INSERT ON public.stock_returns FOR EACH ROW EXECUTE FUNCTION public.assign_document_number('return_number','RET');
CREATE TRIGGER n_inc BEFORE INSERT ON public.stock_incidents FOR EACH ROW EXECUTE FUNCTION public.assign_document_number('reference','BRK');
CREATE TRIGGER n_stk BEFORE INSERT ON public.stocktakes FOR EACH ROW EXECUTE FUNCTION public.assign_document_number('reference','STK');
CREATE TRIGGER n_fuel BEFORE INSERT ON public.fuel_coupons FOR EACH ROW EXECUTE FUNCTION public.assign_document_number('coupon_number','FUEL');
CREATE TRIGGER n_ast BEFORE INSERT ON public.assets FOR EACH ROW EXECUTE FUNCTION public.assign_document_number('asset_number','AST');

CREATE TRIGGER u_po BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER u_grn BEFORE UPDATE ON public.goods_received_notes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER u_req BEFORE UPDATE ON public.requisitions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER u_trf BEFORE UPDATE ON public.stock_transfers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER u_ret BEFORE UPDATE ON public.stock_returns FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER u_inc BEFORE UPDATE ON public.stock_incidents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER u_stk BEFORE UPDATE ON public.stocktakes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER u_fuel BEFORE UPDATE ON public.fuel_coupons FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER u_ast BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER u_veh BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER a_po AFTER INSERT OR UPDATE OR DELETE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.log_entity_change();
CREATE TRIGGER a_grn AFTER INSERT OR UPDATE OR DELETE ON public.goods_received_notes FOR EACH ROW EXECUTE FUNCTION public.log_entity_change();
CREATE TRIGGER a_req AFTER INSERT OR UPDATE OR DELETE ON public.requisitions FOR EACH ROW EXECUTE FUNCTION public.log_entity_change();
CREATE TRIGGER a_trf AFTER INSERT OR UPDATE OR DELETE ON public.stock_transfers FOR EACH ROW EXECUTE FUNCTION public.log_entity_change();
CREATE TRIGGER a_ret AFTER INSERT OR UPDATE OR DELETE ON public.stock_returns FOR EACH ROW EXECUTE FUNCTION public.log_entity_change();
CREATE TRIGGER a_inc AFTER INSERT OR UPDATE OR DELETE ON public.stock_incidents FOR EACH ROW EXECUTE FUNCTION public.log_entity_change();
CREATE TRIGGER a_stk AFTER INSERT OR UPDATE OR DELETE ON public.stocktakes FOR EACH ROW EXECUTE FUNCTION public.log_entity_change();
CREATE TRIGGER a_fuel AFTER INSERT OR UPDATE OR DELETE ON public.fuel_coupons FOR EACH ROW EXECUTE FUNCTION public.log_entity_change();
CREATE TRIGGER a_ast AFTER INSERT OR UPDATE OR DELETE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.log_entity_change();
CREATE TRIGGER a_veh AFTER INSERT OR UPDATE OR DELETE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.log_entity_change();

-- ============ PERMISSIONS ============
INSERT INTO public.role_permissions (role, permission) VALUES
  ('org_admin','procurement.create'), ('org_admin','procurement.approve'),
  ('org_admin','requisition.create'), ('org_admin','requisition.approve'),
  ('org_admin','fuel.manage'), ('org_admin','assets.manage'), ('org_admin','stocktake.approve'),
  ('central_store_manager','procurement.create'), ('central_store_manager','requisition.approve'),
  ('central_store_manager','requisition.create'), ('central_store_manager','fuel.manage'),
  ('central_store_manager','assets.manage'), ('central_store_manager','stocktake.approve'),
  ('store_clerk','requisition.create'),
  ('department_head','requisition.create'), ('department_head','requisition.approve'),
  ('finance','procurement.approve')
ON CONFLICT DO NOTHING;

-- ============ NOTIFICATION HELPER ============
CREATE OR REPLACE FUNCTION public.notify_permission(_org uuid, _permission text, _title text, _body text, _category text, _entity_type text, _entity_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (organization_id, user_id, title, body, category, entity_type, entity_id)
  SELECT _org, p.id, _title, _body, _category, _entity_type, _entity_id
  FROM public.profiles p
  WHERE p.organization_id = _org
    AND EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.role_permissions rp ON rp.role = ur.role
                WHERE ur.user_id = p.id AND rp.permission = _permission);
END $$;
REVOKE ALL ON FUNCTION public.notify_permission(uuid,text,text,text,text,text,uuid) FROM public, anon, authenticated;

-- ============ WORKFLOW RPCs ============
CREATE OR REPLACE FUNCTION public.submit_document(_table text, _id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE org uuid;
BEGIN
  IF _table NOT IN ('purchase_orders','requisitions','stock_transfers','stocktakes') THEN
    RAISE EXCEPTION 'Unsupported document';
  END IF;
  EXECUTE format('SELECT organization_id FROM public.%I WHERE id = $1', _table) INTO org USING _id;
  IF org IS NULL THEN RAISE EXCEPTION 'Document not found'; END IF;
  IF NOT public.in_org(org) THEN RAISE EXCEPTION 'Not authorised for this organization'; END IF;
  EXECUTE format('UPDATE public.%I SET status = ''SUBMITTED'' WHERE id = $1 AND status = ''DRAFT''', _table) USING _id;
  PERFORM public.notify_permission(org, 'procurement.approve', 'Approval required', 'A document was submitted for approval.', 'approval', _table, _id);
END $$;

CREATE OR REPLACE FUNCTION public.approve_purchase_order(_po uuid, _approve boolean, _reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p public.purchase_orders%ROWTYPE; uid uuid := auth.uid();
BEGIN
  SELECT * INTO p FROM public.purchase_orders WHERE id = _po;
  IF p.id IS NULL THEN RAISE EXCEPTION 'Purchase order not found'; END IF;
  IF NOT public.in_org(p.organization_id) THEN RAISE EXCEPTION 'Not authorised for this organization'; END IF;
  IF NOT public.has_permission('procurement.approve') THEN RAISE EXCEPTION 'You do not have permission to approve purchase orders'; END IF;
  IF p.status <> 'SUBMITTED' THEN RAISE EXCEPTION 'Only submitted purchase orders can be decided'; END IF;
  IF p.requested_by = uid AND NOT public.has_role(uid, 'org_admin') THEN
    RAISE EXCEPTION 'You cannot approve a purchase order you raised';
  END IF;
  UPDATE public.purchase_orders
     SET status = CASE WHEN _approve THEN 'APPROVED'::public.doc_status ELSE 'REJECTED'::public.doc_status END,
         approved_by = uid, approved_at = now(), rejection_reason = CASE WHEN _approve THEN NULL ELSE _reason END
   WHERE id = _po;
  INSERT INTO public.audit_logs (organization_id, user_id, action, entity_type, entity_id)
  VALUES (p.organization_id, uid, CASE WHEN _approve THEN 'APPROVE' ELSE 'REJECT' END, 'purchase_orders', _po);
END $$;

CREATE OR REPLACE FUNCTION public.post_goods_received_note(_grn uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE g public.goods_received_notes%ROWTYPE; r record; uid uuid := auth.uid(); remaining numeric;
BEGIN
  SELECT * INTO g FROM public.goods_received_notes WHERE id = _grn;
  IF g.id IS NULL THEN RAISE EXCEPTION 'Goods received note not found'; END IF;
  IF NOT public.in_org(g.organization_id) THEN RAISE EXCEPTION 'Not authorised for this organization'; END IF;
  IF NOT public.has_permission('stock.receive') THEN RAISE EXCEPTION 'You do not have permission to receive stock'; END IF;
  IF g.status <> 'DRAFT' THEN RAISE EXCEPTION 'This goods received note has already been posted'; END IF;

  FOR r IN SELECT * FROM public.grn_items WHERE grn_id = _grn AND received_quantity > 0 LOOP
    PERFORM public.post_stock_transaction(g.organization_id, r.item_id, g.store_id, 'RECEIPT', r.received_quantity,
      NULLIF(r.unit_cost, 0), 'Goods received ' || COALESCE(g.grn_number, ''), NULL, NULL, NULL);
    IF g.purchase_order_id IS NOT NULL THEN
      UPDATE public.purchase_order_items
         SET received_quantity = received_quantity + r.received_quantity
       WHERE purchase_order_id = g.purchase_order_id AND item_id = r.item_id;
    END IF;
  END LOOP;

  UPDATE public.goods_received_notes SET status = 'RECEIVED', received_by = COALESCE(received_by, uid) WHERE id = _grn;

  IF g.purchase_order_id IS NOT NULL THEN
    SELECT COALESCE(sum(GREATEST(quantity - received_quantity, 0)), 0) INTO remaining
      FROM public.purchase_order_items WHERE purchase_order_id = g.purchase_order_id;
    UPDATE public.purchase_orders
       SET status = CASE WHEN remaining <= 0 THEN 'RECEIVED'::public.doc_status ELSE 'PARTIALLY_RECEIVED'::public.doc_status END
     WHERE id = g.purchase_order_id;
  END IF;

  PERFORM public.notify_permission(g.organization_id, 'inventory.view', 'Stock received',
    'Goods received note ' || COALESCE(g.grn_number,'') || ' was posted to stock.', 'stock', 'goods_received_notes', _grn);
END $$;

CREATE OR REPLACE FUNCTION public.approve_requisition(_req uuid, _approve boolean, _reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE q public.requisitions%ROWTYPE; uid uuid := auth.uid();
BEGIN
  SELECT * INTO q FROM public.requisitions WHERE id = _req;
  IF q.id IS NULL THEN RAISE EXCEPTION 'Requisition not found'; END IF;
  IF NOT public.in_org(q.organization_id) THEN RAISE EXCEPTION 'Not authorised for this organization'; END IF;
  IF NOT public.has_permission('requisition.approve') THEN RAISE EXCEPTION 'You do not have permission to approve requisitions'; END IF;
  IF q.status <> 'SUBMITTED' THEN RAISE EXCEPTION 'Only submitted requisitions can be decided'; END IF;
  IF q.requested_by = uid AND NOT public.has_role(uid, 'org_admin') THEN
    RAISE EXCEPTION 'You cannot approve your own requisition';
  END IF;

  UPDATE public.requisition_items SET approved_quantity = COALESCE(approved_quantity, requested_quantity)
   WHERE requisition_id = _req;

  UPDATE public.requisitions
     SET status = CASE WHEN _approve THEN 'APPROVED'::public.doc_status ELSE 'REJECTED'::public.doc_status END,
         approved_by = uid, approved_at = now(), rejection_reason = CASE WHEN _approve THEN NULL ELSE _reason END
   WHERE id = _req;

  INSERT INTO public.audit_logs (organization_id, user_id, action, entity_type, entity_id)
  VALUES (q.organization_id, uid, CASE WHEN _approve THEN 'APPROVE' ELSE 'REJECT' END, 'requisitions', _req);

  PERFORM public.notify_permission(q.organization_id, 'stock.issue',
    CASE WHEN _approve THEN 'Requisition approved' ELSE 'Requisition rejected' END,
    COALESCE(q.requisition_number,'') || ' was ' || CASE WHEN _approve THEN 'approved' ELSE 'rejected' END || '.',
    'requisition', 'requisitions', _req);
END $$;

CREATE OR REPLACE FUNCTION public.issue_requisition(_req uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE q public.requisitions%ROWTYPE; r record; uid uuid := auth.uid(); qty numeric; src uuid;
BEGIN
  SELECT * INTO q FROM public.requisitions WHERE id = _req;
  IF q.id IS NULL THEN RAISE EXCEPTION 'Requisition not found'; END IF;
  IF NOT public.in_org(q.organization_id) THEN RAISE EXCEPTION 'Not authorised for this organization'; END IF;
  IF NOT public.has_permission('stock.issue') THEN RAISE EXCEPTION 'You do not have permission to issue stock'; END IF;
  IF q.status <> 'APPROVED' THEN RAISE EXCEPTION 'Only approved requisitions can be issued'; END IF;
  src := q.source_store_id;
  IF src IS NULL THEN RAISE EXCEPTION 'Choose the issuing store before issuing'; END IF;

  FOR r IN SELECT * FROM public.requisition_items WHERE requisition_id = _req LOOP
    qty := COALESCE(r.approved_quantity, r.requested_quantity) - r.issued_quantity;
    IF qty > 0 THEN
      IF q.destination_store_id IS NOT NULL THEN
        PERFORM public.post_stock_transaction(q.organization_id, r.item_id, src, 'TRANSFER_OUT', qty, NULL,
          'Issue against ' || COALESCE(q.requisition_number,''), q.department_id, q.destination_store_id, NULL);
        PERFORM public.post_stock_transaction(q.organization_id, r.item_id, q.destination_store_id, 'TRANSFER_IN', qty, NULL,
          'Issue against ' || COALESCE(q.requisition_number,''), q.department_id, NULL, NULL);
      ELSE
        PERFORM public.post_stock_transaction(q.organization_id, r.item_id, src, 'ISSUE', qty, NULL,
          'Issue against ' || COALESCE(q.requisition_number,''), q.department_id, NULL, NULL);
      END IF;
      UPDATE public.requisition_items SET issued_quantity = issued_quantity + qty WHERE id = r.id;
    END IF;
  END LOOP;

  UPDATE public.requisitions SET status = 'ISSUED' WHERE id = _req;
  INSERT INTO public.audit_logs (organization_id, user_id, action, entity_type, entity_id)
  VALUES (q.organization_id, uid, 'ISSUE_STOCK', 'requisitions', _req);
END $$;

CREATE OR REPLACE FUNCTION public.dispatch_transfer(_transfer uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t public.stock_transfers%ROWTYPE; r record; qty numeric;
BEGIN
  SELECT * INTO t FROM public.stock_transfers WHERE id = _transfer;
  IF t.id IS NULL THEN RAISE EXCEPTION 'Transfer not found'; END IF;
  IF NOT public.in_org(t.organization_id) THEN RAISE EXCEPTION 'Not authorised for this organization'; END IF;
  IF NOT public.has_permission('stock.transfer') THEN RAISE EXCEPTION 'You do not have permission to transfer stock'; END IF;
  IF t.status NOT IN ('DRAFT','SUBMITTED','APPROVED') THEN RAISE EXCEPTION 'This transfer has already been dispatched'; END IF;

  FOR r IN SELECT * FROM public.stock_transfer_items WHERE transfer_id = _transfer LOOP
    qty := CASE WHEN r.dispatched_quantity > 0 THEN r.dispatched_quantity ELSE r.requested_quantity END;
    PERFORM public.post_stock_transaction(t.organization_id, r.item_id, t.source_store_id, 'TRANSFER_OUT', qty, NULL,
      'Transfer ' || COALESCE(t.transfer_number,''), NULL, t.destination_store_id, NULL);
    UPDATE public.stock_transfer_items SET dispatched_quantity = qty WHERE id = r.id;
  END LOOP;

  UPDATE public.stock_transfers SET status = 'IN_TRANSIT', dispatched_at = now() WHERE id = _transfer;
  PERFORM public.notify_permission(t.organization_id, 'stock.transfer', 'Transfer dispatched',
    COALESCE(t.transfer_number,'') || ' is in transit and awaiting receipt.', 'transfer', 'stock_transfers', _transfer);
END $$;

CREATE OR REPLACE FUNCTION public.receive_transfer(_transfer uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t public.stock_transfers%ROWTYPE; r record; qty numeric;
BEGIN
  SELECT * INTO t FROM public.stock_transfers WHERE id = _transfer;
  IF t.id IS NULL THEN RAISE EXCEPTION 'Transfer not found'; END IF;
  IF NOT public.in_org(t.organization_id) THEN RAISE EXCEPTION 'Not authorised for this organization'; END IF;
  IF NOT public.has_permission('stock.transfer') THEN RAISE EXCEPTION 'You do not have permission to transfer stock'; END IF;
  IF t.status <> 'IN_TRANSIT' THEN RAISE EXCEPTION 'Only dispatched transfers can be received'; END IF;

  FOR r IN SELECT * FROM public.stock_transfer_items WHERE transfer_id = _transfer LOOP
    qty := CASE WHEN r.received_quantity > 0 THEN r.received_quantity ELSE r.dispatched_quantity END;
    IF qty > 0 THEN
      PERFORM public.post_stock_transaction(t.organization_id, r.item_id, t.destination_store_id, 'TRANSFER_IN', qty, NULL,
        'Transfer ' || COALESCE(t.transfer_number,''), NULL, NULL, NULL);
      UPDATE public.stock_transfer_items SET received_quantity = qty WHERE id = r.id;
    END IF;
  END LOOP;

  UPDATE public.stock_transfers SET status = 'COMPLETED', received_at = now() WHERE id = _transfer;
END $$;

CREATE OR REPLACE FUNCTION public.post_stock_return(_return uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s public.stock_returns%ROWTYPE;
BEGIN
  SELECT * INTO s FROM public.stock_returns WHERE id = _return;
  IF s.id IS NULL THEN RAISE EXCEPTION 'Return not found'; END IF;
  IF NOT public.in_org(s.organization_id) THEN RAISE EXCEPTION 'Not authorised for this organization'; END IF;
  IF NOT public.has_permission('stock.receive') THEN RAISE EXCEPTION 'You do not have permission to receive returns'; END IF;
  IF s.status <> 'DRAFT' THEN RAISE EXCEPTION 'This return has already been posted'; END IF;

  IF s.from_store_id IS NOT NULL THEN
    PERFORM public.post_stock_transaction(s.organization_id, s.item_id, s.from_store_id, 'TRANSFER_OUT', s.quantity, NULL,
      'Return ' || COALESCE(s.return_number,''), NULL, s.to_store_id, NULL);
  END IF;
  PERFORM public.post_stock_transaction(s.organization_id, s.item_id, s.to_store_id, 'RETURN', s.quantity, NULL,
    COALESCE(s.reason, 'Return ' || COALESCE(s.return_number,'')), NULL, NULL, NULL);

  UPDATE public.stock_returns SET status = 'COMPLETED', posted_at = now() WHERE id = _return;
END $$;

CREATE OR REPLACE FUNCTION public.approve_stock_incident(_incident uuid, _approve boolean, _reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE i public.stock_incidents%ROWTYPE; uid uuid := auth.uid(); t public.stock_txn_type;
BEGIN
  SELECT * INTO i FROM public.stock_incidents WHERE id = _incident;
  IF i.id IS NULL THEN RAISE EXCEPTION 'Report not found'; END IF;
  IF NOT public.in_org(i.organization_id) THEN RAISE EXCEPTION 'Not authorised for this organization'; END IF;
  IF NOT public.has_permission('stock.adjust') THEN RAISE EXCEPTION 'You do not have permission to approve write-offs'; END IF;
  IF i.status <> 'SUBMITTED' THEN RAISE EXCEPTION 'This report has already been decided'; END IF;
  IF i.reported_by = uid AND NOT public.has_role(uid, 'org_admin') THEN
    RAISE EXCEPTION 'You cannot approve a write-off you reported';
  END IF;

  IF _approve THEN
    t := CASE WHEN i.incident_type IN ('BREAKAGE','DAMAGE') THEN 'BREAKAGE'::public.stock_txn_type ELSE 'LOSS'::public.stock_txn_type END;
    PERFORM public.post_stock_transaction(i.organization_id, i.item_id, i.store_id, t, i.quantity, NULL,
      i.incident_type::text || COALESCE(' — ' || i.description, ''), NULL, NULL, NULL);
  END IF;

  UPDATE public.stock_incidents
     SET status = CASE WHEN _approve THEN 'COMPLETED'::public.doc_status ELSE 'REJECTED'::public.doc_status END,
         approved_by = uid, approved_at = now(), rejection_reason = CASE WHEN _approve THEN NULL ELSE _reason END
   WHERE id = _incident;
END $$;

CREATE OR REPLACE FUNCTION public.populate_stocktake(_stocktake uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s public.stocktakes%ROWTYPE; n integer;
BEGIN
  SELECT * INTO s FROM public.stocktakes WHERE id = _stocktake;
  IF s.id IS NULL THEN RAISE EXCEPTION 'Stocktake not found'; END IF;
  IF NOT public.in_org(s.organization_id) THEN RAISE EXCEPTION 'Not authorised for this organization'; END IF;
  IF NOT public.has_permission('stocktake.create') THEN RAISE EXCEPTION 'You do not have permission to run stocktakes'; END IF;
  IF s.status <> 'DRAFT' THEN RAISE EXCEPTION 'This stocktake is closed'; END IF;

  INSERT INTO public.stocktake_items (organization_id, stocktake_id, item_id, system_quantity, unit_cost)
  SELECT s.organization_id, _stocktake, b.item_id, b.quantity, b.average_cost
    FROM public.stock_balances b
   WHERE b.organization_id = s.organization_id AND b.store_id = s.store_id
  ON CONFLICT (stocktake_id, item_id) DO UPDATE SET system_quantity = EXCLUDED.system_quantity, unit_cost = EXCLUDED.unit_cost;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;

CREATE OR REPLACE FUNCTION public.approve_stocktake(_stocktake uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s public.stocktakes%ROWTYPE; r record; uid uuid := auth.uid(); variance numeric;
BEGIN
  SELECT * INTO s FROM public.stocktakes WHERE id = _stocktake;
  IF s.id IS NULL THEN RAISE EXCEPTION 'Stocktake not found'; END IF;
  IF NOT public.in_org(s.organization_id) THEN RAISE EXCEPTION 'Not authorised for this organization'; END IF;
  IF NOT public.has_permission('stocktake.approve') THEN RAISE EXCEPTION 'You do not have permission to approve stocktakes'; END IF;
  IF s.status = 'COMPLETED' THEN RAISE EXCEPTION 'This stocktake is already approved'; END IF;

  FOR r IN SELECT * FROM public.stocktake_items WHERE stocktake_id = _stocktake AND physical_quantity IS NOT NULL LOOP
    variance := r.physical_quantity - r.system_quantity;
    IF variance <> 0 THEN
      PERFORM public.post_stock_transaction(s.organization_id, r.item_id, s.store_id, 'STOCKTAKE_ADJUSTMENT', variance,
        NULLIF(r.unit_cost,0), COALESCE(r.reason, 'Stocktake ' || COALESCE(s.reference,'')), NULL, NULL, NULL);
    END IF;
  END LOOP;

  UPDATE public.stocktakes SET status = 'COMPLETED', approved_by = uid, approved_at = now() WHERE id = _stocktake;
  INSERT INTO public.audit_logs (organization_id, user_id, action, entity_type, entity_id)
  VALUES (s.organization_id, uid, 'STOCKTAKE', 'stocktakes', _stocktake);
END $$;

REVOKE ALL ON FUNCTION public.assign_document_number() FROM public, anon, authenticated;
