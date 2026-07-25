import React, { FunctionComponent, useEffect, useState } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { FiShoppingBag } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { Link as ScrollLink, scroller } from "react-scroll";
import { useCart } from "@/Context/CartContext";
import logo from "@/assets/logoCafeteria-v2.png";
import "./style.scss";

interface HeaderProps {
  to: string;
  scroll: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: (event?: React.MouseEvent<HTMLElement>) => void;
}

const ScrollOrRouteLink: FunctionComponent<HeaderProps> = ({
  to,
  scroll,
  children,
  className,
  onClick,
}) => {
  const { pathname } = useLocation();

  const handleScroll = (event?: React.MouseEvent<HTMLElement>) => {
    onClick?.(event);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    scroller.scrollTo(to, {
      duration: reducedMotion ? 0 : 550,
      smooth: reducedMotion ? false : "easeInOutQuart",
      offset: -88,
    });
  };

  return pathname === "/" && scroll ? (
    <ScrollLink
      className={className}
      duration={0}
      onClick={handleScroll}
      smooth={false}
      to={to}
    >
      {children}
    </ScrollLink>
  ) : (
    <Link className={className} onClick={onClick} state={{ scrollTo: to }} to="/">
      {children}
    </Link>
  );
};

export function Header() {
  const {
    total,
    itemQuantities,
    isCartOpen,
    setIsCartOpen,
    setCartTriggerId,
  } = useCart();
  const [sticky, setSticky] = useState(false);
  const { pathname } = useLocation();
  const [expanded, setExpanded] = useState(false);
  const cartItemCount = Object.values(itemQuantities).filter((quantity) => quantity > 0).length;

  const handleCartClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setCartTriggerId(event.currentTarget.id);
    setIsCartOpen(!isCartOpen);
  };

  useEffect(() => {
    const handleScroll = () => setSticky(window.scrollY > 0);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeNavbar = () => setExpanded(false);
  const totalFormatado = total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const CartTrigger = ({ id, className }: { id: string; className: string }) => (
    <button
      aria-controls="cart-drawer"
      aria-expanded={isCartOpen}
      aria-label={`Abrir carrinho: ${cartItemCount} ${cartItemCount === 1 ? "item" : "itens"}, total ${totalFormatado}`}
      className={className}
      id={id}
      onClick={handleCartClick}
      type="button"
    >
      <FiShoppingBag aria-hidden="true" />
      <span className="cart-trigger__details">
        <span>{cartItemCount} {cartItemCount === 1 ? "item" : "itens"}</span>
        <strong>{totalFormatado}</strong>
      </span>
    </button>
  );

  return (
    <Navbar
      collapseOnSelect
      expand="lg"
      className={`w-100 position-sticky ${sticky ? "navbar-sticky" : ""}`}
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container>
        <button
          aria-controls="responsive-navbar-nav"
          aria-expanded={expanded}
          aria-label={expanded ? "Fechar menu principal" : "Abrir menu principal"}
          className="navbar-toggler navbar-toggler--mobile"
          onClick={() => setExpanded(!expanded)}
          type="button"
        >
          <span aria-hidden="true" className="navbar-toggler__icon" />
        </button>

        <Navbar.Brand as={Link} to="/">
          <img alt="Cafeteria Sô Zé" className="logoCafeteria" src={logo} />
        </Navbar.Brand>

        {pathname !== "/login" && (
          <CartTrigger className="cart-trigger cart-trigger--mobile d-lg-none" id="cart-trigger-mobile" />
        )}

        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={ScrollOrRouteLink} onClick={closeNavbar} scroll to="home">
              Início
            </Nav.Link>
            <Nav.Link as={ScrollOrRouteLink} onClick={closeNavbar} scroll to="produtos">
              Produtos
            </Nav.Link>
          </Nav>
          <Nav className="align-items-lg-center">
            <Nav.Link as={Link} to="/login">
              Entrar
            </Nav.Link>
            {pathname !== "/login" && (
              <CartTrigger className="cart-trigger cart-trigger--desktop d-none d-lg-inline-flex" id="cart-trigger-desktop" />
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
