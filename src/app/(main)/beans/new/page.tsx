import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BeanForm } from "@/components/beans/BeanForm";

export default async function NewBeanPage() {
  const session = await auth();
  if (!session) {
    redirect("/login?callbackUrl=/beans/new");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">新しい豆を登録</h1>
        <p className="text-muted-foreground">所有している豆の情報を登録しましょう</p>
      </div>
      <BeanForm />
    </div>
  );
}
