import {
  Bell,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Table,
  User,
  UserPlus,
  Users,
  FileText,
} from "lucide-react";

import { SidebarContent as UISidebarContent } from "../ui/sidebar";
import { Navbar } from "../nav/navbar";
import { ScrollArea } from "../ui/scroll-area";

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
      title: "Turmas",
      url: "/turmas",
      icon: Table,
      description:
        "Cadastro de turmas com controle de alunos e aulas vinculadas.",
    },

    {
      title: "Notificações",
      url: "/notificacoes",
      icon: Bell,
      description: "Envio automatizado para responsáveis.",
    },

    
  ],
  navAdministrativo: [
    {
      title: "Contratos",
      url: "/contratos",
      icon: FileText,
      description: "Gestão de contratos administrativos e documentos legais.",
    },
  ],
};

export function SidebarContent() {
  return (
    <UISidebarContent>
      <ScrollArea className="h-full">
        <Navbar items={data.navGerencial} label="Gerencial" />
        <Navbar items={data.navFinanceiro} label="Financeiro" />
        <Navbar items={data.navOperacional} label="Operacional" />
        <Navbar items={data.navAdministrativo} label="Administrativo" />
      </ScrollArea>
    </UISidebarContent>
  );
}
