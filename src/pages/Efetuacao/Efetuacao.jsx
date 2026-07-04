import './style.scss';
import { useCart } from '../../Context/CartContext';

const Efetuacao = () => {
  const { lastOrder } = useCart();

  if (!lastOrder) {
    return <div className="efetuacao-container"><p>Nenhum pedido encontrado.</p></div>;
  }

  return (
    <div className="efetuacao-container">
      <div className="container">
        <div className="d-flex flex-column justify-content-center align-items-center">
          <h1>Bão demais, {lastOrder.nome_cliente}! Seu pedido foi efetuado com sucesso.</h1>
        </div>
        <p>Estimativa de preparo: 30 a 60 minutos.</p>
        <p>Apresente este código no balcão para retirar seu pedido:</p>
        <h3>{lastOrder.senha_retirar_ped}</h3>
        {lastOrder.produtos.map((item) => (
          <div key={item.id} className="pedido-item">
            <img src={item.imagem} alt={item.nome} />
            <div>
              <p>Nome: {item.nome}</p>
              <p>Quantidade: {item.quantidade}</p>
              <p>Valor Unitário: {item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
          </div>
        ))}
        <p>Total: {lastOrder.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
      </div>
    </div>
  );
};

export default Efetuacao;

