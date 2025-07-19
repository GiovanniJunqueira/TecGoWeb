import { Route, Routes } from "react-router-dom";

import { Layout } from "./layouts/layout";
import { SidebarExample } from "./pages/sidebar.example";

export const Router = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<SidebarExample />} />
        <Route path="/dashboard" element={<SidebarExample />} />
        <Route path="/pagamentos" element={<SidebarExample />} />
        <Route path="/jogos" element={<SidebarExample />} />
        <Route path="/turmas" element={<SidebarExample />} />
        <Route path="/alunos/matricular" element={<SidebarExample />} />
        <Route path="/notificacoes" element={<SidebarExample />} />
        <Route path="/alunos" element={<SidebarExample />} />
        <Route path="/responsaveis" element={<SidebarExample />} />
        <Route path="/professores" element={<SidebarExample />} />
      </Route>
    </Routes>
  );
};
