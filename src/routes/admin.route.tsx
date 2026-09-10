import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp, useServerFn } from "@/lib/app";
import { AppLayout } from "@/components/AppLayout";
import { toast } from "sonner";
import { adminLogout } from "@/lib/admin-server";
import { UsersManager, TasksManager, ActivationsManager, SiteSettings } from "@/components/admin";
import { LayoutDashboard, Users, ClipboardList, CreditCard, Settings, Banknote, Wallet, Gift } from "lucide-react";

type Tab = "Dashboard" | "Users" | "Tasks" | "Activations" | "Site Settings" | "Withdrawals" | "Deposits" | "Investments" | "Referrals" | "Submissions";
const TABS = [
  { key: "Dashboard" as Tab, icon: LayoutDashboard }, { key: "Users" as Tab, icon: Users },
  { key: "Tasks" as Tab, icon: ClipboardList }, { key: "Activations" as Tab, icon: CreditCard },
  { key: "Site Settings" as Tab, icon: Settings }, { key: "Withdrawals" as Tab, icon: Banknote },
  { key: "Deposits" as Tab, icon: Wallet }, { key: "Investments" as Tab, icon: CreditCard },
  { key: "Referrals" as Tab, icon: Gift }, { key: "Submissions" as Tab, icon: ClipboardList },
];
const WITHDRAWALS: any[] = []; const DEPOSITS: any[] = []; const INVESTMENTS: any[] = []; const REFERRALS: any[] = [];
const naira = (v: number) => `₦${v.toLocaleString()}`;
const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-card p-3 shadow-card"><p className="text-xs text-muted-foreground">{label}</p><p className="text-lg font-extrabold">{value}</p></div>
);
const Empty = ({ label }: { label: string }) => <p className="text-xs text-muted-foreground">{label}</p>;
const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl bg-card p-4 shadow-card"><h3 className="font-bold mb-2">{title}</h3>{children}</div>
);

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

function AdminPage() {
  const { state } = useApp();
  const [tab, setTab] = useState<Tab>("Dashboard");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const lockConsole = useServerFn(adminLogout);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) { window.location.href = "/login"; return; }
      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("email", user.email).single();
      if (profile?.is_admin === true) { setIsAdmin(true); } 
      else { toast.error("You are not an admin"); setTimeout(() => window.location.href = "/profile", 1500) }
      setLoading(false);
    };
    checkAdmin();
  }, []);

  if (loading) return <AppLayout><p className="p-6 text-center text-sm">Checking admin access...</p></AppLayout>;
  if (!isAdmin) return <AppLayout><p className="p-6 text-center text-sm">Access denied. You are not admin.</p></AppLayout>;

  return (
    <AppLayout>
      <div className="p-4 space-y-4">
        <div className="flex justify-between">
          <div>
            <h1 className="text-lg font-extrabold">Admin Console</h1>
            <p className="text-xs text-muted-foreground">Signed in as {state.user?.email}</p>
          </div>
          <button onClick={() => { void lockConsole().finally(() => window.location.href = "/profile"); }} className="rounded-xl bg-red-500 px-3 py-2 text-xs font-bold text-white">
            Lock console
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {TABS.map(({ key, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)} className="flex items-center gap-1.5 rounded-xl bg-card px-3 py-2 text-xs font-bold">
              <Icon className="size-4" />{key}
            </button>
          ))}
        </div>
        {tab === "Dashboard" && <Card title="Dashboard"><Stat label="Total users" value={String(state.members.length)} /></Card>}
        {tab === "Users" && <UsersManager />}
        {tab === "Tasks" && <TasksManager />}
        {tab === "Activations" && <ActivationsManager />}
        {tab === "Site Settings" && <SiteSettings />}
      </div>
    </AppLayout>
  );
}
