"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, MessageCircle, Heart, Globe, Lock } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  LOCATION_TYPE_LABELS,
  ROAST_LEVEL_LABELS,
  getTasteXLabel,
  type LocationType,
  type RoastLevel,
} from "@/types";

interface LogCardProps {
  log: {
    id: string;
    title: string;
    dateTime: Date;
    locationType: string;
    placeName: string | null;
    drinkType: string | null;
    roastLevel: string;
    rating: number;
    memo: string | null;
    photoUrl: string | null;
    visibility: string;
    tasteX: number;
    roastY: number;
    user?: {
      id: string;
      username: string;
      displayName: string | null;
      avatarUrl: string | null;
    };
    _count?: {
      likes: number;
      comments: number;
    };
  };
  showUser?: boolean;
}

export function LogCard({ log, showUser = false }: LogCardProps) {
  return (
    <Link href={`/logs/${log.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        {log.photoUrl && (
          <div className="relative h-48 overflow-hidden rounded-t-lg">
            <img
              src={log.photoUrl}
              alt={log.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{log.title}</h3>
              <p className="text-sm text-muted-foreground">
                {format(new Date(log.dateTime), "yyyy/MM/dd HH:mm", { locale: ja })}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {log.visibility === "public" ? (
                <Globe className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex flex-wrap gap-1.5 mb-3">
            <Badge variant="secondary">
              {LOCATION_TYPE_LABELS[log.locationType as LocationType]}
            </Badge>
            <Badge variant="outline">
              {ROAST_LEVEL_LABELS[log.roastLevel as RoastLevel]}
            </Badge>
            {log.drinkType && (
              <Badge variant="outline">{log.drinkType}</Badge>
            )}
          </div>

          {log.placeName && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{log.placeName}</span>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= log.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <span className="text-muted-foreground">
              {getTasteXLabel(log.tasteX)}
            </span>
          </div>

          {log.memo && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {log.memo}
            </p>
          )}
        </CardContent>

        {(showUser || log._count) && (
          <CardFooter className="pt-2 border-t">
            <div className="flex items-center justify-between w-full">
              {showUser && log.user && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={log.user.avatarUrl || undefined} />
                    <AvatarFallback>
                      {(log.user.displayName || log.user.username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    {log.user.displayName || log.user.username}
                  </span>
                </div>
              )}
              {log._count && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground ml-auto">
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {log._count.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {log._count.comments}
                  </span>
                </div>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}
