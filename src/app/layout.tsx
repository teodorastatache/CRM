import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Infiniteea CRM",
  description: "CRM local Infiniteea pentru vânzări e-commerce, financiar și operațiuni",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ro"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full bg-[var(--background)]">
        <Providers>
          <Sidebar />
          <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
