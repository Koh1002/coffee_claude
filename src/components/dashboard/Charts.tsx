"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MonthlyData {
  month: string;
  count: number;
  avgRating: number;
}

interface RankingItem {
  name: string;
  count: number;
}

interface DashboardChartsProps {
  monthlyStats: MonthlyData[];
  topPlaces: RankingItem[];
  topOrigins: RankingItem[];
  totalLogs: number;
  avgRating: number;
}

export function DashboardCharts({
  monthlyStats,
  topPlaces,
  topOrigins,
  totalLogs,
  avgRating,
}: DashboardChartsProps) {
  // Format month labels (2024-01 -> 1月)
  const formattedMonthlyStats = monthlyStats.map((stat) => ({
    ...stat,
    label: `${parseInt(stat.month.split("-")[1])}月`,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              総記録数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalLogs}</p>
            <p className="text-xs text-muted-foreground">杯</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              平均評価
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{avgRating.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">/ 5.0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              今月の記録
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formattedMonthlyStats[formattedMonthlyStats.length - 1]?.count || 0}
            </p>
            <p className="text-xs text-muted-foreground">杯</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              今月の平均評価
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {(formattedMonthlyStats[formattedMonthlyStats.length - 1]?.avgRating || 0).toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">/ 5.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Count Chart */}
      <Card>
        <CardHeader>
          <CardTitle>月別記録数</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedMonthlyStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip
                  formatter={(value) => [`${value}杯`, "記録数"]}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Rating Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>評価平均の推移</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedMonthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                <Tooltip
                  formatter={(value) => [Number(value).toFixed(2), "平均評価"]}
                  labelFormatter={(label) => `${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="avgRating"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Rankings */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Places */}
        <Card>
          <CardHeader>
            <CardTitle>よく飲む店 Top 5</CardTitle>
          </CardHeader>
          <CardContent>
            {topPlaces.length === 0 ? (
              <p className="text-sm text-muted-foreground">データがありません</p>
            ) : (
              <div className="space-y-3">
                {topPlaces.map((place, index) => (
                  <div key={place.name} className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-6">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{place.name}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{place.count}杯</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Origins */}
        <Card>
          <CardHeader>
            <CardTitle>よく飲む産地 Top 5</CardTitle>
          </CardHeader>
          <CardContent>
            {topOrigins.length === 0 ? (
              <p className="text-sm text-muted-foreground">データがありません</p>
            ) : (
              <div className="space-y-3">
                {topOrigins.map((origin, index) => (
                  <div key={origin.name} className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-6">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{origin.name}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{origin.count}杯</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
