import { Route, Routes } from "react-router-dom";

import Cadastro from "./pages/cadastro";
import Login from "./pages/login";

export const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
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
