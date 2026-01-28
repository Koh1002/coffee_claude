"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { commentSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

// Like actions
export async function toggleLike(logId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "ログインが必要です" };
  }

  // Check if log exists and is public
  const log = await prisma.coffeeLog.findUnique({
    where: { id: logId },
    select: { visibility: true, userId: true },
  });

  if (!log) {
    return { error: "ログが見つかりません" };
  }

  if (log.visibility !== "public" && log.userId !== session.user.id) {
    return { error: "このログにいいねする権限がありません" };
  }

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_logId: {
        userId: session.user.id,
        logId,
      },
    },
  });

  try {
    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      return { liked: false };
    } else {
      await prisma.like.create({
        data: {
          userId: session.user.id,
          logId,
        },
      });
      return { liked: true };
    }
  } catch {
    return { error: "いいねの更新に失敗しました" };
  }
}

// Comment actions
export async function getComments(logId: string) {
  const comments = await prisma.comment.findMany({
    where: { logId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return comments;
}

export async function addComment(logId: string, body: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "ログインが必要です" };
  }

  const parsed = commentSchema.safeParse({ body });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Check if log exists and is public
  const log = await prisma.coffeeLog.findUnique({
    where: { id: logId },
    select: { visibility: true, userId: true },
  });

  if (!log) {
    return { error: "ログが見つかりません" };
  }

  if (log.visibility !== "public" && log.userId !== session.user.id) {
    return { error: "このログにコメントする権限がありません" };
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        userId: session.user.id,
        logId,
        body: parsed.data.body,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
    revalidatePath(`/logs/${logId}`);
    return { success: true, comment };
  } catch {
    return { error: "コメントの投稿に失敗しました" };
  }
}

export async function deleteComment(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "ログインが必要です" };
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true, logId: true },
  });

  if (!comment) {
    return { error: "コメントが見つかりません" };
  }

  if (comment.userId !== session.user.id) {
    return { error: "このコメントを削除する権限がありません" };
  }

  try {
    await prisma.comment.delete({
      where: { id: commentId },
    });
    revalidatePath(`/logs/${comment.logId}`);
    return { success: true };
  } catch {
    return { error: "コメントの削除に失敗しました" };
  }
}

// Follow actions
export async function toggleFollow(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "ログインが必要です" };
  }

  if (session.user.id === targetUserId) {
    return { error: "自分自身をフォローすることはできません" };
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: targetUserId,
      },
    },
  });

  try {
    if (existingFollow) {
      await prisma.follow.delete({
        where: { id: existingFollow.id },
      });
      return { following: false };
    } else {
      await prisma.follow.create({
        data: {
          followerId: session.user.id,
          followingId: targetUserId,
        },
      });
      return { following: true };
    }
  } catch {
    return { error: "フォローの更新に失敗しました" };
  }
}

export async function isFollowing(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return false;
  }

  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: targetUserId,
      },
    },
  });

  return !!follow;
}

// Feed
export async function getFeedLogs() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  // Get following user IDs
  const following = await prisma.follow.findMany({
    where: { followerId: session.user.id },
    select: { followingId: true },
  });

  const followingIds = following.map((f) => f.followingId);

  // Include own logs and following users' public logs
  return prisma.coffeeLog.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        {
          userId: { in: followingIds },
          visibility: "public",
        },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
    orderBy: { dateTime: "desc" },
    take: 50,
  });
}
