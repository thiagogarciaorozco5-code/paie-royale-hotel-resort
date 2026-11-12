import { cn } from "@/lib/utils";

/** PAIE ROYALE monogram: crown over a P in a fine gold ring. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("h-10 w-10 text-gold", className)} aria-hidden="true" fill="none">
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="32" cy="32" r="26.5" stroke="currentColor" strokeWidth="0.6" opacity="0.6" />
      <path d="M20 22 L24 15 L28 20 L32 13 L36 20 L40 15 L44 22 Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M20 24.5 H44" stroke="currentColor" strokeWidth="1" />
      <path d="M26 50 V29 H34.5 C39 29 41.5 31.6 41.5 35.5 C41.5 39.4 39 42 34.5 42 H26" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22.5 50 H30" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LogoMark className={compact ? "h-8 w-8" : "h-10 w-10"} />
      <div className="leading-none">
        <div className="font-display text-xl font-semibold tracking-[0.18em]">PAIE ROYALE</div>
        {!compact && <div className="eyebrow mt-1 text-[0.58rem] text-gold">Hotel &amp; Resort</div>}
      </div>
    </div>
  );
}
