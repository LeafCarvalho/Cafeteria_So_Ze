import { useEffect, useRef, useState } from "react";
import { Container, Row } from "react-bootstrap";
import "./style.scss";

export const Footer = () => {
  const anoAtual = new Date().getFullYear();
  const email = "cafeteriasoze@gmail.com";
  const [copyStatus, setCopyStatus] = useState("");
  const timeoutRef = useRef<number | null>(null);
  const urlWpp = "https://api.whatsapp.com/send?phone=5531999999999&text=Olá!%20Vim%20pelo%20site%20e%20preciso%20falar%20sobre%20meu%20pedido.";

  useEffect(() => () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  }, []);

  const handleEmailClick = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopyStatus("E-mail copiado.");
    } catch (error) {
      console.error("Não foi possível copiar o e-mail:", error);
      setCopyStatus("Não foi possível copiar o e-mail.");
    }

    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setCopyStatus(""), 2500);
  };

  return (
    <footer>
      <Container>
        <Row className="d-flex flex-column justify-content-center align-items-center">
          <button aria-describedby="copy-status" className="footer__email" onClick={() => void handleEmailClick()} type="button">
            Copiar e-mail: {email}
          </button>
          <p>
            <a aria-label="Falar pelo WhatsApp (abre em nova aba)" href={urlWpp} rel="noopener noreferrer" target="_blank">
              (31) 99999-9999 <span aria-hidden="true">↗</span>
            </a>
          </p>
          <p>© 2023-{anoAtual} Cafeteria Só Zé. Todos os direitos reservados. | Desenvolvido por Rafael Carvalho</p>
        </Row>
      </Container>
      <p aria-live="polite" className="visually-hidden" id="copy-status" role="status">{copyStatus}</p>
    </footer>
  );
};
