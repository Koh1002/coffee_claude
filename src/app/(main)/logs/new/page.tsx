import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogForm } from "@/components/logs/LogForm";

export default async function NewLogPage() {
  const session = await auth();
  if (!session) {
    redirect("/login?callbackUrl=/logs/new");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">新しい記録</h1>
        <p className="text-muted-foreground">コーヒーの記録を作成しましょう</p>
      </div>
      <LogForm />
    </div>
  );
}
