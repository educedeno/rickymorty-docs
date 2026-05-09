"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import CharacterCard from "@/components/CharacterCard";
import { CardSkeleton } from "@/components/Skeleton";
import { API_BASE } from "@/lib/rickAndMorty";
import type { Character, CharacterListResponse } from "@/types/character";

const MAX_ITEMS = 52;

type Props = {
  initialCharacters: Character[];
  initialNextUrl: string | null;
  totalCount: number;
};

export default function CharacterGrid({
  initialCharacters,
  initialNextUrl,
  totalCount,
}: Props) {
  const [characters, setCharacters] = useState<Character[]>(initialCharacters);
  const [nextUrl, setNextUrl] = useState<string | null>(
    initialCharacters.length >= MAX_ITEMS ? null : initialNextUrl
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (!nextUrl || loading) return;
    setLoading(true);
    setError(null);
    try {
      const url = nextUrl.startsWith("http")
        ? nextUrl
        : `${API_BASE}${nextUrl}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as CharacterListResponse;
      setCharacters((prev) => {
        const merged = [...prev, ...data.results];
        return merged.slice(0, MAX_ITEMS);
      });
      const reachedCap =
        characters.length + data.results.length >= MAX_ITEMS;
      setNextUrl(reachedCap ? null : data.info.next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [nextUrl, loading, characters.length]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !nextUrl) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, nextUrl]);

  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-xl font-semibold">Personajes</h2>
        <span className="text-xs text-[var(--muted)]">
          Mostrando {characters.length} de {totalCount}
        </span>
      </div>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {characters.map((character) => (
          <li key={character.id}>
            <CharacterCard character={character} />
          </li>
        ))}
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <li key={`sk-${i}`}>
              <CardSkeleton />
            </li>
          ))}
      </ul>

      {error && (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-md border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
          <span>Error al cargar más: {error}</span>
          <button
            type="button"
            onClick={loadMore}
            className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-[var(--background)] transition hover:brightness-110"
          >
            Reintentar
          </button>
        </div>
      )}

      <div ref={sentinelRef} aria-hidden className="h-1" />

      {!nextUrl && !loading && (
        <p className="mt-8 text-center text-xs text-[var(--muted)]">
          ✨ Mostrando los primeros {characters.length} personajes de{" "}
          {totalCount}. Usa la búsqueda por ID para ver el resto.
        </p>
      )}
    </section>
  );
}
