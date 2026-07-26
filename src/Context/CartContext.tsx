import React, { createContext, useContext, useEffect, useState } from "react";
import { Dispatch, ReactNode, SetStateAction } from "react";
import { DadosAcessoConfirmacao, UltimoPedido } from "@/types/pedidos";
import { Produto } from "@/types/produtos";

export interface ScrollOrRouteLinkProps {
  to: string;
  scroll: boolean;
  children: ReactNode;
  className?: string;
}

export interface CartContextData {
  cartProducts: Produto[];
  setCartProducts: Dispatch<SetStateAction<Produto[]>>;
  itemQuantities: Record<string, number>;
  setItemQuantities: Dispatch<SetStateAction<Record<string, number>>>;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: Dispatch<SetStateAction<boolean>>;
  cartTriggerId: string | null;
  setCartTriggerId: Dispatch<SetStateAction<string | null>>;
  lastOrderConfirmation: UltimoPedido | null;
  setLastOrderConfirmation: Dispatch<SetStateAction<UltimoPedido | null>>;
  confirmationAccessData: DadosAcessoConfirmacao | null;
  setConfirmationAccessData: Dispatch<
    SetStateAction<DadosAcessoConfirmacao | null>
  >;
}

export interface CartProviderProps {
  children: ReactNode;
}

const CartContext = createContext<CartContextData | undefined>(undefined);
const CONFIRMATION_STORAGE_KEY = "cafeteria-so-ze-confirmacao";

const getStoredConfirmationAccessData = (): DadosAcessoConfirmacao | null => {
  try {
    const storedData = sessionStorage.getItem(CONFIRMATION_STORAGE_KEY);
    return storedData ? (JSON.parse(storedData) as DadosAcessoConfirmacao) : null;
  } catch {
    return null;
  }
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = (): CartContextData => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider");
  }

  return context;
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartProducts, setCartProducts] = useState<Produto[]>([]);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartTriggerId, setCartTriggerId] = useState<string | null>(null);
  const [lastOrderConfirmation, setLastOrderConfirmation] = useState<UltimoPedido | null>(null);
  const [confirmationAccessData, setConfirmationAccessData] =
    useState<DadosAcessoConfirmacao | null>(getStoredConfirmationAccessData);

  useEffect(() => {
    const newTotal = cartProducts.reduce((acc, product) => {
      const quantity = itemQuantities[product.id] ?? 0;
      return acc + product.valor * quantity;
    }, 0);

    setTotal(newTotal);
  }, [cartProducts, itemQuantities]);

  useEffect(() => {
    if (confirmationAccessData) {
      sessionStorage.setItem(
        CONFIRMATION_STORAGE_KEY,
        JSON.stringify(confirmationAccessData),
      );
      return;
    }

    sessionStorage.removeItem(CONFIRMATION_STORAGE_KEY);
  }, [confirmationAccessData]);

  return (
    <CartContext.Provider
      value={{
        cartProducts,
        setCartProducts,
        itemQuantities,
        setItemQuantities,
        total,
        isCartOpen,
        setIsCartOpen,
        cartTriggerId,
        setCartTriggerId,
        lastOrderConfirmation,
        setLastOrderConfirmation,
        confirmationAccessData,
        setConfirmationAccessData,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
