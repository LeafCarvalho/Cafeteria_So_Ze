import React, { useEffect, useState } from "react";
import { Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { Link as ScrollLink, scroller } from "react-scroll";
import "./style.scss";
import { useCart } from "../../Context/CartContext";
import logo from "../../assets/logoCafeteria.png";

const ScrollOrRouteLink = ({ to, scroll, children, className, ...rest }) => {
  const { pathname } = useLocation();
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    if (rest.onClick) {
      rest.onClick();
    }
  };

  useEffect(() => {
    if (pathname === "/" && scroll && clicked) {
      scroller.scrollTo(to, {
        duration: 800,
        delay: 0,
        smooth: "easeInOutQuart",
      });
    }
  }, [pathname, to, scroll, clicked]);

  return pathname === "/" ? (
    <ScrollLink
      onClick={handleClick}
      to={to}
      className={className}
      {...rest}
      smooth={true}
      duration={100}
    >
      {children}
    </ScrollLink>
  ) : (
    <Link onClick={handleClick} to="/" className={className} {...rest}>
      {children}
    </Link>
  );
};

export function Header() {
  const { total, quantities, isCartOpen, setIsCartOpen } = useCart();
  const [sticky, setSticky] = useState(false);
  const { pathname } = useLocation();
  const numItems = Object.keys(quantities).filter(
    (id) => quantities[id] > 0
  ).length;
  const [expanded, setExpanded] = useState(false);

  const handleCartClick = () => {
    setIsCartOpen(!isCartOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  const closeNavbar = () => {
    setExpanded(false);
  };

  return (
    <Navbar
      collapseOnSelect
      expand="lg"
      bg="light"
      className={`w-100 position-sticky ${sticky ? 'navbar-sticky' : ''}`}
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
    >
      <Container>
        {pathname !== "/login" && (
          <Nav.Link
            className="d-lg-none cart-icon-mobile"
            onClick={handleCartClick}
          >
            🛒
            <span>
              {" "}
              {total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </Nav.Link>
        )}

        <Navbar.Brand as={Link} to="/">
          <img src={logo} alt="Logo" className="logoCafeteria" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="responsive-navbar-nav" />

        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={ScrollOrRouteLink} to="home" scroll={true} onClick={closeNavbar}>
              Início
            </Nav.Link>
            <Nav.Link as={ScrollOrRouteLink} to="produtos" scroll={true} onClick={closeNavbar}>
              Produtos
            </Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link as={Link} to="/login">
              Entrar
            </Nav.Link>
            {pathname !== "/login" && (
              <Nav.Link className="cart-icon-desktop d-none d-lg-block" onClick={handleCartClick}>
                <Container fluid>
                  <Row className="align-items-center">
                    <Col xs="auto">
                      <span role="img" aria-label="shopping cart">
                        🛒
                      </span>
                    </Col>
                    <Col>
                      <Row>Itens: {numItems}</Row>
                      <Row className="cart-total">
                        Total:{" "}
                        {total.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </Row>
                    </Col>
                  </Row>
                </Container>
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
