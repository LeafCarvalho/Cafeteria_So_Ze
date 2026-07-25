import { supabase } from "@/Utils/supabase";

const obterUrlRedefinicaoSenha = () =>
  `${window.location.origin}${import.meta.env.BASE_URL}#/redefinir-senha`;

export const authService = {
  async login(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  async logout() {
    return supabase.auth.signOut();
  },

  async recuperarSenha(email: string) {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: obterUrlRedefinicaoSenha(),
    });
  },

  async atualizarSenha(password: string) {
    return supabase.auth.updateUser({ password });
  },

  async obterSessao() {
    return supabase.auth.getSession();
  },
};
