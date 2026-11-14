/** Data de hoje no fuso do navegador, no formato do banco (yyyy-MM-dd). */
export function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/**
 * Compara uma data "yyyy-MM-dd" com hoje sem passar por `new Date(iso)`, que lê a data como
 * meia-noite UTC e, no Brasil, faz o jogo de hoje parecer de ontem.
 */
export function relativeDay(iso?: string | null): "hoje" | "futuro" | "passado" | null {
  if (!iso) return null;
  const day = iso.slice(0, 10);
  const today = todayIso();
  return day === today ? "hoje" : day > today ? "futuro" : "passado";
}

/** "2026-11-14" → "14/11/2026". */
export function formatDateBr(iso?: string | null): string {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return y && m && d ? `${d}/${m}/${y}` : iso;
}

/** Comparador de nomes em ordem alfabética (ignora maiúsculas e acentos). */
export function compareNames(a?: string | null, b?: string | null): number {
  return (a ?? "").localeCompare(b ?? "", "pt-BR", { sensitivity: "base" });
}
