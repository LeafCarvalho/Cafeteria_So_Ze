import { useEffect } from "react";
import { Container } from "react-bootstrap";
import { Element, scroller } from "react-scroll";
import { useLocation } from "react-router-dom";
import BannerHome from "@/assets/Home/hero.webp";
import { Produtos } from "@/components/Produtos/Produtos";
import { DefaultButton } from "@/Utils/Buttons/Buttons";
import "./style.scss";

const scrollToProducts = () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  scroller.scrollTo("produtos", {
    duration: reducedMotion ? 0 : 550,
    smooth: reducedMotion ? false : "easeInOutQuart",
    offset: -88,
  });
};

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;

    if (state?.scrollTo === "produtos") {
      window.setTimeout(scrollToProducts, 0);
    }
  }, [location.state]);

  return (
    <main>
      <Element name="home">
        <section aria-labelledby="titulo-principal" id="banner-principal">
          <img src={BannerHome} alt="" className="banner-principal-img" />
          <Container className="banner-principal__content">
            <p className="banner-principal__eyebrow">Café especial, feito para você</p>
            <h1 id="titulo-principal">Cafeteria Sô Zé</h1>
            <p>Sabores artesanais para tornar sua pausa ainda melhor.</p>
            <DefaultButton onClick={scrollToProducts} type="button">
              Ver cardápio
            </DefaultButton>
          </Container>
        </section>
        <Element name="produtos">
          <Produtos />
        </Element>
      </Element>
    </main>
  );
};

export default Home;
