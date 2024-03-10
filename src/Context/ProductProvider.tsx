// --------------------------- Importações ---------------------------
import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

// --------------------------- Interfaces de Tipagem ---------------------------
export interface Product {
  id?: string;
  valor?: number;
  tipo?: string;
  nome?: string;
  imagem?: string;
  descricao?: string;
}

export interface ProductContextData {
  products: Product[];
  setProducts: Dispatch<SetStateAction<Product[]>>;
}

export interface ProductProviderProps {
  children: ReactNode;
}

// --------------------------- Implementação do Contexto de Produtos ---------------------------
const ProductContext = createContext<ProductContextData | undefined>(undefined);

export const useProducts = (): ProductContextData => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts deve ser usado dentro de um ProductProvider');
  }
  return context;
};

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  return (
    <ProductContext.Provider value={{ products, setProducts }}>
      {children}
    </ProductContext.Provider>
  );
};
