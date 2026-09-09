import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const ADMIN_EMAILS = ["serikitunmishe@gmail.com", "serikitumnishe@gmail.com"];
export const ADMIN_EMAIL = ADMIN_EMAILS[0]!;

export type Activity = { id: string; label: string; amount: number; at: string };

export type Wallets = {
  task: number;
  income: number;
  affiliate: number;
  deposit: number;
};

export type Task = {
  id: string;
  platform: string;
  type: string;
  link: string;
  price: number;
  quantity: number;
  taken: number;
  status: "running" | "paused";
};

export type Submission = {
  id: string;
  taskId: string;
  task: string;
  platform: string;
  proof: string;
  status: "pending" | "approved" | "rejected";
  amount: number;
  at: string;
};

export type AppUser = {
  username: string;
  email: string;
  phone?: string;
  rank: string;
};

export type MemberRecord = {
  username: string;
  email: string;
  phone?: string;
  rank: string;
  joinedAt: string;
  wallets: Wallets;
  earned: number;
  withdrawn: number;
};

type State = {
  user: AppUser | null;
  members: MemberRecord[];
  wallets: Wallets;
  earned: number;
  withdrawn: number;
  activity: Activity[];
  tasks: Task[];
  submissions: Submission[];
  lastCheckIn: string | null;
  streak: number;
  lastSpin: string | null;
  seenChannelPopup: boolean;
  bank: { bank: string; accountNumber: string; accountName: string; verified: boolean };
};

const initialState: State = {
  user: null,
  members: [],
  wallets: { task: 0, income: 0, affiliate: 0, deposit: 0 },
  earned: 0,
  withdrawn: 0,
  activity: [],
  tasks: [],
  submissions: [],
  lastCheckIn: null,
  streak: 0,
  lastSpin: null,
  seenChannelPopup: false,
  bank: { bank: "", accountNumber: "", accountName: "", verified: false },
};

const KEY = "flowearn-state-v1";
export const today = () => new Date().toISOString().slice(0, 10);

export type TaskInput = {
  platform: string;
  type: string;
  link: string;
  price: number;
  quantity: number;
};

type Ctx = {
  state: State;
  ready: boolean;
  isAdmin: boolean;
  register: (u: { username: string; email: string; phone?: string }) => void;
  login: (email: string) => void;
  logout: () => void;
  checkIn: () => void;
  spin: () => number | null;
  dismissPopup: () => void;
  addTask: (t: TaskInput) => void;
  updateTask: (id: string, t: TaskInput) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  submitProof: (taskId: string, proof: string) => { ok: boolean; message: string };
  reviewSubmission: (id: string, status: "approved" | "rejected") => void;
  withdraw: (amount: number) => { ok: boolean; message: string };
  deposit: (amount: number) => { ok: boolean; message: string };
  setBank: (b: Partial<State["bank"]>) => void;
};

const AppContext = createContext<Ctx | null>(null);

const sameEmail = (a?: string | null, b?: string | null) =>
  (a ?? "").trim().toLowerCase() === (b ?? "").trim().toLowerCase();

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...initialState, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, ready]);

  // Keep a registry of every account that has used this app, with its latest balances.
  useEffect(() => {
    if (!ready) return;
    setState((s) => {
      const u = s.user;
      if (!u) return s;
      const existing = s.members.find((m) => sameEmail(m.email, u.email));
      const next: MemberRecord = {
        username: u.username,
        email: u.email,
        ...(u.phone ? { phone: u.phone } : {}),
        rank: u.rank,
        joinedAt: existing?.joinedAt ?? new Date().toISOString(),
        wallets: s.wallets,
        earned: s.earned,
        withdrawn: s.withdrawn,
      };
      if (existing && JSON.stringify(existing) === JSON.stringify(next)) return s;
      return {
        ...s,
        members: [next, ...s.members.filter((m) => !sameEmail(m.email, u.email))],
      };
    });
  }, [ready, state.user, state.wallets, state.earned, state.withdrawn]);

  const credit = (s: State, wallet: keyof Wallets, amount: number, label: string): State => ({
    ...s,
    wallets: { ...s.wallets, [wallet]: s.wallets[wallet] + amount },
    earned: s.earned + amount,
    activity: [
      { id: crypto.randomUUID(), label, amount, at: new Date().toISOString() },
      ...s.activity,
    ].slice(0, 30),
  });

  const register = useCallback((u: { username: string; email: string; phone?: string }) => {
    setState((s) =>
      credit(
        {
          ...s,
          ...initialState,
          tasks: s.tasks,
          members: s.members,
          user: { ...u, rank: "BRONZE" },
        },
        "task",
        100,
        "Welcome bonus",
      ),
    );
  }, []);

  const login = useCallback((email: string) => {
    setState((s) => {
      const known = s.members.find((m) => sameEmail(m.email, email));
      return {
        ...s,
        user:
          s.user && sameEmail(s.user.email, email)
            ? s.user
            : {
                username: known?.username ?? email.split("@")[0] ?? email,
                email,
                ...(known?.phone ? { phone: known.phone } : {}),
                rank: known?.rank ?? "BRONZE",
              },
        seenChannelPopup: false,
      };
    });
  }, []);

  const logout = useCallback(() => setState((s) => ({ ...s, user: null })), []);

  const checkIn = useCallback(() => {
    setState((s) => {
      if (s.lastCheckIn === today()) return s;
      const streak = Math.min(7, s.streak + 1);
      const next = credit(s, "task", 50, `Daily check-in (day ${streak})`);
      return { ...next, lastCheckIn: today(), streak };
    });
  }, []);

  const spin = useCallback(() => {
    let won: number | null = null;
    setState((s) => {
      if (s.lastSpin === today()) return s;
      const prizes = [10, 20, 30, 50, 75, 100];
      const prize = prizes[Math.floor(Math.random() * prizes.length)] ?? 10;
      won = prize;
      const next = credit(s, "task", prize, `Spin & Win reward`);
      return { ...next, lastSpin: today() };
    });
    return won;
  }, []);

  const dismissPopup = useCallback(() => setState((s) => ({ ...s, seenChannelPopup: true })), []);

  const addTask = useCallback((t: TaskInput) => {
    setState((s) => ({
      ...s,
      tasks: [{ ...t, id: crypto.randomUUID(), taken: 0, status: "running" as const }, ...s.tasks],
    }));
  }, []);

  const updateTask = useCallback((id: string, t: TaskInput) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((x) => (x.id === id ? { ...x, ...t } : x)),
    }));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((x) =>
        x.id === id ? { ...x, status: x.status === "running" ? "paused" : "running" } : x,
      ),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState((s) => ({ ...s, tasks: s.tasks.filter((x) => x.id !== id) }));
  }, []);

  const submitProof = useCallback((taskId: string, proof: string) => {
    let result = { ok: false, message: "Task not found" };
    setState((s) => {
      const task = s.tasks.find((t) => t.id === taskId);
      if (!task) return s;
      if (task.status !== "running") {
        result = { ok: false, message: "This task is paused" };
        return s;
      }
      if (task.taken >= task.quantity) {
        result = { ok: false, message: "All slots for this task are filled" };
        return s;
      }
      if (s.submissions.some((x) => x.taskId === taskId && x.status !== "rejected")) {
        result = { ok: false, message: "You already submitted this task" };
        return s;
      }
      if (!proof.trim()) {
        result = { ok: false, message: "Add your proof (username or screenshot link)" };
        return s;
      }
      result = { ok: true, message: "Proof submitted for review" };
      return {
        ...s,
        tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, taken: t.taken + 1 } : t)),
        submissions: [
          {
            id: crypto.randomUUID(),
            taskId,
            task: `${task.type} on ${task.platform}`,
            platform: task.platform,
            proof: proof.trim(),
            status: "pending" as const,
            amount: task.price,
            at: new Date().toISOString(),
          },
          ...s.submissions,
        ],
      };
    });
    return result;
  }, []);

  const reviewSubmission = useCallback((id: string, status: "approved" | "rejected") => {
    setState((s) => {
      const sub = s.submissions.find((x) => x.id === id);
      if (!sub || sub.status !== "pending") return s;
      const withStatus: State = {
        ...s,
        submissions: s.submissions.map((x) => (x.id === id ? { ...x, status } : x)),
      };
      if (status === "rejected") {
        return {
          ...withStatus,
          tasks: withStatus.tasks.map((t) =>
            t.id === sub.taskId ? { ...t, taken: Math.max(0, t.taken - 1) } : t,
          ),
        };
      }
      return credit(withStatus, "task", sub.amount, `Task approved — ${sub.task}`);
    });
  }, []);

  const withdraw = useCallback((amount: number) => {
    let result = { ok: false, message: "Enter a valid amount" };
    setState((s) => {
      if (!Number.isFinite(amount) || amount <= 0) return s;
      const available = s.wallets.task + s.wallets.income + s.wallets.affiliate;
      if (amount > available) {
        result = { ok: false, message: "Insufficient balance" };
        return s;
      }
      if (!s.bank.verified) {
        result = { ok: false, message: "Add and verify your bank details first" };
        return s;
      }
      // Draw from task, then income, then affiliate.
      let left = amount;
      const take = (v: number) => {
        const t = Math.min(v, left);
        left -= t;
        return v - t;
      };
      const task = take(s.wallets.task);
      const income = take(s.wallets.income);
      const affiliate = take(s.wallets.affiliate);
      result = { ok: true, message: "Withdrawal request submitted" };
      return {
        ...s,
        wallets: { ...s.wallets, task, income, affiliate },
        withdrawn: s.withdrawn + amount,
        activity: [
          {
            id: crypto.randomUUID(),
            label: "Withdrawal request",
            amount: -amount,
            at: new Date().toISOString(),
          },
          ...s.activity,
        ].slice(0, 30),
      };
    });
    return result;
  }, []);

  const deposit = useCallback((amount: number) => {
    let result = { ok: false, message: "Enter a valid amount" };
    setState((s) => {
      if (!Number.isFinite(amount) || amount <= 0) return s;
      result = { ok: true, message: "Deposit added to your deposit wallet" };
      return {
        ...s,
        wallets: { ...s.wallets, deposit: s.wallets.deposit + amount },
        activity: [
          {
            id: crypto.randomUUID(),
            label: "Deposit",
            amount,
            at: new Date().toISOString(),
          },
          ...s.activity,
        ].slice(0, 30),
      };
    });
    return result;
  }, []);

  const setBank = useCallback(
    (b: Partial<State["bank"]>) => setState((s) => ({ ...s, bank: { ...s.bank, ...b } })),
    [],
  );

  const value = useMemo<Ctx>(
    () => ({
      state,
      ready,
      isAdmin: sameEmail(state.user?.email, ADMIN_EMAIL),
      register,
      login,
      logout,
      checkIn,
      spin,
      dismissPopup,
      addTask,
      updateTask,
      toggleTask,
      deleteTask,
      submitProof,
      reviewSubmission,
      withdraw,
      deposit,
      setBank,
    }),
    [
      state,
      ready,
      register,
      login,
      logout,
      checkIn,
      spin,
      dismissPopup,
      addTask,
      updateTask,
      toggleTask,
      deleteTask,
      submitProof,
      reviewSubmission,
      withdraw,
      deposit,
      setBank,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export const naira = (n: number) =>
  `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const PLATFORMS = [
  "Facebook",
  "Instagram",
  "Telegram",
  "WhatsApp",
  "TikTok",
  "X",
  "YouTube",
  "Snapchat",
  "Threads",
  "Spotify",
  "Website",
  "Playstore",
];

export const ENGAGEMENTS = [
  "Follow",
  "Like",
  "Comment",
  "Share",
  "Subscribe",
  "Join",
  "Install",
  "Watch",
];

export const BANKS = [
  "AL-Barakah Microfinance Bank",
  "Access Bank",
  "First Bank of Nigeria",
  "Guaranty Trust Bank",
  "Kuda Microfinance Bank",
  "Moniepoint MFB",
  "Opay Digital Services",
  "Palmpay",
  "United Bank for Africa",
  "Zenith Bank",
];
