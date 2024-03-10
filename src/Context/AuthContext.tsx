// Importações do React e outras bibliotecas
import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

// --------------------------- Interfaces de Tipagem ---------------------------
interface Product {
  id?: string;
  valor?: number;
  tipo?: string;
  nome?: string;
  imagem?: string;
  descricao?: string;
}

interface CartContextData {
  products: Product[];
  setProducts: Dispatch<SetStateAction<Product[]>>;
  quantities: { [key: string]: number };
  setQuantities: Dispatch<SetStateAction<{ [key: string]: number }>>;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: Dispatch<SetStateAction<boolean>>;
  lastOrder: any; // Sugestão: definir uma interface específica para `lastOrder`, se possível
  setLastOrder: Dispatch<SetStateAction<any>>;
}

interface CartProviderProps {
  children: ReactNode;
}

// --------------------------- Implementação do Contexto ---------------------------
const CartContext = createContext<CartContextData | undefined>(undefined);

export const useCart = (): CartContextData => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [lastOrder, setLastOrder] = useState<any>(null);

  const value = {
    products,
    setProducts,
    quantities,
    setQuantities,
    total,
    isCartOpen,
    setIsCartOpen,
    lastOrder,
    setLastOrder,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
