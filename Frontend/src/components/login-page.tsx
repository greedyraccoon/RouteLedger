import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { Truck } from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/lib/auth";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

export function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary">
            <Truck className="size-5 text-primary-foreground" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">RouteLedger</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Logistics and fleet operations, in one ledger.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <h2 className="text-base font-semibold">Sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Use your organization Google account to continue.
          </p>

          <div className="mt-6 flex justify-center">
            {CLIENT_ID ? (
              <GoogleOAuthProvider clientId={CLIENT_ID}>
                <GoogleLogin
                  onSuccess={(res) => {
                    setError(null);
                    if (res.credential) {
                      void signInWithGoogle(res.credential).catch(() =>
                        setError("Sign-in failed. Please try again."),
                      );
                    }
                  }}
                  onError={() => setError("Google sign-in was cancelled or failed.")}
                  width="300"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                />
              </GoogleOAuthProvider>
            ) : (
              <p className="text-center text-xs text-muted-foreground">
                Set <code className="font-mono">VITE_GOOGLE_CLIENT_ID</code> to enable the live Google
                Identity Services button.
              </p>
            )}
          </div>

          {error && <p className="mt-4 text-center text-xs text-destructive">{error}</p>}

          <div className="mt-6 border-t border-border pt-6">
            <button
              onClick={() => {
                void signInWithGoogle("demo").catch(() => setError("Could not start demo session."));
              }}
              className="w-full rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent"
            >
              Continue with a demo session
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Authenticates against <code className="font-mono">POST /api/v1/auth/google</code>
        </p>
      </div>
    </div>
  );
}
