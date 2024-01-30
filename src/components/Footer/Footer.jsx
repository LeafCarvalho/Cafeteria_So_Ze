import { useState } from "react";
import { Container, Row } from "react-bootstrap";
import './style.scss';

export const Footer = () => {
  const anoAtual = new Date().getFullYear();
  const urlWpp =
    "https://api.whatsapp.com/send?phone=5531999999999&text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20preciso%20falar%20sobre%20meu%20pedido.";
  const email = "cafeteriasoze@gmail.com";
  const [isCopied, setIsCopied] = useState(false);

  const formatPhoneNumber = (phoneNumber) => {
    const cleaned = ("" + phoneNumber).replace(/\D/g, "");
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return "(" + match[1] + ") " + match[2] + "-" + match[3];
    }
    return null;
  };

  const handleEmailClick = async () => {
    try {
      await navigator.clipboard.writeText(email);
      toast.success('Email copiado!', {
        position: toast.POSITION.BOTTOM_LEFT,
        autoClose: 5000
      });
    } catch (err) {
      console.error('Failed to copy email: ', err);
    }
  };

  return (
    <>
      <footer>
        <Container>
          <Row className="d-flex flex-column justify-content-center align-items-center">
          <p onClick={handleEmailClick} style={{ cursor: 'pointer' }}>
              {email} {isCopied && <span>Copiado!</span>}
            </p>
            <p>
                <a href={urlWpp} target="_blank" rel="noopener noreferrer">
                {formatPhoneNumber("31999999999")}
                </a>
            </p>
            <p>
              © {anoAtual} Cafeteria Só Zé. Todos os direitos reservados. |
              Desenvolvido por Rafael Carvalho
            </p>
          </Row>
        </Container>
      </footer>
    </>
  );
};
