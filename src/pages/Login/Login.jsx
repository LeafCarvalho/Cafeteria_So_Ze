import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../services/firebaseConfig';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Alert, Form, Button, Container } from 'react-bootstrap';
import { DefaultButton } from '../../Utils/Buttons/Buttons';
import './style.scss';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [signInWithEmailAndPassword, user, loading, error] = useSignInWithEmailAndPassword(auth);
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();
        await signInWithEmailAndPassword(email, password);
    };

    const handleForgotPassword = async () => {
        if (!email) {
            alert('Por favor, insira seu e-mail para redefinição de senha.');
            return;
        }
        await sendPasswordResetEmail(auth, email);
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
                    <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </Form.Group>
                <Form.Group controlId="loginPassword">
                    <Form.Label>Senha</Form.Label>
                    <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </Form.Group>
                <DefaultButton customizarCSS="loginButton" type="submit" disabled={loading}>Login</DefaultButton>
                <DefaultButton customizarCSS="esqueceuSenhaButton" onClick={handleForgotPassword}>Esqueceu a senha?</DefaultButton>
            </Form>
            {error && <Alert variant="danger" style={{ marginTop: '1rem' }}>{error.message}</Alert>}
        </Container>
    );
}

export default Login;
