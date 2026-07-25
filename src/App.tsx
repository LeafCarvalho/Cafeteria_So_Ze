import { FC } from "react";
import { HashRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { CartProvider } from "./Context/CartContext";
import Router from "./Router/Router";
import { ScrollRestoration } from "@/components/ScrollRestoration/ScrollRestoration";

const App: FC = () => (
  <CartProvider>
    <HashRouter>
      <ScrollRestoration />
      <Router />
    </HashRouter>
  </CartProvider>
);

export default App;
