import { createContext, useContext, ReactNode } from "react";
import { ProdutoContextData } from "../types/produtos";
import { useProdutos } from "../hooks/useProdutos";

const ProdutosContext = createContext<ProdutoContextData | null>(null);

export const ProdutosProvider = ({ children }: { children: ReactNode }) => {
  const produtosState = useProdutos();

  return (
    <ProdutosContext.Provider value={produtosState}>
      {children}
    </ProdutosContext.Provider>
  );
};

export function useProdutosContext() {
  const context = useContext(ProdutosContext);

  if (!context) {
    throw new Error(
      "useProdutosContext deve ser usado dentro de ProdutosProvider",
    );
  }

  return context;
}
