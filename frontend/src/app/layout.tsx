import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { NextAuthProvider } from "@/app/NextAuthProvider";
import { ColorSchemeProvider } from "@/app/contexts/ColorSchemeContext";
import { SwalProvider } from "@/app/contexts/SwalContext";
import Toaster from "@/app/Toaster";
import ClientApplication from "@/app/ClientApplication";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Geo Diary",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ColorSchemeProvider>
      <SwalProvider>
        <html lang="en">
          <body className={inter.className}>
            <NextAuthProvider>
              <ClientApplication>{children}</ClientApplication>
              <Toaster />
            </NextAuthProvider>
          </body>
        </html>
      </SwalProvider>
    </ColorSchemeProvider>
  );
}
