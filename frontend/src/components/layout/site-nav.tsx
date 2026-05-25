"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, FileCheck2, Gauge, LayoutDashboard, Moon, Plane, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/assistant", label: "Assistant", icon: Bot },
  { href: "/assessment", label: "Assessment", icon: Gauge },
  { href: "/documents", label: "Documents", icon: FileCheck2 },
  { href: "/requirements", label: "Requirements", icon: Search },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }
];

export function SiteNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Plane className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline">AI Visa Assistant</span>
        </Link>
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
                  pathname === item.href && "bg-muted text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Button
          aria-label="Toggle theme"
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
      <nav className="grid grid-cols-5 border-t md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("flex h-12 items-center justify-center", pathname === item.href && "bg-muted")}
              aria-label={item.label}
            >
              <Icon className="h-4 w-4" />
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
