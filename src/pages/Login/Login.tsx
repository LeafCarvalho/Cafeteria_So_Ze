import React, { ChangeEvent, FormEvent, useState } from "react";
import { Alert, Container, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { DefaultButton } from "@/Utils/Buttons/Buttons";
import "./style.scss";

interface LoginState {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [loginState, setLoginState] = useState<LoginState>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error: loginError } = await authService.login(loginState.email, loginState.password);

      if (loginError) {
        setError(loginError.message);
        return;
      }

      navigate("/administracao");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setLoginState((previous) => ({ ...previous, [name]: value }));
  };

  const handleForgotPassword = async () => {
    setError(null);
    setMessage(null);

    if (!loginState.email) {
      setError("Informe seu e-mail para redefinir a senha.");
      return;
    }

    const { error: resetError } = await authService.recuperarSenha(loginState.email);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage("Enviamos um link de redefinição para o seu e-mail.");
  };

  return (
    <main className="login-page">
      <Container className="login-page__container">
        <section aria-labelledby="login-title" className="login-card">
          <p className="login-card__eyebrow">Área administrativa</p>
          <h1 id="login-title">Boas-vindas de volta</h1>
          <p className="login-card__description">Acesse para cuidar do cardápio e acompanhar os pedidos.</p>
          <Form onSubmit={handleSignIn}>
            <Form.Group controlId="loginEmail">
              <Form.Label>E-mail</Form.Label>
              <Form.Control autoComplete="email" name="email" onChange={handleInputChange} required type="email" value={loginState.email} />
            </Form.Group>
            <Form.Group controlId="loginPassword">
              <Form.Label>Senha</Form.Label>
              <Form.Control autoComplete="current-password" name="password" onChange={handleInputChange} required type="password" value={loginState.password} />
            </Form.Group>
            <DefaultButton customizarCSS="loginButton" disabled={loading} type="submit">
              {loading ? "Entrando..." : "Entrar"}
            </DefaultButton>
            <button className="forgot-password" onClick={() => void handleForgotPassword()} type="button">
              Esqueceu a senha?
            </button>
          </Form>
          {error && <Alert className="login-feedback" role="alert" variant="danger">{error}</Alert>}
          {message && <Alert className="login-feedback" role="status" variant="success">{message}</Alert>}
        </section>
      </Container>
    </main>
  );
};

export default Login;
