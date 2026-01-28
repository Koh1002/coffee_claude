import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardStats } from "@/actions/logs";
import { DashboardCharts } from "@/components/dashboard/Charts";
import { BarChart3 } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const stats = await getDashboardStats();

  if (!stats || stats.totalLogs === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">ダッシュボード</h1>
          <p className="text-muted-foreground">あなたのコーヒー統計</p>
        </div>

        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium mb-2">データがありません</h2>
          <p className="text-muted-foreground">
            コーヒーログを記録すると、統計が表示されます
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <p className="text-muted-foreground">あなたのコーヒー統計（過去12ヶ月）</p>
      </div>

      <DashboardCharts
        monthlyStats={stats.monthlyStats}
        topPlaces={stats.topPlaces}
        topOrigins={stats.topOrigins}
        totalLogs={stats.totalLogs}
        avgRating={stats.avgRating}
      />
    </div>
  );
}
