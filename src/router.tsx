import { Route, Routes } from "react-router-dom";

import { Layout } from "./layouts/layout";
import { SidebarExample } from "./pages/sidebar.example";
import LoginPage from "./pages/login/login.page";
import { ProtectedRoute, PublicRoute } from "./contexts/auth/guards";
import { NotFoundPage } from "./pages/notFound/NotFoundPage";

export const Router = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<SidebarExample />} />
          <Route path="/dashboard" element={<SidebarExample />} />
          <Route path="/pagamentos" element={<SidebarExample />} />
          <Route path="/jogos" element={<SidebarExample />} />
          <Route path="/turmas" element={<SidebarExample />} />
          <Route path="/atletas/matricular" element={<SidebarExample />} />
          <Route path="/notificacoes" element={<SidebarExample />} />
          <Route path="/atletas" element={<SidebarExample />} />
          <Route path="/responsaveis" element={<SidebarExample />} />
          <Route path="/professores" element={<SidebarExample />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
};
