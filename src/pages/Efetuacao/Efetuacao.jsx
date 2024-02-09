import React from 'react';
import { useCart } from '../../Context/CartContext';

const Efetuacao = () => {
  const { lastOrder } = useCart();

  if (!lastOrder) {
    return <p>Nenhum pedido encontrado.</p>;
  }
  console.log(lastOrder.senha)

  return (
    <div class="container pt-5">
      <h1>Pedido Realizado!</h1>
      <h3>Total: {lastOrder.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h3>
      <h1>Senha do Pedido: {lastOrder.senha}</h1>
      <h4>Nome Completo: {lastOrder.nome_completo}</h4>
      {lastOrder.produtos.map((item, index) => (
        <div key={index}>
          <img src={item.imagem} alt={item.nome} style={{ width: "100px" }} />
          <p>Nome: {item.nome}</p>
          <p>Quantidade: {item.quantidade}</p>
          <p>Valor: {item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
      ))}
    </div>
  );
};

export default Efetuacao;
