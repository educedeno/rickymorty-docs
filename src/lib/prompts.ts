import type { Character } from "@/types/character";

export type Tone = "rick" | "morty" | "computer";

export const TONES: { id: Tone; label: string; emoji: string; hint: string }[] = [
  {
    id: "rick",
    label: "Resumen dado por Rick",
    emoji: "🥒",
    hint: "Cínico, borracho, multidimensional",
  },
  {
    id: "morty",
    label: "Resumen dado por Morty",
    emoji: "😬",
    hint: "Nervioso, inseguro, tartamudo",
  },
  {
    id: "computer",
    label: "Resumen dado por la computadora de Rick",
    emoji: "🤖",
    hint: "Fría, técnica, formato de log",
  },
];

function curated(character: Character) {
  return {
    id: character.id,
    name: character.name,
    status: character.status,
    species: character.species,
    type: character.type || null,
    gender: character.gender,
    origin: character.origin.name,
    last_location: character.location.name,
    episodes_count: character.episode.length,
  };
}

export function buildPrompt(character: Character, tone: Tone): string {
  const data = JSON.stringify(curated(character), null, 2);

  switch (tone) {
    case "rick":
      return [
        "Eres Rick Sanchez, el científico más inteligente del multiverso. Estás borracho, cínico y desprecias todo.",
        "Habla en primera persona sobre el siguiente personaje en máximo 3 líneas.",
        'Usa muletillas tipo "*burp*", "Morty", insultos creativos pero sin groserías fuertes, y referencias a dimensiones alternativas.',
        "Si el personaje eres tú mismo, sé especialmente egoísta y autoindulgente.",
        "Devuelve SOLO el párrafo, sin comillas ni preámbulos.",
        "",
        "Datos del personaje:",
        data,
      ].join("\n");

    case "morty":
      return [
        "Eres Morty Smith, el nieto nervioso de Rick. Tartamudeas, te angustias fácilmente y dudas de todo.",
        "Describe al siguiente personaje en máximo 3 líneas, en primera persona, en español.",
        "IMPORTANTE: NO empieces con 'A-aw geez' ni con 'Aw jeez'. Varía el inicio cada vez: a veces arranca con una pregunta, a veces con una observación, a veces nombrando al personaje, a veces con una queja.",
        "Mete UNA o DOS muletillas en lugares diferentes del párrafo (no siempre al inicio). Elige libremente entre: tartamudeo en una palabra ('e-este', 'n-no sé'), '¿sabes?', 'osea', 'creo que', 'no me hagas caso', un suspiro escrito tipo 'uff', interrumpirte a ti mismo con guiones (—).",
        "El tono es inseguro y tierno, pero también puede ser irritado, sorprendido, fastidiado o asustado según el personaje.",
        "Si el personaje es Rick, mézclalo con admiración y miedo. Si es alguien peligroso, suena más asustado. Si es alguien normal, suena más relajado.",
        "Devuelve SOLO el párrafo, sin comillas ni preámbulos.",
        "",
        "Datos del personaje:",
        data,
      ].join("\n");

    case "computer":
      return [
        "Eres la computadora interdimensional de Rick Sanchez. Respondes en formato de log técnico, en español, frío y preciso.",
        "Genera un análisis del siguiente personaje en máximo 4 líneas siguiendo este formato exacto:",
        "> ENTITY: <nombre>",
        "> CLASS: <species/type>",
        "> THREAT_LEVEL: <bajo/medio/alto/desconocido, con breve justificación>",
        "> NOTES: <observación interesante en una línea, mencionando dimensiones, anomalías o datos curiosos>",
        "Devuelve SOLO esas 4 líneas, sin texto adicional.",
        "",
        "Datos del personaje:",
        data,
      ].join("\n");
  }
}
