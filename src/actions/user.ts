"use server";

import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signUpSchema, updateProfileSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function signUp(formData: FormData) {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
    username: formData.get("username"),
  };

  const parsed = signUpSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password, username } = parsed.data;

  // Check if email already exists
  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });
  if (existingEmail) {
    return { error: "このメールアドレスは既に登録されています" };
  }

  // Check if username already exists
  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });
  if (existingUsername) {
    return { error: "このユーザー名は既に使用されています" };
  }

  const passwordHash = await hash(password, 12);

  try {
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        username,
        displayName: username,
      },
    });
    return { success: true };
  } catch {
    return { error: "アカウントの作成に失敗しました" };
  }
}

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "ログインが必要です" };
  }

  const rawData = {
    displayName: formData.get("displayName") || undefined,
    bio: formData.get("bio") || undefined,
    avatarUrl: formData.get("avatarUrl") || undefined,
  };

  const parsed = updateProfileSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        displayName: parsed.data.displayName || null,
        bio: parsed.data.bio || null,
        avatarUrl: parsed.data.avatarUrl || null,
      },
    });
    revalidatePath(`/u/${session.user.username}`);
    revalidatePath("/settings");
    return { success: true };
  } catch {
    return { error: "プロフィールの更新に失敗しました" };
  }
}

export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
      _count: {
        select: {
          logs: {
            where: { visibility: "public" },
          },
          followers: true,
          following: true,
        },
      },
    },
  });
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
    },
  });
}
