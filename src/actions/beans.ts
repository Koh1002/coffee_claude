"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { beanSchema, type BeanInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createBean(data: BeanInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "ログインが必要です" };
  }

  const parsed = beanSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    const bean = await prisma.bean.create({
      data: {
        userId: session.user.id,
        name: parsed.data.name,
        roastLevel: parsed.data.roastLevel,
        origin: parsed.data.origin || null,
        variety: parsed.data.variety || null,
        process: parsed.data.process || null,
        memo: parsed.data.memo || null,
        tasteX: parsed.data.tasteX,
        roastY: parsed.data.roastY,
      },
    });
    revalidatePath("/beans");
    revalidatePath("/taste-map");
    return { success: true, id: bean.id };
  } catch {
    return { error: "豆の登録に失敗しました" };
  }
}

export async function updateBean(id: string, data: BeanInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "ログインが必要です" };
  }

  const existingBean = await prisma.bean.findUnique({
    where: { id },
  });

  if (!existingBean) {
    return { error: "豆が見つかりません" };
  }

  if (existingBean.userId !== session.user.id) {
    return { error: "この豆を編集する権限がありません" };
  }

  const parsed = beanSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await prisma.bean.update({
      where: { id },
      data: {
        name: parsed.data.name,
        roastLevel: parsed.data.roastLevel,
        origin: parsed.data.origin || null,
        variety: parsed.data.variety || null,
        process: parsed.data.process || null,
        memo: parsed.data.memo || null,
        tasteX: parsed.data.tasteX,
        roastY: parsed.data.roastY,
      },
    });
    revalidatePath("/beans");
    revalidatePath(`/beans/${id}`);
    revalidatePath("/taste-map");
    return { success: true };
  } catch {
    return { error: "豆の更新に失敗しました" };
  }
}

export async function deleteBean(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "ログインが必要です" };
  }

  const existingBean = await prisma.bean.findUnique({
    where: { id },
  });

  if (!existingBean) {
    return { error: "豆が見つかりません" };
  }

  if (existingBean.userId !== session.user.id) {
    return { error: "この豆を削除する権限がありません" };
  }

  try {
    await prisma.bean.delete({
      where: { id },
    });
    revalidatePath("/beans");
    revalidatePath("/taste-map");
    return { success: true };
  } catch {
    return { error: "豆の削除に失敗しました" };
  }
}

export async function getBean(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const bean = await prisma.bean.findUnique({
    where: { id },
  });

  if (!bean || bean.userId !== session.user.id) {
    return null;
  }

  return bean;
}

export async function getBeans() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  return prisma.bean.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBeansForTasteMap(filters?: {
  roastLevel?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const where: { userId: string; roastLevel?: string } = {
    userId: session.user.id,
  };

  if (filters?.roastLevel) {
    where.roastLevel = filters.roastLevel;
  }

  return prisma.bean.findMany({
    where,
    select: {
      id: true,
      name: true,
      tasteX: true,
      roastY: true,
      roastLevel: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
