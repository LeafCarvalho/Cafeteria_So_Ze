import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [total, setTotal] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    const newTotal = Object.keys(quantities).reduce((total, id) => {
      const product = products.find((product) => product.id === id);
      return total + (product ? product.valor * quantities[id] : 0);
    }, 0);
    setTotal(newTotal);
  }, [products, quantities]);

  return (
    <CartContext.Provider
      value={{
        products,
        setProducts,
        quantities,
        setQuantities,
        total,
        isCartOpen,
        setIsCartOpen,
        lastOrder,
        setLastOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
