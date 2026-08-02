import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

import { LoginPage } from "@/components/login-page";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — RouteLedger" },
      {
        name: "description",
        content: "Sign in to RouteLedger with your organization Google account to manage your fleet.",
      },
      { property: "og:title", content: "Sign in — RouteLedger" },
      {
        property: "og:description",
        content: "Sign in with your organization Google account to manage your fleet.",
      },
    ],
  }),
  component: LoginRoute,
});

function LoginRoute() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) void router.navigate({ to: "/", replace: true });
  }, [user, router]);

  return <LoginPage />;
}
