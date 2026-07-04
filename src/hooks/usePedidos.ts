import { useEffect, useState } from "react";
import { pedidosService } from "../services/pedidosService";
import { AtualizarPedidoDTO, Pedido } from "../types/pedidos";

export function usePedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarPedidos = async () => {
    try {
      setLoading(true);
      setErro(null);

      const pedidosCarregados = await pedidosService.listarPedidos();

      setPedidos(pedidosCarregados);
    } catch (error) {
      console.error(error);
      setErro("Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPedidos();
  }, []);

  const atualizarPedido = async (
    id: string,
    data: AtualizarPedidoDTO,
  ): Promise<boolean> => {
    try {
      setErro(null);

      const pedidoAtualizado = await pedidosService.atualizarPedidoPorId(id, data);

      setPedidos((pedidosAtuais) =>
        pedidosAtuais.map((pedido) =>
          pedido.id === id ? pedidoAtualizado : pedido,
        ),
      );

      return true;
    } catch (error) {
      console.error(error);
      setErro("Erro ao atualizar pedido");
      return false;
    }
  };

  return {
    pedidos,
    loading,
    erro,
    carregarPedidos,
    atualizarPedido,
  };
}

