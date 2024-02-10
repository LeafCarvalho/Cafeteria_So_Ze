import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../services/firebaseConfig';
import { signOut } from 'firebase/auth';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import './style.scss';

const Administracao = () => {
    const navigate = useNavigate();
    const [activeKey, setActiveKey] = useState('inicio');

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login'); // Redireciona para a página de login após o logout
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        }
    };

    const handleSelect = (selectedKey) => {
        setActiveKey(selectedKey);
        if (selectedKey === 'logout') {
            handleLogout(); // Chama a função de logout quando o Logout é selecionado
        }
    };

    return (
        <Container fluid className="admin-container">
            <Row>
                <Col xs={2} id="sidebar-wrapper">
                    <Nav className="flex-column" variant="pills" activeKey={activeKey} onSelect={handleSelect}>
                        <Nav.Link eventKey="inicio">Início</Nav.Link>
                        <Nav.Link eventKey="todosProdutos">Todos os Produtos</Nav.Link>
                        <Nav.Link eventKey="cadastro">Cadastro</Nav.Link>
                        <Nav.Link eventKey="todosPedidos">Todos os Pedidos</Nav.Link>
                        <Nav.Link eventKey="emAndamento">Em Andamento</Nav.Link>
                        <Nav.Link eventKey="finalizados">Finalizados</Nav.Link>
                        <Nav.Link eventKey="logout" onSelect={handleLogout}>Logout</Nav.Link>
                    </Nav>
                </Col>
                <Col xs={10} id="page-content-wrapper">
                    {/* Conteúdo da administração com base na seleção do menu */}
                    {activeKey === 'inicio' && <h1>Início</h1>}
                    {activeKey === 'todosProdutos' && <h1>Todos os Produtos</h1>}
                    {activeKey === 'cadastro' && <h1>Cadastro</h1>}
                    {activeKey === 'todosPedidos' && <h1>Todos os Pedidos</h1>}
                    {activeKey === 'emAndamento' && <h1>Em Andamento</h1>}
                    {activeKey === 'finalizados' && <h1>Finalizados</h1>}
                </Col>
            </Row>
        </Container>
    );
};

export default Administracao;
