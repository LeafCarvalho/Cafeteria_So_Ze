import { useState } from "react";
import { Container, Row } from "react-bootstrap";
import "./style.scss";

interface FormatPhoneNumber {
  (phoneNumber: string): string | null;
}

export const Footer = () => {
  const anoAtual: number = new Date().getFullYear();
  const urlWpp: string =
    "https://api.whatsapp.com/send?phone=5531999999999&text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20preciso%20falar%20sobre%20meu%20pedido.";
  const email: string = "cafeteriasoze@gmail.com";
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const formatPhoneNumber: FormatPhoneNumber = (phoneNumber) => {
    const cleaned: string = phoneNumber.replace(/\D/g, "");
    const match: RegExpMatchArray | null = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return "(" + match[1] + ") " + match[2] + "-" + match[3];
    }
    return null;
  };

  const handleEmailClick = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(email);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <>
      <footer>
        <Container>
          <Row className="d-flex flex-column justify-content-center align-items-center">
            <p onClick={handleEmailClick} style={{ cursor: "pointer" }}>
              {email}{" "}
              {isCopied && (
                <span className={`copied-toast ${isCopied ? "visible" : ""}`}>
                  Copiado!
                </span>
              )}
            </p>
            <p>
              <a href={urlWpp} target="_blank" rel="noopener noreferrer">
                {formatPhoneNumber("31999999999")}
              </a>
            </p>
            <p>
              © 2023-{anoAtual} Cafeteria Sô Zé. Todos os direitos reservados. |
              Desenvolvido por Rafael Carvalho
            </p>
          </Row>
        </Container>
      </footer>
    </>
  );
};
