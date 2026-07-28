import { useCallback, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { authService } from "@/services/authService";
import { perfisService } from "@/services/perfisService";
import { logError } from "@/Utils/logger";
import "./style.scss";

const PrivateRoute = () => {
  const [loading, setLoading] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [erroValidacao, setErroValidacao] = useState(false);

  const validarAcesso = useCallback(async () => {
    try {
      setLoading(true);
      setErroValidacao(false);

      const { data, error } = await authService.obterSessao();
      if (error) throw error;

      const user = data.session?.user ?? null;
      const isAdmin = await perfisService.usuarioEhAdmin(user);

      setAutorizado(Boolean(user && isAdmin));
    } catch (error) {
      logError(error, {
        operation: "admin.acesso.validar",
        category: "indisponibilidade",
      });
      setAutorizado(false);
      setErroValidacao(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void validarAcesso();
  }, [validarAcesso]);

  if (loading) {
    return (
      <main className="route-loading" role="status">
        <span aria-hidden="true" />
        <p>Carregando área administrativa...</p>
      </main>
    );
  }

  if (erroValidacao) {
    return (
      <main className="route-loading route-loading--error" role="alert">
        <p>Não foi possível validar o acesso administrativo.</p>
        <button type="button" onClick={() => void validarAcesso()}>
          Tentar novamente
        </button>
      </main>
    );
  }

  return autorizado ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
