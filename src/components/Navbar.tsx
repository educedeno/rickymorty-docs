"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [id, setId] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = id.trim();
    if (!trimmed) return;
    router.push(`/character/${trimmed}`);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-[var(--accent)]/15 text-sm font-bold text-[var(--accent)]">
            R&amp;M
          </span>
          <span className="hidden sm:inline">Rick &amp; Morty</span>
        </Link>

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <label htmlFor="search-id" className="sr-only">
            Buscar por ID
          </label>
          <input
            id="search-id"
            type="number"
            min={1}
            placeholder="Buscar por ID…"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-32 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm placeholder:text-[var(--muted)] focus:border-[var(--accent-2)] focus:outline-none sm:w-48"
            suppressHydrationWarning
          />
          <button
            type="submit"
            className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--background)] transition hover:brightness-110"
            suppressHydrationWarning
          >
            Ir
          </button>
        </form>
      </div>
    </header>
  );
}
