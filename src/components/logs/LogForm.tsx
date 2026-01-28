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
import { Loader2, Star, Upload, X } from "lucide-react";
import { createLog, updateLog } from "@/actions/logs";
import {
  LOCATION_TYPE_LABELS,
  ROAST_LEVEL_LABELS,
  VISIBILITY_LABELS,
  DRINK_TYPE_SUGGESTIONS,
  ROAST_LEVEL_TO_Y,
  getTasteXLabel,
  getRoastYLabel,
  type LocationType,
  type RoastLevel,
  type Visibility,
} from "@/types";
import type { CoffeeLog } from "@prisma/client";

interface LogFormProps {
  log?: CoffeeLog;
}

export function LogForm({ log }: LogFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(log?.photoUrl || null);

  // Form state
  const [dateTime, setDateTime] = useState(
    log?.dateTime
      ? new Date(log.dateTime).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [title, setTitle] = useState(log?.title || "");
  const [locationType, setLocationType] = useState<LocationType>(
    (log?.locationType as LocationType) || "cafe"
  );
  const [placeName, setPlaceName] = useState(log?.placeName || "");
  const [drinkType, setDrinkType] = useState(log?.drinkType || "");
  const [roastLevel, setRoastLevel] = useState<RoastLevel>(
    (log?.roastLevel as RoastLevel) || "medium"
  );
  const [origin, setOrigin] = useState(log?.origin || "");
  const [variety, setVariety] = useState(log?.variety || "");
  const [process, setProcess] = useState(log?.process || "");
  const [rating, setRating] = useState(log?.rating || 3);
  const [memo, setMemo] = useState(log?.memo || "");
  const [visibility, setVisibility] = useState<Visibility>(
    (log?.visibility as Visibility) || "private"
  );
  const [tasteX, setTasteX] = useState(log?.tasteX ?? 0);
  const [roastY, setRoastY] = useState(log?.roastY ?? ROAST_LEVEL_TO_Y[roastLevel]);
  const [photoUrl, setPhotoUrl] = useState(log?.photoUrl || "");

  // Update roastY when roastLevel changes (only if not editing)
  useEffect(() => {
    if (!log) {
      setRoastY(ROAST_LEVEL_TO_Y[roastLevel]);
    }
  }, [roastLevel, log]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const data = {
      dateTime: new Date(dateTime),
      title,
      locationType,
      placeName: placeName || undefined,
      drinkType: drinkType || undefined,
      roastLevel,
      origin: origin || undefined,
      variety: variety || undefined,
      process: process || undefined,
      rating,
      memo: memo || undefined,
      photoUrl: photoUrl || undefined,
      visibility,
      tasteX,
      roastY,
    };

    try {
      const result = log
        ? await updateLog(log.id, data)
        : await createLog(data);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(log ? "ログを更新しました" : "ログを作成しました");
        router.push("/logs");
        router.refresh();
      }
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // TODO: Implement actual upload to Supabase Storage
      // For now, we'll just show the preview
      toast.info("画像アップロード機能は準備中です");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateTime">日時 *</Label>
              <Input
                id="dateTime"
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">コーヒー名 *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: エチオピア イルガチェフェ"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="locationType">場所タイプ *</Label>
              <Select value={locationType} onValueChange={(v) => setLocationType(v as LocationType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LOCATION_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="placeName">店名/場所</Label>
              <Input
                id="placeName"
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                placeholder="例: Blue Bottle Coffee"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="drinkType">ドリンクタイプ</Label>
              <Input
                id="drinkType"
                value={drinkType}
                onChange={(e) => setDrinkType(e.target.value)}
                placeholder="例: ドリップ"
                list="drinkTypeSuggestions"
              />
              <datalist id="drinkTypeSuggestions">
                {DRINK_TYPE_SUGGESTIONS.map((suggestion) => (
                  <option key={suggestion} value={suggestion} />
                ))}
              </datalist>
            </div>
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
          </div>
        </CardContent>
      </Card>

      {/* Bean Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">豆情報（任意）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="origin">産地</Label>
              <Input
                id="origin"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="例: エチオピア"
              />
            </div>
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

      {/* Rating */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">評価 *</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground self-center">
              {rating} / 5
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Memo & Photo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">メモ・写真</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="memo">メモ</Label>
            <Textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="味の感想、お気に入りポイントなど"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>写真</Label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-muted">
                <Upload className="h-4 w-4" />
                <span className="text-sm">画像を選択</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              {photoPreview && (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="h-20 w-20 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview(null);
                      setPhotoUrl("");
                    }}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">公開設定</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={visibility} onValueChange={(v) => setVisibility(v as Visibility)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(VISIBILITY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2">
            公開にすると、他のユーザーがこの記録を閲覧できます
          </p>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="flex-1 sm:flex-none">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {log ? "更新する" : "記録する"}
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
