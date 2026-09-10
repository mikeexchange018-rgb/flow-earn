function AdminPage() {
  const { state } = useApp();
  const [tab, setTab] = useState<Tab>("Dashboard");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const lockConsole = useServerFn(adminLogout);

  useEffect(() => {
    const checkAdmin = async () => {
      // 1. Wait for session to load properly
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      console.log("Session user:", user?.email)

      if (!user) {
        window.location.href = "/login";
        return;
      }

      // 2. Check admin in DB
      const { data: profile, error } = await supabase
       .from("profiles")
       .select("is_admin")
       .eq("email", user.email)
       .single();

      console.log("Profile result:", profile, "Error:", error)

      if (error) {
        console.error("DB Error:", error)
        toast.error("DB Error: " + error.message)
        setLoading(false)
        return;
      }

      if (profile?.is_admin === true) {
        setIsAdmin(true);
      } else {
        toast.error("You are not an admin");
        setTimeout(() => window.location.href = "/profile", 1500)
      }
      setLoading(false);
    };

    checkAdmin();
  }, []);

  if (loading) {
    return <AppLayout><p className="p-6 text-center text-sm text-muted-foreground">Checking admin access...</p></AppLayout>;
  }
  if (!isAdmin) {
    return <AppLayout><p className="p-6 text-center text-sm text-muted-foreground">Access denied. You are not admin.</p></AppLayout>;
  }

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
