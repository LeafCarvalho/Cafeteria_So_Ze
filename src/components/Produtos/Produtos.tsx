import React, { useEffect, useState } from "react";
import { Container, Row, Col, Modal } from "react-bootstrap";
import { FcPlus, FcMinus } from "react-icons/fc";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { useCart } from "../../Context/CartContext";
import { DefaultButton } from "../../Utils/Buttons/Buttons";
import { produtosService } from "../../services/produtosService";
import { Produto } from "../../types/produtos";
import "./style.scss";

export const Produtos = () => {
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("Todos");
  const [displayCount, setDisplayCount] = useState(6);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const {
    isCartOpen,
    setIsCartOpen,
    products,
    setProducts,
    quantities,
    setQuantities,
  } = useCart();

  useEffect(() => {
    const getProducts = async () => {
      try {
        setIsLoading(true);
        setErro(null);

        if (products.length === 0) {
          const produtos = await produtosService.listarProdutos();
          setProducts(produtos);
        }
      } catch (error) {
        console.error(error);
        setErro("Não foi possível carregar os produtos.");
      } finally {
        setIsLoading(false);
      }
    };

    getProducts();
  }, [products.length, setProducts]);

  const addProduct = (id: string) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [id]: (prevQuantities[id] || 0) + 1,
    }));
  };

  const removeProduct = (id: string) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [id]: Math.max(0, (prevQuantities[id] || 0) - 1),
    }));
  };

  const emptyCart = () => {
    setQuantities({});
  };

  const filteredProducts = products.filter(
    (product) =>
      (selectedType === "Todos" || product.tipo === selectedType) &&
      product.nome.toLowerCase().includes(search.toLowerCase()),
  );

  const types = ["Todos", ...new Set(products.map((product) => product.tipo))];

  return (
    <Container className="mt-5 mb-5">
      <Row className="mb-5">
        <div className="d-flex align-items-center justify-content-start search-and-filter">
          <div className="d-flex flex-column">
            <input
              type="text"
              value={search}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(event.target.value)
              }
              placeholder="Pesquisar..."
            />
            <select
              value={selectedType}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                setSelectedType(event.target.value)
              }
            >
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Row>
      <Row>
        {isLoading ? (
          <Col className="d-flex justify-content-center">
            <Skeleton count={6} height={100} width={200} />
          </Col>
        ) : erro ? (
          <Col className="d-flex justify-content-center">
            <h1>{erro}</h1>
          </Col>
        ) : filteredProducts.length > 0 ? (
          <>
            {filteredProducts.slice(0, displayCount).map((product) => (
              <Col sm={12} md={6} lg={4} xl={4} key={product.id}>
                <div className="product-card">
                  <div id="imgProdutoHome">
                    <img
                      src={product.imagem}
                      alt={product.nome}
                      onClick={() => setSelectedProduct(product)}
                    />
                  </div>
                  <Row className="d-flex align-items-start m-1">
                    <Col>
                      <p>{product.nome}</p>
                      <p>
                        {product.valor.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                    </Col>
                    <Col className="d-flex flex-column text-end">
                      <Row>
                        <p>Quantidade: {quantities[product.id] ?? 0}</p>
                        <Col>
                          <DefaultButton
                            id="addButton"
                            onClick={() => addProduct(product.id)}
                          >
                            <FcPlus />
                          </DefaultButton>
                          <DefaultButton
                            id="removeButton"
                            onClick={() => removeProduct(product.id)}
                          >
                            <FcMinus />
                          </DefaultButton>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </div>
              </Col>
            ))}
            <Col sm={12} className="d-flex justify-content-center">
              {filteredProducts.length > displayCount && (
                <DefaultButton
                  onClick={() => setDisplayCount(displayCount + 6)}
                  id="vermaisButton"
                >
                  Ver Mais
                </DefaultButton>
              )}
              {displayCount > 6 && filteredProducts.length <= displayCount && (
                <DefaultButton
                  onClick={() => setDisplayCount(6)}
                  id="vermenosButton"
                >
                  Ver Menos
                </DefaultButton>
              )}
            </Col>
          </>
        ) : (
          <Col className="d-flex justify-content-center">
            <h1>Nenhum produto foi encontrado.</h1>
          </Col>
        )}
      </Row>

      <Modal show={selectedProduct !== null} onHide={() => setSelectedProduct(null)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedProduct?.nome}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <img
            src={selectedProduct?.imagem}
            alt={selectedProduct?.nome}
            style={{ width: "100%" }}
          />
          <p className="mt-3 mb-3">{selectedProduct?.descricao}</p>
        </Modal.Body>
      </Modal>

      <div className={`cart-overlay ${isCartOpen ? "open" : ""}`}>
        <DefaultButton
          onClick={() => setIsCartOpen(false)}
          customizarCSS="closeCartButton"
        >
          Fechar
        </DefaultButton>
        {Object.entries(quantities).some(([, quantity]) => quantity > 0) ? (
          <>
            {Object.entries(quantities)
              .filter(([, quantity]) => quantity > 0)
              .map(([id, quantity]) => {
                const product = products.find((item) => item.id === id);
                if (!product) return null;

                const valorTotalProduto = product.valor * quantity;

                return (
                  <Row key={id} className="mb-3 cart-container">
                    <Col>
                      <img
                        src={product.imagem}
                        alt={product.nome}
                        style={{ width: "100%", height: "auto" }}
                      />
                    </Col>
                    <Col>
                      <p>{product.nome}</p>
                      <p>Quantidade: {quantity}</p>
                      <Col className="pb-3">
                        <DefaultButton
                          id="addButton"
                          onClick={() => addProduct(product.id)}
                        >
                          <FcPlus />
                        </DefaultButton>
                        <DefaultButton
                          id="removeButton"
                          onClick={() => removeProduct(product.id)}
                        >
                          <FcMinus />
                        </DefaultButton>
                      </Col>
                      <p>
                        Valor Unitário:{" "}
                        {product.valor.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                      <p>
                        Valor total:{" "}
                        {valorTotalProduto.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                    </Col>
                  </Row>
                );
              })}
            <p>
              Total a pagar:{" "}
              {Object.entries(quantities)
                .reduce((total, [id, quantity]) => {
                  const product = products.find((item) => item.id === id);
                  return total + (product ? product.valor * quantity : 0);
                }, 0)
                .toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
            </p>
            <DefaultButton onClick={emptyCart} customizarCSS="esvaziarCarrinho">
              Esvaziar Carrinho
            </DefaultButton>
            <Link to="/pedidos" className="continueButton">
              Continuar
            </Link>
          </>
        ) : (
          <p style={{ textAlign: "center" }}>Nenhum produto adicionado à lista</p>
        )}
      </div>
    </Container>
  );
};

