import Image from "next/image";
import { ReactNode } from "react";

interface PageHolderProps {
  children: ReactNode;
}

export default function PageHolder({ children }: PageHolderProps) {
  return (
    <main className="min-h-screen">
      <div className="fixed inset-0">
        <Image
          src="/images/backgroundImage.jpg"
          alt="About background"
          fill
          quality={100}
          style={{ objectFit: "cover" }}
          priority
        />
      </div>
      <div className="relative flex justify-center min-h-screen">
        <div className="text-slate-200 text-center bg-opacity-70 bg-dark-body w-full">
          {children}
        </div>
      </div>
    </main>
  );
}
