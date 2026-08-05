import Script from "next/script";

/**
 * Monetag Vignette — a full-page interstitial overlay, not an inline banner,
 * so it reserves no space in the layout and needs no container.
 *
 * The snippet is reproduced exactly as Monetag supplied it, zone id included.
 * Do not reformat or "clean up" the expression: it is what their dashboard
 * hands out, and rewriting it risks breaking attribution for the zone.
 *
 * `lazyOnload` keeps it behind everything that matters — Next waits for the
 * window load event, then an idle callback. Where the component mounts *after*
 * load has already fired (the quiz scorecard does exactly this), next/script
 * checks document.readyState and falls back to a plain idle callback, so the
 * script still runs.
 *
 * The stable `id` is what makes this safe to render conditionally: next/script
 * keys its cache on it, so remounting — replaying a quiz, say — will not
 * inject the script a second time.
 */
const VIGNETTE_SNIPPET = `(function(s){s.dataset.zone='11511969',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`;

export function MonetagVignette() {
  return (
    <Script
      id="monetag-vignette"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{ __html: VIGNETTE_SNIPPET }}
    />
  );
}
