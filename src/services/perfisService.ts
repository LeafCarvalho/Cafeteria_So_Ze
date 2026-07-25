import { User } from "@supabase/supabase-js";
import { supabase } from "@/Utils/supabase";
import { Perfil } from "@/types/perfis";

const perfilEhAdmin = (perfil: Perfil | null): boolean => {
  if (!perfil) return false;

  return (
    perfil.admin === true ||
    perfil.role === "admin" ||
    perfil.tipo === "admin"
  );
};

export const perfisService = {
  async usuarioEhAdmin(user: User | null): Promise<boolean> {
    if (!user) return false;

    const { data, error } = await supabase
      .from("perfis")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar perfil:", error);
      return false;
    }

    return perfilEhAdmin(data as Perfil | null);
  },
};
