import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-shell py-20">
      <div className="card mx-auto max-w-xl p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">404</p>
        <h1 className="section-title mt-2">Page not found</h1>
        <p className="mt-3 text-muted">
          The page or item you are looking for is not available yet.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-white hover:bg-[#9a7734]"
          >
            Back to home
          </Link>
          <Link
            href="/catalog"
            className="rounded-full border border-line bg-white px-6 py-2.5 text-sm font-medium text-ink hover:border-gold hover:text-gold"
          >
            View catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
