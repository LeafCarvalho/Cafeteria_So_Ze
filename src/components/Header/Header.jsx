import React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { Link as ScrollLink, scroller } from 'react-scroll';
import './style.scss';
import { useCart } from '../../Context/CartContext';
import logo from '../../assets/logoCafeteria.png'

const ScrollOrRouteLink = ({ to, scroll, children, className, ...rest }) => {
  const { pathname } = useLocation();
  const [clicked, setClicked] = React.useState(false);

  const handleClick = () => {
    setClicked(true);
  };

  React.useEffect(() => {
    if (pathname === '/' && scroll && clicked) {
      scroller.scrollTo(to, {
        duration: 800,
        delay: 0,
        smooth: 'easeInOutQuart',
      });
    }
  }, [pathname, to, scroll, clicked]);

  return pathname === '/' ? (
    <ScrollLink onClick={handleClick} to={to} className={className} {...rest} smooth={true} duration={100}>
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
  const numItems = Object.keys(quantities).filter((id) => quantities[id] > 0).length;

  const handleCartClick = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <Navbar collapseOnSelect expand="lg" className="w-100 position-sticky">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img src={logo} alt="" className='logoCafeteria'/>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto" />
          <Nav>
            <Nav.Link as={ScrollOrRouteLink} to="home"  scroll={true} >
              Início
            </Nav.Link>
            <Nav.Link as={ScrollOrRouteLink} to="produtos"  scroll={true} >
              Produtos
            </Nav.Link>
            <Nav.Link as={Link} to="/login" >
              Entrar
            </Nav.Link>
            <Nav.Link className="d-flex flex-column cursor-pointer" id="carrinho" onClick={handleCartClick} >
              <span>
                {total.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
              <span>Itens: {numItems}</span>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
