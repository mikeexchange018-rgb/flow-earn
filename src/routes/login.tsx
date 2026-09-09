import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/app-layout";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Flowearn Rewards" },
      { name: "description", content: "Log in to your Flowearn account to complete tasks, earn daily income and withdraw to your Nigerian bank." },
      { property: "og:title", content: "Sign in — Flowearn Rewards" },
      { property: "og:description", content: "Log in to Flowearn to complete tasks and earn daily." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue earning with Flowearn.">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!email) return;
          login(email.trim().toLowerCase());
          navigate({ to: "/dashboard" });
        }}
      >
        <Field label="EMAIL">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-brand"
          />
        </Field>
        <Field label="PASSWORD">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-brand"
          />
        </Field>
        <div className="text-right">
          <Link to="/forgot-password" className="text-xs font-semibold text-muted-foreground">
            Forgot password?
          </Link>
        </div>
        <button className="h-11 w-full rounded-xl bg-brand text-sm font-bold text-brand-foreground">
          Sign In
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link to="/register" className="font-bold text-foreground">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
