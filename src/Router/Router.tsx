import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home/Home";
import Pedidos from "../pages/Pedidos/Pedidos";
import Login from "../pages/Login/Login";
import DefaultLayout from "../Layout/DefaultLayout";
import Efetuacao from "../pages/Efetuacao/Efetuacao";
import PrivateRoute from "./PrivateRoute";
import Administracao from "../pages/Administracao/Administracao";
import { ProductProvider } from "../Context/ProductProvider";
import React from "react";

const Router = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<DefaultLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/login" element={<Login />} />
          <Route path="/efetuacao" element={<Efetuacao />} />
        </Route>
        <Route element={<PrivateRoute />}>
          <React.Fragment>
            <Route
              path="/administracao"
              element={
                <ProductProvider>
                  <Administracao />
                </ProductProvider>
              }
            />
          </React.Fragment>
        </Route>
      </Routes>
    </>
  );
};

export default Router;
