import { FormEvent, useEffect, useState } from "react";
import { Alert, Container, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { supabase } from "../../Utils/supabase";
import { DefaultButton } from "../../Utils/Buttons/Buttons";
import { logError } from "@/Utils/logger";
import "./style.scss";

const RedefinirSenha = () => {
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let ativo = true;

    const validarSessao = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!ativo) return;

      if (sessionError || !data.session) {
        setErro(
          "Este link de redefinição é inválido ou expirou. Solicite outro link.",
        );
      }
      setCarregando(false);
    };

    void validarSessao();
    return () => {
      ativo = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro(null);

    if (senha.length < 8) {
      setErro("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (senha !== confirmacaoSenha) {
      setErro("As senhas informadas não são iguais.");
      return;
    }

    try {
      setEnviando(true);
      const { error: updateError } = await authService.atualizarSenha(senha);
      if (updateError) {
        setErro("Não foi possível atualizar sua senha. Solicite um novo link.");
        return;
      }

      await authService.logout();
      navigate("/login", { replace: true });
    } catch (updateError) {
      logError(updateError, {
        operation: "auth.redefinicao-senha.atualizar",
        category: "indisponibilidade",
      });
      setErro("Não foi possível atualizar sua senha. Solicite um novo link.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="redefinir-senha-page">
      <Container className="redefinir-senha-page__container">
        <section
          aria-labelledby="redefinir-senha-title"
          className="redefinir-senha-card"
        >
          <p className="redefinir-senha-card__eyebrow">Área administrativa</p>
          <h1 id="redefinir-senha-title">Crie uma nova senha</h1>
          <p className="redefinir-senha-card__description">
            Escolha uma senha forte para voltar a acessar a administração.
          </p>

          {carregando ? (
            <p role="status">Validando link de redefinição...</p>
          ) : (
            <Form noValidate onSubmit={handleSubmit}>
              <Form.Group controlId="novaSenha">
                <Form.Label>Nova senha</Form.Label>
                <Form.Control
                  autoComplete="new-password"
                  onChange={(event) => setSenha(event.target.value)}
                  required
                  type="password"
                  value={senha}
                />
              </Form.Group>
              <Form.Group controlId="confirmacaoNovaSenha">
                <Form.Label>Confirme a nova senha</Form.Label>
                <Form.Control
                  autoComplete="new-password"
                  onChange={(event) => setConfirmacaoSenha(event.target.value)}
                  required
                  type="password"
                  value={confirmacaoSenha}
                />
              </Form.Group>
              <DefaultButton
                aria-busy={enviando}
                customizarCSS="redefinir-senha-button"
                disabled={Boolean(erro?.includes("inválido")) || enviando}
                type="submit"
              >
                {enviando ? "Salvando nova senha..." : "Salvar nova senha"}
              </DefaultButton>
            </Form>
          )}

          {erro && (
            <Alert
              className="redefinir-senha-feedback"
              role="alert"
              variant="danger"
            >
              {erro}
            </Alert>
          )}
          {!carregando && erro?.includes("inválido") && (
            <button
              className="redefinir-senha-link"
              onClick={() => navigate("/login")}
              type="button"
            >
              Voltar ao login
            </button>
          )}
        </section>
      </Container>
    </main>
  );
};

export default RedefinirSenha;
