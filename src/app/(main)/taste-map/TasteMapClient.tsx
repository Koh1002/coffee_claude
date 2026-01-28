"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TasteMap } from "@/components/taste-map/TasteMap";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROAST_LEVEL_LABELS } from "@/types";

interface LogPoint {
  id: string;
  title: string;
  tasteX: number;
  roastY: number;
  rating: number;
  roastLevel: string;
  dateTime: Date;
  type: "log";
}

interface BeanPoint {
  id: string;
  name: string;
  tasteX: number;
  roastY: number;
  roastLevel: string;
  type: "bean";
}

interface TasteMapClientProps {
  logs: LogPoint[];
  beans: BeanPoint[];
  initialShowLogs: boolean;
  initialShowBeans: boolean;
}

export function TasteMapClient({
  logs,
  beans,
  initialShowLogs,
  initialShowBeans,
}: TasteMapClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showLogs, setShowLogs] = useState(initialShowLogs);
  const [showBeans, setShowBeans] = useState(initialShowBeans);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/taste-map?${params.toString()}`);
  }

  function handleShowChange(value: string) {
    if (value === "both") {
      setShowLogs(true);
      setShowBeans(true);
    } else if (value === "logs") {
      setShowLogs(true);
      setShowBeans(false);
    } else {
      setShowLogs(false);
      setShowBeans(true);
    }
    updateParam("show", value === "both" ? null : value);
  }

  const currentShow = showLogs && showBeans ? "both" : showLogs ? "logs" : "beans";

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>表示対象</Label>
              <Tabs value={currentShow} onValueChange={handleShowChange}>
                <TabsList>
                  <TabsTrigger value="both">両方</TabsTrigger>
                  <TabsTrigger value="logs">ログのみ</TabsTrigger>
                  <TabsTrigger value="beans">豆のみ</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label>焙煎度</Label>
              <Select
                value={searchParams.get("roastLevel") || "all"}
                onValueChange={(v) => updateParam("roastLevel", v === "all" ? null : v)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {Object.entries(ROAST_LEVEL_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {showLogs && (
              <>
                <div className="space-y-2">
                  <Label>評価（ログ）</Label>
                  <Select
                    value={searchParams.get("rating") || "all"}
                    onValueChange={(v) => updateParam("rating", v === "all" ? null : v)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      {[5, 4, 3, 2, 1].map((r) => (
                        <SelectItem key={r} value={r.toString()}>
                          {"★".repeat(r)}{"☆".repeat(5 - r)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>期間（ログ）</Label>
                  <Select
                    value={searchParams.get("period") || "all"}
                    onValueChange={(v) => updateParam("period", v === "all" ? null : v)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全期間</SelectItem>
                      <SelectItem value="30">直近30日</SelectItem>
                      <SelectItem value="90">直近90日</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardContent className="pt-6">
          <TasteMap
            logs={logs}
            beans={beans}
            showLogs={showLogs}
            showBeans={showBeans}
          />
        </CardContent>
      </Card>
    </div>
  );
}
