import React, { useEffect, useState } from "react";
import { DocumentData, QuerySnapshot, collection, getDocs } from "firebase/firestore";
import { Container, Row, Col, Modal } from "react-bootstrap";
import { FcPlus, FcMinus } from "react-icons/fc";
import { db } from "../../services/firebaseConfig";
import { Link } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import { DefaultButton } from "../../Utils/Buttons/Buttons";
import "./style.scss";
import Skeleton from "react-loading-skeleton";

interface Product {
  id: string;
  nome: string;
  tipo: string;
  valor: number;
  imagem: string;
  descricao: string;
}

export const Produtos = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("Todos");
  const [displayCount, setDisplayCount] = useState<number>(6);
  const {
    isCartOpen,
    setIsCartOpen,
    products,
    setProducts,
    quantities,
    setQuantities,
  } = useCart();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const getProducts = async () => {
      setIsLoading(true);
      if (products.length === 0) {
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, "products"));
        const productsArray: Product[] = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }) as Product);
        setProducts(productsArray);
      }
      setIsLoading(false);
    };

    getProducts();
  }, [products, setProducts]);

  const handleViewMoreClick = () => {
    setDisplayCount(displayCount + 6);
  };

  const handleViewLessClick = () => {
    setDisplayCount(6);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(event.target.value);
  };


  const addProduct = (id: string) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [id]: (prevQuantities[id] || 0) + 1,
    }));
  };

  const removeProduct = (id: string) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [id]: Math.max(0, prevQuantities[id] - 1),
    }));
  };

  const emptyCart = () => {
    setQuantities((prevQuantities) => {
      const newQuantities = { ...prevQuantities };
      for (const id in newQuantities) {
        newQuantities[id] = 0;
      }
      return newQuantities;
    });
  };

  const handleImageClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleClose = () => {
    setSelectedProduct(null);
  };

  const filteredProducts = products.filter(
    (product) =>
      (selectedType === "Todos" || product.tipo === selectedType) &&
      (product.nome ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const types = ["Todos", ...new Set(products.map((product) => product.tipo))];

  return (
    <>
      <Container className="mt-5 mb-5">
        <Row className="mb-5">
          <div className="d-flex align-items-center justify-content-start search-and-filter">
            <div className="d-flex flex-column">
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Pesquisar..."
              />
              <select value={selectedType} onChange={handleTypeChange}>
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
          ) : filteredProducts.length > 0 ? (
            <>
              {filteredProducts.slice(0, displayCount).map((product) => (
                <Col sm={12} md={6} lg={4} xl={4} key={product.id}>
                  <div className="product-card">
                    <div id="imgProdutoHome">
                      <img
                        src={product.imagem}
                        alt={product.nome}
                        onClick={() => handleImageClick(product as Product)}
                      />
                    </div>
                    <Row className="d-flex align-items-start m-1">
                      <Col>
                        <p>{product.nome}</p>
                        <p>
                          {Number(product.valor).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </p>
                      </Col>
                      <Col className="d-flex flex-column text-end">
                        <Row>
                          <p>Quantidade: {product.id != null ? quantities[product.id] ?? 0 : 0}</p>
                          <Col>
                            <DefaultButton
                              id="addButton"
                              onClick={() => {
                                if (product.id != null) {
                                  addProduct(product.id);
                                }
                              }}
                            >
                              <FcPlus />
                            </DefaultButton>
                            <DefaultButton
                              id="removeButton"
                              onClick={() => {
                                if (product.id != null) {
                                  removeProduct(product.id);
                                }
                              }}
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
                    onClick={handleViewMoreClick}
                    id="vermaisButton"
                  >
                    Ver Mais
                  </DefaultButton>
                )}
                {displayCount > 6 &&
                  filteredProducts.length <= displayCount && (
                    <DefaultButton
                      onClick={handleViewLessClick}
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

        <Modal show={selectedProduct !== null} onHide={handleClose}>
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
          <Modal.Footer></Modal.Footer>
        </Modal>
        <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`}>
          <DefaultButton
            onClick={() => setIsCartOpen(false)}
            customizarCSS="closeCartButton"
          >
            Fechar
          </DefaultButton>
          {Object.entries(quantities).filter(([_, quantity]) => quantity > 0)
            .length > 0 ? (
            <>
              {Object.entries(quantities)
                .filter(([_, quantity]) => quantity > 0)
                .map(([id, quantity]) => {
                  const product = products.find(
                    (product) => product.id === id
                  );
                  if (!product) return null;

                  const valorUnitario = product.valor ?? 0;
                  const valorTotalProduto = (product.valor ?? 0) * quantity;

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
                            onClick={() => {
                              if (product.id != null) {
                                addProduct(product.id);
                              }
                            }}
                          >
                            <FcPlus />
                          </DefaultButton>
                          <DefaultButton
                            id="removeButton"
                            onClick={() => {
                              if (product.id != null) {
                                removeProduct(product.id);
                              }
                            }}
                          >
                            <FcMinus />
                          </DefaultButton>
                        </Col>
                        <p>
                          Valor Unitário:{" "}
                          {valorUnitario.toLocaleString("pt-BR", {
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
                    const product = products.find(
                      (product) => product.id === id
                    );
                    return total + (product && product.valor != null ? product.valor * quantity : 0);
                  }, 0)
                  .toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
              </p>
              <DefaultButton
                onClick={emptyCart}
                customizarCSS="esvaziarCarrinho"
              >
                Esvaziar Carrinho
              </DefaultButton>
              <Link to="/pedidos" className="continueButton">
                Continuar
              </Link>
            </>
          ) : (
            <p style={{ textAlign: "center" }}>
              Nenhum produto adicionado à lista
            </p>
          )}
        </div>

      </Container>
    </>
  );
};
