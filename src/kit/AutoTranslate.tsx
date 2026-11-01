"use client";
/**
 * DOU kit: catalog-based UI translator. Translates rendered UI text nodes (+ placeholder/aria-label/title)
 * from English using /i18n/<lang>.json (exact-string catalog + a few number/name patterns).
 * Skips anything inside [data-no-t] (legal text, official rules), <script>/<style>/<code>/<pre>, inputs.
 * Original English is remembered per node, so switching languages (or back to English) is lossless.
 */
import { useEffect } from "react";

type Cat = { s: Record<string, string>; p: Record<string, string> };
const cache: Record<string, Cat> = {};

const PATTERNS: [RegExp, string, ((m: RegExpMatchArray, c: Cat) => Record<string, string>)?][] = [
  [/^(\d+)m ago$/, "m_ago"], [/^(\d+)h ago$/, "h_ago"], [/^bid \$([\d,]+)$/, "bid"],
  [/^(.+) hit the shot clock$/, "hit"], [/^(.+) first name grace ends \(est\.\)$/, "firstgrace"], [/^(.+) grace ends \(est\.\)$/, "grace_est"],
  [/^Bid on (.+)$/, "bidon"], [/^(≤\d+|\d+\+) DAYS · (\d+)d left$/, "days_left", (m) => ({ t: m[1], n: m[2] })],
  [/^(≤\d+|\d+\+) DAYS$/, "days", (m) => ({ t: m[1] })],
  [/^(GRACE|REDEMPTION) · (\d+)d past$/, "past", (m, c) => ({ w: c.p[m[1]] ?? m[1], n: m[2] })],
  [/^(GRACE|REDEMPTION)$/, "__word"],
  [/^(\d+) listed$/, "listed"], [/^(\d+) simulated sales$/, "sales"], [/^(\d+) bundles$/, "bundles"], [/^(\d+) are demo data$/, "demo"],
  [/^Quick-sale lot "(.+)" is live$/, "qlot"], [/^Follow @shotclockfun on (.+)$/, "followon"],
  [/^(\d+)-max Sit & Go$/, "nmax", (m) => ({ n: m[1] })], [/^\$([\d,]+) · coming soon$/, "soon"],
  [/^(\d+) seats? left$/, "seats"], [/^([\d,]+) pts$/, "pts"],
  [/^Ends (.+ ET)$/, "ends"], [/^Entries close (.+)$/, "eclose"],
  [/^© (\d{4}) SHOTCLOCK · a DOU DIGITAL project\. All rights reserved\.$/, "copy"],
  [/^(Micro|Low|Mid|High|Whale)( · \$[\d,]+| \(\$[\d,]+\))$/, "__tier"],
];

function tr(src: string, c: Cat): string | null {
  const t = src.trim();
  if (!t) return null;
  const hit = c.s[t];
  if (hit !== undefined) return src.replace(t, hit);
  for (const [re, key, fn] of PATTERNS) {
    const m = t.match(re);
    if (!m) continue;
    if (key === "__word") return c.p[m[1]] ? src.replace(t, c.p[m[1]]) : null;
    if (key === "__tier") return c.s[m[1]] ? src.replace(t, c.s[m[1]] + m[2]) : null;
    const tpl = c.p[key];
    if (!tpl) return null;
    const vars = fn ? fn(m, c) : { n: m[1], x: m[1] };
    let out = tpl;
    for (const [k, v] of Object.entries(vars)) out = out.replace(`{${k}}`, v);
    return src.replace(t, out);
  }
  return null;
}

const ORIG = new WeakMap<Node, { en: string; out: string }>();
const ATTRS = ["placeholder", "aria-label", "title"];
const SKIP = "script,style,code,pre,textarea,[data-no-t]";

function apply(root: Node, c: Cat | null) {
  const doText = (n: Text) => {
    const pe = n.parentElement;
    if (!pe || pe.closest(SKIP)) return;
    const rec = ORIG.get(n);
    const cur = n.nodeValue ?? "";
    const en = rec && rec.out === cur ? rec.en : cur;
    const out = c ? tr(en, c) ?? en : en;
    ORIG.set(n, { en, out });
    if (out !== cur) n.nodeValue = out;
  };
  const doEl = (el: Element) => {
    if (el.closest(SKIP)) return;
    for (const a of ATTRS) {
      const v = el.getAttribute(a);
      if (v == null) continue;
      const k = `data-t-${a}`;
      const prevOut = el.getAttribute(`${k}-out`);
      const en = prevOut === v ? el.getAttribute(k) ?? v : v;
      const out = c ? tr(en, c) ?? en : en;
      el.setAttribute(k, en); el.setAttribute(`${k}-out`, out);
      if (out !== v) el.setAttribute(a, out);
    }
  };
  if (root.nodeType === 3) return doText(root as Text);
  if (root.nodeType !== 1) return;
  doEl(root as Element);
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  while (w.nextNode()) { const n = w.currentNode; if (n.nodeType === 3) doText(n as Text); else doEl(n as Element); }
}

export function AutoTranslate({ lang }: { lang: string }) {
  useEffect(() => {
    let c: Cat | null = null;
    let stop = false;
    let mo: MutationObserver | null = null;
    const run = () => {
      apply(document.body, c);
      mo?.disconnect();
      mo = new MutationObserver((ms) => {
        mo!.disconnect();
        for (const m of ms) {
          if (m.type === "characterData") apply(m.target, c);
          else if (m.type === "attributes") apply(m.target, c);
          else m.addedNodes.forEach((n) => apply(n, c));
        }
        mo!.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
      });
      mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    };
    if (lang === "en") run();
    else if (cache[lang]) { c = cache[lang]; run(); }
    else fetch(`/i18n/${lang}.json`).then((r) => r.json()).then((j: Cat) => { if (stop) return; cache[lang] = j; c = j; run(); }).catch(() => {});
    return () => { stop = true; mo?.disconnect(); };
  }, [lang]);
  return null;
}
