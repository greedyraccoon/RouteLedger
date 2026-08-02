import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { AppShell, PageHeader } from "@/components/app-shell";
import { ROLES, useAuth, type Role, type UserResponse } from "@/lib/auth";
import { tryWrite, usersQuery } from "@/lib/data";
import { MOCK_USERS } from "@/lib/mock-data";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "User Administration — RouteLedger" },
      {
        name: "description",
        content: "Manage RouteLedger team members and assign system, finance, and dispatcher roles.",
      },
      { property: "og:title", content: "User Administration — RouteLedger" },
      {
        property: "og:description",
        content: "Manage team members and assign system, finance, and dispatcher roles.",
      },
    ],
  }),
  component: UsersPage,
});

const ALLOWED: Role[] = ["SYSTEM_ADMIN", "FINANCE_ADMIN"];

function UsersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: rows = MOCK_USERS } = useQuery({ ...usersQuery(), initialData: MOCK_USERS });

  if (!user || !ALLOWED.includes(user.role)) {
    return (
      <AppShell>
        <div className="mx-auto mt-20 max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto size-6 text-muted-foreground" />
          <h1 className="mt-4 text-lg font-semibold">Restricted module</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            User Administration is available to System and Finance administrators only.
          </p>
        </div>
      </AppShell>
    );
  }

  const canEdit = user.role === "SYSTEM_ADMIN";

  const updateRole = (email: string, role: Role) => {
    queryClient.setQueryData<UserResponse[]>(usersQuery().queryKey, (prev) =>
      (prev ?? []).map((r) => (r.email === email ? { ...r, role } : r)),
    );
    void tryWrite(`/api/v1/users/${encodeURIComponent(email)}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
    toast.success("Role updated", { description: `${email} → ${role}` });
  };

  return (
    <AppShell>
      <PageHeader
        title="User Administration"
        description="Team directory and role assignment for the RouteLedger workspace."
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-6 py-3 font-medium">Avatar</th>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((u) => (
              <tr key={u.email} className="transition-colors hover:bg-muted/50">
                <td className="px-6 py-4">
                  <img
                    src={
                      u.pictureUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`
                    }
                    alt={u.name}
                    className="size-9 rounded-full border border-border object-cover"
                  />
                </td>
                <td className="px-6 py-4 font-medium">{u.name}</td>
                <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                <td className="px-6 py-4">
                  <select
                    value={u.role}
                    disabled={!canEdit}
                    onChange={(e) => updateRole(u.email, e.target.value as Role)}
                    className="rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground outline-none transition-colors focus:border-ring disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!canEdit && (
        <p className="mt-4 text-xs text-muted-foreground">
          Only a SYSTEM_ADMIN can change role assignments.
        </p>
      )}
    </AppShell>
  );
}
