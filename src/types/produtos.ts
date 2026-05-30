export interface Produto {
  id: string;
  nome: string;
  tipo: string;
  valor: number;
  descricao: string;
  imagem: string;
}

export type AtualizarProdutoDTO = Partial<Pick<
  Produto,
  "nome" | "tipo" | "valor" | "descricao" | "imagem"
>>;

export type ProdutoContextData = {
  produtos: Produto[]
  loading: boolean
  erro: string | null
  carregarProdutos: () => Promise<void>;
  atualizarProduto: (
    id: string,
    data: AtualizarProdutoDTO
  ) => Promise<boolean>;
  deletarProduto: (id: string) => Promise<boolean>;
}

export interface EditState {
  id: string | null;
  field: keyof Produto | "";
}