import { Container, Row } from "react-bootstrap";
import { FaWhatsapp } from "react-icons/fa";
import { FiClipboard } from "react-icons/fi";
import { toast } from "react-toastify";
import "./style.scss";

export const Footer = () => {
  const anoAtual = new Date().getFullYear();
  const email = "cafeteriasoze@gmail.com";
  const urlWpp =
    "https://api.whatsapp.com/send?phone=5531999999999&text=Olá!%20Vim%20pelo%20site%20e%20preciso%20falar%20sobre%20meu%20pedido.";

  const handleEmailClick = async () => {
    try {
      await navigator.clipboard.writeText(email);
      toast.dismiss("copy-email-feedback");
      toast.success("E-mail copiado.", {
        autoClose: 3000,
        className: "app-toast app-toast--success",
        toastId: "copy-email-feedback",
      });
    } catch (error) {
      console.error("Não foi possível copiar o e-mail:", error);
      toast.dismiss("copy-email-feedback");
      toast.error("Não foi possível copiar. Selecione o e-mail manualmente.", {
        autoClose: 5000,
        className: "app-toast app-toast--error",
        toastId: "copy-email-feedback",
      });
    }
  };

  return (
    <footer className="footer">
      <Container>
        <Row className="d-flex flex-column justify-content-center align-items-center">
          <button
            aria-label="Copiar e-mail"
            className="footer__email"
            onClick={() => void handleEmailClick()}
            type="button"
          >
            <span>{email}</span>
            <FiClipboard aria-hidden="true" />
          </button>
          <p>
            <a
              aria-label="Falar pelo WhatsApp (abre em nova aba)"
              href={urlWpp}
              rel="noopener noreferrer"
              target="_blank"
            >
              (31) 99999-9999{" "}
              <FaWhatsapp
                aria-hidden="true"
                className="footer__whatsapp-icon"
              />
            </a>
          </p>
          <p>
            © 2023-{anoAtual} Cafeteria Sô Zé. Todos os direitos reservados. |
            Desenvolvido por Rafael Carvalho
          </p>
        </Row>
      </Container>
    </footer>
  );
};
