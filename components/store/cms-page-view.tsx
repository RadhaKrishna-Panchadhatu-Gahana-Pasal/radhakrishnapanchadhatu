import Link from 'next/link';
import { getStore } from '@/lib/store/repository';

export function CmsPageView({ slug }: { slug: string }) {
  const store = getStore();
  const page = store.pages.find((p) => p.slug === slug);

  if (!page) {
    return (
      <div className="container-shell py-14">
        <div className="card mx-auto max-w-3xl p-8">
          <h1 className="section-title">Store Information</h1>
          <p className="mt-4 text-sm text-muted">
            This content page can be customized from the Admin Pages editor.
          </p>
        </div>
      </div>
    );
  }

  const paragraphs = page.content.split('\n\n').filter(Boolean);

  return (
    <div className="container-shell py-14">
      <article className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
          {store.settings.storeName}
        </p>
        <h1 className="section-title mt-2">{page.title}</h1>
        <p className="mt-3 text-base text-muted">{page.summary}</p>

        <div className="card mt-8 space-y-5 p-8 text-sm leading-relaxed text-ink/90 sm:text-base">
          {paragraphs.map((para, idx) => (
            <p key={idx} className="whitespace-pre-line">
              {para}
            </p>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3 text-xs text-muted">
          <Link href="/catalog" className="underline hover:text-ink">
            Browse Catalog
          </Link>
          <span>&middot;</span>
          <Link href="/contact" className="underline hover:text-ink">
            Contact Butwal Store ({store.settings.phone})
          </Link>
        </div>
      </article>
    </div>
  );
}
