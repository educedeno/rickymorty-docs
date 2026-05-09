"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-6 text-center">
      <h1 className="text-xl font-semibold text-[var(--danger)]">
        Algo salió mal
      </h1>
      <p className="text-sm text-[var(--muted)]">
        {error.message || "Ocurrió un error inesperado al cargar los datos."}
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--background)] transition hover:brightness-110"
      >
        Reintentar
      </button>
    </div>
  );
}
