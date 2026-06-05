"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/assistant", label: "Assistant" },
  { href: "/assessment", label: "Assessment" },
  // { href: "/documents", label: "Documents" },
  { href: "/requirements", label: "Requirements" },
  // { href: "/dashboard", label: "Dashboard" }
];

export function SiteNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-5">
        <Link href="/" className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
          {/* <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
            V
          </span> */}
          <span className="hidden sm:inline text-foreground">Visa Assistant</span>
        </Link>
        <nav className="ml-auto hidden items-center gap-0.5 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground",
                pathname === item.href && "bg-muted text-foreground font-medium"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="md:hidden ml-auto" />
        {/* <Button
          aria-label="Toggle theme"
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        </Button> */}
      </div>
      <nav className="flex border-t md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 py-2.5 text-center text-xs text-muted-foreground",
              pathname === item.href && "bg-muted text-foreground font-medium"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
