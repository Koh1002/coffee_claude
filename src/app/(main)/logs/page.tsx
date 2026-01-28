import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogCard } from "@/components/logs/LogCard";
import { LogFilters } from "@/components/logs/LogFilters";
import { getLogs } from "@/actions/logs";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Plus, Coffee, Download } from "lucide-react";
import type { LogFilterInput } from "@/lib/validations";

interface LogsPageProps {
  searchParams: Promise<{
    keyword?: string;
    locationType?: string;
    roastLevel?: string;
    rating?: string;
    drinkType?: string;
    visibility?: string;
  }>;
}

export default async function LogsPage({ searchParams }: LogsPageProps) {
  const session = await auth();
  if (!session) {
    redirect("/login?callbackUrl=/logs");
  }

  const params = await searchParams;

  const filters: LogFilterInput = {
    keyword: params.keyword,
    locationType: params.locationType as LogFilterInput["locationType"],
    roastLevel: params.roastLevel as LogFilterInput["roastLevel"],
    rating: params.rating ? parseInt(params.rating) : undefined,
    drinkType: params.drinkType,
    visibility: params.visibility as LogFilterInput["visibility"],
  };

  const logs = await getLogs(filters);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">コーヒーログ</h1>
          <p className="text-muted-foreground">あなたのコーヒー記録</p>
        </div>
        <div className="flex gap-2">
          <a href="/api/export/csv" download>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              CSV出力
            </Button>
          </a>
          <Link href="/logs/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規記録
            </Button>
          </Link>
        </div>
      </div>

      <Suspense fallback={<div>Loading filters...</div>}>
        <LogFilters />
      </Suspense>

      {logs.length === 0 ? (
        <div className="text-center py-12">
          <Coffee className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium mb-2">まだ記録がありません</h2>
          <p className="text-muted-foreground mb-4">
            最初のコーヒーを記録してみましょう
          </p>
          <Link href="/logs/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              最初の記録を作成
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {logs.map((log) => (
            <LogCard key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}
