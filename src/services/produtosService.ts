import { AtualizarProdutoDTO, Produto } from "../types/produtos";
import { supabase } from "../Utils/supabase";

export const produtosService = {
  async listarProdutos(): Promise<Produto[]> {
    const { data, error } = await supabase
      .from("produtos")
      .select()
      .order("nome", { ascending: true });

    if (error) throw error;

    return data ?? [];
  },

  async buscarProdutoPorId(id: string): Promise<Produto | null> {
    const { data, error } = await supabase
      .from("produtos")
      .select()
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar produto por id:", error);
      throw error;
    }

    return data;
  },

  async atualizarProdutoPorId(
    id: string,
    data: AtualizarProdutoDTO,
  ): Promise<Produto> {
    const { data: produtoAtualizado, error } = await supabase
      .from("produtos")
      .update(data)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    return produtoAtualizado;
  },

  async deletarProdutoPorId(id: string): Promise<void> {
    const { error } = await supabase.from("produtos").delete().eq("id", id);

    if (error) throw error;
  },
};
