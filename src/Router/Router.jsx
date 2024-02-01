import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home/Home";
import Pedidos from "../pages/Pedidos/Pedidos";
import Login from "../pages/Login/Login";
import Cadastro from "../pages/Cadastro/Cadastro";
import DefaultLayout from "../Layout/DefaultLayout";


const Router = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<DefaultLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
        </Route>
      </Routes>
    </>
  );
};

export default Router;
