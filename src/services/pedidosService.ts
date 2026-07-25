import { supabase } from "../Utils/supabase";
import {
  AtualizarStatusPedidoAdminDTO,
  ConfirmacaoCriada,
  CriarPedidoConfirmadoDTO,
  Pedido,
  PedidosCount,
  UltimoPedido,
} from "../types/pedidos";
import { Produto } from "../types/produtos";

const mapProdutosPorId = (produtos: Produto[]) =>
  produtos.reduce<Record<string, Produto>>((acc, produto) => {
    acc[produto.id] = produto;
    return acc;
  }, {});

async function anexarProdutos(pedidos: Pedido[]): Promise<Pedido[]> {
  const produtoIds = [...new Set(pedidos.map((pedido) => pedido.produto_id))];

  if (produtoIds.length === 0) {
    return pedidos;
  }

  const { data: produtos, error } = await supabase
    .from("produtos")
    .select("*")
    .in("id", produtoIds);

  if (error) throw error;

  const produtosPorId = mapProdutosPorId((produtos ?? []) as Produto[]);

  return pedidos.map((pedido) => ({
    ...pedido,
    produto: produtosPorId[pedido.produto_id] ?? null,
  }));
}

export const pedidosService = {
  async criarPedidoConfirmado(
    pedido: CriarPedidoConfirmadoDTO,
  ): Promise<ConfirmacaoCriada> {
    const { data, error } = await supabase.rpc("criar_pedido_confirmado", {
      p_nome_cliente: pedido.nome_cliente,
      p_telefone: pedido.telefone,
      p_itens: pedido.itens,
      p_chave_idempotencia: pedido.chave_idempotencia,
    });

    if (error) throw error;

    const confirmacao = (data ?? [])[0] as ConfirmacaoCriada | undefined;

    if (!confirmacao) {
      throw new Error("O pedido foi criado sem uma confirmação válida.");
    }

    return {
      ...confirmacao,
      total: Number(confirmacao.total),
    };
  },

  async recuperarConfirmacao(
    confirmacaoId: string,
    codigoRetirada: string,
  ): Promise<UltimoPedido | null> {
    const { data, error } = await supabase.rpc("recuperar_confirmacao_pedido", {
      p_confirmacao_id: confirmacaoId,
      p_codigo_retirada: codigoRetirada,
    });

    if (error) throw error;

    const confirmacao = (data ?? [])[0] as
      | {
          confirmacao_id: string;
          nome_cliente: string;
          codigo_retirada: string;
          expira_em: string;
          total: number;
          itens: Array<{
            produto_id: string;
            nome: string;
            imagem: string;
            quantidade: number;
            valor_unitario: number;
          }>;
        }
      | undefined;

    if (!confirmacao) return null;

    return {
      confirmacao_id: confirmacao.confirmacao_id,
      nome_cliente: confirmacao.nome_cliente,
      senha_retirar_ped: confirmacao.codigo_retirada,
      expira_em: confirmacao.expira_em,
      total: Number(confirmacao.total),
      produtos: (confirmacao.itens ?? []).map((item) => ({
        id: item.produto_id,
        nome: item.nome,
        imagem: item.imagem,
        valor: Number(item.valor_unitario),
        quantidade: Number(item.quantidade),
      })),
    };
  },

  async listarPedidos(): Promise<Pedido[]> {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return anexarProdutos((data ?? []) as Pedido[]);
  },

  async atualizarStatusPedidoAdmin({
    pedido_id,
    status_atual,
    novo_status,
  }: AtualizarStatusPedidoAdminDTO): Promise<void> {
    const { error } = await supabase.rpc("atualizar_status_pedido_admin", {
      p_pedido_id: pedido_id,
      p_status_esperado: status_atual,
      p_novo_status: novo_status,
    });

    if (error) throw error;
  },

  calcularResumo(pedidos: Pedido[]): PedidosCount {
    const hoje = new Date();
    const inicioDoAno = new Date(hoje.getFullYear(), 0, 1);
    const inicioDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const inicioDaSemana = new Date(hoje);
    inicioDaSemana.setDate(hoje.getDate() - hoje.getDay());
    inicioDaSemana.setHours(0, 0, 0, 0);
    const inicioDoDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

    return pedidos.reduce<PedidosCount>(
      (count, pedido) => {
        const dataPedido = new Date(pedido.created_at);

        if (dataPedido >= inicioDoDia) count.diario += 1;
        if (dataPedido >= inicioDaSemana) count.semanal += 1;
        if (dataPedido >= inicioDoMes) count.mensal += 1;
        if (dataPedido >= inicioDoAno) count.anual += 1;

        return count;
      },
      { diario: 0, semanal: 0, mensal: 0, anual: 0 },
    );
  },
};
