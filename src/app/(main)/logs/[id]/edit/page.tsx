import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogForm } from "@/components/logs/LogForm";

interface EditLogPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLogPage({ params }: EditLogPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    redirect(`/login?callbackUrl=/logs/${id}/edit`);
  }

  const log = await prisma.coffeeLog.findUnique({
    where: { id },
  });

  if (!log) {
    notFound();
  }

  if (log.userId !== session.user.id) {
    redirect(`/logs/${id}`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">記録を編集</h1>
        <p className="text-muted-foreground">コーヒーの記録を編集します</p>
      </div>
      <LogForm log={log} />
    </div>
  );
}
