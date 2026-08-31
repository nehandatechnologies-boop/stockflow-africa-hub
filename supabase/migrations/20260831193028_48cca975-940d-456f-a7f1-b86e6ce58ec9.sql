
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.block_ledger_mutation() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.block_audit_mutation() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.next_transaction_reference(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_supreme_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.current_org_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_permission(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.in_org(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.create_organization(text, text, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.join_organization(text, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.claim_supreme_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.platform_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_supreme_admin(), public.current_org_id(), public.has_permission(text), public.in_org(uuid),
  public.next_transaction_reference(uuid, text), public.create_organization(text, text, text, text, text),
  public.join_organization(text, public.app_role), public.claim_supreme_admin(), public.platform_stats() TO authenticated;
