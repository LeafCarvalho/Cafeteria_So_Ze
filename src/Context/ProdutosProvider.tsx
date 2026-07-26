import { createContext, useContext, ReactNode } from "react";
import { ProdutoContextData } from "@/types/produtos";
import { useProdutos } from "@/hooks/useProdutos";

const ProdutosContext = createContext<ProdutoContextData | null>(null);

export const ProdutosProvider = ({ children }: { children: ReactNode }) => {
  const produtosState = useProdutos();

  return (
    <ProdutosContext.Provider value={produtosState}>
      {children}
    </ProdutosContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useProdutosContext() {
  const context = useContext(ProdutosContext);

  if (!context) {
    throw new Error(
      "useProdutosContext deve ser usado dentro de ProdutosProvider",
    );
  }

  return context;
}
