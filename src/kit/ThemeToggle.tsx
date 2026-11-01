"use client";
import { useEffect, useState } from "react";

type Mode = "system" | "light" | "dark";
const KEY = "theme";
const ICON: Record<Mode, string> = { system: "🖥️", light: "☀️", dark: "🌙" };

/** Inline in <head> (before paint) so there is no flash of the wrong theme. */
export const THEME_SCRIPT = `(function(){try{var m=localStorage.getItem('${KEY}')||'system';var d=m==='dark'||(m==='system'&&!matchMedia('(prefers-color-scheme: light)').matches);var r=document.documentElement;r.dataset.theme=d?'dark':'light';r.dataset.themeMode=m;r.style.colorScheme=d?'dark':'light';var c=document.querySelector('meta[name=theme-color]:not([media])');if(c)c.setAttribute('content',d?getComputedStyle(r).getPropertyValue('--tc-dark')||c.content:getComputedStyle(r).getPropertyValue('--tc-light')||c.content);}catch(e){}})();`;

export function applyTheme(mode: Mode) {
  const r = document.documentElement;
  const dark = mode === "dark" || (mode === "system" && !matchMedia("(prefers-color-scheme: light)").matches);
  r.dataset.theme = dark ? "dark" : "light";
  r.dataset.themeMode = mode;
  r.style.colorScheme = dark ? "dark" : "light";
  const v = getComputedStyle(r).getPropertyValue(dark ? "--tc-dark" : "--tc-light").trim();
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => v && m.setAttribute("content", v));
}

export function ThemeToggle({ labels = { theme: "Theme", system: "System", light: "Light", dark: "Dark" }, className = "" }:
  { labels?: { theme: string; system: string; light: string; dark: string }; className?: string }) {
  const [mode, setMode] = useState<Mode>("system");
  useEffect(() => {
    const m = (localStorage.getItem(KEY) as Mode) || "system";
    setMode(m); applyTheme(m);
    const mq = matchMedia("(prefers-color-scheme: light)");
    const on = () => (localStorage.getItem(KEY) || "system") === "system" && applyTheme("system");
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  const set = (m: Mode) => { setMode(m); localStorage.setItem(KEY, m); applyTheme(m); };
  return (
    <label className={`theme-toggle ${className}`} title={labels.theme}>
      <span aria-hidden>{ICON[mode]}</span>
      <select aria-label={labels.theme} value={mode} onChange={(e) => set(e.target.value as Mode)}>
        <option value="system">{labels.system}</option>
        <option value="light">{labels.light}</option>
        <option value="dark">{labels.dark}</option>
      </select>
    </label>
  );
}
