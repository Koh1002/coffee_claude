import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getBean } from "@/actions/beans";
import { BeanForm } from "@/components/beans/BeanForm";

interface EditBeanPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBeanPage({ params }: EditBeanPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    redirect(`/login?callbackUrl=/beans/${id}/edit`);
  }

  const bean = await getBean(id);

  if (!bean) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">豆を編集</h1>
        <p className="text-muted-foreground">豆の情報を編集します</p>
      </div>
      <BeanForm bean={bean} />
    </div>
  );
}
