import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Coffee, BarChart3, Map, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <Coffee className="h-16 w-16 mb-6 text-primary" />
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Coffee Log
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-md">
          あなたのコーヒー体験を記録し、味の好みを可視化。
          コーヒー愛好家とつながりましょう。
        </p>
        <div className="flex gap-4">
          <Link href="/signup">
            <Button size="lg">無料で始める</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">ログイン</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container max-w-5xl">
          <h2 className="text-2xl font-bold text-center mb-12">主な機能</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <Coffee className="h-10 w-10 mb-4 text-primary" />
              <h3 className="font-semibold mb-2">コーヒー記録</h3>
              <p className="text-sm text-muted-foreground">
                飲んだコーヒーの情報、味わい、評価を簡単に記録。
                写真も添付できます。
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <Map className="h-10 w-10 mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Taste Map</h3>
              <p className="text-sm text-muted-foreground">
                渋み・酸味、焙煎度を2D座標で可視化。
                自分の味の好みを発見しましょう。
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <BarChart3 className="h-10 w-10 mb-4 text-primary" />
              <h3 className="font-semibold mb-2">ダッシュボード</h3>
              <p className="text-sm text-muted-foreground">
                月別の杯数、評価の推移、よく飲む店や産地を
                グラフで確認できます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SNS Feature */}
      <section className="py-16 px-4">
        <div className="container max-w-5xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <Users className="h-10 w-10 mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-4">コーヒー愛好家とつながる</h2>
              <p className="text-muted-foreground mb-4">
                コーヒー記録を公開して、他のユーザーと共有。
                いいねやコメントで交流し、新しいコーヒーの発見につなげましょう。
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ 記録の公開/非公開を選択</li>
                <li>✓ いいね・コメント機能</li>
                <li>✓ ユーザーをフォロー</li>
                <li>✓ フォロー中のユーザーのフィード</li>
              </ul>
            </div>
            <div className="flex-1 bg-muted rounded-lg p-8 text-center">
              <p className="text-muted-foreground">
                コーヒー愛好家のコミュニティに参加しよう
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Coffee Log. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
