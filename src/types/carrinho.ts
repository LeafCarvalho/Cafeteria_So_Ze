import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { DadosAcessoConfirmacao, UltimoPedido } from "@/types/pedidos";
import type { Produto } from "@/types/produtos";

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
