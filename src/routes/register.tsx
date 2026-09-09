import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/app-layout";
import { Field } from "./login";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — Flowearn Rewards" },
      { name: "description", content: "Join Flowearn and get a ₦100 welcome bonus in your Task Wallet. Earn from social tasks, referrals and daily income." },
      { property: "og:title", content: "Create account — Flowearn Rewards" },
      { property: "og:description", content: "Register today and claim your ₦100 welcome bonus." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", phone: "", password: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <AuthShell title="Create your account" subtitle="Get ₦100 welcome bonus instantly.">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          register({
            username: form.username,
            email: form.email.trim().toLowerCase(),
            phone: form.phone,
          });
          toast.success("Welcome bonus of ₦100.00 added to your Task Wallet");
          navigate({ to: "/dashboard" });
        }}
      >
        <Field label="USERNAME">
          <input
            required
            value={form.username}
            onChange={(e) => set("username", e.target.value)}
            placeholder="johndoe"
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-brand"
          />
        </Field>
        <Field label="EMAIL">
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="you@example.com"
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-brand"
          />
        </Field>
        <Field label="PHONE NUMBER">
          <input
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="080 0000 0000"
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-brand"
          />
        </Field>
        <Field label="PASSWORD">
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="••••••••"
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-brand"
          />
        </Field>
        <div className="rounded-xl bg-brand/15 px-3 py-2.5 text-xs font-semibold text-foreground">
          +₦100 Welcome bonus credited to your Task Wallet on sign up.
        </div>
        <button className="h-11 w-full rounded-xl bg-brand text-sm font-bold text-brand-foreground">
          Create Account
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link to="/login" className="font-bold text-foreground">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
