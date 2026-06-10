import { Route, Routes } from "react-router-dom";

import { Layout } from "./layouts/layout";
import DashboardPage from "./pages/dashboard/dashboard.page";
import { SidebarExample } from "./pages/sidebar.example";
import LoginPage from "./pages/login/login.page";
import { ProtectedRoute, PublicRoute } from "./contexts/auth/guards";
import { NotFoundPage } from "./pages/notFound/NotFoundPage";
import PlayerListPage from "./pages/operational/player/list/player.list.page";
import PlayerCreateFormPage from "./pages/operational/player/player.create.form.page";
import PlayerDetailsPage from "./pages/operational/player/details/player.details.page";
import PaymentListPage from "./pages/operational/payment/payment.list.page";
import GameListPage from "./pages/operational/game/game.list.page";
import GameCreatePage from "./pages/operational/game/game.create.page";
import GameDetailsPage from "./pages/operational/game/game.details.page";
import ResponsibleListPage from "./pages/operational/responsible/responsible.list.page";
import ResponsibleDetailsPage from "./pages/operational/responsible/responsible.details.page";
import TeacherListPage from "./pages/operational/teacher/teacher.list.page";
import TeacherFormPage from "./pages/operational/teacher/teacher.form.page";
import TeacherDetailsPage from "./pages/operational/teacher/teacher.details.page";

export const Router = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pagamentos" element={<PaymentListPage />} />
          <Route path="/jogos" element={<GameListPage />} />
          <Route path="/jogos/novo" element={<GameCreatePage />} />
          <Route path="/jogos/:id" element={<GameDetailsPage />} />
          <Route path="/turmas" element={<SidebarExample />} />
          <Route path="/atletas/matricular" element={<PlayerCreateFormPage />} />
          <Route path="/atletas/editar/:id" element={<PlayerCreateFormPage />} />
          <Route path="/notificacoes" element={<SidebarExample />} />
          <Route path="/atletas" element={<PlayerListPage />} />
          <Route path="/atletas/:id" element={<PlayerDetailsPage />} />
          <Route path="/responsaveis" element={<ResponsibleListPage />} />
          <Route path="/responsaveis/:id" element={<ResponsibleDetailsPage />} />
          <Route path="/professores" element={<TeacherListPage />} />
          <Route path="/professores/novo" element={<TeacherFormPage />} />
          <Route path="/professores/editar/:id" element={<TeacherFormPage />} />
          <Route path="/professores/:id" element={<TeacherDetailsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
};
