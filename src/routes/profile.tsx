import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  Gift,
  LifeBuoy,
  LogOut,
  Shield,
  Trophy,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { BANKS, naira, useApp } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Flowearn Rewards" },
      {
        name: "description",
        content:
          "Manage your Flowearn profile, referrals, leaderboard rank, daily spin, support and bank withdrawal details.",
      },
      { property: "og:title", content: "Profile — Flowearn Rewards" },
      {
        property: "og:description",
        content: "Manage your Flowearn account, referrals and payout details.",
      },
    ],
  }),
  component: ProfilePage,
});

const LINKS = [
  { label: "Notifications", icon: Bell },
  { label: "Leaderboard", icon: Trophy },
  { label: "Referrals", icon: Users },
  { label: "Support Center", icon: LifeBuoy },
  { label: "Terms & Privacy", icon: Shield },
];

function ProfilePage() {
  const { state, logout, spin } = useApp();
  const navigate = useNavigate();
  const [bank, setBankState] = useState(state.bank);
  const { setBank } = useApp();

  return (
    <AppLayout>
      <h1 className="text-lg font-extrabold">Profile</h1>

      <div className="mt-3 rounded-2xl bg-card p-4 shadow-card">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-full bg-brand text-lg font-black text-brand-foreground">
            {(state.user?.username ?? "F").slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{state.user?.username ?? "Guest"}</p>
            <p className="truncate text-[11px] text-muted-foreground">{state.user?.email}</p>
          </div>
          <span className="ml-auto rounded-full bg-secondary px-2 py-1 text-[10px] font-bold">
            {state.user?.rank ?? "BRONZE"}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-secondary p-3">
            <p className="text-[10px] font-bold text-muted-foreground">TOTAL EARNED</p>
            <p className="mt-1 text-sm font-extrabold">{naira(state.earned)}</p>
          </div>
          <div className="rounded-xl bg-secondary p-3">
            <p className="text-[10px] font-bold text-muted-foreground">WITHDRAWN</p>
            <p className="mt-1 text-sm font-extrabold">{naira(state.withdrawn)}</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          const won = spin();
          if (won === null) {
            toast.error("You already spun today");
            return;
          }
          toast.success(`You won ${naira(won)}!`);
        }}
        className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-brand p-4 text-left text-brand-foreground shadow-card"
      >
        <Gift className="size-5" />
        <span className="text-sm font-bold">Spin &amp; Win — 1 free spin daily</span>
        <ChevronRight className="ml-auto size-4" />
      </button>

      <ul className="mt-3 divide-y divide-border overflow-hidden rounded-2xl bg-card shadow-card">
        {LINKS.map((l) => (
          <li key={l.label}>
            <button
              onClick={() => toast("Coming soon")}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <l.icon className="size-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{l.label}</span>
              <ChevronRight className="ml-auto size-4 text-muted-foreground" />
            </button>
          </li>
        ))}
        <li>
          <button
            onClick={() => navigate({ to: "/admin" })}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
          >
            <Shield className="size-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Admin Panel</span>
            <ChevronRight className="ml-auto size-4 text-muted-foreground" />
          </button>
        </li>
      </ul>

      <form
        className="mt-3 space-y-3 rounded-2xl bg-card p-4 shadow-card"
        onSubmit={(e) => {
          e.preventDefault();
          setBank({ ...bank, verified: true });
          toast.success("Bank details verified");
        }}
      >
        <p className="text-sm font-bold">Bank Details</p>
        <div>
          <p className="mb-1.5 text-[11px] font-bold text-muted-foreground">BANK *</p>
          <select
            value={bank.bank}
            onChange={(e) => setBankState({ ...bank, bank: e.target.value })}
            className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus:border-brand"
          >
            <option value="">Select bank</option>
            {BANKS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-bold text-muted-foreground">ACCOUNT NUMBER *</p>
          <input
            required
            inputMode="numeric"
            value={bank.accountNumber}
            onChange={(e) => setBankState({ ...bank, accountNumber: e.target.value })}
            className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus:border-brand"
          />
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-bold text-muted-foreground">ACCOUNT HOLDER</p>
          <input
            value={bank.accountName}
            onChange={(e) => setBankState({ ...bank, accountName: e.target.value })}
            placeholder="Verified Name"
            className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus:border-brand"
          />
        </div>
        <button className="h-11 w-full rounded-xl bg-brand text-sm font-bold text-brand-foreground">
          {state.bank.verified ? "Details Verified" : "Verify Details"}
        </button>
      </form>

      <button
        onClick={() => {
          logout();
          navigate({ to: "/login" });
        }}
        className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-secondary text-sm font-bold text-secondary-foreground"
      >
        <LogOut className="size-4" /> Logout
      </button>
    </AppLayout>
  );
}
