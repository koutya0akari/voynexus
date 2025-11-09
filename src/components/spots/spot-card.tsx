import Link from "next/link";
import Image from "next/image";
import type { Spot } from "@/lib/types/cms";

type Props = {
  locale: string;
  spot: Spot;
};

export function SpotCard({ locale, spot }: Props) {
  const tagList = spot.tags.slice(0, 3);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1">
      <div className="relative h-44 w-full overflow-hidden rounded-t-2xl">
        {spot.images?.[0] ? (
          <Image
            src={spot.images[0].url}
            alt={spot.images[0].alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="h-full w-full bg-slate-100" />
        )}
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{spot.area}</span>
          {spot.lastVerifiedAt && <span>✓ {new Date(spot.lastVerifiedAt).toLocaleDateString()}</span>}
        </div>
        <h3 className="text-lg font-semibold text-slate-900">{spot.name}</h3>
        <p className="text-sm text-slate-600">{spot.summary}</p>
        <div className="flex flex-wrap gap-2 text-xs">
          {tagList.map((tag) => (
            <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
              {tag}
            </span>
          ))}
        </div>
        <Link
          href={`/${locale}/spots/${spot.slug}`}
          className="inline-flex text-sm font-semibold text-brand hover:underline"
        >
          詳細を見る →
        </Link>
      </div>
    </article>
  );
}
