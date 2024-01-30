import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [products, setProducts] = useState([]); // Lista de produtos no carrinho
  const [quantities, setQuantities] = useState({}); // Quantidades dos produtos
  const [total, setTotal] = useState(0); // Total do carrinho
  const [isCartOpen, setIsCartOpen] = useState(false); // Estado para controle de visualização do carrinho

  useEffect(() => {
    // Calcular o total sempre que os produtos ou quantidades mudarem
    const newTotal = Object.keys(quantities).reduce((total, id) => {
      const product = products.find((product) => product.id === id);
      return total + (product ? product.valor * quantities[id] : 0);
    }, 0);
    setTotal(newTotal);
  }, [products, quantities]);

  // Funções para manipular o carrinho (adicionar produto, remover produto, etc.)
  // podem ser adicionadas aqui e expostas através do contexto para uso em componentes

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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
