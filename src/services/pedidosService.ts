import { supabase } from "../Utils/supabase";
import {
  AtualizarPedidoDTO,
  CriarPedidoDTO,
  Pedido,
  PedidosCount,
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
  async listarPedidos(): Promise<Pedido[]> {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return anexarProdutos((data ?? []) as Pedido[]);
  },

  async criarPedidos(pedidos: CriarPedidoDTO[]): Promise<Pedido[]> {
    const { data, error } = await supabase
      .from("pedidos")
      .insert(pedidos)
      .select("*");

    if (error) throw error;

    return anexarProdutos((data ?? []) as Pedido[]);
  },

  async atualizarPedidoPorId(
    id: string,
    data: AtualizarPedidoDTO,
  ): Promise<Pedido> {
    const { data: pedidoAtualizado, error } = await supabase
      .from("pedidos")
      .update(data)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    const [pedidoComProduto] = await anexarProdutos([pedidoAtualizado as Pedido]);

    return pedidoComProduto;
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

