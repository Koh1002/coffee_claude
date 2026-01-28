import { z } from "zod";

// User validation
export const signUpSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z
    .string()
    .min(8, "パスワードは8文字以上で入力してください")
    .max(100, "パスワードは100文字以下で入力してください"),
  username: z
    .string()
    .min(3, "ユーザー名は3文字以上で入力してください")
    .max(30, "ユーザー名は30文字以下で入力してください")
    .regex(/^[a-zA-Z0-9_]+$/, "ユーザー名は英数字とアンダースコアのみ使用できます"),
});

export const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

export const updateProfileSchema = z.object({
  displayName: z.string().max(50, "表示名は50文字以下で入力してください").optional(),
  bio: z.string().max(500, "自己紹介は500文字以下で入力してください").optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

// CoffeeLog validation
export const coffeeLogSchema = z.object({
  dateTime: z.coerce.date(),
  title: z.string().min(1, "タイトルを入力してください").max(100, "タイトルは100文字以下で入力してください"),
  locationType: z.enum(["cafe", "home", "other"]),
  placeName: z.string().max(100, "場所名は100文字以下で入力してください").optional(),
  drinkType: z.string().max(50, "ドリンクタイプは50文字以下で入力してください").optional(),
  roastLevel: z.enum(["light", "medium", "dark"]),
  origin: z.string().max(100, "産地は100文字以下で入力してください").optional(),
  variety: z.string().max(100, "品種は100文字以下で入力してください").optional(),
  process: z.string().max(100, "精製方法は100文字以下で入力してください").optional(),
  rating: z.number().int().min(1, "評価は1以上で入力してください").max(5, "評価は5以下で入力してください"),
  memo: z.string().max(2000, "メモは2000文字以下で入力してください").optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
  visibility: z.enum(["private", "public"]).default("private"),
  tasteX: z.number().int().min(-100, "tasteXは-100以上で入力してください").max(100, "tasteXは100以下で入力してください"),
  roastY: z.number().int().min(0, "roastYは0以上で入力してください").max(100, "roastYは100以下で入力してください"),
});

export type CoffeeLogInput = z.infer<typeof coffeeLogSchema>;

// Bean validation
export const beanSchema = z.object({
  name: z.string().min(1, "豆の名前を入力してください").max(100, "豆の名前は100文字以下で入力してください"),
  roastLevel: z.enum(["light", "medium", "dark"]),
  origin: z.string().max(100, "産地は100文字以下で入力してください").optional(),
  variety: z.string().max(100, "品種は100文字以下で入力してください").optional(),
  process: z.string().max(100, "精製方法は100文字以下で入力してください").optional(),
  memo: z.string().max(2000, "メモは2000文字以下で入力してください").optional(),
  tasteX: z.number().int().min(-100, "tasteXは-100以上で入力してください").max(100, "tasteXは100以下で入力してください"),
  roastY: z.number().int().min(0, "roastYは0以上で入力してください").max(100, "roastYは100以下で入力してください"),
});

export type BeanInput = z.infer<typeof beanSchema>;

// Comment validation
export const commentSchema = z.object({
  body: z.string().min(1, "コメントを入力してください").max(1000, "コメントは1000文字以下で入力してください"),
});

// Search/Filter validation
export const logFilterSchema = z.object({
  locationType: z.enum(["cafe", "home", "other"]).optional(),
  roastLevel: z.enum(["light", "medium", "dark"]).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  drinkType: z.string().optional(),
  keyword: z.string().optional(),
  visibility: z.enum(["private", "public"]).optional(),
  period: z.enum(["30", "90", "all"]).optional(),
});

export type LogFilterInput = z.infer<typeof logFilterSchema>;
