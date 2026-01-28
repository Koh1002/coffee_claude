import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BeanCard } from "@/components/beans/BeanCard";
import { getBeans } from "@/actions/beans";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Plus, Bean } from "lucide-react";

export default async function BeansPage() {
  const session = await auth();
  if (!session) {
    redirect("/login?callbackUrl=/beans");
  }

  const beans = await getBeans();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Beans</h1>
          <p className="text-muted-foreground">所有している豆の一覧</p>
        </div>
        <Link href="/beans/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新規登録
          </Button>
        </Link>
      </div>

      {beans.length === 0 ? (
        <div className="text-center py-12">
          <Bean className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium mb-2">まだ豆が登録されていません</h2>
          <p className="text-muted-foreground mb-4">
            所有している豆を登録してみましょう
          </p>
          <Link href="/beans/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              最初の豆を登録
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {beans.map((bean) => (
            <BeanCard key={bean.id} bean={bean} />
          ))}
        </div>
      )}
    </div>
  );
}
