// Libs
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Pages
import Home from "./pages/Home/Home";

// Hooks

// CSS
import "bootstrap/dist/css/bootstrap.min.css";
import Cadastro from "./pages/Cadastro/Cadastro";
import Login from "./pages/Login/Login";
import Pedidos from "./pages/Pedidos/Pedidos";
import { CartProvider } from "./Context/CartContext";

function App() {
  return (
    <>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </>
  );
}

export default App;
