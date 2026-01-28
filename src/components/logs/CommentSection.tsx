"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Send, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { getComments, addComment, deleteComment } from "@/actions/social";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Comment {
  id: string;
  body: string;
  createdAt: Date;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

interface CommentSectionProps {
  logId: string;
}

export function CommentSection({ logId }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    const result = await getComments(logId);
    setComments(result);
    setIsLoading(false);
  }, [logId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadComments();
  }, [loadComments]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    startTransition(async () => {
      const result = await addComment(logId, body);
      if (result.error) {
        toast.error(result.error);
      } else {
        setBody("");
        loadComments();
      }
    });
  }

  async function handleDelete(commentId: string) {
    startTransition(async () => {
      const result = await deleteComment(commentId);
      if (result.error) {
        toast.error(result.error);
      } else {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    });
  }

  return (
    <div className="space-y-4">
      <Separator />
      <h3 className="font-semibold">コメント</h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="コメントを入力..."
          className="min-h-[80px]"
          disabled={isPending}
        />
        <Button type="submit" size="icon" disabled={isPending || !body.trim()}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>

      {/* Comments List */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          まだコメントはありません
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Link href={`/u/${comment.user.username}`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user.avatarUrl || undefined} />
                  <AvatarFallback>
                    {(comment.user.displayName || comment.user.username).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/u/${comment.user.username}`}
                    className="font-medium text-sm hover:underline"
                  >
                    {comment.user.displayName || comment.user.username}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(comment.createdAt), "MM/dd HH:mm", { locale: ja })}
                  </span>
                  {session?.user?.id === comment.user.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-auto"
                      onClick={() => handleDelete(comment.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap">{comment.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
