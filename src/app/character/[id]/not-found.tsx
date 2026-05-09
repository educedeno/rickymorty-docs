import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-6 text-center">
      <p className="text-3xl">❗</p>
      <h1 className="text-xl font-semibold text-[var(--danger)]">
        Personaje no encontrado. Intenta con otro ID.
      </h1>
      <p className="text-sm text-[var(--muted)]">
        La API respondió con un 404. Verifica que el ID exista (1–826
        aproximadamente).
      </p>
      <Link
        href="/"
        className="inline-block rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--background)] transition hover:brightness-110"
      >
        Volver al listado
      </Link>
    </div>
  );
}
