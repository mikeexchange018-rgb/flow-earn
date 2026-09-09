import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/app-layout";
import { Field } from "./login";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Flowearn Rewards" },
      { name: "description", content: "Request a Flowearn password reset link and regain access to your task and income wallets." },
      { property: "og:title", content: "Reset password — Flowearn Rewards" },
      { property: "og:description", content: "Request a Flowearn password reset link." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <AuthShell title="Forgot password" subtitle="We will send a reset link to your email.">
      {sent ? (
        <div className="rounded-xl bg-success/10 p-4 text-sm font-semibold text-success">
          If an account exists for {email}, a reset link is on its way.
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <Field label="EMAIL">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-brand"
            />
          </Field>
          <button className="h-11 w-full rounded-xl bg-brand text-sm font-bold text-brand-foreground">
            Send Reset Link
          </button>
        </form>
      )}
      <p className="mt-5 text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-bold text-foreground">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
