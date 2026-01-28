import { Header } from "@/components/shared/Header";
import { Providers } from "@/components/shared/Providers";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
      </div>
    </Providers>
  );
}
