import { FC } from "react";
import { HashRouter } from "react-router-dom";
import { Slide, ToastContainer } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import { CartProvider } from "./Context/CartContext";
import Router from "./Router/Router";
import { ScrollRestoration } from "@/components/ScrollRestoration/ScrollRestoration";

const App: FC = () => (
  <CartProvider>
    <HashRouter>
      <ScrollRestoration />
      <Router />
      <ToastContainer
        autoClose={3000}
        closeOnClick
        draggable={false}
        hideProgressBar
        limit={1}
        position="bottom-right"
        theme="dark"
        transition={Slide}
      />
    </HashRouter>
  </CartProvider>
);

export default App;
