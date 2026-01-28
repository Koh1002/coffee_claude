import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getLog } from "@/actions/logs";
import { auth } from "@/lib/auth";
import { LogActions } from "@/components/logs/LogActions";
import { LikeButton } from "@/components/logs/LikeButton";
import { CommentSection } from "@/components/logs/CommentSection";
import {
  LOCATION_TYPE_LABELS,
  ROAST_LEVEL_LABELS,
  getTasteXLabel,
  getRoastYLabel,
  type LocationType,
  type RoastLevel,
} from "@/types";
import {
  Star,
  MapPin,
  Calendar,
  Coffee,
  Globe,
  Lock,
  ArrowLeft,
} from "lucide-react";

interface LogDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LogDetailPage({ params }: LogDetailPageProps) {
  const { id } = await params;
  const session = await auth();
  const log = await getLog(id);

  if (!log) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/logs" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          ログ一覧に戻る
        </Link>
      </div>

      {/* Photo */}
      {log.photoUrl && (
        <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-6">
          <img
            src={log.photoUrl}
            alt={log.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">{log.title}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(log.dateTime), "yyyy年MM月dd日 HH:mm", { locale: ja })}</span>
            {log.visibility === "public" ? (
              <Badge variant="outline" className="ml-2">
                <Globe className="h-3 w-3 mr-1" />
                公開
              </Badge>
            ) : (
              <Badge variant="secondary" className="ml-2">
                <Lock className="h-3 w-3 mr-1" />
                非公開
              </Badge>
            )}
          </div>
        </div>
        {log.isOwner && <LogActions logId={log.id} />}
      </div>

      {/* User */}
      <Link href={`/u/${log.user.username}`} className="flex items-center gap-3 mb-6 hover:bg-muted/50 p-2 rounded-lg -mx-2">
        <Avatar>
          <AvatarImage src={log.user.avatarUrl || undefined} />
          <AvatarFallback>
            {(log.user.displayName || log.user.username).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{log.user.displayName || log.user.username}</p>
          <p className="text-sm text-muted-foreground">@{log.user.username}</p>
        </div>
      </Link>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Coffee className="h-5 w-5" />
              コーヒー情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {LOCATION_TYPE_LABELS[log.locationType as LocationType]}
              </Badge>
              <Badge variant="outline">
                {ROAST_LEVEL_LABELS[log.roastLevel as RoastLevel]}
              </Badge>
              {log.drinkType && <Badge variant="outline">{log.drinkType}</Badge>}
            </div>

            {log.placeName && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{log.placeName}</span>
              </div>
            )}

            {(log.origin || log.variety || log.process) && (
              <div className="space-y-1 text-sm">
                {log.origin && (
                  <p><span className="text-muted-foreground">産地:</span> {log.origin}</p>
                )}
                {log.variety && (
                  <p><span className="text-muted-foreground">品種:</span> {log.variety}</p>
                )}
                {log.process && (
                  <p><span className="text-muted-foreground">精製:</span> {log.process}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Taste & Rating */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">評価・味わい</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">評価</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${
                      star <= log.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
                <span className="ml-2 font-medium">{log.rating} / 5</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">渋み ↔ 酸味</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${((log.tasteX + 100) / 200) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-24 text-right">
                    {log.tasteX} ({getTasteXLabel(log.tasteX)})
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">焙煎度</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-600 transition-all"
                      style={{
                        width: `${log.roastY}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-24 text-right">
                    {log.roastY} ({getRoastYLabel(log.roastY)})
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Memo */}
      {log.memo && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">メモ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{log.memo}</p>
          </CardContent>
        </Card>
      )}

      {/* Social Actions */}
      {log.visibility === "public" && session && (
        <div className="mt-6">
          <div className="flex items-center gap-4 mb-4">
            <LikeButton
              logId={log.id}
              initialLiked={log.hasLiked}
              initialCount={log._count.likes}
            />
            <span className="text-sm text-muted-foreground">
              {log._count.comments}件のコメント
            </span>
          </div>
          <CommentSection logId={log.id} />
        </div>
      )}
    </div>
  );
}
