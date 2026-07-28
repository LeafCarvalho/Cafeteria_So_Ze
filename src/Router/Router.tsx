import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "@/pages/Home/Home";
import Pedidos from "@/pages/Pedidos/Pedidos";
import Login from "@/pages/Login/Login";
import DefaultLayout from "@/Layout/DefaultLayout";
import Efetuacao from "@/pages/Efetuacao/Efetuacao";
import PrivateRoute from "./PrivateRoute";
import { ProdutosProvider } from "@/Context/ProdutosProvider";
import RedefinirSenha from "../pages/RedefinirSenha/RedefinirSenha";

const Administracao = lazy(
  () => import("@/pages/Administracao/Administracao"),
);

const CarregandoAdministracao = () => (
  <main className="route-loading" role="status">
    <span aria-hidden="true" />
    <p>Carregando área administrativa...</p>
  </main>
);

const Router = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<DefaultLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/login" element={<Login />} />
          <Route path="/efetuacao" element={<Efetuacao />} />
          <Route path="/efetuacao/:confirmacaoId" element={<Efetuacao />} />
        </Route>
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />
        <Route element={<PrivateRoute />}>
          <Route
            path="/administracao"
            element={
              <Suspense fallback={<CarregandoAdministracao />}>
                <ProdutosProvider>
                  <Administracao />
                </ProdutosProvider>
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </>
  );
};

export default Router;
