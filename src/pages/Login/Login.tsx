import React, { ChangeEvent, FormEvent, useState } from "react";
import { Alert, Container, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { DefaultButton } from "../../Utils/Buttons/Buttons";
import { authService } from "../../services/authService";
import "./style.scss";

interface LoginState {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [loginState, setLoginState] = useState<LoginState>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignIn = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const { error: loginError } = await authService.login(
        loginState.email,
        loginState.password,
      );

      if (loginError) {
        setError(loginError.message);
        return;
      }

      navigate("/administracao");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setLoginState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleForgotPassword = async (): Promise<void> => {
    if (!loginState.email) {
      setError("Por favor, insira seu e-mail para redefinição de senha.");
      return;
    }

    const { error: resetError } = await authService.recuperarSenha(
      loginState.email,
    );

    setError(
      resetError
        ? resetError.message
        : "Link de redefinição de senha enviado. Verifique seu e-mail.",
    );
  };

  return (
    <Container>
      <Form onSubmit={handleSignIn}>
        <Form.Group controlId="loginEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={loginState.email}
            onChange={handleInputChange}
          />
        </Form.Group>
        <Form.Group controlId="loginPassword">
          <Form.Label>Senha</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={loginState.password}
            onChange={handleInputChange}
          />
        </Form.Group>
        <DefaultButton customizarCSS="loginButton" type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Login"}
        </DefaultButton>
        <DefaultButton
          customizarCSS="esqueceuSenhaButton"
          onClick={handleForgotPassword}
        >
          Esqueceu a senha?
        </DefaultButton>
      </Form>
      {error && (
        <Alert variant="danger" style={{ marginTop: "1rem" }}>
          {error}
        </Alert>
      )}
    </Container>
  );
};

export default Login;

