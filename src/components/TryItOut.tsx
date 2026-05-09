"use client";

import Image from "next/image";
import { useState } from "react";
import type { Character } from "@/types/character";
import { API_BASE } from "@/lib/rickAndMorty";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; data: Character; status: number }
  | { kind: "notFound" }
  | { kind: "error"; message: string };

export default function TryItOut() {
  const [id, setId] = useState("1");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [open, setOpen] = useState(false);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = id.trim();
    if (!trimmed) return;
    setState({ kind: "loading" });
    try {
      const res = await fetch(`${API_BASE}/character/${trimmed}`);
      if (res.status === 404) {
        setState({ kind: "notFound" });
        return;
      }
      if (!res.ok) {
        setState({ kind: "error", message: `HTTP ${res.status}` });
        return;
      }
      const data = (await res.json()) as Character;
      setState({ kind: "success", data, status: res.status });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Error desconocido",
      });
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="try-it-out-body"
        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[var(--surface-2)] ${
          open ? "border-b border-[var(--border)]" : ""
        }`}
        suppressHydrationWarning
      >
        <span
          aria-hidden
          className={`text-[var(--muted)] transition-transform ${
            open ? "rotate-90" : ""
          }`}
        >
          ▶
        </span>
        <h2 className="text-sm font-semibold tracking-wide text-[var(--muted)]">
          TRY IT OUT
        </h2>
        <span className="ml-auto rounded bg-[var(--surface-2)] px-2 py-0.5 font-mono text-xs text-[var(--accent)]">
          GET /character/{`{id}`}
        </span>
      </button>

      {open && (
      <div id="try-it-out-body">
      <form onSubmit={run} className="flex flex-wrap items-end gap-3 p-4">
        <div className="flex flex-col">
          <label htmlFor="try-id" className="text-xs text-[var(--muted)]">
            id (path param)
          </label>
          <input
            id="try-id"
            type="number"
            min={1}
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="mt-1 w-32 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 font-mono text-sm focus:border-[var(--accent-2)] focus:outline-none"
            suppressHydrationWarning
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-[var(--accent-2)] px-4 py-2 text-sm font-medium text-[var(--background)] transition hover:brightness-110 disabled:opacity-50"
          disabled={state.kind === "loading"}
          suppressHydrationWarning
        >
          {state.kind === "loading" ? "Consultando…" : "Consultar personaje"}
        </button>
        <code className="ml-auto rounded bg-[var(--surface-2)] px-2 py-1 font-mono text-xs text-[var(--muted)]">
          {API_BASE}/character/{id || "{id}"}
        </code>
      </form>

      <div className="border-t border-[var(--border)] p-4">
        {state.kind === "idle" && (
          <p className="text-sm text-[var(--muted)]">
            Ingresa un ID y presiona &quot;Consultar personaje&quot; para ver la respuesta.
          </p>
        )}
        {state.kind === "loading" && (
          <p className="text-sm text-[var(--muted)]">Cargando…</p>
        )}
        {state.kind === "notFound" && (
          <p className="rounded-md border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
            ❗ Personaje no encontrado. Intenta con otro ID.
          </p>
        )}
        {state.kind === "error" && (
          <p className="rounded-md border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
            Error: {state.message}
          </p>
        )}
        {state.kind === "success" && (
          <div className="grid gap-4 md:grid-cols-[200px_1fr]">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-[var(--border)]">
              <Image
                src={state.data.image}
                alt={state.data.name}
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{state.data.name}</h3>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <dt className="text-[var(--muted)]">Status</dt>
                <dd>{state.data.status}</dd>
                <dt className="text-[var(--muted)]">Species</dt>
                <dd>{state.data.species}</dd>
                <dt className="text-[var(--muted)]">Gender</dt>
                <dd>{state.data.gender}</dd>
              </dl>

              <details className="mt-4">
                <summary className="cursor-pointer text-xs text-[var(--muted)] hover:text-[var(--foreground)]">
                  Ver respuesta JSON cruda (200 OK)
                </summary>
                <pre className="mt-2 max-h-80 overflow-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-xs leading-relaxed">
                  {JSON.stringify(state.data, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
      </div>
      )}
    </section>
  );
}
