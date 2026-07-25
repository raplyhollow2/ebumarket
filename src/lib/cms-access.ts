import { createClient } from "@/lib/supabase/server";

/** Admins (legacy role) or RBAC content managers can manage CMS. */
export async function requireCmsAccess() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { supabase, user: null, allowed: false as const };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, can_approve")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "admin") {
    return { supabase, user, allowed: true as const };
  }

  const { data: roleCheck } = await supabase
    .from("admin_role_assignments")
    .select("admin_roles!inner(name, permissions)")
    .eq("user_id", user.id)
    .maybeSingle();

  const adminRole = roleCheck?.admin_roles as
    | { name?: string; permissions?: string[] | Record<string, unknown> }
    | { name?: string; permissions?: string[] | Record<string, unknown> }[]
    | null
    | undefined;
  const role = Array.isArray(adminRole) ? adminRole[0] : adminRole;
  const permissions = Array.isArray(role?.permissions)
    ? role.permissions
    : [];
  const allowed =
    permissions.includes("*") ||
    permissions.includes("cms.manage") ||
    role?.name === "Super Admin" ||
    role?.name === "Content Manager";

  return { supabase, user, allowed: Boolean(allowed) as boolean };
}
