import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Truck,
  Users,
  LogOut,
  Map,
  BookOpen,
  Sparkles,
  Bell,
  IdCard,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/drivers", label: "Drivers", icon: IdCard },
  { to: "/dispatch", label: "Dispatch", icon: Truck },
  { to: "/trips", label: "Trips", icon: Map },
  { to: "/ledger", label: "Ledger", icon: BookOpen },
  { to: "/predictor", label: "AI Predictor", icon: Sparkles },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/users", label: "User Administration", icon: Users, roles: ["SYSTEM_ADMIN", "FINANCE_ADMIN"] },
] as const;


function roleLabel(role: string) {
  return role
    .toLowerCase()
    .split("_")
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(" ");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="flex items-center gap-2 px-6 py-6">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary">
            <Truck className="size-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">RouteLedger</span>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV.filter((item) => !("roles" in item) || (user && item.roles.includes(user.role as never))).map(
            (item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            },
          )}
        </nav>

        {user && (
          <div className="border-t border-sidebar-border p-3">
            <div className="flex items-center gap-3 rounded-md px-2 py-2">
              <img
                src={user.pictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                alt={user.name}
                className="size-9 rounded-full border border-border object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{roleLabel(user.role)}</p>
              </div>
              <button
                onClick={signOut}
                aria-label="Sign out"
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 md:pl-64">
        <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="mb-8">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </header>
  );
}
