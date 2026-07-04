import { supabase } from "../Utils/supabase";

export const authService = {
  async login(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  async logout() {
    return supabase.auth.signOut();
  },

  async recuperarSenha(email: string) {
    return supabase.auth.resetPasswordForEmail(email);
  },

  async obterSessao() {
    return supabase.auth.getSession();
  },
};

