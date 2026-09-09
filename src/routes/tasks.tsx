import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, ExternalLink, Search, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { ENGAGEMENTS, naira, PLATFORMS, useApp, type Task } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Flowearn Rewards" },
      {
        name: "description",
        content:
          "Browse paid social tasks, submit proof and place your own ads across Facebook, TikTok, Telegram and more on Flowearn.",
      },
      { property: "og:title", content: "Tasks — Flowearn Rewards" },
      { property: "og:description", content: "Complete social tasks or place ads on Flowearn." },
    ],
  }),
  component: TasksPage,
});

const TABS = ["Available", "My Submissions", "Place Ad"] as const;

function TasksPage() {
  const { state } = useApp();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Available");
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState("All platforms");

  const filtered = useMemo(
    () =>
      state.tasks.filter(
        (t) =>
          t.status === "running" &&
          t.taken < t.quantity &&
          (platform === "All platforms" || t.platform === platform) &&
          `${t.type} ${t.platform}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [state.tasks, query, platform],
  );

  return (
    <AppLayout>
      <h1 className="text-lg font-extrabold">Tasks</h1>

      <div className="mt-3 grid grid-cols-3 gap-1 rounded-2xl bg-secondary p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-xl py-2 text-[11px] font-bold",
              tab === t ? "bg-card text-foreground shadow-card" : "text-muted-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab !== "Place Ad" && (
        <div className="mt-3 flex gap-2">
          <div className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-input bg-card px-3">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="h-11 rounded-xl border border-input bg-card px-2 text-xs font-semibold outline-none"
          >
            <option>All platforms</option>
            {PLATFORMS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-4">
        {tab === "Available" && (
          <ul className="space-y-3">
            {filtered.map((t) => (
              <TaskCard key={t.id} task={t} onDone={() => setTab("My Submissions")} />
            ))}
            {filtered.length === 0 && (
              <li className="rounded-2xl bg-card p-8 text-center text-xs text-muted-foreground shadow-card">
                No tasks available right now — check back soon
              </li>
            )}
          </ul>
        )}

        {tab === "My Submissions" &&
          (state.submissions.length === 0 ? (
            <div className="rounded-2xl bg-card p-8 text-center shadow-card">
              <div className="mx-auto grid size-14 place-items-center rounded-full bg-secondary">
                <ClipboardList className="size-6 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm font-semibold">
                You have not submitted any task proof yet
              </p>
              <button
                onClick={() => setTab("Available")}
                className="mx-auto mt-4 h-10 rounded-xl bg-brand px-5 text-xs font-bold text-brand-foreground"
              >
                Find a task
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {state.submissions.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-card"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {s.proof?.startsWith("data:image") && (
                      <img
                        src={s.proof}
                        alt="Screenshot proof"
                        className="size-12 shrink-0 rounded-lg border border-border object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{s.task}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        Screenshot submitted
                      </p>
                    </div>
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
                </li>
              ))}
            </ul>
          ))}

        {tab === "Place Ad" && <PlaceAdForm />}
      </div>
    </AppLayout>
  );
}

function TaskCard({ task, onDone }: { task: Task; onDone: () => void }) {
  const { submitProof } = useApp();
  const [open, setOpen] = useState(false);
  const [proof, setProof] = useState("");

  const pickFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a screenshot image");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Screenshot must be smaller than 3MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setProof(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <li className="rounded-2xl bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
            {task.platform}
          </span>
          <p className="mt-2 text-sm font-bold">
            {task.type} on {task.platform}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {task.quantity - task.taken} slots left
          </p>
        </div>
        <span className="shrink-0 text-sm font-extrabold text-success">{naira(task.price)}</span>
      </div>

      {task.link ? (
        <a
          href={task.link}
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-secondary text-xs font-bold text-secondary-foreground"
        >
          <ExternalLink className="size-4" /> Open task link
        </a>
      ) : null}

      {open ? (
        <form
          className="mt-3 space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!proof) {
              toast.error("Upload a screenshot as proof");
              return;
            }
            const res = submitProof(task.id, proof);
            if (!res.ok) {
              toast.error(res.message);
              return;
            }
            toast.success(res.message);
            setProof("");
            setOpen(false);
            onDone();
          }}
        >
          <label className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-background text-xs font-bold text-muted-foreground">
            <Upload className="size-4" />
            {proof ? "Change screenshot" : "Upload screenshot proof"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
          </label>
          {proof && (
            <img
              src={proof}
              alt="Screenshot preview"
              className="max-h-48 w-full rounded-xl border border-border object-contain"
            />
          )}
          <p className="text-[10px] text-muted-foreground">
            Screenshots only · max 3MB. Your proof goes to admin for review.
          </p>
          <div className="flex gap-2">
            <button className="h-10 flex-1 rounded-xl bg-brand text-xs font-bold text-brand-foreground">
              Submit proof
            </button>
            <button
              type="button"
              onClick={() => {
                setProof("");
                setOpen(false);
              }}
              className="h-10 flex-1 rounded-xl bg-secondary text-xs font-semibold text-secondary-foreground"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="mt-2 h-10 w-full rounded-xl bg-brand text-xs font-bold text-brand-foreground"
        >
          Do Task
        </button>
      )}
    </li>
  );
}


function PlaceAdForm() {
  const { state } = useApp();
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [engagement, setEngagement] = useState(ENGAGEMENTS[0]);
  const [quantity, setQuantity] = useState(10);
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");

  const pricePerUnit = 20;
  const total = Math.max(0, quantity) * pricePerUnit;
  const balance = state.wallets.task;

  const inputCls =
    "h-11 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus:border-brand";

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (quantity < 10 || quantity > 100000) {
          toast.error("Quantity must be between 10 and 100,000");
          return;
        }
        if (total > balance) {
          toast.error("Insufficient wallet balance");
          return;
        }
        toast.success("Ad order placed — our team will review it shortly");
        setLink("");
        setDescription("");
      }}
    >
      <div>
        <p className="mb-1.5 text-[11px] font-bold text-muted-foreground">PLATFORM *</p>
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={inputCls}>
          {PLATFORMS.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>
      <div>
        <p className="mb-1.5 text-[11px] font-bold text-muted-foreground">ENGAGEMENT TYPE *</p>
        <select
          value={engagement}
          onChange={(e) => setEngagement(e.target.value)}
          className={inputCls}
        >
          {ENGAGEMENTS.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>
      <div>
        <p className="mb-1.5 text-[11px] font-bold text-muted-foreground">QUANTITY *</p>
        <input
          type="number"
          min={10}
          max={100000}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className={inputCls}
        />
        <p className="mt-1 text-[10px] text-muted-foreground">Minimum 10, maximum 100,000</p>
      </div>
      <div>
        <p className="mb-1.5 text-[11px] font-bold text-muted-foreground">TARGET LINK *</p>
        <input
          required
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://"
          className={inputCls}
        />
      </div>
      <div>
        <p className="mb-1.5 text-[11px] font-bold text-muted-foreground">DESCRIPTION</p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Tell workers what to do"
          className="w-full rounded-xl border border-input bg-card p-3 text-sm outline-none focus:border-brand"
        />
      </div>

      <div className="rounded-2xl bg-card p-4 text-xs shadow-card">
        <p className="text-sm font-bold">Summary</p>
        <dl className="mt-3 space-y-2">
          {[
            ["Platform", platform ?? ""],
            ["Engagement type", engagement ?? ""],
            ["Quantity", String(quantity)],
            ["Price per unit", naira(pricePerUnit)],
            ["Total charge", naira(total)],
            ["Wallet balance", naira(balance)],
            ["Balance after order", naira(balance - total)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="font-bold">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <button className="h-11 w-full rounded-xl bg-brand text-sm font-bold text-brand-foreground">
        Place Ad
      </button>
    </form>
  );
}
