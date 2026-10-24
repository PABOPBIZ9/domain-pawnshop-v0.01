export function Footer() {
  return (
    <footer className="border-t border-line mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-xs text-mute flex flex-col sm:flex-row gap-2 justify-between">
        <p>
          <span className="font-bold text-white">PAWN.DOMAINS</span> v0.01 — prototype. Valuations are indicative heuristics, not appraisals. No real
          payments, escrow, or transfers happen here.
        </p>
        <p>Data is stored only in your browser (localStorage). Seeded listings are demo data.</p>
      </div>
    </footer>
  );
}
