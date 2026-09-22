const KNOWN_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  pagamentos: "Pagamentos",
  jogos: "Jogos",
  atletas: "Atletas",
  responsaveis: "Responsáveis",
  professores: "Professores",
  aulas: "Aulas",
  escola: "Escola",
  conta: "Conta",
  senha: "Senha",
  master: "Master",
  escolas: "Escolas",
  novo: "Novo",
  nova: "Nova",
  editar: "Editar",
  matricular: "Matricular",
  relatorio: "Relatório",
  registrar: "Registrar",
  sessoes: "Sessões",
  chamada: "Chamada",
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class Formatter {
  public static formatSegment(segment: string): string {
    if (!segment) return "Página Inicial";

    const lower = segment.toLowerCase();
    if (KNOWN_LABELS[lower]) return KNOWN_LABELS[lower];
    if (UUID_REGEX.test(segment)) return "Detalhes";

    return segment
      .split("-")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  public static formatPathname(pathname: string): string {
    const segments = pathname.replace(/^\//, "").split("/").filter(Boolean);
    if (segments.length === 0) return "Página Inicial";
    return segments.map((segment) => this.formatSegment(segment)).join(" ");
  }
}
