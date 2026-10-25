import Link from "next/link";

export const metadata = { title: "404: the clock ran out | SHOTCLOCK" };

export default function NotFound() {
  return (
    <div className="py-16 sm:py-24 flex justify-center">
      <div className="card max-w-xl w-full p-8 sm:p-10 text-center space-y-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.svg" alt="" width={88} height={88} className="mx-auto drop-shadow-[0_0_24px_rgba(198,255,61,.35)]" />
        <div className="lx-ruby inline-flex rounded-full px-3 py-1 text-xs font-bold tracking-wide">⏱ 00:00 · SHOT CLOCK EXPIRED</div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
          404 <span style={{ color: "var(--lx-sig)" }}>name not found</span>
        </h1>
        <p className="text-mute">The clock ran out on this page. Somebody probably backordered it. Plenty of live names are still on the clock.</p>
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Link href="/shotclock" className="btn btn-acid">⏱ Live Shot Clock</Link>
          <Link href="/market" className="btn btn-ghost">Browse the market</Link>
          <Link href="/" className="btn btn-ghost">Home</Link>
        </div>
      </div>
    </div>
  );
}
