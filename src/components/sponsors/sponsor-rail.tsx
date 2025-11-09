import Image from "next/image";
import Link from "next/link";
import type { Sponsor } from "@/lib/types/cms";

type Props = {
  sponsors: Sponsor[];
};

export function SponsorRail({ sponsors }: Props) {
  if (!sponsors.length) return null;

  return (
    <section className="mx-auto mt-12 max-w-5xl">
      <div className="flex items-center gap-4">
        <span className="text-xs uppercase text-slate-500">Sponsored</span>
        <div className="flex flex-1 gap-4 overflow-auto">
          {sponsors.map((sponsor) => (
            <Link
              key={sponsor.id}
              href={sponsor.destinationUrl}
              target="_blank"
              rel="noreferrer"
              className="flex min-w-[220px] items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="relative h-12 w-12 overflow-hidden rounded-xl">
                {sponsor.asset && (
                  <Image src={sponsor.asset.url} alt={sponsor.asset.alt} fill className="object-cover" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{sponsor.title}</p>
                <p className="text-xs text-slate-500">{sponsor.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
