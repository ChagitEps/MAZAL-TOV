"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatAgorot } from "@/lib/utils";

/** Plain card data passed from the server catalog page (serializable). */
export interface CatalogCard {
  slug: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  priceAgorot: number;
  /** First color set of the template — for the gradient placeholder. */
  bg: string;
  accent: string;
}

export interface CatalogGroup {
  slug: string;
  title: string;
  cards: CatalogCard[];
}

/** The catalog with live search: filters titles + descriptions as you type. */
export function CatalogBrowser({ groups }: { groups: CatalogGroup[] }) {
  const [query, setQuery] = useState("");

  const q = query.trim();
  const filtered = groups
    .map((g) => ({
      ...g,
      cards: q
        ? g.cards.filter(
            (c) => c.title.includes(q) || (c.description ?? "").includes(q),
          )
        : g.cards,
    }))
    .filter((g) => g.cards.length > 0);

  return (
    <>
      <div className="mx-auto mt-6 max-w-md">
        <label htmlFor="catalog-search" className="sr-only">
          חיפוש תבנית
        </label>
        <input
          id="catalog-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 חיפוש: חתונה, בר מצווה, קורות חיים..."
          className="w-full rounded-full border border-gray-300 bg-white ps-5 pe-5 py-2.5 text-start focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed p-10 text-center text-gray-600">
          לא נמצאו תבניות עבור „{q}". נסו מילה אחרת.
        </div>
      ) : (
        filtered.map((group) => (
          <section key={group.slug} className="mt-10">
            <h2 className="text-xl font-bold">{group.title}</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.cards.map((c) => (
                <Link
                  key={c.slug}
                  href={`/create/${c.slug}`}
                  className="group overflow-hidden rounded-2xl border text-start transition hover:border-brand hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    {c.thumbnail ? (
                      <Image
                        src={c.thumbnail}
                        alt={c.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${c.bg} 0%, ${c.accent}33 60%, ${c.accent}66 100%)`,
                        }}
                      >
                        <span
                          className="px-4 text-center text-xl font-bold"
                          style={{ color: c.accent }}
                        >
                          {c.title}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold group-hover:text-brand">{c.title}</h3>
                    {c.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">{c.description}</p>
                    )}
                    <div className="mt-3 text-sm font-medium text-brand">
                      {formatAgorot(c.priceAgorot)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}
