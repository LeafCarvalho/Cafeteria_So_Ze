import { useState } from 'react';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '../../services/firebaseConfig';

const Cadastro = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [
    createUserWithEmailAndPassword,
    user,
    loading,
    error,
  ] = useCreateUserWithEmailAndPassword(auth);

  function handleSignOut(e) {
    e.preventDefault();
    createUserWithEmailAndPassword(email, password);
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
        <p>Email cadastrado: {user.user.email}</p>
      </div>
    );
  }

  return (
    <div className="App">
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
      <button onClick={handleSignOut}>
        Criar Conta
      </button>
    </div>
  );
};

export default Cadastro;