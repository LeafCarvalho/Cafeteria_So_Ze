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

export interface ItemCriarPedidoConfirmadoDTO {
  produto_id: string;
  quantidade: number;
}

export interface CriarPedidoConfirmadoDTO {
  nome_cliente: string;
  telefone: string;
  itens: ItemCriarPedidoConfirmadoDTO[];
  chave_idempotencia: string;
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

export interface AtualizarStatusPedidoAdminDTO {
  pedido_id: string;
  status_atual: PedidoStatus;
  novo_status: PedidoStatus;
}

export type ResultadoAtualizacaoStatusPedido = "atualizado" | "conflito" | "erro";

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
