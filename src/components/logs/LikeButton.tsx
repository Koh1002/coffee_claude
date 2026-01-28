"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { toggleLike } from "@/actions/social";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  logId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function LikeButton({ logId, initialLiked, initialCount }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleLike(logId);
      if (result.error) {
        toast.error(result.error);
      } else {
        setIsLiked(result.liked!);
        setCount((prev) => (result.liked ? prev + 1 : prev - 1));
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "gap-2",
        isLiked && "text-red-500 hover:text-red-600"
      )}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
      )}
      <span>{count}</span>
    </Button>
  );
}
