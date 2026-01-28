"use client";

import { useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Star } from "lucide-react";
import {
  ROAST_LEVEL_LABELS,
  getTasteXLabel,
  getRoastYLabel,
  type RoastLevel,
} from "@/types";

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

type DataPoint = LogPoint | BeanPoint;

interface TasteMapProps {
  logs: LogPoint[];
  beans: BeanPoint[];
  showLogs: boolean;
  showBeans: boolean;
}

// Custom shape for scatter points
const CustomShape = (props: { cx?: number; cy?: number; payload?: DataPoint }) => {
  const { cx, cy, payload } = props;
  if (cx === undefined || cy === undefined || !payload) return null;

  if (payload.type === "bean") {
    // Circle for beans
    return (
      <circle
        cx={cx}
        cy={cy}
        r={8}
        fill="#22c55e"
        stroke="#16a34a"
        strokeWidth={2}
        style={{ cursor: "pointer" }}
      />
    );
  } else {
    // Triangle for logs
    const size = 10;
    const points = `${cx},${cy - size} ${cx - size},${cy + size} ${cx + size},${cy + size}`;
    return (
      <polygon
        points={points}
        fill="#3b82f6"
        stroke="#2563eb"
        strokeWidth={2}
        style={{ cursor: "pointer" }}
      />
    );
  }
};

// Custom tooltip
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: DataPoint }> }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium">
          {data.type === "bean" ? (data as BeanPoint).name : (data as LogPoint).title}
        </p>
        <p className="text-muted-foreground">
          {data.type === "bean" ? "豆" : "ログ"}
        </p>
        <p className="text-muted-foreground">
          味: {getTasteXLabel(data.tasteX)} ({data.tasteX})
        </p>
        <p className="text-muted-foreground">
          焙煎: {getRoastYLabel(data.roastY)} ({data.roastY})
        </p>
      </div>
    );
  }
  return null;
};

export function TasteMap({ logs, beans, showLogs, showBeans }: TasteMapProps) {
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);

  const handleClick = (data: DataPoint) => {
    setSelectedPoint(data);
  };

  // Convert data for Recharts
  const logData = showLogs ? logs.map((log) => ({ ...log, type: "log" as const })) : [];
  const beanData = showBeans ? beans.map((bean) => ({ ...bean, type: "bean" as const })) : [];

  return (
    <>
      <div className="w-full h-[500px] md:h-[600px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="tasteX"
              domain={[-100, 100]}
              name="味"
              label={{
                value: "← 渋み | 酸味 →",
                position: "bottom",
                offset: 20,
              }}
              tickFormatter={(value) => value.toString()}
            />
            <YAxis
              type="number"
              dataKey="roastY"
              domain={[0, 100]}
              name="焙煎度"
              label={{
                value: "← 浅煎り | 深煎り →",
                angle: -90,
                position: "insideLeft",
                offset: 10,
              }}
              tickFormatter={(value) => value.toString()}
            />
            <ReferenceLine x={0} stroke="#666" strokeDasharray="3 3" />
            <ReferenceLine y={50} stroke="#666" strokeDasharray="3 3" />
            <Tooltip content={<CustomTooltip />} />

            {/* Beans scatter */}
            {showBeans && beanData.length > 0 && (
              <Scatter
                name="豆"
                data={beanData}
                shape={<CustomShape />}
                onClick={(data) => handleClick(data as unknown as DataPoint)}
              />
            )}

            {/* Logs scatter */}
            {showLogs && logData.length > 0 && (
              <Scatter
                name="ログ"
                data={logData}
                shape={<CustomShape />}
                onClick={(data) => handleClick(data as unknown as DataPoint)}
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        {showBeans && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span className="text-sm">豆 ({beans.length})</span>
          </div>
        )}
        {showLogs && (
          <div className="flex items-center gap-2">
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-blue-500" />
            <span className="text-sm">ログ ({logs.length})</span>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedPoint} onOpenChange={() => setSelectedPoint(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedPoint?.type === "bean"
                ? (selectedPoint as BeanPoint).name
                : (selectedPoint as LogPoint)?.title}
            </DialogTitle>
          </DialogHeader>

          {selectedPoint && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge variant={selectedPoint.type === "bean" ? "default" : "secondary"}>
                  {selectedPoint.type === "bean" ? "豆" : "ログ"}
                </Badge>
                <Badge variant="outline">
                  {ROAST_LEVEL_LABELS[selectedPoint.roastLevel as RoastLevel]}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">渋み ↔ 酸味</span>
                  <span>{selectedPoint.tasteX} ({getTasteXLabel(selectedPoint.tasteX)})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">焙煎度</span>
                  <span>{selectedPoint.roastY} ({getRoastYLabel(selectedPoint.roastY)})</span>
                </div>
                {selectedPoint.type === "log" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">日時</span>
                      <span>
                        {format(new Date((selectedPoint as LogPoint).dateTime), "yyyy/MM/dd", { locale: ja })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">評価</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= (selectedPoint as LogPoint).rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Link
                  href={
                    selectedPoint.type === "bean"
                      ? `/beans/${selectedPoint.id}/edit`
                      : `/logs/${selectedPoint.id}`
                  }
                  className="flex-1"
                >
                  <Button className="w-full">
                    {selectedPoint.type === "bean" ? "豆を編集" : "ログを表示"}
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => setSelectedPoint(null)}>
                  閉じる
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
