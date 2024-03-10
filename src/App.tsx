// Libs
import { HashRouter } from "react-router-dom";
import { FC } from "react";

// CSS
import "bootstrap/dist/css/bootstrap.min.css";
import { CartProvider } from "./Context/CartContext";
import Router from "./Router/Router";

const App: FC = () => {
  return (
    <>
      <CartProvider>
        <HashRouter>
          <Router />
        </HashRouter>
      </CartProvider>
    </>
  );
}

export default App;