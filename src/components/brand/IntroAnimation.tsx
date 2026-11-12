import { useEffect, useState } from "react";
import { LogoMark } from "./LogoMark";
import { siteConfig } from "@/config/site";

const KEY = "pr:intro-seen";
const LETTERS = "PAIE ROYALE".split("");

/**
 * First-visit brand intro. Never blocks: it fades out on its own after ~3s,
 * can be skipped, and is hidden for returning visitors (inline script in __root)
 * and for prefers-reduced-motion (CSS).
 */
export function IntroAnimation() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY)) {
        setVisible(false);
        return;
      }
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    const t = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  const skip = () => {
    document.documentElement.dataset.intro = "seen";
    setVisible(false);
  };

  return (
    <div className="intro-overlay" role="dialog" aria-label="Bienvenida PAIE ROYALE">
      <div className="flex flex-col items-center px-6 text-center">
        <LogoMark className="intro-mark h-20 w-20" />
        <h1 className="mt-6 font-display text-4xl font-medium tracking-[0.3em] sm:text-6xl" aria-label="PAIE ROYALE">
          {LETTERS.map((l, i) => (
            <span key={i} className="intro-letter" style={{ animationDelay: `${0.5 + i * 0.065}s` }} aria-hidden="true">
              {l === " " ? "\u00a0" : l}
            </span>
          ))}
        </h1>
        <div className="intro-tagline mt-2 eyebrow text-gold">Hotel &amp; Resort</div>
        <div className="intro-tagline mt-6 gold-rule w-40" />
        <p className="intro-tagline mt-6 font-display text-lg italic text-forest-foreground/80 sm:text-xl">
          {siteConfig.slogan}
        </p>
      </div>
      <button
        type="button"
        onClick={skip}
        className="absolute bottom-8 right-8 rounded-full border border-gold/50 px-4 py-1.5 text-xs tracking-widest text-forest-foreground/80 uppercase transition-colors hover:bg-gold hover:text-gold-foreground"
      >
        Saltar
      </button>
    </div>
  );
}
