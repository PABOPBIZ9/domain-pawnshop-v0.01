import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center space-y-4">
      <h1 className="text-4xl font-black">404 — name not found</h1>
      <p className="text-mute">The clock ran out on this page. Somebody probably backordered it.</p>
      <Link href="/" className="btn btn-acid inline-block">
        Back home
      </Link>
    </div>
  );
}
