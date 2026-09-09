import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Users,
  PlayCircle,
  Headphones,
  Eye,
  EyeOff,
  Megaphone,
  TrendingUp,
  Gift,
  Check,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { naira, today, useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Flowearn Rewards" },
      { name: "description", content: "Track your Flowearn wallets, daily check-in streak, investments and referral earnings in one mobile dashboard." },
      { property: "og:title", content: "Dashboard — Flowearn Rewards" },
      { property: "og:description", content: "Track wallets, check-in streak and earnings on Flowearn." },
    ],
  }),
  component: DashboardPage,
});

const quickActions = [
  { label: "Deposit", icon: ArrowDownToLine, to: "/assets" },
  { label: "Withdraw", icon: ArrowUpFromLine, to: "/assets" },
  { label: "Referral", icon: Users, to: "/profile" },
  { label: "Watch", icon: PlayCircle, to: "/watch" },
  { label: "Support", icon: Headphones, to: "/profile" },
] as const;

function DashboardPage() {
  const { state, checkIn, spin } = useApp();
  const [hidden, setHidden] = useState(false);
  const w = state.wallets;
  const total = w.task + w.income + w.affiliate;
  const claimedToday = state.lastCheckIn === today();
  const spunToday = state.lastSpin === today();
  const dateLabel = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const show = (v: number) => (hidden ? "₦****" : naira(v));

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-2xl bg-brand p-3 text-brand-foreground shadow-card">
          <Megaphone className="mt-0.5 size-4 shrink-0" />
          <p className="text-xs font-semibold leading-relaxed">
            Welcome to Flowearn! Complete daily tasks, invest and withdraw straight to your bank.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold">Good morning {state.user?.username ?? "there"}</h1>
            <p className="text-xs text-muted-foreground">{dateLabel}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Link
              to="/tasks"
              className="rounded-full bg-ink px-3 py-1.5 text-[10px] font-bold text-ink-foreground"
            >
              PLACE ADS
            </Link>
            <span className="rounded-full bg-warn/15 px-3 py-1 text-[10px] font-bold text-warn">
              {state.user?.rank ?? "BRONZE"}
            </span>
          </div>
        </div>

        <section className="rounded-2xl bg-ink p-5 text-ink-foreground shadow-card">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-bold tracking-wide opacity-70">TOTAL WITHDRAWABLE</p>
            <button onClick={() => setHidden((h) => !h)} aria-label="Toggle balance">
              {hidden ? <EyeOff className="size-4 opacity-70" /> : <Eye className="size-4 opacity-70" />}
            </button>
          </div>
          <p className="mt-1 text-3xl font-extrabold tracking-tight">{show(total)}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-white/10 px-3 py-2">
              <p className="opacity-70">Earned</p>
              <p className="mt-0.5 font-bold">{show(state.earned)}</p>
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-2">
              <p className="opacity-70">Withdrawn</p>
              <p className="mt-0.5 font-bold">{show(state.withdrawn)}</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "TASK", value: w.task, tone: "bg-brand/20 text-foreground" },
            { label: "INCOME", value: w.income, tone: "bg-success/15 text-success" },
            { label: "AFFILIATE", value: w.affiliate, tone: "bg-info/15 text-info" },
            { label: "DEPOSIT", value: w.deposit, tone: "bg-warn/15 text-warn" },
          ].map((c) => (
            <div key={c.label} className="rounded-2xl bg-card p-4 shadow-card">
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", c.tone)}>
                {c.label}
              </span>
              <p className="mt-2 text-base font-extrabold">{show(c.value)}</p>
              <p className="text-[10px] text-muted-foreground">Wallet balance</p>
            </div>
          ))}
        </div>

        <section className="rounded-2xl bg-card p-4 shadow-card">
          <h2 className="text-sm font-bold">Quick Actions</h2>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {quickActions.map((a) => (
              <Link key={a.label} to={a.to} className="flex flex-col items-center gap-1.5">
                <span className="grid size-11 place-items-center rounded-xl bg-secondary">
                  <a.icon className="size-5" />
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground">{a.label}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-between rounded-2xl bg-success p-4 text-success-foreground shadow-card">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-bold">
              <TrendingUp className="size-4" /> Grow Your Money
            </p>
            <p className="mt-0.5 text-[11px] opacity-90">Earn daily income from packages</p>
          </div>
          <Link
            to="/assets"
            className="rounded-xl bg-white/20 px-3 py-2 text-xs font-bold backdrop-blur"
          >
            Invest Now
          </Link>
        </section>

        <section className="rounded-2xl bg-card p-4 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">Daily Check-in</h2>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Streak: {Math.max(state.streak, 0)}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1.5">
            {Array.from({ length: 7 }, (_, i) => i + 1).map((d) => {
              const done = d <= state.streak;
              return (
                <div
                  key={d}
                  className={cn(
                    "grid aspect-square place-items-center rounded-xl text-[11px] font-bold",
                    done ? "bg-brand text-brand-foreground" : "bg-secondary text-muted-foreground",
                  )}
                >
                  {done ? <Check className="size-4" /> : d}
                </div>
              );
            })}
          </div>
          <button
            disabled={claimedToday}
            onClick={() => {
              checkIn();
              toast.success("Check-in reward of ₦50.00 claimed");
            }}
            className={cn(
              "mt-3 h-11 w-full rounded-xl text-sm font-bold",
              claimedToday
                ? "bg-secondary text-muted-foreground"
                : "bg-brand text-brand-foreground",
            )}
          >
            {claimedToday ? "Already claimed today" : "Claim ₦50.00 check-in"}
          </button>
        </section>

        <section className="rounded-2xl bg-card p-4 shadow-card">
          <h2 className="text-sm font-bold">Overview</h2>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
            {[
              { label: "Pending", value: state.submissions.filter((s) => s.status === "pending").length },
              { label: "Investments", value: 0 },
              { label: "Referrals", value: 0 },
              { label: "Completed", value: state.submissions.filter((s) => s.status === "approved").length },
            ].map((o) => (
              <div key={o.label} className="rounded-xl bg-secondary py-3">
                <p className="text-base font-extrabold">{o.value}</p>
                <p className="text-[10px] text-muted-foreground">{o.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-between rounded-2xl bg-ink p-4 text-ink-foreground shadow-card">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-bold">
              <Gift className="size-4 text-brand" /> Spin &amp; Win
            </p>
            <p className="mt-0.5 text-[11px] opacity-70">Try your luck daily</p>
          </div>
          <button
            disabled={spunToday}
            onClick={() => {
              const won = spin();
              if (won) toast.success(`You won ${naira(won)}!`);
            }}
            className={cn(
              "rounded-xl px-3 py-2 text-xs font-bold",
              spunToday ? "bg-white/10 opacity-60" : "bg-brand text-brand-foreground",
            )}
          >
            {spunToday ? "Come back tomorrow" : "Spin Now"}
          </button>
        </section>

        <section className="rounded-2xl bg-card p-4 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">Recent Activity</h2>
            <Link to="/profile" className="text-[11px] font-bold text-muted-foreground">
              View all
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-border">
            {state.activity.length === 0 ? (
              <li className="py-6 text-center text-xs text-muted-foreground">No activity yet</li>
            ) : (
              state.activity.slice(0, 6).map((a) => (
                <li key={a.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-xs font-semibold">{a.label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(a.at).toLocaleString("en-NG")}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-success">+{naira(a.amount)}</span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </AppLayout>
  );
}
