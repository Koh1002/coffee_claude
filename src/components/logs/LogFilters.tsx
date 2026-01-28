"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import {
  LOCATION_TYPE_LABELS,
  ROAST_LEVEL_LABELS,
} from "@/types";

export function LogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/logs?${params.toString()}`);
  }

  function clearFilters() {
    router.push("/logs");
  }

  const hasFilters =
    searchParams.has("keyword") ||
    searchParams.has("locationType") ||
    searchParams.has("roastLevel") ||
    searchParams.has("rating");

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="キーワードで検索..."
          className="pl-10"
          defaultValue={searchParams.get("keyword") || ""}
          onChange={(e) => {
            const value = e.target.value;
            if (value) {
              updateFilter("keyword", value);
            } else {
              updateFilter("keyword", null);
            }
          }}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select
          value={searchParams.get("locationType") || "all"}
          onValueChange={(v) => updateFilter("locationType", v === "all" ? null : v)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="場所" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全ての場所</SelectItem>
            {Object.entries(LOCATION_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("roastLevel") || "all"}
          onValueChange={(v) => updateFilter("roastLevel", v === "all" ? null : v)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="焙煎度" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全ての焙煎度</SelectItem>
            {Object.entries(ROAST_LEVEL_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("rating") || "all"}
          onValueChange={(v) => updateFilter("rating", v === "all" ? null : v)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="評価" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全ての評価</SelectItem>
            {[5, 4, 3, 2, 1].map((r) => (
              <SelectItem key={r} value={r.toString()}>
                {"★".repeat(r)}{"☆".repeat(5 - r)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            クリア
          </Button>
        )}
      </div>
    </div>
  );
}
