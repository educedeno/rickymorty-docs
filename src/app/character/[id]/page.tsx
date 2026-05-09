import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CharacterNotFoundError, getCharacter } from "@/lib/rickAndMorty";
import AISummary from "@/components/AISummary";

const statusColor: Record<string, string> = {
  Alive: "bg-emerald-400",
  Dead: "bg-rose-400",
  unknown: "bg-slate-400",
};

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params;
  try {
    const character = await getCharacter(id);
    return {
      title: `${character.name} · Rick & Morty Docs`,
      description: `${character.name} — ${character.species} (${character.status})`,
      openGraph: { images: [character.image] },
    };
  } catch {
    return { title: "Personaje no encontrado · Rick & Morty Docs" };
  }
}

export default async function CharacterPage(props: Props) {
  const { id } = await props.params;

  let character;
  try {
    character = await getCharacter(id);
  } catch (err) {
    if (err instanceof CharacterNotFoundError) notFound();
    throw err;
  }

  return (
    <div className="space-y-8">
      <nav className="text-sm text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--foreground)]">
          ← Volver al listado
        </Link>
      </nav>

      <article className="grid gap-6 md:grid-cols-[320px_1fr]">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-[var(--border)]">
          <Image
            src={character.image}
            alt={character.name}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            priority
            className="object-cover"
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <span className="font-mono text-xs text-[var(--muted)]">
              GET /character/{character.id}
            </span>
            <h1 className="text-3xl font-bold sm:text-4xl">{character.name}</h1>
            <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  statusColor[character.status] ?? statusColor.unknown
                }`}
                aria-hidden
              />
              <span>
                {character.status} · {character.species}
                {character.type ? ` · ${character.type}` : ""}
              </span>
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-[var(--muted)]">Gender</dt>
              <dd className="font-medium">{character.gender}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--muted)]">Origin</dt>
              <dd className="font-medium">{character.origin.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--muted)]">Last location</dt>
              <dd className="font-medium">{character.location.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--muted)]">Episodes</dt>
              <dd className="font-medium">{character.episode.length}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-[var(--muted)]">Created</dt>
              <dd className="font-medium">
                {new Date(character.created).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </article>

      <AISummary character={character} />

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <h2 className="text-sm font-semibold tracking-wide text-[var(--muted)]">
            RAW RESPONSE
          </h2>
          <span className="rounded bg-[var(--surface-2)] px-2 py-0.5 font-mono text-xs text-[var(--accent)]">
            200 OK · application/json
          </span>
        </header>
        <pre className="max-h-[480px] overflow-auto p-4 text-xs leading-relaxed">
          {JSON.stringify(character, null, 2)}
        </pre>
      </section>
    </div>
  );
}
