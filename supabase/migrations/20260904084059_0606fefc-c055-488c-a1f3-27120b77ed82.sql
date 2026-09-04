REVOKE ALL ON FUNCTION public.log_entity_change() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.next_transaction_reference(uuid, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.next_transaction_reference(uuid, text) TO service_role;