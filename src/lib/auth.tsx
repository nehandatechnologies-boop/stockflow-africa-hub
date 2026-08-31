import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];

export const ROLE_LABELS: Record<AppRole, string> = {
  supreme_admin: "Supreme Admin",
  org_admin: "Organization Admin",
  central_store_manager: "Central Store Manager",
  store_clerk: "Store Clerk",
  department_head: "Department Head",
  finance: "Finance",
  auditor: "Auditor",
};

/** Landing route per role, highest privilege first. */
const ROLE_HOME: Array<[AppRole, string]> = [
  ["supreme_admin", "/platform"],
  ["org_admin", "/dashboard"],
  ["central_store_manager", "/dashboard"],
  ["store_clerk", "/dashboard"],
  ["department_head", "/dashboard"],
  ["finance", "/finance"],
  ["auditor", "/audit"],
];

export function homeForRoles(roles: AppRole[]): string {
  for (const [role, path] of ROLE_HOME) if (roles.includes(role)) return path;
  return "/onboarding";
}

interface AuthState {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  organization: Organization | null;
  roles: AppRole[];
  permissions: string[];
  isSupremeAdmin: boolean;
  can: (permission: string) => boolean;
  hasRole: (...roles: AppRole[]) => boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);

  const load = useCallback(async (uid: string | undefined) => {
    if (!uid) {
      setProfile(null);
      setOrganization(null);
      setRoles([]);
      setPermissions([]);
      return;
    }
    const [profileRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);

    const nextProfile = profileRes.data ?? null;
    const nextRoles = (rolesRes.data ?? []).map((r) => r.role as AppRole);
    setProfile(nextProfile);
    setRoles(nextRoles);

    if (nextRoles.length) {
      const { data: perms } = await supabase
        .from("role_permissions")
        .select("permission")
        .in("role", nextRoles);
      setPermissions([...new Set((perms ?? []).map((p) => p.permission))]);
    } else {
      setPermissions([]);
    }

    if (nextProfile?.organization_id) {
      const { data: org } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", nextProfile.organization_id)
        .maybeSingle();
      setOrganization(org ?? null);
    } else {
      setOrganization(null);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      if (event === "SIGNED_OUT") {
        void load(undefined);
        return;
      }
      if (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "INITIAL_SESSION") {
        setTimeout(() => {
          void load(nextSession?.user?.id);
        }, 0);
      }
    });

    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
      await load(data.session?.user?.id);
      setLoading(false);
    })();

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [load]);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    await load(data.session?.user?.id);
  }, [load]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    await load(undefined);
  }, [load]);

  const value = useMemo<AuthState>(
    () => ({
      loading,
      session,
      user: session?.user ?? null,
      profile,
      organization,
      roles,
      permissions,
      isSupremeAdmin: roles.includes("supreme_admin"),
      can: (permission: string) => permissions.includes(permission),
      hasRole: (...wanted: AppRole[]) => wanted.some((r) => roles.includes(r)),
      refresh,
      signOut,
    }),
    [loading, session, profile, organization, roles, permissions, refresh, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
