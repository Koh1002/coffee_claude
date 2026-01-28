"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { signUp } from "@/actions/user";

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await signUp(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("アカウントを作成しました。ログインしてください。");
        router.push("/login");
      }
    } catch {
      toast.error("アカウントの作成に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">新規登録</CardTitle>
        <CardDescription>
          アカウントを作成してコーヒー記録を始めましょう
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@example.com"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">ユーザー名</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="coffee_lover"
              pattern="^[a-zA-Z0-9_]+$"
              minLength={3}
              maxLength={30}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              3〜30文字の英数字とアンダースコアのみ使用できます
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={8}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              8文字以上で入力してください
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            アカウントを作成
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            すでにアカウントをお持ちの方は{" "}
            <Link href="/login" className="text-primary hover:underline">
              ログイン
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
