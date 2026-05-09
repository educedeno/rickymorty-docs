import CharacterGrid from "@/components/CharacterGrid";
import TryItOut from "@/components/TryItOut";
import { getCharacters } from "@/lib/rickAndMorty";

export default async function HomePage() {
  const { results, info } = await getCharacters(1);

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Personajes de Rick y Morty
        </h1>
        <p className="max-w-2xl text-[var(--muted)]">
          Elige un personaje para ver más información o pedir una descripción
          hecha por Rick, por Morty o por la computadora de Rick.
        </p>
      </section>

      <TryItOut />

      <CharacterGrid
        initialCharacters={results}
        initialNextUrl={info.next}
        totalCount={info.count}
      />
    </div>
  );
}
