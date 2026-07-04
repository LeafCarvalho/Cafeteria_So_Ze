import React, { createContext, useContext, useEffect, useState } from "react";
import { Dispatch, ReactNode, SetStateAction } from "react";
import { UltimoPedido } from "../types/pedidos";
import { Produto } from "../types/produtos";

export interface ScrollOrRouteLinkProps {
  to: string;
  scroll: boolean;
  children: ReactNode;
  className?: string;
}

export interface CartContextData {
  products: Produto[];
  setProducts: Dispatch<SetStateAction<Produto[]>>;
  quantities: Record<string, number>;
  setQuantities: Dispatch<SetStateAction<Record<string, number>>>;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: Dispatch<SetStateAction<boolean>>;
  lastOrder: UltimoPedido | null;
  setLastOrder: Dispatch<SetStateAction<UltimoPedido | null>>;
}

export interface CartProviderProps {
  children: ReactNode;
}

const CartContext = createContext<CartContextData | undefined>(undefined);

export const useCart = (): CartContextData => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider");
  }

  return context;
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Produto[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<UltimoPedido | null>(null);

  useEffect(() => {
    const newTotal = products.reduce((acc, product) => {
      const quantity = quantities[product.id] ?? 0;
      return acc + product.valor * quantity;
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

