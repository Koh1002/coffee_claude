import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLogsForTasteMap } from "@/actions/logs";
import { getBeansForTasteMap } from "@/actions/beans";
import { TasteMapClient } from "./TasteMapClient";
import { Map } from "lucide-react";

interface TasteMapPageProps {
  searchParams: Promise<{
    show?: string;
    roastLevel?: string;
    rating?: string;
    period?: string;
  }>;
}

export default async function TasteMapPage({ searchParams }: TasteMapPageProps) {
  const session = await auth();
  if (!session) {
    redirect("/login?callbackUrl=/taste-map");
  }

  const params = await searchParams;

  const showParam = params.show || "both";
  const showLogs = showParam === "both" || showParam === "logs";
  const showBeans = showParam === "both" || showParam === "beans";

  const [logs, beans] = await Promise.all([
    showLogs
      ? getLogsForTasteMap({
          roastLevel: params.roastLevel,
          rating: params.rating ? parseInt(params.rating) : undefined,
          period: params.period,
        })
      : Promise.resolve([]),
    showBeans
      ? getBeansForTasteMap({
          roastLevel: params.roastLevel,
        })
      : Promise.resolve([]),
  ]);

  const hasData = logs.length > 0 || beans.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Taste Map</h1>
        <p className="text-muted-foreground">
          コーヒーの味わいを2D座標で可視化
        </p>
      </div>

      {!hasData ? (
        <div className="text-center py-12">
          <Map className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium mb-2">データがありません</h2>
          <p className="text-muted-foreground">
            コーヒーログや豆を登録すると、Taste Mapに表示されます
          </p>
        </div>
      ) : (
        <Suspense fallback={<div className="h-[600px] flex items-center justify-center">Loading...</div>}>
          <TasteMapClient
            logs={logs.map((log) => ({
              ...log,
              type: "log" as const,
            }))}
            beans={beans.map((bean) => ({
              ...bean,
              type: "bean" as const,
            }))}
            initialShowLogs={showLogs}
            initialShowBeans={showBeans}
          />
        </Suspense>
      )}
    </div>
  );
}
