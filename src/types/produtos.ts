export interface Produto {
  id: string;
  created_at?: string;
  updated_at?: string;
  nome: string;
  tipo: string;
  valor: number;
  descricao: string;
  imagem: string;
}

export type CriarProdutoDTO = Omit<Produto, "id" | "created_at" | "updated_at">;

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
