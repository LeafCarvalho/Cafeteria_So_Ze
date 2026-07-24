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

export interface ItemCriarPedidoConfirmadoDTO {
  produto_id: string;
  quantidade: number;
}

export interface CriarPedidoConfirmadoDTO {
  nome_cliente: string;
  telefone: string;
  itens: ItemCriarPedidoConfirmadoDTO[];
}

export interface ConfirmacaoCriada {
  confirmacao_id: string;
  codigo_retirada: string;
  expira_em: string;
  total: number;
}

export interface DadosAcessoConfirmacao {
  confirmacaoId: string;
  codigoRetirada: string;
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
  confirmacao_id: string;
  nome_cliente: string;
  senha_retirar_ped: string;
  expira_em: string;
  total: number;
  produtos: PedidoResumoItem[];
}

export interface PedidosCount {
  diario: number;
  semanal: number;
  mensal: number;
  anual: number;
}
