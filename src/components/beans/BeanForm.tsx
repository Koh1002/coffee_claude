"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createBean, updateBean } from "@/actions/beans";
import {
  ROAST_LEVEL_LABELS,
  ROAST_LEVEL_TO_Y,
  getTasteXLabel,
  getRoastYLabel,
  type RoastLevel,
} from "@/types";
import type { Bean } from "@prisma/client";

interface BeanFormProps {
  bean?: Bean;
}

export function BeanForm({ bean }: BeanFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [name, setName] = useState(bean?.name || "");
  const [roastLevel, setRoastLevel] = useState<RoastLevel>(
    (bean?.roastLevel as RoastLevel) || "medium"
  );
  const [origin, setOrigin] = useState(bean?.origin || "");
  const [variety, setVariety] = useState(bean?.variety || "");
  const [process, setProcess] = useState(bean?.process || "");
  const [memo, setMemo] = useState(bean?.memo || "");
  const [tasteX, setTasteX] = useState(bean?.tasteX ?? 0);
  const [roastY, setRoastY] = useState(bean?.roastY ?? ROAST_LEVEL_TO_Y[roastLevel]);

  // Update roastY when roastLevel changes (only if not editing)
  useEffect(() => {
    if (!bean) {
      setRoastY(ROAST_LEVEL_TO_Y[roastLevel]);
    }
  }, [roastLevel, bean]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const data = {
      name,
      roastLevel,
      origin: origin || undefined,
      variety: variety || undefined,
      process: process || undefined,
      memo: memo || undefined,
      tasteX,
      roastY,
    };

    try {
      const result = bean
        ? await updateBean(bean.id, data)
        : await createBean(data);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(bean ? "豆を更新しました" : "豆を登録しました");
        router.push("/beans");
        router.refresh();
      }
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">豆情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">豆の名前 *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: エチオピア イルガチェフェ G1"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="roastLevel">焙煎度 *</Label>
              <Select value={roastLevel} onValueChange={(v) => setRoastLevel(v as RoastLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROAST_LEVEL_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="origin">産地</Label>
              <Input
                id="origin"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="例: エチオピア"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="variety">品種</Label>
              <Input
                id="variety"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder="例: ゲイシャ"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="process">精製方法</Label>
              <Input
                id="process"
                value={process}
                onChange={(e) => setProcess(e.target.value)}
                placeholder="例: ナチュラル"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Taste Coordinates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">味座標 *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* TasteX Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>渋み ↔ 酸味</Label>
              <span className="text-sm text-muted-foreground">
                {tasteX} ({getTasteXLabel(tasteX)})
              </span>
            </div>
            <div className="px-2">
              <Slider
                value={[tasteX]}
                onValueChange={(v) => setTasteX(v[0])}
                min={-100}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>渋み (-100)</span>
                <span>中立 (0)</span>
                <span>酸味 (+100)</span>
              </div>
            </div>
          </div>

          {/* RoastY Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>焙煎度（詳細）</Label>
              <span className="text-sm text-muted-foreground">
                {roastY} ({getRoastYLabel(roastY)})
              </span>
            </div>
            <div className="px-2">
              <Slider
                value={[roastY]}
                onValueChange={(v) => setRoastY(v[0])}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>浅煎り (0)</span>
                <span>中煎り (50)</span>
                <span>深煎り (100)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Memo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">メモ</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="購入店、価格、味の特徴など"
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="flex-1 sm:flex-none">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {bean ? "更新する" : "登録する"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
