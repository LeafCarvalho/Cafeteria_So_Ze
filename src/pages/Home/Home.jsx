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
        <div id="banner-principal">
          <img src={BannerHome} alt="" className="banner-principal-img"/>
          <div>
            <h1>Bem-Vindo a</h1>
            <h2>Cafeteria Sô Zé</h2>
          </div>
        </div>
        <Element name="produtos">
          <Produtos />
        </Element>
      </Element>
    </>
  );
};

export default Home;
