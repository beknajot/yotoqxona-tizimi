"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Hydration mismatch'dan qochish uchun
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="w-9 h-9 rounded-full"
        aria-label="Tema almashish"
      >
        <span className="w-4 h-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-9 h-9 rounded-full relative overflow-hidden transition-all duration-300 hover:bg-accent"
      aria-label={isDark ? "Kunduzgi rejimga o'tish" : "Tungi rejimga o'tish"}
      title={isDark ? "Kunduzgi rejim" : "Tungi rejim"}
    >
      {/* Sun icon */}
      <Sun
        className={`absolute w-4 h-4 transition-all duration-500 ${
          isDark
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 -rotate-90 scale-50"
        }`}
      />
      {/* Moon icon */}
      <Moon
        className={`absolute w-4 h-4 transition-all duration-500 ${
          isDark
            ? "opacity-0 rotate-90 scale-50"
            : "opacity-100 rotate-0 scale-100"
        }`}
      />
    </Button>
  );
}
