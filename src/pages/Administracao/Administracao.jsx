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
import { FiLogOut } from "react-icons/fi";

const Administracao = () => {
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState("inicio");
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <Container fluid className="admin-container">
      <button
        className="menu-toggle"
        onClick={() => setSidebarVisible(!isSidebarVisible)}
      >
        <span>☰</span>
      </button>
      <Row className="w-100">
        <Col
          xs={3}
          lg={3}
          md={4}
          sm={3}
          id="sidebar-wrapper"
          className={`sidebar-nav h-100 ${isSidebarVisible ? "active" : ""}`}
        >
          <Nav className="flex-column sidebar-nav h-100">
            <Nav.Link
              eventKey="inicio"
              onClick={() => {
                setActiveKey("inicio");
                setSidebarVisible(false);
              }}
            >
              Início
            </Nav.Link>
            <Nav.Link
              eventKey="pedidos"
              onClick={() => {
                setActiveKey("pedidos");
                setSidebarVisible(false);
              }}
            >
              Pedidos
            </Nav.Link>
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Produtos</Accordion.Header>
                <Accordion.Body>
                  <Nav.Link
                    eventKey="todosProdutos"
                    onClick={() => {
                      setActiveKey("todosProdutos");
                      setSidebarVisible(false);
                    }}
                  >
                    Todos os Produtos
                  </Nav.Link>
                  <Nav.Link
                    eventKey="cadastro"
                    onClick={() => {
                      setActiveKey("cadastro");
                      setSidebarVisible(false);
                    }}
                  >
                    Cadastro
                  </Nav.Link>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>

            <Nav.Link
              eventKey="logout"
              onClick={() => {
                handleLogout();
                setSidebarVisible(false);
              }}
              className="logout-link"
            >
              <FiLogOut className="me-2" />
              Logout
            </Nav.Link>
          </Nav>
        </Col>
        <Col xs={9} lg={9} md={8} sm={7} id="page-content-wrapper">
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
