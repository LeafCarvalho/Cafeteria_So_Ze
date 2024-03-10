import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthError } from 'firebase/auth';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '../../services/firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Alert, Form, Container } from 'react-bootstrap';
import { DefaultButton } from '../../Utils/Buttons/Buttons';
import './style.scss';
interface LoginState {
  email: string;
  password: string;
} 

interface LoginFormEvent extends FormEvent<HTMLFormElement> {}
interface LoginChangeEvent extends ChangeEvent<HTMLInputElement> {}

const Login: React.FC = () => {
    const [loginState, setLoginState] = useState<LoginState>({ email: '', password: '' });
    const [signInWithEmailAndPassword, user, loading, error] = useSignInWithEmailAndPassword(auth);
    const navigate = useNavigate();

    const handleSignIn = async (e: LoginFormEvent): Promise<void> => {
        e.preventDefault();
        await signInWithEmailAndPassword(loginState.email, loginState.password);
    };

    const handleInputChange = (e: LoginChangeEvent): void => {
        const { name, value } = e.target;
        setLoginState(prevState => ({ ...prevState, [name]: value }));
    };

    const handleForgotPassword = async (): Promise<void> => {
        if (!loginState.email) {
            alert('Por favor, insira seu e-mail para redefinição de senha.');
            return;
        }
        await sendPasswordResetEmail(auth, loginState.email);
        alert('Link de redefinição de senha enviado. Verifique seu e-mail.');
    };

    if (user) {
        navigate('/administracao');
    }

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
                <DefaultButton customizarCSS="loginButton" type="submit" disabled={loading}>Login</DefaultButton>
                <DefaultButton customizarCSS="esqueceuSenhaButton" onClick={handleForgotPassword}>Esqueceu a senha?</DefaultButton>
            </Form>
            {error && <Alert variant="danger" style={{ marginTop: '1rem' }}>{error.message}</Alert>}
        </Container>
    );
}

export default Login;
