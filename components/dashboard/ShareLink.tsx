"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The shareable quiz link, with a copy button.
 *
 * `url` arrives from the server already absolute when NEXT_PUBLIC_SITE_URL is
 * set, and as a bare path otherwise. Resolving a bare path needs
 * window.location, which the server doesn't have — so that happens in an effect
 * after mount rather than during render, where it would trip hydration.
 */
export function ShareLink({
  url,
  className,
}: {
  url: string;
  className?: string;
}) {
  const [resolved, setResolved] = useState(url);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setResolved(new URL(url, window.location.origin).toString());
  }, [url]);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  async function copy(event: React.MouseEvent<HTMLButtonElement>) {
    try {
      await navigator.clipboard.writeText(resolved);
      setCopied(true);
    } catch {
      // Clipboard access is denied on insecure origins and in some in-app
      // browsers. Select the text so the user can copy it by hand.
      const input = event.currentTarget.parentElement?.querySelector("input");
      input?.select();
    }
  }

  return (
    <div
      className={cn(
        "flex items-stretch border-2 border-dashed border-[rgba(123,47,255,0.4)] bg-[#0A0A0F]",
        className
      )}
    >
      <input
        readOnly
        value={resolved}
        aria-label="Shareable quiz link"
        onFocus={(event) => event.currentTarget.select()}
        className="w-full min-w-0 bg-transparent px-3 py-2 text-xs text-white/70 outline-none"
      />
      <button
        type="button"
        onClick={copy}
        className="font-pixel shrink-0 border-l-2 border-dashed border-[rgba(123,47,255,0.4)] px-3 text-[9px] uppercase tracking-wider text-white/60 transition-colors hover:bg-white/5 hover:text-white"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
