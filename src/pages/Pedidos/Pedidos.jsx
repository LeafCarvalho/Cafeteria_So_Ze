import React, { useState } from 'react';
import { useCart } from '../../Context/CartContext';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import './style.scss';

const Pedidos = () => {
  const { quantities, products, setQuantities, setLastOrder } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const cartItems = Object.entries(quantities)
    .filter(([_, quantity]) => quantity > 0)
    .map(([id, quantity]) => {
      const product = products.find(product => product.id === id);
      return product ? { ...product, quantity } : null;
    })
    .filter(Boolean);

  const totalValue = cartItems.reduce((total, item) => total + item.valor * item.quantity, 0);

  const formattedTotalValue = totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleNameChange = (event) => setName(event.target.value);
  const handlePhoneChange = (event) => {
    let value = event.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
    let formattedValue = '';

    if (value.length > 2) {
      formattedValue += `(${value.substring(0, 2)}) `; // Adiciona o DDD com parênteses
      value = value.substring(2);
    }

    if (value.length > 5) {
      formattedValue += `${value.substring(0, 5)}-${value.substring(5, 9)}`; // Separa os 5 primeiros dos 4 últimos dígitos com um hífen
    } else {
      formattedValue += value; // Mantém o restante do número sem formatação
    }

    setPhone(formattedValue); // Atualiza o estado com o valor formatado
  };

  function generateRandomPassword() {
    const timestamp = new Date().getTime();
    return `${timestamp}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const telefone = phone;
    console.log("telefone:", telefone);
    const senha = generateRandomPassword();
    console.log("senha:", senha);

    if (telefone && cartItems.length > 0) {
      const pedido = {
        produtos: cartItems.map(item => ({
          imagem: item.imagem,
          nome: item.nome,
          tipo: item.tipo,
          valor: item.valor,
          quantidade: item.quantity
        })),
        total: totalValue,
        nome_completo: name,
        telefone: telefone,
        senha: senha,
      };
      try {
        const docRef = await addDoc(collection(db, "pedidos"), pedido);
        setLastOrder({ ...pedido, senha, docId: docRef.id });
        setQuantities({});
        navigate('/efetuacao');
      } catch (error) {
        console.error("Erro ao enviar o pedido:", error);
        alert("Erro ao enviar o pedido.");
      }
    } else {
      alert("Número de telefone inválido ou carrinho vazio.");
    }
  };

  return (
    <Container className="pedidos-page">
      <Row>
        <Col>
          <Button variant="secondary" onClick={() => navigate(-1)}>Voltar</Button>
          <div className="pedido-form">
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formName">
                <Form.Label>Nome completo</Form.Label>
                <Form.Control type="text" value={name} onChange={handleNameChange} required />
              </Form.Group>
              <Form.Group controlId="formPhone">
                <Form.Label>Telefone</Form.Label>
                <Form.Control type="tel" value={phone} onChange={handlePhoneChange} placeholder="(XX) XXXXX-XXXX" required />
              </Form.Group>
              <Button variant="primary" type="submit">Finalizar Pedido</Button>
            </Form>
          </div>
        </Col>
        <Col>
          <div className="pedido-resumo">
            <h2>Seu Pedido</h2>
            {cartItems.map((item) => (
              <div key={item.id} className="item">
                <img src={item.imagem} alt={item.nome} />
                <div className="info">
                  <h3>{item.nome}</h3>
                  <p>Quantidade: {item.quantity}</p>
                  <p>Preço: {item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
              </div>
            ))}
            <div className="total">Valor Total: {formattedTotalValue}</div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Pedidos;
