import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../../services/firebaseConfig';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';




function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [
        signInWithEmailAndPassword,
        user,
        loading,
        error,
    ] = useSignInWithEmailAndPassword(auth);

    function handleSignIn(e) {
        e.preventDefault();
        signInWithEmailAndPassword(email, password);
    }

    if (error) {
        return (
          <div>
            <p>Error: {error.message}</p>
          </div>
        );
      }
      if (loading) {
        return <p>Carregando...</p>;
      }
      if (user) {
        return (
          <div>
            <p>Email logado: {user.user.email}</p>
          </div>
        );
      }

  return (
    <>
    <Header />
    <input
    type="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
  <input
    type="Senha"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />
      <button type="submit" onClick={handleSignIn}>Login</button>
      <p>
        <span>Não possui conta ainda?</span>
        <Link as={Link} to="/cadastro">Cadastre-se</Link>
      </p>
      <Footer />
      </>
  );
}

export default Login;