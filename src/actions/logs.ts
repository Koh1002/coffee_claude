"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { coffeeLogSchema, type CoffeeLogInput, type LogFilterInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function createLog(data: CoffeeLogInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "ログインが必要です" };
  }

  const parsed = coffeeLogSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    const log = await prisma.coffeeLog.create({
      data: {
        userId: session.user.id,
        dateTime: parsed.data.dateTime,
        title: parsed.data.title,
        locationType: parsed.data.locationType,
        placeName: parsed.data.placeName || null,
        drinkType: parsed.data.drinkType || null,
        roastLevel: parsed.data.roastLevel,
        origin: parsed.data.origin || null,
        variety: parsed.data.variety || null,
        process: parsed.data.process || null,
        rating: parsed.data.rating,
        memo: parsed.data.memo || null,
        photoUrl: parsed.data.photoUrl || null,
        visibility: parsed.data.visibility,
        tasteX: parsed.data.tasteX,
        roastY: parsed.data.roastY,
      },
    });
    revalidatePath("/logs");
    revalidatePath("/dashboard");
    revalidatePath("/taste-map");
    return { success: true, id: log.id };
  } catch {
    return { error: "ログの作成に失敗しました" };
  }
}

export async function updateLog(id: string, data: CoffeeLogInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "ログインが必要です" };
  }

  const existingLog = await prisma.coffeeLog.findUnique({
    where: { id },
  });

  if (!existingLog) {
    return { error: "ログが見つかりません" };
  }

  if (existingLog.userId !== session.user.id) {
    return { error: "このログを編集する権限がありません" };
  }

  const parsed = coffeeLogSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await prisma.coffeeLog.update({
      where: { id },
      data: {
        dateTime: parsed.data.dateTime,
        title: parsed.data.title,
        locationType: parsed.data.locationType,
        placeName: parsed.data.placeName || null,
        drinkType: parsed.data.drinkType || null,
        roastLevel: parsed.data.roastLevel,
        origin: parsed.data.origin || null,
        variety: parsed.data.variety || null,
        process: parsed.data.process || null,
        rating: parsed.data.rating,
        memo: parsed.data.memo || null,
        photoUrl: parsed.data.photoUrl || null,
        visibility: parsed.data.visibility,
        tasteX: parsed.data.tasteX,
        roastY: parsed.data.roastY,
      },
    });
    revalidatePath("/logs");
    revalidatePath(`/logs/${id}`);
    revalidatePath("/dashboard");
    revalidatePath("/taste-map");
    return { success: true };
  } catch {
    return { error: "ログの更新に失敗しました" };
  }
}

export async function deleteLog(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "ログインが必要です" };
  }

  const existingLog = await prisma.coffeeLog.findUnique({
    where: { id },
  });

  if (!existingLog) {
    return { error: "ログが見つかりません" };
  }

  if (existingLog.userId !== session.user.id) {
    return { error: "このログを削除する権限がありません" };
  }

  try {
    await prisma.coffeeLog.delete({
      where: { id },
    });
    revalidatePath("/logs");
    revalidatePath("/dashboard");
    revalidatePath("/taste-map");
    return { success: true };
  } catch {
    return { error: "ログの削除に失敗しました" };
  }
}

export async function getLog(id: string) {
  const session = await auth();

  const log = await prisma.coffeeLog.findUnique({
    where: { id },
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
  });

  if (!log) {
    return null;
  }

  // Check visibility permissions
  if (log.visibility === "private" && log.userId !== session?.user?.id) {
    return null;
  }

  // Check if current user has liked this log
  let hasLiked = false;
  if (session?.user?.id) {
    const like = await prisma.like.findUnique({
      where: {
        userId_logId: {
          userId: session.user.id,
          logId: id,
        },
      },
    });
    hasLiked = !!like;
  }

  return {
    ...log,
    hasLiked,
    isOwner: log.userId === session?.user?.id,
  };
}

export async function getLogs(filters?: LogFilterInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const where: Prisma.CoffeeLogWhereInput = {
    userId: session.user.id,
  };

  if (filters?.locationType) {
    where.locationType = filters.locationType;
  }
  if (filters?.roastLevel) {
    where.roastLevel = filters.roastLevel;
  }
  if (filters?.rating) {
    where.rating = filters.rating;
  }
  if (filters?.drinkType) {
    where.drinkType = { contains: filters.drinkType, mode: "insensitive" };
  }
  if (filters?.visibility) {
    where.visibility = filters.visibility;
  }
  if (filters?.keyword) {
    where.OR = [
      { title: { contains: filters.keyword, mode: "insensitive" } },
      { placeName: { contains: filters.keyword, mode: "insensitive" } },
      { memo: { contains: filters.keyword, mode: "insensitive" } },
      { origin: { contains: filters.keyword, mode: "insensitive" } },
    ];
  }
  if (filters?.period && filters.period !== "all") {
    const days = parseInt(filters.period);
    const date = new Date();
    date.setDate(date.getDate() - days);
    where.dateTime = { gte: date };
  }

  return prisma.coffeeLog.findMany({
    where,
    orderBy: { dateTime: "desc" },
    include: {
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });
}

export async function getPublicLogs(userId: string) {
  return prisma.coffeeLog.findMany({
    where: {
      userId,
      visibility: "public",
    },
    orderBy: { dateTime: "desc" },
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
  });
}

export async function getLogsForTasteMap(filters?: {
  period?: string;
  roastLevel?: string;
  rating?: number;
  visibility?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const where: Prisma.CoffeeLogWhereInput = {
    userId: session.user.id,
  };

  if (filters?.roastLevel) {
    where.roastLevel = filters.roastLevel;
  }
  if (filters?.rating) {
    where.rating = filters.rating;
  }
  if (filters?.visibility) {
    where.visibility = filters.visibility;
  }
  if (filters?.period && filters.period !== "all") {
    const days = parseInt(filters.period);
    const date = new Date();
    date.setDate(date.getDate() - days);
    where.dateTime = { gte: date };
  }

  return prisma.coffeeLog.findMany({
    where,
    select: {
      id: true,
      title: true,
      tasteX: true,
      roastY: true,
      rating: true,
      roastLevel: true,
      dateTime: true,
    },
    orderBy: { dateTime: "desc" },
  });
}

// Dashboard aggregation functions
export async function getDashboardStats() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;

  // Monthly counts for the past 12 months
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const logs = await prisma.coffeeLog.findMany({
    where: {
      userId,
      dateTime: { gte: twelveMonthsAgo },
    },
    select: {
      dateTime: true,
      rating: true,
      placeName: true,
      origin: true,
    },
  });

  // Monthly counts and average ratings
  const monthlyData: Record<string, { count: number; totalRating: number }> = {};
  const placeCount: Record<string, number> = {};
  const originCount: Record<string, number> = {};

  for (const log of logs) {
    const monthKey = `${log.dateTime.getFullYear()}-${String(log.dateTime.getMonth() + 1).padStart(2, "0")}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { count: 0, totalRating: 0 };
    }
    monthlyData[monthKey].count++;
    monthlyData[monthKey].totalRating += log.rating;

    if (log.placeName) {
      placeCount[log.placeName] = (placeCount[log.placeName] || 0) + 1;
    }
    if (log.origin) {
      originCount[log.origin] = (originCount[log.origin] || 0) + 1;
    }
  }

  // Generate all months in range
  const monthlyStats = [];
  const current = new Date(twelveMonthsAgo);
  const now = new Date();
  while (current <= now) {
    const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
    const data = monthlyData[monthKey] || { count: 0, totalRating: 0 };
    monthlyStats.push({
      month: monthKey,
      count: data.count,
      avgRating: data.count > 0 ? data.totalRating / data.count : 0,
    });
    current.setMonth(current.getMonth() + 1);
  }

  // Top places
  const topPlaces = Object.entries(placeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Top origins
  const topOrigins = Object.entries(originCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Total stats
  const totalLogs = await prisma.coffeeLog.count({ where: { userId } });
  const avgRating = await prisma.coffeeLog.aggregate({
    where: { userId },
    _avg: { rating: true },
  });

  return {
    monthlyStats,
    topPlaces,
    topOrigins,
    totalLogs,
    avgRating: avgRating._avg.rating || 0,
  };
}
