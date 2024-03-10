import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useCart } from '../../Context/CartContext';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, DocumentReference } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import './style.scss';
import { DefaultButton } from '../../Utils/Buttons/Buttons';

interface Product {
  id: string;
  imagem: string;
  nome: string;
  tipo: string;
  valor: number;
}

interface CartItem extends Product {
  quantity: number;
}

const Pedidos: React.FC = () => {
  const { quantities, products, setQuantities, setLastOrder } = useCart();

  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const navigate = useNavigate();

  const cartItems: CartItem[] = Object.entries(quantities)
    .filter(([_, quantity]) => quantity > 0)
    .map(([id, quantity]) => {
      const product = products.find((product): product is Product => Boolean(product.id) && product.id === id);
      return product ? { ...product, quantity } : null;
    })
    .filter(Boolean) as CartItem[];


  const totalValue = cartItems.reduce((total, item) => total + item.valor * item.quantity, 0);

  const formattedTotalValue = totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => setName(event.target.value);
  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value.replace(/\D/g, '');
    let formattedValue = '';

    if (value.length > 2) {
      formattedValue += `(${value.substring(0, 2)}) `;
      value = value.substring(2);
    }

    if (value.length > 5) {
      formattedValue += `${value.substring(0, 5)}-${value.substring(5, 9)}`;
    } else {
      formattedValue += value;
    }

    setPhone(formattedValue);
  };

  const generateRandomPassword = (): string => {
    const timestamp = new Date().getTime();
    return `${timestamp}-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (phone && cartItems.length > 0) {
      const pedido = {
        produtos: cartItems.map(item => ({
          imagem: item.imagem,
          nome: item.nome,
          tipo: item.tipo,
          valor: item.valor,
          quantidade: item.quantity,
        })),
        total: totalValue,
        nome_completo: name,
        telefone: phone,
        senha: generateRandomPassword(),
        data_hora: new Date(),
        status: "Em Andamento",
      };
      try {
        const docRef: DocumentReference = await addDoc(collection(db, "pedidos"), pedido);
        setLastOrder({ ...pedido, docId: docRef.id });
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
          <DefaultButton customizarCSS="voltarButton" onClick={() => navigate(-1)}>Voltar</DefaultButton>
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
              <Button style={{ marginTop: "1.5rem" }} type="submit">Finalizar Pedido</Button>
            </Form>
          </div>
        </Col>
        <Col>
          <div className="pedido-resumo">
            <h2>Seu Pedido</h2>
            {cartItems.map((item: CartItem) => (
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
