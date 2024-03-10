// --------------------------- Importações ---------------------------
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ButtonProps } from 'react-bootstrap';
import { ReactNode, Dispatch, MouseEventHandler, SetStateAction } from 'react';
import { User } from 'firebase/auth';

// --------------------------- Interfaces de Tipagem ---------------------------
export interface ScrollOrRouteLinkProps {
  to: string;
  scroll: boolean;
  children: ReactNode;
  className?: string;
}

export interface DefaultButtonProps extends ButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
  customizarCSS?: string;
}

export interface ProductContextData {
  products: any[];
  setProducts: Dispatch<SetStateAction<any[]>>;
}

export interface ProductProviderProps {
  children: ReactNode;
}

export interface Product {
  id?: string;
  valor?: number;
  tipo?: string;
  nome?: string;
  imagem?: string;
  descricao?: string;
}

export interface CartContextData {
  products: Product[];
  setProducts: Dispatch<SetStateAction<Product[]>>;
  quantities: { [key: string]: number };
  setQuantities: Dispatch<SetStateAction<{ [key: string]: number }>>;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: Dispatch<SetStateAction<boolean>>;
  lastOrder: LastOrder | null; // Aqui, substituímos `any` por `LastOrder | null`
  setLastOrder: Dispatch<SetStateAction<LastOrder | null>>;
}

export interface CartProviderProps {
  children: ReactNode;
}

export interface AuthContextData {
  currentUser: User | null;
}

export interface AuthProviderProps {
  children: ReactNode;
}

// Substitua esta interface por uma mais específica de acordo com a estrutura do seu último pedido
interface LastOrder {
  // Estrutura do seu último pedido
}

// --------------------------- Implementação do Contexto do Carrinho ---------------------------
const CartContext = createContext<CartContextData | undefined>(undefined);

export const useCart = (): CartContextData => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [total, setTotal] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);

  useEffect(() => {
    const newTotal = products.reduce((total, product) => {
      const quantity = quantities[product.id ?? ''] ?? 0;
      return total + (product.valor ?? 0) * quantity;
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
