import { Route, Routes } from "react-router-dom";

import Cadastro from "./pages/cadastro";
import { SidebarExample } from "./pages/sidebar.example";
import { Layout } from "./layouts/layout";

export const Router = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<SidebarExample />} />
      </Route>
      <Route path="/cadastro" element={<Cadastro />} />

      {/* <Route element={<MainLayout />}>
        <Route path="/inicio" element={<DashBoard />} />
        <Route path="/gestaoPagamentos" element={<GestaoPagamentos />} />
        <Route path="/gestaoAlunos" element={<GestaoAlunos />} />
        <Route path="/escalacao" element={<Escalacao />} />
        <Route path="/partidas" element={<Partidas />} />
      </Route> */}
    </Routes>
  );
};
