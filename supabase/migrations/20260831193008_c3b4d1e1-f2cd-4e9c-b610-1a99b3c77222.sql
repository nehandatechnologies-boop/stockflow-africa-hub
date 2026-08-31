
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('supreme_admin','org_admin','central_store_manager','store_clerk','department_head','finance','auditor');
CREATE TYPE public.entity_status AS ENUM ('active','inactive','suspended');
CREATE TYPE public.store_type AS ENUM ('CENTRAL','DEPARTMENTAL','SPECIALIZED');
CREATE TYPE public.stock_txn_type AS ENUM ('RECEIPT','ISSUE','TRANSFER_OUT','TRANSFER_IN','RETURN','BREAKAGE','LOSS','ADJUSTMENT','STOCKTAKE_ADJUSTMENT','OPENING_BALANCE','REVERSAL');

-- shared updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ORGANIZATIONS
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(btrim(name)) > 1),
  organization_code text NOT NULL UNIQUE CHECK (length(btrim(organization_code)) > 1),
  description text,
  email text,
  phone text,
  address text,
  city text,
  country text NOT NULL DEFAULT 'Zimbabwe',
  currency text NOT NULL DEFAULT 'USD',
  timezone text NOT NULL DEFAULT 'Africa/Harare',
  logo_url text,
  is_demo boolean NOT NULL DEFAULT false,
  status public.entity_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  email text,
  full_name text,
  phone text,
  job_title text,
  avatar_url text,
  status public.entity_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_profiles_org ON public.profiles(organization_id);

-- USER ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, organization_id)
);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);

-- ROLE PERMISSIONS (platform-wide catalogue)
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  permission text NOT NULL,
  UNIQUE (role, permission)
);

-- SECURITY DEFINER HELPERS
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_supreme_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'supreme_admin');
$$;

CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.has_permission(_permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    WHERE ur.user_id = auth.uid() AND rp.permission = _permission
  );
$$;

CREATE OR REPLACE FUNCTION public.in_org(_org uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _org IS NOT NULL AND _org = (SELECT organization_id FROM public.profiles WHERE id = auth.uid());
$$;

-- DEPARTMENTS
CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  description text,
  manager_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status public.entity_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, code)
);

-- STORES
CREATE TABLE public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  name text NOT NULL,
  code text NOT NULL,
  store_type public.store_type NOT NULL DEFAULT 'DEPARTMENTAL',
  location text,
  manager_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status public.entity_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, code)
);

CREATE TABLE public.store_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (store_id, user_id)
);

-- CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  description text,
  status public.entity_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, code)
);

-- UNITS
CREATE TABLE public.units_of_measure (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  abbreviation text NOT NULL,
  status public.entity_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, abbreviation)
);

-- SUPPLIERS
CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  supplier_code text NOT NULL,
  name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  address text,
  tax_number text,
  payment_terms text,
  status public.entity_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, supplier_code)
);

-- ITEMS
CREATE TABLE public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  unit_of_measure_id uuid REFERENCES public.units_of_measure(id) ON DELETE SET NULL,
  item_code text NOT NULL,
  name text NOT NULL,
  description text,
  barcode text,
  sku text,
  minimum_stock_level numeric(18,3) NOT NULL DEFAULT 0 CHECK (minimum_stock_level >= 0),
  reorder_level numeric(18,3) NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
  maximum_stock_level numeric(18,3) CHECK (maximum_stock_level IS NULL OR maximum_stock_level >= 0),
  default_unit_cost numeric(18,4) NOT NULL DEFAULT 0 CHECK (default_unit_cost >= 0),
  track_batch boolean NOT NULL DEFAULT false,
  track_expiry boolean NOT NULL DEFAULT false,
  track_serial_number boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, item_code)
);
CREATE INDEX idx_items_org_cat ON public.items(organization_id, category_id);
CREATE INDEX idx_items_barcode ON public.items(barcode) WHERE barcode IS NOT NULL;

-- STOCK BALANCES
CREATE TABLE public.stock_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  quantity numeric(18,3) NOT NULL DEFAULT 0,
  reserved_quantity numeric(18,3) NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
  average_cost numeric(18,4) NOT NULL DEFAULT 0 CHECK (average_cost >= 0),
  total_value numeric(18,2) NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (store_id, item_id)
);
CREATE INDEX idx_balances_org ON public.stock_balances(organization_id);

-- STOCK LEDGER (immutable)
CREATE TABLE public.stock_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  transaction_reference text NOT NULL,
  transaction_type public.stock_txn_type NOT NULL,
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE RESTRICT,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE RESTRICT,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  quantity numeric(18,3) NOT NULL CHECK (quantity <> 0),
  unit_cost numeric(18,4) NOT NULL DEFAULT 0 CHECK (unit_cost >= 0),
  total_value numeric(18,2) NOT NULL DEFAULT 0,
  balance_after numeric(18,3) NOT NULL DEFAULT 0,
  source_store_id uuid REFERENCES public.stores(id) ON DELETE SET NULL,
  destination_store_id uuid REFERENCES public.stores(id) ON DELETE SET NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason text,
  related_transaction_id uuid REFERENCES public.stock_ledger(id) ON DELETE SET NULL,
  transaction_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, transaction_reference)
);
CREATE INDEX idx_ledger_item_store ON public.stock_ledger(item_id, store_id, transaction_date DESC);
CREATE INDEX idx_ledger_org_date ON public.stock_ledger(organization_id, transaction_date DESC);

CREATE OR REPLACE FUNCTION public.block_ledger_mutation() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'Stock ledger transactions are immutable. Post a reversal instead.';
END; $$;
CREATE TRIGGER trg_ledger_immutable BEFORE UPDATE OR DELETE ON public.stock_ledger
FOR EACH ROW EXECUTE FUNCTION public.block_ledger_mutation();

-- REFERENCE SEQUENCES
CREATE TABLE public.reference_counters (
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  prefix text NOT NULL,
  year int NOT NULL,
  last_number bigint NOT NULL DEFAULT 0,
  PRIMARY KEY (organization_id, prefix, year)
);

CREATE OR REPLACE FUNCTION public.next_transaction_reference(_org uuid, _prefix text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE y int := extract(year from now())::int; n bigint;
BEGIN
  IF NOT public.in_org(_org) AND NOT public.is_supreme_admin() THEN
    RAISE EXCEPTION 'Not authorised for this organization';
  END IF;
  INSERT INTO public.reference_counters(organization_id, prefix, year, last_number)
  VALUES (_org, _prefix, y, 1)
  ON CONFLICT (organization_id, prefix, year)
  DO UPDATE SET last_number = public.reference_counters.last_number + 1
  RETURNING last_number INTO n;
  RETURN _prefix || '-' || y || '-' || lpad(n::text, 6, '0');
END; $$;

-- AUDIT LOGS
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_org_date ON public.audit_logs(organization_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.block_audit_mutation() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN RAISE EXCEPTION 'Audit logs are immutable.'; END; $$;
CREATE TRIGGER trg_audit_immutable BEFORE UPDATE OR DELETE ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION public.block_audit_mutation();

-- updated_at triggers
CREATE TRIGGER t1 BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t2 BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t3 BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t4 BEFORE UPDATE ON public.stores FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t5 BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t6 BEFORE UPDATE ON public.units_of_measure FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t7 BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t8 BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- NEW USER TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- GRANTS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations, public.profiles, public.departments,
  public.stores, public.store_users, public.categories, public.units_of_measure, public.suppliers,
  public.items, public.stock_balances, public.stock_ledger, public.audit_logs, public.user_roles TO authenticated;
GRANT SELECT ON public.role_permissions, public.reference_counters TO authenticated;
GRANT ALL ON public.organizations, public.profiles, public.departments, public.stores, public.store_users,
  public.categories, public.units_of_measure, public.suppliers, public.items, public.stock_balances,
  public.stock_ledger, public.audit_logs, public.user_roles, public.role_permissions, public.reference_counters TO service_role;

-- RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units_of_measure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY org_select ON public.organizations FOR SELECT TO authenticated
  USING (public.is_supreme_admin() OR id = public.current_org_id());
CREATE POLICY org_insert ON public.organizations FOR INSERT TO authenticated WITH CHECK (public.is_supreme_admin());
CREATE POLICY org_update ON public.organizations FOR UPDATE TO authenticated
  USING (public.is_supreme_admin() OR (id = public.current_org_id() AND public.has_permission('system.manage')))
  WITH CHECK (public.is_supreme_admin() OR id = public.current_org_id());
CREATE POLICY org_delete ON public.organizations FOR DELETE TO authenticated USING (public.is_supreme_admin());

CREATE POLICY profiles_select ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_supreme_admin() OR public.in_org(organization_id));
CREATE POLICY profiles_update_self ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_supreme_admin() OR (public.in_org(organization_id) AND public.has_permission('users.manage')))
  WITH CHECK (id = auth.uid() OR public.is_supreme_admin() OR public.in_org(organization_id));

CREATE POLICY roles_select ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_supreme_admin() OR public.in_org(organization_id));
CREATE POLICY roles_write ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.is_supreme_admin() OR (public.in_org(organization_id) AND public.has_permission('users.manage') AND role <> 'supreme_admin'));
CREATE POLICY roles_delete ON public.user_roles FOR DELETE TO authenticated
  USING (public.is_supreme_admin() OR (public.in_org(organization_id) AND public.has_permission('users.manage') AND role <> 'supreme_admin'));

CREATE POLICY perms_select ON public.role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY counters_select ON public.reference_counters FOR SELECT TO authenticated
  USING (public.is_supreme_admin() OR public.in_org(organization_id));

-- generic tenant policies
DO $do$
DECLARE t text; perm text;
BEGIN
  FOR t, perm IN SELECT * FROM (VALUES
    ('departments','departments.manage'),
    ('stores','stores.manage'),
    ('store_users','stores.manage'),
    ('categories','inventory.create'),
    ('units_of_measure','inventory.create'),
    ('suppliers','inventory.create'),
    ('items','inventory.create')
  ) v(a,b) LOOP
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.is_supreme_admin() OR public.in_org(organization_id))', t||'_select', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.in_org(organization_id) AND public.has_permission(%L))', t||'_insert', t, perm);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.in_org(organization_id) AND public.has_permission(%L)) WITH CHECK (public.in_org(organization_id))', t||'_update', t, perm);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.in_org(organization_id) AND public.has_permission(%L))', t||'_delete', t, perm);
  END LOOP;
END $do$;

CREATE POLICY balances_select ON public.stock_balances FOR SELECT TO authenticated
  USING (public.is_supreme_admin() OR public.in_org(organization_id));

CREATE POLICY ledger_select ON public.stock_ledger FOR SELECT TO authenticated
  USING (public.is_supreme_admin() OR public.in_org(organization_id));
CREATE POLICY ledger_insert ON public.stock_ledger FOR INSERT TO authenticated
  WITH CHECK (public.in_org(organization_id) AND (
    public.has_permission('stock.receive') OR public.has_permission('stock.issue') OR
    public.has_permission('stock.transfer') OR public.has_permission('stock.adjust')));

CREATE POLICY audit_select ON public.audit_logs FOR SELECT TO authenticated
  USING (public.is_supreme_admin() OR (public.in_org(organization_id) AND public.has_permission('audit.view')));
CREATE POLICY audit_insert ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- PERMISSION SEED
INSERT INTO public.role_permissions (role, permission) VALUES
('supreme_admin','system.manage'),('supreme_admin','platform.organizations.manage'),('supreme_admin','platform.users.manage'),('supreme_admin','audit.view'),('supreme_admin','reports.view'),
('org_admin','system.manage'),('org_admin','users.manage'),('org_admin','stores.manage'),('org_admin','departments.manage'),
('org_admin','inventory.view'),('org_admin','inventory.create'),('org_admin','inventory.edit'),('org_admin','inventory.delete'),
('org_admin','stock.receive'),('org_admin','stock.issue'),('org_admin','stock.transfer'),('org_admin','stock.adjust'),
('org_admin','stocktake.create'),('org_admin','stocktake.approve'),('org_admin','reports.view'),('org_admin','audit.view'),
('central_store_manager','inventory.view'),('central_store_manager','inventory.create'),('central_store_manager','inventory.edit'),
('central_store_manager','stock.receive'),('central_store_manager','stock.issue'),('central_store_manager','stock.transfer'),
('central_store_manager','stock.adjust'),('central_store_manager','stocktake.create'),('central_store_manager','stocktake.approve'),('central_store_manager','reports.view'),
('store_clerk','inventory.view'),('store_clerk','stock.receive'),('store_clerk','stock.issue'),('store_clerk','stock.transfer'),('store_clerk','stocktake.create'),
('department_head','inventory.view'),('department_head','reports.view'),('department_head','stocktake.create'),
('finance','inventory.view'),('finance','reports.view'),('finance','audit.view'),
('auditor','inventory.view'),('auditor','reports.view'),('auditor','audit.view');

-- ORG BOOTSTRAP RPCS
CREATE OR REPLACE FUNCTION public.create_organization(_name text, _code text, _country text DEFAULT 'Zimbabwe', _currency text DEFAULT 'USD', _timezone text DEFAULT 'Africa/Harare')
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_id uuid; uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF (SELECT organization_id FROM public.profiles WHERE id = uid) IS NOT NULL THEN
    RAISE EXCEPTION 'You already belong to an organization';
  END IF;
  INSERT INTO public.organizations (name, organization_code, country, currency, timezone)
  VALUES (_name, upper(_code), _country, _currency, _timezone) RETURNING id INTO new_id;
  UPDATE public.profiles SET organization_id = new_id WHERE id = uid;
  INSERT INTO public.user_roles (user_id, organization_id, role) VALUES (uid, new_id, 'org_admin');
  INSERT INTO public.audit_logs (organization_id, user_id, action, entity_type, entity_id)
  VALUES (new_id, uid, 'CREATE', 'organization', new_id);
  RETURN new_id;
END; $$;

CREATE OR REPLACE FUNCTION public.join_organization(_code text, _role public.app_role DEFAULT 'store_clerk')
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE org_id uuid; uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _role = 'supreme_admin' THEN RAISE EXCEPTION 'Invalid role'; END IF;
  SELECT id INTO org_id FROM public.organizations WHERE organization_code = upper(_code) AND is_demo = true AND status = 'active';
  IF org_id IS NULL THEN RAISE EXCEPTION 'Unknown or non-joinable organization code'; END IF;
  UPDATE public.profiles SET organization_id = org_id WHERE id = uid AND organization_id IS NULL;
  INSERT INTO public.user_roles (user_id, organization_id, role) VALUES (uid, org_id, _role) ON CONFLICT DO NOTHING;
  RETURN org_id;
END; $$;

CREATE OR REPLACE FUNCTION public.claim_supreme_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'supreme_admin') THEN
    RAISE EXCEPTION 'A platform owner already exists';
  END IF;
  INSERT INTO public.user_roles (user_id, organization_id, role) VALUES (uid, NULL, 'supreme_admin');
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id) VALUES (uid, 'ROLE_CHANGED', 'user_roles', uid);
  RETURN true;
END; $$;

CREATE OR REPLACE FUNCTION public.platform_stats()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_supreme_admin() THEN RAISE EXCEPTION 'Not authorised'; END IF;
  RETURN jsonb_build_object(
    'organizations', (SELECT count(*) FROM public.organizations),
    'active_organizations', (SELECT count(*) FROM public.organizations WHERE status = 'active'),
    'users', (SELECT count(*) FROM public.profiles),
    'stores', (SELECT count(*) FROM public.stores),
    'items', (SELECT count(*) FROM public.items),
    'transactions_today', (SELECT count(*) FROM public.stock_ledger WHERE transaction_date >= date_trunc('day', now()))
  );
END; $$;
