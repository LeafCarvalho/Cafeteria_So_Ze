import React, { useState } from "react";
import { useCart } from "../../Context/CartContext";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";


const Pedidos = () => {
  const { quantities, products } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handlePhoneChange = (event) => {
    setPhone(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formattedPhoneNumber = formatPhoneNumber(phone);
    if (formattedPhoneNumber) {
      // Submit the form with the formatted phone number
    } else {
      // Show an error message
    }
  };

  const cartItems = Object.entries(quantities)
    .filter(([_, quantity]) => quantity > 0)
    .map(([id, quantity]) => {
      const product = products.find((product) => product.id === id);
      return product ? { ...product, quantity } : null;
    })
    .filter(Boolean);

    function formatPhoneNumber(phoneNumberString) {
      const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
      const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
      if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
      }
      return null;
    }

  return (
    <Container>
      <Row>
        <Col>
        <Button variant="secondary" onClick={handleBackClick}>
            Voltar
          </Button>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formName">
              <Form.Label>Nome completo</Form.Label>
              <Form.Control type="text" value={name} onChange={handleNameChange} required />
            </Form.Group>

            <Form.Group controlId="formPhone">
              <Form.Label>Telefone</Form.Label>
              <Form.Control type="tel" value={phone} onChange={handlePhoneChange} required />
            </Form.Group>

            <Button variant="primary" type="submit">
              Enviar Pedido
            </Button>
          </Form>
        </Col>
        <Col>
          <h2>Seu Pedido</h2>
          {cartItems.map((item) => (
            <div key={item.id}>
              <h3>{item.nome}</h3>
              <p>Quantidade: {item.quantity}</p>
              <p>Preço: {item.valor}</p>
            </div>
          ))}
        </Col>
      </Row>
    </Container>
  );
};

export default Pedidos;