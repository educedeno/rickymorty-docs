"use client";

import { useEffect, useRef, useState } from "react";
import type { Character } from "@/types/character";
import { TONES, type Tone } from "@/lib/prompts";

type State =
  | { kind: "idle" }
  | { kind: "loading"; tone: Tone }
  | { kind: "success"; tone: Tone; text: string }
  | { kind: "error"; message: string };

export default function AISummary({ character }: { character: Character }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>({ kind: "idle" });
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  async function generate(tone: Tone) {
    setOpen(false);
    setState({ kind: "loading", tone });
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ character, tone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({
          kind: "error",
          message: data?.error || `Error ${res.status}`,
        });
        return;
      }
      setState({ kind: "success", tone, text: data.text });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Error desconocido",
      });
    }
  }

  const activeTone =
    state.kind === "success" || state.kind === "loading"
      ? TONES.find((t) => t.id === state.tone)
      : null;

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <h2 className="text-sm font-semibold tracking-wide text-[var(--muted)]">
          ✨ RESUMEN CON IA
        </h2>
        <span className="rounded bg-[var(--surface-2)] px-2 py-0.5 font-mono text-xs text-[var(--accent)]">
          Powered by Gemini
        </span>
      </header>

      <div className="p-4">
        <div ref={wrapperRef} className="relative inline-block">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            disabled={state.kind === "loading"}
            aria-haspopup="menu"
            aria-expanded={open}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--background)] transition hover:brightness-110 disabled:opacity-50"
            suppressHydrationWarning
          >
            <span>Generar resumen con IA</span>
            <span
              aria-hidden
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            >
              ▾
            </span>
          </button>

          {open && (
            <div
              role="menu"
              className="absolute left-0 top-full z-30 mt-2 w-72 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-2)] shadow-xl"
            >
              {TONES.map((t) => (
                <button
                  key={t.id}
                  role="menuitem"
                  type="button"
                  onClick={() => generate(t.id)}
                  className="flex w-full items-start gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-[var(--accent)]/10"
                >
                  <span className="text-lg leading-none">{t.emoji}</span>
                  <span className="flex-1">
                    <span className="block font-medium">{t.label}</span>
                    <span className="block text-xs text-[var(--muted)]">
                      {t.hint}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4">
          {state.kind === "idle" && (
            <p className="text-sm text-[var(--muted)]">
              Elige una voz y deja que la IA describa a {character.name}.
            </p>
          )}

          {state.kind === "loading" && activeTone && (
            <div className="flex items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--muted)]">
              <span className="text-lg">{activeTone.emoji}</span>
              <span>
                Generando {activeTone.label.toLowerCase()}
                <span className="inline-block animate-pulse">…</span>
              </span>
            </div>
          )}

          {state.kind === "error" && (
            <div className="rounded-md border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
              <strong>Error:</strong> {state.message}
            </div>
          )}

          {state.kind === "success" && activeTone && (
            <figure className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
              <figcaption className="mb-2 flex items-center gap-2 text-xs text-[var(--muted)]">
                <span className="text-base">{activeTone.emoji}</span>
                <span className="font-medium">{activeTone.label}</span>
                <span className="ml-auto rounded bg-[var(--surface-2)] px-1.5 py-0.5 font-mono text-[10px]">
                  AI generated
                </span>
              </figcaption>
              <blockquote
                className={
                  state.tone === "computer"
                    ? "whitespace-pre-wrap font-mono text-xs leading-relaxed text-[var(--accent)]"
                    : "whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]"
                }
              >
                {state.text}
              </blockquote>
              <button
                type="button"
                onClick={() => generate(state.tone)}
                className="mt-3 text-xs text-[var(--muted)] underline-offset-2 hover:text-[var(--accent-2)] hover:underline"
              >
                Regenerar
              </button>
            </figure>
          )}
        </div>
      </div>
    </section>
  );
}
