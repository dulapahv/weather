"use client";

import { useTheme } from "next-themes";
import styles from "./ThemeToggle.module.scss";
import { MoonIcon, SunIcon } from "@phosphor-icons/react/dist/ssr";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      className={styles.toggle}
      aria-label="Toggle light and dark theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <SunIcon className={styles.sun} />
      <MoonIcon className={styles.moon} />
    </button>
  );
}
