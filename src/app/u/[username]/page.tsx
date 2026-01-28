import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserByUsername } from "@/actions/user";
import { getPublicLogs } from "@/actions/logs";
import { isFollowing } from "@/actions/social";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { LogCard } from "@/components/logs/LogCard";
import { FollowButton } from "@/components/shared/FollowButton";
import { Providers } from "@/components/shared/Providers";
import { Header } from "@/components/shared/Header";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar, Coffee } from "lucide-react";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const session = await auth();

  const user = await getUserByUsername(username);
  if (!user) {
    notFound();
  }

  const logs = await getPublicLogs(user.id);
  const following = session?.user?.id ? await isFollowing(user.id) : false;
  const isOwnProfile = session?.user?.id === user.id;

  return (
    <Providers>
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback className="text-2xl">
                      {(user.displayName || user.username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-2xl font-bold">
                      {user.displayName || user.username}
                    </h1>
                    <p className="text-muted-foreground">@{user.username}</p>
                    {user.bio && (
                      <p className="mt-2 whitespace-pre-wrap">{user.bio}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-4 justify-center sm:justify-start text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Coffee className="h-4 w-4" />
                        {user._count.logs} 件の公開ログ
                      </span>
                      <span>{user._count.followers} フォロワー</span>
                      <span>{user._count.following} フォロー中</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(user.createdAt), "yyyy年MM月", { locale: ja })}から利用
                      </span>
                    </div>
                  </div>
                  {!isOwnProfile && session && (
                    <FollowButton targetUserId={user.id} initialFollowing={following} />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Public Logs */}
            <div>
              <h2 className="text-xl font-semibold mb-4">公開ログ</h2>
              {logs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  まだ公開ログがありません
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {logs.map((log) => (
                    <LogCard key={log.id} log={log} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </Providers>
  );
}
