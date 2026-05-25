import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { SiteNav } from "@/components/layout/site-nav";

export const metadata: Metadata = {
  title: "AI Visa Assistant",
  description: "AI-powered eligibility, document verification, and visa guidance platform"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SiteNav />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
