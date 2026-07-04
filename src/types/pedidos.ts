import { Produto } from "./produtos";

export type PedidoStatus = "criado" | "em_preparo" | "pronto" | "finalizado" | "cancelado";

export interface Pedido {
  id: string;
  nome_cliente: string;
  produto_id: string;
  senha_retirar_ped: string;
  status: PedidoStatus;
  telefone: string;
  total: number;
  created_at: string;
  updated_at?: string;
  produto?: Produto | null;
}

export interface CriarPedidoDTO {
  nome_cliente: string;
  produto_id: string;
  senha_retirar_ped: string;
  telefone: string;
  total: number;
}

export type AtualizarPedidoDTO = Partial<Pick<Pedido, "status">>;

export interface PedidoResumoItem {
  id: string;
  nome: string;
  tipo?: string;
  imagem: string;
  valor: number;
  quantidade: number;
}

export interface UltimoPedido {
  ids: string[];
  nome_cliente: string;
  telefone: string;
  senha_retirar_ped: string;
  total: number;
  produtos: PedidoResumoItem[];
}

export interface PedidosCount {
  diario: number;
  semanal: number;
  mensal: number;
  anual: number;
}

