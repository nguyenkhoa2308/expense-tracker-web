"use client";

import { create } from "zustand";

type Theme = "auto" | "light" | "dark";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  initTheme: () => void;
}

function setDarkClass(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "light") {
    root.classList.remove("dark");
  } else {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    if (prefersDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }
}

function applyTheme(theme: Theme, animate = false) {
  if (!animate || !document.startViewTransition) {
    setDarkClass(theme);
    return;
  }

  const transition = document.startViewTransition(() => {
    setDarkClass(theme);
  });

  transition.ready.then(() => {
    const x = window.innerWidth - 40;
    const y = 32;
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 300,
        easing: "ease-out",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  });
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "light",

  setTheme: (theme) => {
    localStorage.setItem("theme", theme);
    applyTheme(theme, true);
    set({ theme });
  },

  initTheme: () => {
    const saved = (localStorage.getItem("theme") as Theme) || "light";
    applyTheme(saved);
    set({ theme: saved });

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        const current = (localStorage.getItem("theme") as Theme) || "light";
        if (current === "auto") {
          applyTheme("auto");
        }
      });
  },
}));
