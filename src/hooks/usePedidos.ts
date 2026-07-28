import { useEffect, useState } from "react";
import { pedidosService } from "@/services/pedidosService";
import {
  AtualizarStatusPedidoAdminDTO,
  Pedido,
  ResultadoAtualizacaoStatusPedido,
} from "@/types/pedidos";

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

  const atualizarStatusPedido = async (
    data: AtualizarStatusPedidoAdminDTO,
  ): Promise<ResultadoAtualizacaoStatusPedido> => {
    try {
      setErro(null);

      await pedidosService.atualizarStatusPedidoAdmin(data);
      await carregarPedidos();
      return "atualizado";
    } catch (error) {
      console.error(error);
      // A RPC rejeita tanto uma transição inválida quanto um status desatualizado.
      // Recarregar evita uma nova ação sobre dados possivelmente defasados.
      await carregarPedidos();

      const mensagem =
        error instanceof Error ? error.message.toLowerCase() : "";
      const codigo =
        typeof error === "object" && error !== null && "code" in error
          ? String(error.code)
          : "";
      const conflito =
        codigo === "40001" ||
        codigo === "P0002" ||
        /conflito|status (atual|desatualizado)|transição/.test(mensagem);

      if (!conflito) setErro("Erro ao atualizar pedido");
      return conflito ? "conflito" : "erro";
    }
  };

  return {
    pedidos,
    loading,
    erro,
    carregarPedidos,
    atualizarStatusPedido,
  };
}
