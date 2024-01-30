import { Footer } from "../../components/Footer/Footer";
import { Header } from "../../components/Header/Header";
import BannerHome from "../../assets/Home/cafe-principal1.jpg";
import "./style.scss";
import { Produtos } from "../../components/Produtos/Produtos";
import { Element } from "react-scroll";

const Home = () => {
  return (
    <>
      <Element name="home">
        <Header />
        <div>
          <img src={BannerHome} alt="" />
        </div>
        <Element name="produtos">
          <Produtos />
        </Element>
        <Footer />
      </Element>
    </>
  );
};

export default Home;
