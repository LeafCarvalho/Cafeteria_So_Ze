import { useCallback, useEffect, useState } from "react";
import { pedidosService } from "@/services/pedidosService";
import type { AsyncResource } from "@/types/async";
import type { PedidosCount } from "@/types/pedidos";
import { logError } from "@/Utils/logger";

const resumoInicial: PedidosCount = {
  diario: 0,
  semanal: 0,
  mensal: 0,
  anual: 0,
};

export function useResumoPedidos(): AsyncResource<PedidosCount> {
  const [data, setData] = useState<PedidosCount>(resumoInicial);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const pedidos = await pedidosService.listarPedidos();
      setData(pedidosService.calcularResumo(pedidos));
    } catch (error) {
      logError(error, {
        operation: "admin.resumo-pedidos.carregar",
        category: "indisponibilidade",
      });
      setErro("Não foi possível carregar o resumo dos pedidos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  return { data, loading, erro, recarregar };
}
