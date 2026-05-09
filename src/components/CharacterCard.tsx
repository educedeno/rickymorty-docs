import Image from "next/image";
import Link from "next/link";
import type { Character } from "@/types/character";

const statusColor: Record<string, string> = {
  Alive: "bg-emerald-400",
  Dead: "bg-rose-400",
  unknown: "bg-slate-400",
};

export default function CharacterCard({ character }: { character: Character }) {
  return (
    <Link
      href={`/character/${character.id}`}
      className="group flex overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] transition"
    >
      <span
        aria-hidden
        className="w-1 shrink-0 bg-[var(--border)] transition-colors group-hover:bg-[var(--accent-2)]"
      />
      <div className="min-w-0 flex-1">
        <div className="relative aspect-square w-full overflow-hidden">
          <Image
            src={character.image}
            alt={character.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition group-hover:scale-105"
          />
        </div>
        <div className="p-3">
          <h3 className="truncate font-semibold">{character.name}</h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-[var(--muted)]">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                statusColor[character.status] ?? statusColor.unknown
              }`}
              aria-hidden
            />
            <span>
              {character.status} · {character.species}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
