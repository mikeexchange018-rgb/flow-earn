import { createFileRoute } from "@tanstack/react-router";
import { PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { naira } from "@/lib/store";

export const Route = createFileRoute("/watch")({
  head: () => ({
    meta: [
      { title: "Watch & Earn — Flowearn Rewards" },
      { name: "description", content: "Watch short sponsored videos on Flowearn and earn naira rewards credited straight to your task wallet." },
      { property: "og:title", content: "Watch & Earn — Flowearn Rewards" },
      { property: "og:description", content: "Watch sponsored videos and earn naira rewards." },
    ],
  }),
  component: WatchPage,
});

type Video = { id: string; title: string; secs: number; pay: number };

const VIDEOS: Video[] = [];

function WatchPage() {
  return (
    <AppLayout>
      <h1 className="text-lg font-extrabold">Watch &amp; Earn</h1>
      <p className="text-xs text-muted-foreground">Watch a full video to claim its reward.</p>
      <ul className="mt-4 space-y-3">
        {VIDEOS.map((v) => (
          <li key={v.id} className="rounded-2xl bg-card p-4 shadow-card">
            <div className="grid h-32 place-items-center rounded-xl bg-ink text-ink-foreground">
              <PlayCircle className="size-10 text-brand" />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">{v.title}</p>
                <p className="text-[11px] text-muted-foreground">{v.secs} seconds</p>
              </div>
              <button
                onClick={() => toast.success(`Reward of ${naira(v.pay)} pending review`)}
                className="rounded-xl bg-brand px-3 py-2 text-xs font-bold text-brand-foreground"
              >
                Watch {naira(v.pay)}
              </button>
            </div>
          </li>
        ))}
        {VIDEOS.length === 0 && (
          <li className="rounded-2xl bg-card p-8 text-center shadow-card">
            <PlayCircle className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-2 text-xs text-muted-foreground">No videos available yet</p>
          </li>
        )}
      </ul>
    </AppLayout>
  );
}
