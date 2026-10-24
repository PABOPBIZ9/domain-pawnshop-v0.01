import { REGISTRARS, type Registrar } from "./types";
import { isValidDomain, normalizeDomain } from "./valuation";

export interface ParsedRow {
  domain: string;
  registrar: Registrar;
  expiry: string;
  costBasis?: number;
  error?: string;
}

export function normalizeRegistrar(raw: string | undefined): Registrar {
  const r = (raw || "").trim().toLowerCase().replace(/[^a-z]/g, "");
  if (!r) return "Other";
  if (r.includes("godaddy")) return "GoDaddy";
  if (r.includes("namecheap")) return "Namecheap";
  if (r.includes("dynadot")) return "Dynadot";
  if (r.includes("unstoppable") || r === "ud") return "Unstoppable";
  return REGISTRARS.find((x) => x.toLowerCase() === r) ?? "Other";
}

export function normalizeDate(raw: string | undefined): string {
  const s = (raw || "").trim();
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
  if (m) {
    const y = m[3].length === 2 ? "20" + m[3] : m[3];
    return `${y}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  }
  const t = Date.parse(s);
  if (!Number.isNaN(t)) return new Date(t).toISOString().slice(0, 10);
  return "";
}

function splitLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (q && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else q = !q;
    } else if ((c === "," || c === "\t" || c === ";") && !q) {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

/**
 * Accepts CSV/TSV with optional header (domain, registrar, expiry, cost)
 * or a plain list of domains (one per line, or separated by spaces/commas).
 */
export function parsePortfolio(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return [];

  let idx = { domain: 0, registrar: 1, expiry: 2, cost: 3 };
  let start = 0;
  const head = splitLine(lines[0]).map((h) => h.toLowerCase());
  if (head.some((h) => /domain|name|registrar|expir|cost/.test(h)) && !isValidDomain(normalizeDomain(head[0]))) {
    const find = (re: RegExp, d: number) => {
      const i = head.findIndex((h) => re.test(h));
      return i === -1 ? d : i;
    };
    idx = {
      domain: find(/domain|name/, 0),
      registrar: find(/registrar|platform|provider/, -1),
      expiry: find(/expir|renew|date/, -1),
      cost: find(/cost|basis|paid|price/, -1),
    };
    start = 1;
  }

  const isPlainList = start === 0 && lines.every((l) => splitLine(l).length === 1 || !/\d{4}|godaddy|namecheap|dynadot|unstoppable/i.test(l));

  const rows: ParsedRow[] = [];
  const seen = new Set<string>();
  const push = (row: ParsedRow) => {
    if (seen.has(row.domain)) return;
    seen.add(row.domain);
    rows.push(row);
  };

  for (const line of lines.slice(start)) {
    if (isPlainList) {
      for (const tok of line.split(/[\s,;]+/).filter(Boolean)) {
        const domain = normalizeDomain(tok);
        push({ domain, registrar: "Other", expiry: "", error: isValidDomain(domain) ? undefined : "Invalid domain" });
      }
      continue;
    }
    const cells = splitLine(line);
    const domain = normalizeDomain(cells[idx.domain] || "");
    const costRaw = idx.cost >= 0 ? (cells[idx.cost] || "").replace(/[$,]/g, "") : "";
    const cost = costRaw ? Number(costRaw) : undefined;
    push({
      domain,
      registrar: normalizeRegistrar(idx.registrar >= 0 ? cells[idx.registrar] : ""),
      expiry: normalizeDate(idx.expiry >= 0 ? cells[idx.expiry] : ""),
      costBasis: cost !== undefined && !Number.isNaN(cost) ? cost : undefined,
      error: isValidDomain(domain) ? undefined : "Invalid domain",
    });
  }
  return rows;
}

export const SAMPLE_CSV = `domain,registrar,expiry,cost_basis
pawnloop.com,GoDaddy,2026-11-02,12
cryptoyard.io,Namecheap,2027-03-14,35
vibecoder.ai,Dynadot,2026-11-20,80
degenvault.crypto,Unstoppable,,20
kushchef.com,GoDaddy,2026-10-29,10
quick-loan-hub.net,Namecheap,2027-08-01,9
zorvex.com,Dynadot,2027-01-15,15
moonwallet.x,Unstoppable,,40
healthbot.co,GoDaddy,2026-12-05,25
777.xyz,Namecheap,2027-05-09,8`;
