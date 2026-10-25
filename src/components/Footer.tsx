export function Footer() {
  return (
    <footer className="border-t border-line mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-xs text-mute flex flex-col sm:flex-row gap-2 justify-between">
        <p>
          <span className="font-bold text-white">SHOTCLOCK</span> v0.01 prototype. Prices are indicative heuristics, not appraisals. Offers and bids
          are simulated, and no real payments, escrow or transfers happen here.
        </p>
        <p>Your activity is stored only in your browser. Anything marked DEMO DATA is simulated.</p>
      </div>
    </footer>
  );
}
