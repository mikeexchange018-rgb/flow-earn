import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowDownToLine, ArrowUpFromLine, LogOut, Wallet } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { naira, useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assets")({
  head: () => ({
    meta: [
      { title: "Assets & Packages — Flowearn Rewards" },
      { name: "description", content: "Invest in Flowearn packages with fixed 16-day cycles and daily income, and manage your income, affiliate and deposit wallets." },
      { property: "og:title", content: "Assets & Packages — Flowearn Rewards" },
      { property: "og:description", content: "Invest in daily-income packages and manage your wallets." },
    ],
  }),
  component: AssetsPage,
});

const PACKAGES = [
  { tag: "BASIC", name: "Earnex 1", price: 1000, cycle: 16, daily: 125, total: 2000 },
  { tag: "ENTRY", name: "Earnex 2", price: 2000, cycle: 16, daily: 250, total: 4000 },
];

function AssetsPage() {
  const { state, logout } = useApp();
  const navigate = useNavigate();
  const w = state.wallets;

  return (
    <AppLayout>
      <h1 className="text-lg font-extrabold">Assets</h1>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-ink p-4 text-ink-foreground shadow-card">
          <p className="text-[10px] font-bold opacity-70">DEPOSIT BALANCE</p>
          <p className="mt-1.5 text-lg font-extrabold">{naira(w.deposit)}</p>
          <p className="text-[10px] opacity-60">For Investments</p>
        </div>
        <div className="rounded-2xl bg-brand p-4 text-brand-foreground shadow-card">
          <p className="text-[10px] font-bold opacity-70">INCOME BALANCE</p>
          <p className="mt-1.5 text-lg font-extrabold">{naira(w.income)}</p>
          <p className="text-[10px] opacity-70">From daily income</p>
        </div>
      </div>

      <h2 className="mt-6 text-sm font-bold">Available Packages</h2>
      <div className="mt-3 space-y-3">
        {PACKAGES.map((p) => (
          <div key={p.name} className="rounded-2xl bg-card p-4 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-full bg-brand/20 px-2 py-0.5 text-[10px] font-bold">
                  {p.tag}
                </span>
                <p className="mt-2 text-base font-extrabold">{p.name}</p>
              </div>
              <p className="text-base font-extrabold">{naira(p.price)}</p>
            </div>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="rounded-xl bg-secondary py-2">
                <dt className="text-muted-foreground">Cycle</dt>
                <dd className="font-bold">{p.cycle}d</dd>
              </div>
              <div className="rounded-xl bg-secondary py-2">
                <dt className="text-muted-foreground">Daily Income</dt>
                <dd className="font-bold">{naira(p.daily)}/day</dd>
              </div>
              <div className="rounded-xl bg-secondary py-2">
                <dt className="text-muted-foreground">Total</dt>
                <dd className="font-bold">{naira(p.total)}</dd>
              </div>
            </dl>
            <button
              onClick={() =>
                w.deposit >= p.price
                  ? toast.success(`${p.name} activated`)
                  : toast.error("Insufficient deposit balance. Fund your wallet to invest.")
              }
              className="mt-3 h-10 w-full rounded-xl bg-brand text-xs font-bold text-brand-foreground"
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>

      <h2 className="mt-6 text-sm font-bold">My Wallets</h2>
      <div className="mt-3 space-y-3">
        {[
          { label: "Income Wallet", value: w.income, tone: "bg-success" },
          { label: "Affiliate Wallet", value: w.affiliate, tone: "bg-info" },
          { label: "Deposit Wallet", value: w.deposit, tone: "bg-warn" },
        ].map((x) => (
          <div
            key={x.label}
            className={cn(
              "flex items-center justify-between rounded-2xl p-4 text-ink-foreground shadow-card",
              x.tone,
            )}
          >
            <span className="flex items-center gap-2 text-sm font-bold">
              <Wallet className="size-4" /> {x.label}
            </span>
            <span className="text-sm font-extrabold">{naira(x.value)}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => toast.info("Withdrawal request opened")}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-ink text-xs font-bold text-ink-foreground"
        >
          <ArrowUpFromLine className="size-4" /> Withdraw
        </button>
        <button
          onClick={() => toast.info("Deposit details sent")}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand text-xs font-bold text-brand-foreground"
        >
          <ArrowDownToLine className="size-4" /> Deposit
        </button>
      </div>
      <button
        onClick={() => {
          logout();
          navigate({ to: "/login" });
        }}
        className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 text-xs font-bold text-destructive"
      >
        <LogOut className="size-4" /> Logout
      </button>
    </AppLayout>
  );
}
