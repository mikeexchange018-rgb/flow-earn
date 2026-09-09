import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { adminLogin, getAdminSession, adminLogout } from "@/lib/admin.functions";
import {
  BarChart3,
  Users,
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardList,
  FileCheck2,
  PiggyBank,
  Share2,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { ENGAGEMENTS, naira, PLATFORMS, useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — Flowearn" },
      {
        name: "description",
        content:
          "Flowearn admin console: manage users, withdrawals, deposits, tasks, submissions, investments, referrals and site settings.",
      },
      { property: "og:title", content: "Admin Console — Flowearn" },
      {
        property: "og:description",
        content: "Manage Flowearn users, payouts, tasks and platform settings.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Tab =
  | "Dashboard"
  | "Users"
  | "Withdrawals"
  | "Deposits"
  | "Tasks"
  | "Submissions"
  | "Investments"
  | "Referrals"
  | "Site Settings";

const TABS: { key: Tab; icon: typeof Users }[] = [
  { key: "Dashboard", icon: BarChart3 },
  { key: "Users", icon: Users },
  { key: "Withdrawals", icon: ArrowUpFromLine },
  { key: "Deposits", icon: ArrowDownToLine },
  { key: "Tasks", icon: ClipboardList },
  { key: "Submissions", icon: FileCheck2 },
  { key: "Investments", icon: PiggyBank },
  { key: "Referrals", icon: Share2 },
  { key: "Site Settings", icon: Settings },
];


type Withdrawal = { id: string; user: string; amount: number; bank: string; status: string };

const WITHDRAWALS: Withdrawal[] = [];

type Deposit = { id: string; user: string; amount: number; method: string; status: string };

const DEPOSITS: Deposit[] = [];

type Investment = {

  id: string;
  user: string;
  plan: string;
  amount: number;
  daily: number;
  status: string;
};

const INVESTMENTS: Investment[] = [];

type Referral = { referrer: string; invited: number; earned: number };

const REFERRALS: Referral[] = [];

function toneFor(status: string) {
  if (["approved", "confirmed", "active", "running", "completed"].includes(status))
    return "bg-success/10 text-success";
  if (["pending", "paused"].includes(status)) return "bg-brand/20 text-brand-foreground";
  return "bg-destructive/10 text-destructive";
}

function Pill({ status }: { status: string }) {
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", toneFor(status))}>
      {status}
    </span>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-card p-4 shadow-card">
      <h2 className="mb-3 text-sm font-bold">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <p className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
      {label}
    </p>
  );
}



function Row({
  title,
  subtitle,
  value,
  status,
  actions,
}: {
  title: string;
  subtitle: string;
  value?: string | undefined;
  status?: string | undefined;
  actions?: string[] | undefined;
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="shrink-0 text-right">
          {value ? <p className="text-sm font-bold">{value}</p> : null}
          {status ? <Pill status={status} /> : null}
        </div>
      </div>
      {actions?.length ? (
        <div className="mt-3 flex gap-2">
          {actions.map((a) => (
            <button
              key={a}
              onClick={() => toast.success(`${a} — ${title}`)}
              className="h-8 flex-1 rounded-lg bg-secondary text-xs font-semibold text-secondary-foreground"
            >
              {a}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <p className="text-[11px] font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-extrabold">{value}</p>
    </div>
  );
}

function SiteSettings() {
  const [form, setForm] = useState({
    siteName: "Flowearn",
    minWithdrawal: "1000",
    referralBonus: "300",
    welcomeBonus: "100",
    maintenance: false,
  });
  return (
    <Card title="Site Settings">
      {(
        [
          ["Site name", "siteName"],
          ["Minimum withdrawal (₦)", "minWithdrawal"],
          ["Referral bonus (₦)", "referralBonus"],
          ["Welcome bonus (₦)", "welcomeBonus"],
        ] as const
      ).map(([label, key]) => (
        <label key={key} className="block">
          <span className="text-[11px] font-semibold uppercase text-muted-foreground">{label}</span>
          <input
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
          />
        </label>
      ))}
      <label className="flex items-center justify-between rounded-xl border border-border p-3">
        <span className="text-sm font-semibold">Maintenance mode</span>
        <input
          type="checkbox"
          checked={form.maintenance}
          onChange={(e) => setForm({ ...form, maintenance: e.target.checked })}
          className="size-5 accent-[hsl(var(--brand))]"
        />
      </label>
      <button
        onClick={() => toast.success("Settings saved")}
        className="h-11 w-full rounded-xl bg-brand text-sm font-bold text-brand-foreground"
      >
        Save Settings
      </button>
    </Card>
  );
}

const EMPTY_TASK = { platform: "", type: "", link: "", price: "", quantity: "" };

function TasksManager() {
  const { state, addTask, updateTask, toggleTask, deleteTask } = useApp();
  const tasks = state.tasks;
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_TASK);

  function reset() {
    setEditing(null);
    setForm(EMPTY_TASK);
  }

  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const price = Number(form.price);
    const quantity = Number(form.quantity);
    if (!form.platform.trim() || !form.type.trim()) {
      toast.error("Platform and engagement type are required");
      return;
    }
    if (!form.link.trim()) {
      toast.error("Task link is required so users can open it");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Enter a valid amount per task");
      return;
    }
    if (!Number.isFinite(quantity) || quantity < 1) {
      toast.error("Enter how many people should join");
      return;
    }
    const payload = {
      platform: form.platform.trim(),
      type: form.type.trim(),
      link: form.link.trim(),
      price,
      quantity,
    };
    if (editing) {
      updateTask(editing, payload);
      toast.success("Task updated");
    } else {
      addTask(payload);
      toast.success("Task uploaded — it is now live for users");
    }
    reset();
  }

  const total = Number(form.price || 0) * Number(form.quantity || 0);

  return (
    <div className="space-y-3">
      <Card title={editing ? "Edit task" : "Upload new task"}>
        <form onSubmit={save} className="space-y-3">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground">
              Platform
            </span>
            <select
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
              className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
            >
              <option value="">Select platform</option>
              {PLATFORMS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase text-muted-foreground">
              Engagement type
            </span>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
            >
              <option value="">Select engagement</option>
              {ENGAGEMENTS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          {(
            [
              ["Task link", "link", "text"],
              ["Amount per task (₦)", "price", "number"],
              ["People needed", "quantity", "number"],
            ] as const
          ).map(([label, key, type]) => (
            <label key={key} className="block">
              <span className="text-[11px] font-semibold uppercase text-muted-foreground">
                {label}
              </span>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={key === "link" ? "https://" : undefined}
                className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
              />
            </label>
          ))}
          <div className="rounded-xl border border-border p-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total budget</span>
              <span className="font-bold">{naira(Number.isFinite(total) ? total : 0)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="h-11 flex-1 rounded-xl bg-brand text-sm font-bold text-brand-foreground">
              {editing ? "Save changes" : "Upload task"}
            </button>
            {editing ? (
              <button
                type="button"
                onClick={reset}
                className="h-11 flex-1 rounded-xl bg-secondary text-sm font-semibold text-secondary-foreground"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </Card>

      <Card title="All tasks">
        {tasks.map((t) => (
          <div key={t.id} className="rounded-xl border border-border p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {t.platform} · {t.type}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {t.taken}/{t.quantity} joined · {naira(t.price)}/task
                </p>
                {t.link ? (
                  <a
                    href={t.link}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-[11px] font-semibold text-brand"
                  >
                    {t.link}
                  </a>
                ) : null}
              </div>
              <Pill status={t.status} />
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  setEditing(t.id);
                  setForm({
                    platform: t.platform,
                    type: t.type,
                    link: t.link,
                    price: String(t.price),
                    quantity: String(t.quantity),
                  });
                }}
                className="h-8 flex-1 rounded-lg bg-secondary text-xs font-semibold text-secondary-foreground"
              >
                Edit
              </button>
              <button
                onClick={() => toggleTask(t.id)}
                className="h-8 flex-1 rounded-lg bg-secondary text-xs font-semibold text-secondary-foreground"
              >
                {t.status === "running" ? "Pause" : "Resume"}
              </button>
              <button
                onClick={() => {
                  deleteTask(t.id);
                  if (editing === t.id) reset();
                  toast.success("Task deleted");
                }}
                className="h-8 flex-1 rounded-lg bg-destructive/10 text-xs font-semibold text-destructive"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && <Empty label="No tasks uploaded yet" />}
      </Card>
    </div>
  );
}


type Gate = "loading" | "locked" | "unlocked";

function AdminLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const login = useServerFn(adminLogin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    try {
      const { ok } = await login({ data: { email, password } });
      if (ok) onSuccess();
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppLayout>
      <div className="p-4">
        <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-sm space-y-4 rounded-2xl bg-card p-6 shadow-card">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-xl font-extrabold text-brand-foreground">
              F
            </div>
            <h1 className="text-lg font-extrabold">Admin Access</h1>
            <p className="text-xs text-muted-foreground">
              Restricted to the Flowearn administrator.
            </p>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold tracking-wide text-muted-foreground">
              ADMIN EMAIL
            </span>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin email"
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-brand"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold tracking-wide text-muted-foreground">
              PASSWORD
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-brand"
            />
          </label>
          {error && (
            <p className="text-center text-xs font-semibold text-destructive">
              Invalid admin credentials
            </p>
          )}
          <button
            disabled={busy}
            className="h-11 w-full rounded-xl bg-brand text-sm font-bold text-brand-foreground disabled:opacity-60"
          >
            {busy ? "Verifying…" : "Unlock Console"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}

function AdminPage() {
  const { state, isAdmin } = useApp();
  const [tab, setTab] = useState<Tab>("Dashboard");
  const [gate, setGate] = useState<Gate>("loading");
  const checkSession = useServerFn(getAdminSession);
  const lockConsole = useServerFn(adminLogout);

  useEffect(() => {
    let cancelled = false;
    // An already signed-in admin account skips the extra admin sign-in.
    if (isAdmin) {
      setGate("unlocked");
      return;
    }
    checkSession()
      .then(({ unlocked }) => {
        if (!cancelled) setGate(unlocked ? "unlocked" : "locked");
      })
      .catch(() => {
        if (!cancelled) setGate("locked");
      });
    return () => {
      cancelled = true;
    };
  }, [checkSession]);

  if (gate === "loading") {
    return (
      <AppLayout>
        <p className="p-6 text-center text-sm text-muted-foreground">Checking permissions…</p>
      </AppLayout>
    );
  }

  if (gate === "locked") {
    return <AdminLoginForm onSuccess={() => setGate("unlocked")} />;
  }

  return (
    <AppLayout>
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-extrabold">Admin Console</h1>
            <p className="truncate text-xs text-muted-foreground">
              Signed in as {state.user?.email}
            </p>
          </div>
          <button
            onClick={() => {
              void lockConsole().finally(() => setGate("locked"));
            }}
            className="h-9 shrink-0 rounded-xl bg-secondary px-3 text-xs font-bold text-secondary-foreground"
          >
            Lock console
          </button>
        </div>

        <div className="-mx-4 overflow-x-auto px-4">
          <div className="flex w-max gap-2">
            {TABS.map(({ key, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold",
                  tab === key
                    ? "bg-brand text-brand-foreground"
                    : "bg-card text-muted-foreground shadow-card",
                )}
              >
                <Icon className="size-4" />
                {key}
              </button>
            ))}
          </div>
        </div>

        {tab === "Dashboard" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Total users" value={String(state.members.length)} />
              <Stat
                label="Pending withdrawals"
                value={String(WITHDRAWALS.filter((w) => w.status === "pending").length)}
              />
              <Stat
                label="Deposits today"
                value={naira(DEPOSITS.reduce((sum, d) => sum + d.amount, 0))}
              />
              <Stat
                label="Active investments"
                value={String(INVESTMENTS.filter((i) => i.status === "active").length)}
              />
            </div>
            <Card title="Latest activity">
              <Empty label="No activity yet" />
            </Card>
          </div>
        )}

        {tab === "Users" && <UsersManager />}

        {tab === "Withdrawals" && (
          <Card title="Withdrawal requests">
            {WITHDRAWALS.map((w) => (
              <Row
                key={w.id}
                title={`${w.id} · ${w.user}`}
                subtitle={w.bank}
                value={naira(w.amount)}
                status={w.status}
                actions={w.status === "pending" ? ["Approve", "Reject"] : undefined}
              />
            ))}
            {WITHDRAWALS.length === 0 && <Empty label="No withdrawal requests" />}
          </Card>
        )}

        {tab === "Deposits" && (
          <Card title="Deposits">
            {DEPOSITS.map((d) => (
              <Row
                key={d.id}
                title={`${d.id} · ${d.user}`}
                subtitle={d.method}
                value={naira(d.amount)}
                status={d.status}
                actions={d.status === "pending" ? ["Confirm", "Decline"] : undefined}
              />
            ))}
            {DEPOSITS.length === 0 && <Empty label="No deposits yet" />}
          </Card>
        )}

        {tab === "Tasks" && <TasksManager />}

        {tab === "Submissions" && <SubmissionsManager />}


        {tab === "Investments" && (
          <Card title="Investments">
            {INVESTMENTS.map((i) => (
              <Row
                key={i.id}
                title={`${i.plan} · ${i.user}`}
                subtitle={`${i.id} · ${naira(i.daily)}/day`}
                value={naira(i.amount)}
                status={i.status}
              />
            ))}
            {INVESTMENTS.length === 0 && <Empty label="No investments yet" />}
          </Card>
        )}

        {tab === "Referrals" && (
          <Card title="Referrals">
            {REFERRALS.map((r) => (
              <Row
                key={r.referrer}
                title={r.referrer}
                subtitle={`${r.invited} invited`}
                value={naira(r.earned)}
              />
            ))}
            {REFERRALS.length === 0 && <Empty label="No referrals yet" />}
          </Card>
        )}

        {tab === "Site Settings" && <SiteSettings />}
      </div>
    </AppLayout>
  );
}

function UsersManager() {
  const { state } = useApp();
  const [q, setQ] = useState("");
  const members = state.members
    .map((m) => ({
      ...m,
      withdrawable: m.wallets.task + m.wallets.income + m.wallets.affiliate,
    }))
    .filter((m) =>
      `${m.username} ${m.email}`.toLowerCase().includes(q.trim().toLowerCase()),
    )
    .sort((a, b) => b.withdrawable - a.withdrawable);

  const totalWaiting = members.reduce((sum, m) => sum + m.withdrawable, 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Registered users" value={String(state.members.length)} />
        <Stat label="Money waiting" value={naira(totalWaiting)} />
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name or email"
        className="h-11 w-full rounded-xl bg-card px-3 text-sm shadow-card outline-none"
      />

      <Card title="Users">
        {members.map((m) => (
          <div key={m.email} className="border-b border-border py-3 last:border-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{m.username}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {m.email} · {m.rank}
                </p>
                {m.phone && <p className="text-xs text-muted-foreground">{m.phone}</p>}
                <p className="text-[11px] text-muted-foreground">
                  Joined {new Date(m.joinedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-extrabold">{naira(m.withdrawable)}</p>
                <p className="text-[11px] text-muted-foreground">withdrawable</p>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2 text-center">
              {(
                [
                  ["Task", m.wallets.task],
                  ["Income", m.wallets.income],
                  ["Affiliate", m.wallets.affiliate],
                  ["Deposit", m.wallets.deposit],
                ] as const
              ).map(([label, amount]) => (
                <div key={label} className="rounded-xl bg-secondary px-1 py-1.5">
                  <p className="text-[10px] font-bold text-muted-foreground">{label}</p>
                  <p className="text-[11px] font-bold">{naira(amount)}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Earned {naira(m.earned)} · Withdrawn {naira(m.withdrawn)}
            </p>
          </div>
        ))}
        {members.length === 0 && <Empty label="No users yet" />}
      </Card>
    </div>
  );
}

function SubmissionsManager() {
  const { state, reviewSubmission } = useApp();
  const [zoom, setZoom] = useState<string | null>(null);
  const pending = state.submissions.filter((s) => s.status === "pending");
  const reviewed = state.submissions.filter((s) => s.status !== "pending");

  const list = (items: typeof state.submissions) =>
    items.map((s) => (
      <div key={s.id} className="border-b border-border py-4 last:border-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{s.task}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {state.user?.username ?? "user"} · {new Date(s.at).toLocaleString()}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs font-extrabold">{naira(s.amount)}</p>
            <span
              className={cn(
                "text-[10px] font-bold capitalize",
                s.status === "approved"
                  ? "text-success"
                  : s.status === "rejected"
                    ? "text-destructive"
                    : "text-warn",
              )}
            >
              {s.status}
            </span>
          </div>
        </div>

        {s.proof?.startsWith("data:image") ? (
          <button
            type="button"
            onClick={() => setZoom(s.proof)}
            className="mt-3 block w-full overflow-hidden rounded-xl border border-border"
          >
            <img src={s.proof} alt="Screenshot proof" className="max-h-64 w-full object-contain" />
          </button>
        ) : (
          <p className="mt-2 break-all text-[11px] text-muted-foreground">Proof: {s.proof}</p>
        )}

        {s.status === "pending" && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => {
                reviewSubmission(s.id, "approved");
                toast.success("Submission approved and user paid");
              }}
              className="h-10 flex-1 rounded-xl bg-brand text-xs font-bold text-brand-foreground"
            >
              Approve
            </button>
            <button
              onClick={() => {
                reviewSubmission(s.id, "rejected");
                toast.success("Submission rejected");
              }}
              className="h-10 flex-1 rounded-xl bg-secondary text-xs font-semibold text-secondary-foreground"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    ));

  return (
    <div className="space-y-4">
      <Card title={`Pending proofs (${pending.length})`}>
        {pending.length === 0 ? <Empty label="No pending task proofs" /> : list(pending)}
      </Card>
      <Card title="Reviewed">
        {reviewed.length === 0 ? <Empty label="Nothing reviewed yet" /> : list(reviewed)}
      </Card>

      {zoom && (
        <button
          type="button"
          onClick={() => setZoom(null)}
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/80 p-4"
        >
          <img src={zoom} alt="Screenshot proof" className="max-h-full w-full object-contain" />
        </button>
      )}
    </div>
  );
}
