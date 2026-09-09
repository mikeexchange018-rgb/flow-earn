import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { adminLogout } from "@/lib/admin.functions";
import {
  BarChart3, Users, ArrowDownToLine, ArrowUpFromLine, ClipboardList,
  FileCheck2, PiggyBank, Share2, Settings,
} from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { ENGAGEMENTS, naira, PLATFORMS, useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// DELETED THIS LINE: const ADMIN_EMAIL = "serikitumnishe@gmail.com";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — Flowearn" },
      { name: "description", content: "Flowearn admin console: manage users, withdrawals, deposits, tasks, submissions, investments, referrals and site settings." },
      { property: "og:title", content: "Admin Console — Flowearn" },
      { property: "og:description", content: "Manage Flowearn users, payouts, tasks and platform settings." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Tab = "Dashboard" | "Users" | "Withdrawals" | "Deposits" | "Tasks" | "Submissions" | "Investments" | "Referrals" | "Activations" | "Site Settings";

const TABS: { key: Tab; icon: typeof Users }[] = [
  { key: "Dashboard", icon: BarChart3 }, { key: "Users", icon: Users },
  { key: "Withdrawals", icon: ArrowUpFromLine }, { key: "Deposits", icon: ArrowDownToLine },
  { key: "Tasks", icon: ClipboardList }, { key: "Submissions", icon: FileCheck2 },
  { key: "Investments", icon: PiggyBank }, { key: "Referrals", icon: Share2 },
  { key: "Activations", icon: FileCheck2 }, { key: "Site Settings", icon: Settings },
];

//... ALL YOUR TYPES AND COMPONENTS STAY THE SAME...
type Withdrawal = { id: string; user: string; amount: number; bank: string; status: string };
const WITHDRAWALS: Withdrawal[] = [];
type Deposit = { id: string; user: string; amount: number; method: string; status: string };
const DEPOSITS: Deposit[] = [];
type Investment = { id: string; user: string; plan: string; amount: number; daily: number; status: string };
const INVESTMENTS: Investment[] = [];
type Referral = { referrer: string; invited: number; earned: number };
const REFERRALS: Referral[] = [];

function toneFor(status: string) { /*... unchanged ...*/ return "bg-success/10 text-success" }
function Pill({ status }: { status: string }) { /*... unchanged ...*/ return <span></span> }
function Card({ title, children }: { title: string; children: React.ReactNode }) { /*... unchanged ...*/ return <section></section> }
function Empty({ label }: { label: string }) { /*... unchanged ...*/ return <p></p> }
function Row({ title, subtitle, value, status, actions }: any) { /*... unchanged ...*/ return <div></div> }
function Stat({ label, value }: { label: string; value: string }) { /*... unchanged ...*/ return <div></div> }
function UsersManager() { /*... unchanged ...*/ return <Card title="Users"></Card> }
function SiteSettings() { /*... unchanged ...*/ return <Card title="Site Settings"></Card> }
const EMPTY_TASK = { platform: "", type: "", link: "", price: "", quantity: "" };
function TasksManager() { /*... unchanged ...*/ return <div></div> }
function ActivationsManager() { /*... unchanged ...*/ return <Card title="Pending Activations"></Card> }


function AdminPage() {
  const { state } = useApp();
  const [tab, setTab] = useState<Tab>("Dashboard");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const lockConsole = useServerFn(adminLogout);

  // CHANGED THIS WHOLE useEffect
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = "/login"; // not logged in
        return;
      }

      // THIS IS THE NEW CHECK: Check profiles table for is_admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (profile?.is_admin) {
        setIsAdmin(true);
      } else {
        window.location.href = "/profile"; // not admin
      }
      setLoading(false);
    };
    checkAdmin();
  }, []);

  if (loading) {
    return <AppLayout><p className="p-6 text-center text-sm text-muted-foreground">Checking admin access...</p></AppLayout>;
  }

  if (!isAdmin) {
    return <AppLayout><p className="p-6 text-center text-sm text-muted-foreground">Access denied</p></AppLayout>;
  }

  // YOUR DASHBOARD - 100% UNCHANGED
  return (
    <AppLayout>
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-extrabold">Admin Console</h1>
            <p className="truncate text-xs text-muted-foreground">Signed in as {state.user?.email}</p>
          </div>
          <button onClick={() => { void lockConsole().finally(() => window.location.href = "/profile"); }} className="h-9 shrink-0 rounded-xl bg-secondary px-3 text-xs font-bold text-secondary-foreground">
            Lock console
          </button>
        </div>

        <div className="-mx-4 overflow-x-auto px-4">
          <div className="flex w-max gap-2">
            {TABS.map(({ key, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)} className={cn("flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold", tab === key? "bg-brand text-brand-foreground" : "bg-card text-muted-foreground shadow-card")}>
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
              <Stat label="Pending withdrawals" value={String(WITHDRAWALS.filter((w) => w.status === "pending").length)} />
              <Stat label="Deposits today" value={naira(DEPOSITS.reduce((sum, d) => sum + d.amount, 0))} />
              <Stat label="Active investments" value={String(INVESTMENTS.filter((i) => i.status === "active").length)} />
            </div>
            <Card title="Latest activity"><Empty label="No activity yet" /></Card>
          </div>
        )}

        {tab === "Users" && <UsersManager />}
        {tab === "Tasks" && <TasksManager />}
        {tab === "Activations" && <ActivationsManager />}
        {tab === "Site Settings" && <SiteSettings />}
        {tab === "Withdrawals" && <Card title="Withdrawal requests">{WITHDRAWALS.length === 0 && <Empty label="No withdrawal requests" />}</Card>}
        {tab === "Deposits" && <Card title="Deposits">{DEPOSITS.length === 0 && <Empty label="No deposits" />}</Card>}
        {tab === "Investments" && <Card title="Investments">{INVESTMENTS.length === 0 && <Empty label="No investments" />}</Card>}
        {tab === "Referrals" && <Card title="Referrals">{REFERRALS.length === 0 && <Empty label="No referrals" />}</Card>}
        {tab === "Submissions" && <Card title="Task Submissions"><Empty label="No submissions" /></Card>}
      </div>
    </AppLayout>
  );
}
