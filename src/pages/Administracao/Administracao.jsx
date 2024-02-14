import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../services/firebaseConfig";
import { signOut } from "firebase/auth";
import { Container, Row, Col, Nav, Accordion } from "react-bootstrap";
import "./style.scss";
import Inicio from "../../components/Administracao/Inicio/Inicio";
import TodosProdutos from "../../components/Administracao/Produtos/TodosProdutos/TodosProdutos";
import Cadastro from "../../components/Administracao/Produtos/Cadastro/Cadastro";
import Pedidos from "../../components/Administracao/Pedidos/Pedidos";

const Administracao = () => {
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState("inicio");

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleSelect = (selectedKey) => {
    setActiveKey(selectedKey);
    if (selectedKey === "logout") {
      handleLogout();
    }
  };

  return (
    <Container fluid className="admin-container">
      <Row className="w-100">
        <Col xs={3} id="sidebar-wrapper">
          <Nav className="flex-column sidebar-nav h-100">
            <Nav.Link eventKey="inicio" onClick={() => setActiveKey("inicio")}>
              Início
            </Nav.Link>
            <Nav.Link eventKey="pedidos" onClick={() => setActiveKey("pedidos")}>
              Pedidos
            </Nav.Link>
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Produtos</Accordion.Header>
                <Accordion.Body>
                  <Nav.Link
                    eventKey="todosProdutos"
                    onClick={() => setActiveKey("todosProdutos")}
                  >
                    Todos os Produtos
                  </Nav.Link>
                  <Nav.Link
                    eventKey="cadastro"
                    onClick={() => setActiveKey("cadastro")}
                  >
                    Cadastro
                  </Nav.Link>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>

            <Nav.Link eventKey="logout" onClick={handleLogout}>
              Logout
            </Nav.Link>
          </Nav>
        </Col>
        <Col xs={9} id="page-content-wrapper">
          {activeKey === "inicio" && <Inicio />}
          {activeKey === "pedidos" && <Pedidos />}
          {activeKey === "todosProdutos" && <TodosProdutos />}
          {activeKey === "cadastro" && <Cadastro />}
        </Col>
      </Row>
    </Container>
  );
};

export default Administracao;
