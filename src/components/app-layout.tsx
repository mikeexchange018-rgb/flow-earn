import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, Home, ClipboardList, PlayCircle, User, LogOut, Send, X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid place-items-center rounded-full bg-brand font-black text-brand-foreground",
        className,
      )}
    >
      F
    </span>
  );
}

function ChannelPopup() {
  const { state, dismissPopup } = useApp();
  if (!state.user || state.seenChannelPopup) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 px-6 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 text-center shadow-card">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-info/10 text-info">
          <Send className="size-7" />
        </div>
        <h2 className="mt-4 text-lg font-bold">Join Our Official Channel</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Stay updated with new tasks, payouts and announcements from Flowearn.
        </p>
        <a
          href="https://t.me/"
          target="_blank"
          rel="noreferrer"
          onClick={dismissPopup}
          className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-brand text-sm font-bold text-brand-foreground"
        >
          Join Channel
        </a>
        <button
          onClick={dismissPopup}
          className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-secondary text-sm font-semibold text-secondary-foreground"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export function AppHeader() {
  const { logout } = useApp();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <BrandMark className="size-8 text-base" />
          <span className="text-sm font-extrabold tracking-tight">FLOWEARN</span>
        </Link>
        <div className="flex items-center gap-1">
          <button
            aria-label="Notifications"
            className="relative grid size-9 place-items-center rounded-full text-foreground hover:bg-secondary"
          >
            <Bell className="size-5" />
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
          </button>
          <button
            aria-label="Logout"
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            className="grid size-9 place-items-center rounded-full text-foreground hover:bg-secondary"
          >
            <LogOut className="size-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

const navItems = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/tasks", label: "Tasks", icon: ClipboardList },
  { to: "/assets", label: "Assets", icon: null },
  { to: "/watch", label: "Watch", icon: PlayCircle },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card shadow-nav">
      <div className="mx-auto grid max-w-md grid-cols-5 items-end px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {navItems.map((item) => {
          const active = pathname === item.to;
          if (!item.icon) {
            return (
              <Link key={item.to} to={item.to} className="flex flex-col items-center gap-1">
                <span className="-mt-6 grid size-12 place-items-center rounded-full border-4 border-card bg-brand text-lg font-black text-brand-foreground shadow-card">
                  F
                </span>
                <span
                  className={cn(
                    "text-[10px] font-semibold",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          }
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to} className="flex flex-col items-center gap-1 py-1">
              <span className="relative">
                <Icon
                  className={cn("size-5", active ? "text-foreground" : "text-muted-foreground")}
                />
              </span>
              <span
                className={cn(
                  "text-[10px] font-semibold",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { state, ready } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !state.user) navigate({ to: "/login" });
  }, [ready, state.user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-md px-4 pb-28 pt-4">{children}</main>
      <BottomNav />
      <ChannelPopup />
    </div>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background px-5 py-12">
      <div className="mx-auto max-w-md">
        <div className="flex flex-col items-center text-center">
          <BrandMark className="size-14 text-2xl shadow-card" />
          <h1 className="mt-3 text-xl font-extrabold tracking-tight">FLOWEARN</h1>
        </div>
        <div className="mt-8 rounded-2xl bg-card p-6 shadow-card">
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export { X };
