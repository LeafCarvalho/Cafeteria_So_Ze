import { useEffect, useRef, useState } from "react";
import { Accordion, Nav } from "react-bootstrap";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Inicio from "../../components/Administracao/Inicio/Inicio";
import Pedidos from "../../components/Administracao/Pedidos/Pedidos";
import Cadastro from "../../components/Administracao/Produtos/Cadastro/Cadastro";
import TodosProdutos from "../../components/Administracao/Produtos/TodosProdutos/TodosProdutos";
import { authService } from "../../services/authService";
import "./style.scss";

const Administracao = () => {
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState("inicio");
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const wasSidebarVisible = useRef(false);

  const closeSidebar = () => setSidebarVisible(false);

  useEffect(() => {
    if (!isSidebarVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSidebar();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarVisible]);

  useEffect(() => {
    if (wasSidebarVisible.current && !isSidebarVisible) menuToggleRef.current?.focus();
    if (isSidebarVisible) sidebarRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    wasSidebarVisible.current = isSidebarVisible;
  }, [isSidebarVisible]);

  const selectPage = (page: string) => {
    setActiveKey(page);
    closeSidebar();
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      closeSidebar();
    }
  };

  return (
    <div className="admin-container">
      <button
        ref={menuToggleRef}
        type="button"
        className="menu-toggle"
        aria-controls="admin-navigation"
        aria-expanded={isSidebarVisible}
        aria-label={isSidebarVisible ? "Fechar menu administrativo" : "Abrir menu administrativo"}
        onClick={() => setSidebarVisible((visible) => !visible)}
      >
        {isSidebarVisible ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
        <span>Menu</span>
      </button>

      <button
        type="button"
        className={`admin-backdrop ${isSidebarVisible ? "is-visible" : ""}`}
        aria-label="Fechar menu administrativo"
        tabIndex={isSidebarVisible ? 0 : -1}
        onClick={closeSidebar}
      />

      <aside
        ref={sidebarRef}
        id="admin-navigation"
        className={`sidebar-nav ${isSidebarVisible ? "is-open" : ""}`}
        aria-label="Navegação administrativa"
      >
        <div className="admin-brand">
          <span>So Zé</span>
          <strong>Administração</strong>
        </div>
        <Nav className="flex-column" activeKey={activeKey}>
          <Nav.Link eventKey="inicio" onClick={() => selectPage("inicio")}>Início</Nav.Link>
          <Nav.Link eventKey="pedidos" onClick={() => selectPage("pedidos")}>Pedidos</Nav.Link>
          <Accordion className="admin-products-nav">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Produtos</Accordion.Header>
              <Accordion.Body>
                <Nav.Link eventKey="todosProdutos" onClick={() => selectPage("todosProdutos")}>Todos os produtos</Nav.Link>
                <Nav.Link eventKey="cadastro" onClick={() => selectPage("cadastro")}>Cadastrar produto</Nav.Link>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
          <button type="button" onClick={handleLogout} className="logout-link">
            <FiLogOut aria-hidden="true" />
            Sair
          </button>
        </Nav>
      </aside>

      <main id="page-content-wrapper" className="admin-content">
        {activeKey === "inicio" && <Inicio />}
        {activeKey === "pedidos" && <Pedidos />}
        {activeKey === "todosProdutos" && <TodosProdutos />}
        {activeKey === "cadastro" && <Cadastro />}
      </main>
    </div>
  );
};

export default Administracao;
