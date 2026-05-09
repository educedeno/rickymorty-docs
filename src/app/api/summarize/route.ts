import { buildPrompt, type Tone } from "@/lib/prompts";
import type { Character } from "@/types/character";

const VALID_TONES: Tone[] = ["rick", "morty", "computer"];
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Falta GEMINI_API_KEY en el servidor." },
      { status: 500 }
    );
  }

  let body: { character?: Character; tone?: Tone };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { character, tone } = body;
  if (!character || typeof character !== "object" || !character.name) {
    return Response.json(
      { error: "Falta el objeto 'character' o no es válido." },
      { status: 400 }
    );
  }
  if (!tone || !VALID_TONES.includes(tone)) {
    return Response.json(
      { error: `Tono inválido. Usa uno de: ${VALID_TONES.join(", ")}.` },
      { status: 400 }
    );
  }

  const prompt = buildPrompt(character, tone);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const isGemini25 = MODEL.startsWith("gemini-2.5");
  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: tone === "computer" ? 0.5 : 0.95,
      topP: 0.95,
      maxOutputTokens: 1024,
      ...(isGemini25 ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
    },
  };

  let geminiRes: Response;
  try {
    geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    return Response.json(
      {
        error: "No se pudo contactar a Gemini.",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 }
    );
  }

  if (!geminiRes.ok) {
    const detail = await geminiRes.text().catch(() => "");
    return Response.json(
      { error: `Gemini respondió con ${geminiRes.status}.`, detail },
      { status: 502 }
    );
  }

  const data = (await geminiRes.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text =
    data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("").trim() ?? "";

  if (!text) {
    return Response.json(
      { error: "Gemini no devolvió contenido." },
      { status: 502 }
    );
  }

  return Response.json({ text, tone, model: MODEL });
}
