import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getFeedLogs } from "@/actions/social";
import { LogCard } from "@/components/logs/LogCard";
import { Users } from "lucide-react";

export default async function FeedPage() {
  const session = await auth();
  if (!session) {
    redirect("/login?callbackUrl=/feed");
  }

  const logs = await getFeedLogs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">フィード</h1>
        <p className="text-muted-foreground">
          あなたとフォロー中のユーザーの記録
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium mb-2">フィードに表示するものがありません</h2>
          <p className="text-muted-foreground">
            他のユーザーをフォローするか、自分でログを作成しましょう
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {logs.map((log) => (
            <LogCard key={log.id} log={log} showUser />
          ))}
        </div>
      )}
    </div>
  );
}
