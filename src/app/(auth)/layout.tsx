import { Coffee } from "lucide-react";
import Link from "next/link";
import { Providers } from "@/components/shared/Providers";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <Coffee className="h-8 w-8" />
          <span className="text-2xl font-bold">Coffee Log</span>
        </Link>
        {children}
      </div>
    </Providers>
  );
}
