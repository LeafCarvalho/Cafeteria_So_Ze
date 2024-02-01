// Libs
import { BrowserRouter } from "react-router-dom";

// CSS
import "bootstrap/dist/css/bootstrap.min.css";
import { CartProvider } from "./Context/CartContext";
import Router from "./Router/Router";

function App() {
  return (
    <>
      <CartProvider>
        <BrowserRouter>
          <Router />
        </BrowserRouter>
      </CartProvider>
    </>
  );
}

export default App;
