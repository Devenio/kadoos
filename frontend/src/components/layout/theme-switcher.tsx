"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckIcon, SwatchBookIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/dictionaries";
import { themeCookieName, themes, type ThemeId } from "@/lib/theme";

type ThemeSwitcherProps = {
  currentTheme: ThemeId;
  labels: Dictionary["theme"];
};

export function ThemeSwitcher({ currentTheme, labels }: ThemeSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(currentTheme);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.cookie = `${themeCookieName}=${theme}; path=/; max-age=31536000; samesite=lax`;
  }, [theme]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function selectTheme(nextTheme: ThemeId) {
    setTheme(nextTheme);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="touch"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={menuId}
        aria-label={labels.label}
        onClick={() => setOpen((value) => !value)}
      >
        <SwatchBookIcon />
        <span className="hidden sm:inline">{labels[theme]}</span>
      </Button>
      {open ? (
        <ul
          id={menuId}
          role="listbox"
          aria-label={labels.label}
          className="absolute end-0 top-[calc(100%+0.5rem)] z-50 w-52 overflow-hidden rounded-lg border border-border bg-background p-1 shadow-lg"
        >
          {themes.map((item) => {
            const selected = item.id === theme;

            return (
              <li key={item.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 px-2 py-2 text-start text-sm transition-colors hover:bg-muted"
                  onClick={() => selectTheme(item.id)}
                >
                  <span
                    className="size-3.5 shrink-0 rounded-full border border-border"
                    style={{ backgroundColor: item.swatch }}
                  />
                  <span className="flex-1">{labels[item.id]}</span>
                  {selected ? (
                    <CheckIcon className="size-3.5 text-foreground" />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
