import {
  CalendarCheck,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  School,
  Settings,
  User,
  UserPlus,
  Users,
} from "lucide-react";

import { SidebarContent as UISidebarContent } from "../ui/sidebar";
import { Navbar } from "../nav/navbar";
import { ScrollArea } from "../ui/scroll-area";
import { useAuth } from "@/contexts/auth/auth.context";

const data = {
  navGerencial: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      description: "Visualização geral de indicadores do sistema.",
    },
  ],
  navFinanceiro: [
    {
      title: "Pagamentos",
      url: "/pagamentos",
      icon: CreditCard,
      description: "Controle de mensalidades e histórico financeiro.",
    },
  ],
  navOperacional: [
    {
      title: "Atletas",
      url: "/atletas",
      icon: User,
      items: [
        {
          title: "Matricular Atleta",
          url: "/atletas/matricular",
          icon: UserPlus,
        },
      ],
    },
    {
      title: "Responsáveis",
      url: "/responsaveis",
      icon: Users,
      description:
        "Visualização e gestão dos responsáveis vinculados aos alunos.",
    },
    {
      title: "Professores",
      url: "/professores",
      icon: Users,
      description: "Gestão dos dados dos professores.",
    },
    {
      title: "Jogos",
      url: "/jogos",
      icon: ClipboardList,
      description: "Criação e visualização de partidas agendadas (Escalação).",
    },
    {
      title: "Aulas",
      url: "/aulas",
      icon: CalendarCheck,
      description: "Grupos de aula, chamada e histórico de frequência.",
    },
  ],
  navConfiguracoes: [
    {
      title: "Escola",
      url: "/escola",
      icon: Settings,
      description: "Dados e logo da escola.",
    },
  ],
  navMaster: [
    {
      title: "Escolas",
      url: "/master/escolas/nova",
      icon: School,
      description: "Cadastro de novas escolas e seus administradores.",
    },
  ],
};

export function SidebarContent() {
  const { user } = useAuth();
  const isMaster = user?.role === "MASTER";

  return (
    <UISidebarContent>
      <ScrollArea className="h-full">
        {isMaster && <Navbar items={data.navMaster} label="Master" />}
        {!isMaster && (
          <>
            <Navbar items={data.navGerencial} label="Gerencial" />
            <Navbar items={data.navFinanceiro} label="Financeiro" />
            <Navbar items={data.navOperacional} label="Operacional" />
            <Navbar items={data.navConfiguracoes} label="Configurações" />
          </>
        )}
      </ScrollArea>
    </UISidebarContent>
  );
}
