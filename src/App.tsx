import React, { useMemo, useState } from "react";
import { Menu, X } from "lucide-react";

import Landing from "./pages/Landing";

type Language = "en" | "hi";

function App(): React.JSX.Element {
  const [language, setLanguage] = useState<Language>("en");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems = useMemo(
    () => [
      { href: "#dpdp-basics", label: "DPDP basics" },
      { href: "#how-it-works", label: "Privacy journey" },
      { href: "#demo", label: "Try an example" },
      { href: "#rules", label: "Learn DPDP rules" },
      { href: "#upload", label: "Upload APK" },
    ],
    []
  );

  return (
    <div className="cyber-bg min-h-screen text-slate-100">
      <header className="sticky top-0 z-20 border-b border-[var(--ds-nav-border)] bg-[var(--ds-nav-bg)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 via-teal-400 to-emerald-400 text-sm font-bold text-navy-950 shadow-glow">
              S
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.25em] text-cyan-400/70 font-mono">DPDP Sentinel</p>
              <h1 className="text-sm font-semibold text-slate-100 font-heading leading-tight">
                {language === "hi"
                  ? "एंड्रॉइड ऐप्स के लिए AI-assisted DPDP और security analysis"
                  : "AI-assisted DPDP and security analysis for Android apps"}
              </h1>
            </div>
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition-all hover:text-slate-300"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage((prev) => (prev === "en" ? "hi" : "en"))}
              className="hidden rounded-lg border border-[var(--ds-border-default)] bg-navy-800/60 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-cyan-500/30 hover:text-slate-200 sm:block"
            >
              {language === "en" ? "हिंदी" : "English"}
            </button>
            <button
              type="button"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              className="flex rounded-lg border border-[var(--ds-border-default)] bg-navy-800/60 p-2 text-slate-400 transition hover:border-cyan-500/30 hover:text-slate-200 lg:hidden"
            >
              {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileNavOpen ? (
          <div className="border-t border-[var(--ds-border-subtle)] bg-navy-900/95 backdrop-blur-xl lg:hidden">
            <div className="mx-auto max-w-7xl space-y-1 px-4 py-3">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-navy-700/50 hover:text-slate-200"
                >
                  {item.label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => {
                  setLanguage((prev) => (prev === "en" ? "hi" : "en"));
                  setMobileNavOpen(false);
                }}
                className="block w-full rounded-lg border border-[var(--ds-border-default)] px-3 py-2 text-left text-sm font-medium text-slate-400 transition hover:bg-navy-700/50 hover:text-slate-200"
              >
                {language === "en" ? "हिंदी" : "English"}
              </button>
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Landing language={language} />
      </main>
    </div>
  );
}

export default App;
