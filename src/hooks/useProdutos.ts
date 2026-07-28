import { useEffect, useState } from "react";
import { produtosService } from "@/services/produtosService";
import { AtualizarProdutoDTO, Produto } from "@/types/produtos";
import { logError } from "@/Utils/logger";

export function useProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      setErro(null);

      const produtos = await produtosService.listarProdutos();

      setProdutos(produtos);
    } catch (error) {
      logError(error, {
        operation: "admin.produtos.carregar",
        category: "indisponibilidade",
      });
      setErro("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const atualizarProduto = async (
    id: string,
    data: AtualizarProdutoDTO,
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setErro(null);

      const produtoAtualizado = await produtosService.atualizarProdutoPorId(
        id,
        data,
      );

      setProdutos((produtosAtuais) =>
        produtosAtuais.map((produto) =>
          produto.id === id ? produtoAtualizado : produto,
        ),
      );

      return true;
    } catch (error) {
      logError(error, {
        operation: "admin.produtos.atualizar",
        category: "indisponibilidade",
      });
      setErro("Erro ao atualizar produto");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deletarProduto = async (id: string): Promise<boolean> => {
    try {
      setErro(null);

      await produtosService.deletarProdutoPorId(id);

      setProdutos((produtosAtuais) =>
        produtosAtuais.filter((produto) => produto.id !== id),
      );

      return true;
    } catch (error) {
      logError(error, {
        operation: "admin.produtos.deletar",
        category: "indisponibilidade",
      });
      setErro("Erro ao deletar produto");
      return false;
    }
  };

  return {
    produtos,
    loading,
    erro,
    carregarProdutos,
    atualizarProduto,
    deletarProduto,
  };
}
