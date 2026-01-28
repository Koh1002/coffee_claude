"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, UserMinus } from "lucide-react";
import { toggleFollow } from "@/actions/social";
import { toast } from "sonner";

interface FollowButtonProps {
  targetUserId: string;
  initialFollowing: boolean;
}

export function FollowButton({ targetUserId, initialFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleFollow(targetUserId);
      if (result.error) {
        toast.error(result.error);
      } else {
        setIsFollowing(result.following!);
        toast.success(result.following ? "フォローしました" : "フォロー解除しました");
      }
    });
  }

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="h-4 w-4 mr-2" />
          フォロー中
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          フォローする
        </>
      )}
    </Button>
  );
}
