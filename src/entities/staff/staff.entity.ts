export type StaffRoleType =
  | "PROFESSOR"
  | "ASSISTENTE_TECNICO"
  | "ESTAGIARIO"
  | "PREPARADOR_GOLEIRO"
  | "OUTRO";

export type StaffStatus = "ACTIVE" | "INACTIVE";

export type Permission =
  | "ATLETAS_VER"
  | "ATLETAS_MATRICULAR"
  | "ATLETAS_EDITAR"
  | "ATLETAS_INATIVAR"
  | "ATLETAS_REATIVAR"
  | "ATLETAS_EXCLUIR_PERMANENTE"
  | "ATLETAS_IMPRIMIR"
  | "RESPONSAVEIS_VER"
  | "RESPONSAVEIS_CRIAR"
  | "RESPONSAVEIS_EDITAR"
  | "RESPONSAVEIS_EXCLUIR"
  | "PAGAMENTOS_VER"
  | "PAGAMENTOS_LANCAR"
  | "PAGAMENTOS_DAR_BAIXA"
  | "PAGAMENTOS_EDITAR"
  | "PAGAMENTOS_MARCAR_PENDENTE"
  | "PAGAMENTOS_EXCLUIR"
  | "JOGOS_VER"
  | "JOGOS_CRIAR"
  | "JOGOS_EDITAR"
  | "JOGOS_FAZER_CHAMADA"
  | "JOGOS_EXCLUIR"
  | "AULAS_VER_GRUPOS"
  | "AULAS_CRIAR_GRUPO"
  | "AULAS_EDITAR_GRUPO"
  | "AULAS_EXCLUIR_GRUPO"
  | "AULAS_REGISTRAR_AULA"
  | "AULAS_FAZER_CHAMADA"
  | "AULAS_EDITAR_CHAMADA_PASSADA"
  | "AULAS_EXCLUIR_SESSAO"
  | "AULAS_GERAR_RELATORIO"
  | "PRODUTOS_VER"
  | "PRODUTOS_CRIAR"
  | "PRODUTOS_EDITAR"
  | "PRODUTOS_INATIVAR"
  | "PRODUTOS_REATIVAR"
  | "PRODUTOS_VENDER"
  | "PRODUTOS_EXCLUIR_VENDA";

export interface StaffMember {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  staffRole: StaffRoleType;
  customRoleLabel: string | null;
  phone: string | null;
  document: string | null;
  admissionDate: string | null;
  salary: number | null;
  notes: string | null;
  status: StaffStatus;
  permissions: Permission[];
}

export const STAFF_ROLE_LABELS: Record<StaffRoleType, string> = {
  PROFESSOR: "Professor",
  ASSISTENTE_TECNICO: "Assistente técnico",
  ESTAGIARIO: "Estagiário",
  PREPARADOR_GOLEIRO: "Preparador de goleiro",
  OUTRO: "Outro",
};

export const PERMISSION_GROUPS: {
  module: string;
  permissions: { value: Permission; label: string }[];
}[] = [
  {
    module: "Atletas",
    permissions: [
      { value: "ATLETAS_VER", label: "Ver atletas" },
      { value: "ATLETAS_MATRICULAR", label: "Matricular atleta" },
      { value: "ATLETAS_EDITAR", label: "Editar atleta" },
      { value: "ATLETAS_INATIVAR", label: "Inativar atleta" },
      { value: "ATLETAS_REATIVAR", label: "Reativar atleta" },
      { value: "ATLETAS_EXCLUIR_PERMANENTE", label: "Excluir atleta permanentemente" },
      { value: "ATLETAS_IMPRIMIR", label: "Imprimir relatório de atletas" },
    ],
  },
  {
    module: "Responsáveis",
    permissions: [
      { value: "RESPONSAVEIS_VER", label: "Ver responsáveis" },
      { value: "RESPONSAVEIS_CRIAR", label: "Cadastrar responsável" },
      { value: "RESPONSAVEIS_EDITAR", label: "Editar responsável" },
      { value: "RESPONSAVEIS_EXCLUIR", label: "Excluir responsável" },
    ],
  },
  {
    module: "Pagamentos",
    permissions: [
      { value: "PAGAMENTOS_VER", label: "Ver pagamentos" },
      { value: "PAGAMENTOS_LANCAR", label: "Lançar pagamento" },
      { value: "PAGAMENTOS_DAR_BAIXA", label: "Dar baixa (marcar como pago)" },
      { value: "PAGAMENTOS_EDITAR", label: "Editar pagamento quitado" },
      { value: "PAGAMENTOS_MARCAR_PENDENTE", label: "Reverter para pendente" },
      { value: "PAGAMENTOS_EXCLUIR", label: "Excluir pagamento" },
    ],
  },
  {
    module: "Jogos",
    permissions: [
      { value: "JOGOS_VER", label: "Ver jogos" },
      { value: "JOGOS_CRIAR", label: "Criar jogo" },
      { value: "JOGOS_EDITAR", label: "Editar jogo" },
      { value: "JOGOS_FAZER_CHAMADA", label: "Fazer chamada" },
      { value: "JOGOS_EXCLUIR", label: "Excluir jogo" },
    ],
  },
  {
    module: "Aulas",
    permissions: [
      { value: "AULAS_VER_GRUPOS", label: "Ver grupos e aulas" },
      { value: "AULAS_CRIAR_GRUPO", label: "Criar grupo" },
      { value: "AULAS_EDITAR_GRUPO", label: "Editar grupo" },
      { value: "AULAS_EXCLUIR_GRUPO", label: "Excluir grupo" },
      { value: "AULAS_REGISTRAR_AULA", label: "Registrar nova aula" },
      { value: "AULAS_FAZER_CHAMADA", label: "Fazer chamada" },
      { value: "AULAS_EDITAR_CHAMADA_PASSADA", label: "Editar chamada de aula passada" },
      { value: "AULAS_EXCLUIR_SESSAO", label: "Excluir aula/sessão" },
      { value: "AULAS_GERAR_RELATORIO", label: "Gerar relatório de aulas" },
    ],
  },
  {
    module: "Produtos",
    permissions: [
      { value: "PRODUTOS_VER", label: "Ver produtos e vendas" },
      { value: "PRODUTOS_CRIAR", label: "Cadastrar produto" },
      { value: "PRODUTOS_EDITAR", label: "Editar produto" },
      { value: "PRODUTOS_INATIVAR", label: "Inativar produto" },
      { value: "PRODUTOS_REATIVAR", label: "Reativar produto" },
      { value: "PRODUTOS_VENDER", label: "Registrar venda" },
      { value: "PRODUTOS_EXCLUIR_VENDA", label: "Excluir venda" },
    ],
  },
];
