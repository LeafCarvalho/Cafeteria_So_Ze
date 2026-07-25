import React, { createContext, useContext, useEffect, useState } from "react";
import { Dispatch, ReactNode, SetStateAction } from "react";
import { DadosAcessoConfirmacao, UltimoPedido } from "../types/pedidos";
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
  cartTriggerId: string | null;
  setCartTriggerId: Dispatch<SetStateAction<string | null>>;
  lastOrder: UltimoPedido | null;
  setLastOrder: Dispatch<SetStateAction<UltimoPedido | null>>;
  dadosAcessoConfirmacao: DadosAcessoConfirmacao | null;
  setDadosAcessoConfirmacao: Dispatch<
    SetStateAction<DadosAcessoConfirmacao | null>
  >;
}

export interface CartProviderProps {
  children: ReactNode;
}

const CartContext = createContext<CartContextData | undefined>(undefined);
const CONFIRMACAO_STORAGE_KEY = "cafeteria-so-ze-confirmacao";

const recuperarDadosAcesso = (): DadosAcessoConfirmacao | null => {
  try {
    const dados = sessionStorage.getItem(CONFIRMACAO_STORAGE_KEY);
    return dados ? (JSON.parse(dados) as DadosAcessoConfirmacao) : null;
  } catch {
    return null;
  }
};

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
  const [cartTriggerId, setCartTriggerId] = useState<string | null>(null);
  const [lastOrder, setLastOrder] = useState<UltimoPedido | null>(null);
  const [dadosAcessoConfirmacao, setDadosAcessoConfirmacao] =
    useState<DadosAcessoConfirmacao | null>(recuperarDadosAcesso);

  useEffect(() => {
    const newTotal = products.reduce((acc, product) => {
      const quantity = quantities[product.id] ?? 0;
      return acc + product.valor * quantity;
    }, 0);

    setTotal(newTotal);
  }, [products, quantities]);

  useEffect(() => {
    if (dadosAcessoConfirmacao) {
      sessionStorage.setItem(
        CONFIRMACAO_STORAGE_KEY,
        JSON.stringify(dadosAcessoConfirmacao),
      );
      return;
    }

    sessionStorage.removeItem(CONFIRMACAO_STORAGE_KEY);
  }, [dadosAcessoConfirmacao]);

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
        cartTriggerId,
        setCartTriggerId,
        lastOrder,
        setLastOrder,
        dadosAcessoConfirmacao,
        setDadosAcessoConfirmacao,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
