import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { authService } from "../services/authService";
import { perfisService } from "../services/perfisService";
import "./style.scss";

const PrivateRoute = () => {
  const [loading, setLoading] = useState(true);
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const validarAcesso = async () => {
      try {
        setLoading(true);

        const { data } = await authService.obterSessao();
        const user = data.session?.user ?? null;
        const isAdmin = await perfisService.usuarioEhAdmin(user);

        setAutorizado(Boolean(user && isAdmin));
      } catch (error) {
        console.error("Erro ao validar acesso:", error);
        setAutorizado(false);
      } finally {
        setLoading(false);
      }
    };

    validarAcesso();
  }, []);

  if (loading) {
    return (
      <main className="route-loading" role="status">
        <span aria-hidden="true" />
        <p>Carregando área administrativa...</p>
      </main>
    );
  }

  return autorizado ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
