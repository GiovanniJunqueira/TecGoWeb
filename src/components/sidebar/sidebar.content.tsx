import {
  CalendarCheck,
  CalendarPlus,
  ClipboardList,
  CreditCard,
  Eye,
  LayoutDashboard,
  PackagePlus,
  Receipt,
  School,
  Settings,
  ShoppingBag,
  User,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { SidebarContent as UISidebarContent } from "../ui/sidebar";
import { Navbar } from "../nav/navbar";
import { ScrollArea } from "../ui/scroll-area";
import { useAuth } from "@/contexts/auth/auth.context";
import { hasPermission } from "@/lib/permissions";
import type { Permission } from "@/entities/staff/staff.entity";
import type { UserPayload } from "@/entities/user/user.entity";

interface NavSubItem {
  title: string;
  url: string;
  icon: LucideIcon;
  permission?: Permission;
}

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  description?: string;
  permission?: Permission;
  items?: NavSubItem[];
}

const data = {
  navGerencial: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      description: "Visualização geral de indicadores do sistema.",
    },
  ] satisfies NavItem[],
  navFinanceiro: [
    {
      title: "Pagamentos",
      url: "/pagamentos",
      icon: CreditCard,
      description: "Controle de mensalidades e histórico financeiro.",
      permission: "PAGAMENTOS_VER",
    },
    {
      title: "Financeiro",
      url: "/financeiro",
      icon: Wallet,
      description: "Resumo consolidado de mensalidades e vendas do mês.",
    },
  ] satisfies NavItem[],
  navOperacional: [
    {
      title: "Atletas",
      url: "/atletas",
      icon: User,
      permission: "ATLETAS_VER",
      items: [
        {
          title: "Ver Atletas",
          url: "/atletas",
          icon: Eye,
          permission: "ATLETAS_VER",
        },
        {
          title: "Matricular Atleta",
          url: "/atletas/matricular",
          icon: UserPlus,
          permission: "ATLETAS_MATRICULAR",
        },
      ],
    },
    {
      title: "Responsáveis",
      url: "/responsaveis",
      icon: Users,
      description:
        "Visualização e gestão dos responsáveis vinculados aos alunos.",
      permission: "RESPONSAVEIS_VER",
      items: [
        {
          title: "Ver Responsáveis",
          url: "/responsaveis",
          icon: Eye,
          permission: "RESPONSAVEIS_VER",
        },
        {
          title: "Novo Responsável",
          url: "/responsaveis/novo",
          icon: UserPlus,
          permission: "RESPONSAVEIS_CRIAR",
        },
      ],
    },
    {
      title: "Profissionais",
      url: "/profissionais",
      icon: Users,
      description: "Cadastro de professores e demais profissionais, com acessos por módulo.",
      items: [
        {
          title: "Ver Profissionais",
          url: "/profissionais",
          icon: Eye,
        },
        {
          title: "Novo Profissional",
          url: "/profissionais/novo",
          icon: UserPlus,
        },
      ],
    },
    {
      title: "Jogos",
      url: "/jogos",
      icon: ClipboardList,
      description: "Criação e visualização de partidas agendadas (Escalação).",
      permission: "JOGOS_VER",
      items: [
        {
          title: "Ver Jogos",
          url: "/jogos",
          icon: Eye,
          permission: "JOGOS_VER",
        },
        {
          title: "Novo Jogo",
          url: "/jogos/novo",
          icon: UserPlus,
          permission: "JOGOS_CRIAR",
        },
      ],
    },
    {
      title: "Aulas",
      url: "/aulas",
      icon: CalendarCheck,
      description: "Grupos de aula, chamada e histórico de frequência.",
      permission: "AULAS_VER_GRUPOS",
      items: [
        {
          title: "Ver Grupos",
          url: "/aulas",
          icon: Eye,
          permission: "AULAS_VER_GRUPOS",
        },
        {
          title: "Registrar Aula",
          url: "/aulas/registrar",
          icon: CalendarPlus,
          permission: "AULAS_REGISTRAR_AULA",
        },
      ],
    },
    {
      title: "Produtos",
      url: "/produtos",
      icon: ShoppingBag,
      description: "Cadastro de produtos da lojinha e registro de vendas.",
      permission: "PRODUTOS_VER",
      items: [
        {
          title: "Ver Produtos",
          url: "/produtos",
          icon: Eye,
          permission: "PRODUTOS_VER",
        },
        {
          title: "Novo Produto",
          url: "/produtos/novo",
          icon: PackagePlus,
          permission: "PRODUTOS_CRIAR",
        },
        {
          title: "Ver Vendas",
          url: "/produtos/vendas",
          icon: Receipt,
          permission: "PRODUTOS_VER",
        },
        {
          title: "Registrar Venda",
          url: "/produtos/vendas/nova",
          icon: ShoppingBag,
          permission: "PRODUTOS_VENDER",
        },
      ],
    },
  ] satisfies NavItem[],
  navConfiguracoes: [
    {
      title: "Escola",
      url: "/escola",
      icon: Settings,
      description: "Dados e logo da escola.",
    },
  ] satisfies NavItem[],
  navMaster: [
    {
      title: "Escolas",
      url: "/master/escolas/nova",
      icon: School,
      description: "Cadastro de novas escolas e seus administradores.",
    },
  ] satisfies NavItem[],
};

// Um item sem `permission` (ex: Profissionais) não é concedível a um profissional
// (STAFF) — só ADMIN/MASTER, que nunca passam por este filtro, o enxergam.
function filterForStaff(items: NavItem[], user: UserPayload): NavItem[] {
  return items
    .filter((item) => item.permission && hasPermission(user, item.permission))
    .map((item) => ({
      ...item,
      items: item.items?.filter(
        (subItem) => subItem.permission && hasPermission(user, subItem.permission)
      ),
    }))
    .filter((item) => (item.items ? item.items.length > 0 : true));
}

export function SidebarContent() {
  const { user } = useAuth();
  const isMaster = user?.role === "MASTER";
  const isStaff = user?.role === "STAFF";

  const navFinanceiro = isStaff && user ? filterForStaff(data.navFinanceiro, user) : data.navFinanceiro;
  const navOperacional = isStaff && user ? filterForStaff(data.navOperacional, user) : data.navOperacional;

  return (
    <UISidebarContent>
      <ScrollArea className="h-full">
        {isMaster && <Navbar items={data.navMaster} label="Master" />}
        {!isMaster && (
          <>
            {!isStaff && <Navbar items={data.navGerencial} label="Gerencial" />}
            {navFinanceiro.length > 0 && <Navbar items={navFinanceiro} label="Financeiro" />}
            {navOperacional.length > 0 && (
              <Navbar items={navOperacional} label="Operacional" />
            )}
            {!isStaff && <Navbar items={data.navConfiguracoes} label="Configurações" />}
          </>
        )}
      </ScrollArea>
    </UISidebarContent>
  );
}
