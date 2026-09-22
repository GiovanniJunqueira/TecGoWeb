import type { Permission } from "@/entities/staff/staff.entity";
import type { UserPayload } from "@/entities/user/user.entity";

export function hasPermission(user: UserPayload | null, permission: Permission): boolean {
  if (!user) return false;
  if (user.role === "ADMIN" || user.role === "MASTER") return true;
  if (user.role !== "STAFF") return false;
  return user.permissions?.includes(permission) ?? false;
}

// Rotas cujo acesso depende de uma permissão específica quando o usuário é STAFF.
// A ordem importa: rotas mais específicas devem vir antes das mais genéricas.
export const ROUTE_PERMISSIONS: { pattern: string; permission: Permission }[] = [
  { pattern: "/atletas/matricular", permission: "ATLETAS_MATRICULAR" },
  { pattern: "/atletas/editar/:id", permission: "ATLETAS_EDITAR" },
  { pattern: "/atletas/relatorio", permission: "ATLETAS_IMPRIMIR" },
  { pattern: "/atletas/:id", permission: "ATLETAS_VER" },
  { pattern: "/atletas", permission: "ATLETAS_VER" },

  { pattern: "/responsaveis/novo", permission: "RESPONSAVEIS_CRIAR" },
  { pattern: "/responsaveis/editar/:id", permission: "RESPONSAVEIS_EDITAR" },
  { pattern: "/responsaveis/:id", permission: "RESPONSAVEIS_VER" },
  { pattern: "/responsaveis", permission: "RESPONSAVEIS_VER" },

  { pattern: "/pagamentos", permission: "PAGAMENTOS_VER" },

  { pattern: "/jogos/novo", permission: "JOGOS_CRIAR" },
  { pattern: "/jogos/editar/:id", permission: "JOGOS_EDITAR" },
  { pattern: "/jogos/:id/chamada", permission: "JOGOS_FAZER_CHAMADA" },
  { pattern: "/jogos/:id", permission: "JOGOS_VER" },
  { pattern: "/jogos", permission: "JOGOS_VER" },

  { pattern: "/aulas/novo", permission: "AULAS_CRIAR_GRUPO" },
  { pattern: "/aulas/registrar", permission: "AULAS_REGISTRAR_AULA" },
  { pattern: "/aulas/editar/:id", permission: "AULAS_EDITAR_GRUPO" },
  { pattern: "/aulas/sessoes/:sessaoId/chamada", permission: "AULAS_FAZER_CHAMADA" },
  { pattern: "/aulas/:id/relatorio", permission: "AULAS_GERAR_RELATORIO" },
  { pattern: "/aulas/:id", permission: "AULAS_VER_GRUPOS" },
  { pattern: "/aulas", permission: "AULAS_VER_GRUPOS" },
];

// Rotas sempre liberadas para qualquer usuário autenticado, independente de permissão
// (ex: trocar a própria senha). Módulos como Dashboard, Escola e Profissionais não
// entram aqui de propósito: não são permissões concedíveis, então ficam restritos a
// ADMIN/MASTER.
export const ALWAYS_ALLOWED_ROUTES = ["/conta/senha"];

// Ordem de preferência para decidir a primeira página de um profissional (STAFF)
// após o login, já que ele nunca tem acesso ao Dashboard.
const STAFF_LANDING_PRIORITY: { path: string; permission: Permission }[] = [
  { path: "/atletas", permission: "ATLETAS_VER" },
  { path: "/pagamentos", permission: "PAGAMENTOS_VER" },
  { path: "/jogos", permission: "JOGOS_VER" },
  { path: "/aulas", permission: "AULAS_VER_GRUPOS" },
  { path: "/responsaveis", permission: "RESPONSAVEIS_VER" },
];

export function getStaffLandingPath(permissions: Permission[]): string {
  const match = STAFF_LANDING_PRIORITY.find((entry) => permissions.includes(entry.permission));
  return match?.path ?? "/conta/senha";
}
