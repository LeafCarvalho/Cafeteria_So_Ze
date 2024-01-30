import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Container, Row, Col, Modal, Button } from "react-bootstrap";
import { FcPlus, FcMinus } from "react-icons/fc";
import { db } from "../../services/firebaseConfig";
import { Link } from "react-router-dom";
import { useCart } from "../../Context/CartContext";

export const Produtos = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("Todos");
  const { isCartOpen, setIsCartOpen } = useCart();
  const [displayCount, setDisplayCount] = useState(6);
  const { products, setProducts, quantities, setQuantities } = useCart();

  useEffect(() => {
  const getProducts = async () => {
    if (products.length === 0) { // Só carrega produtos se ainda não estiverem carregados
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsArray = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setProducts(productsArray);
    }
  };

  getProducts();
}, [products, setProducts]);

  const handleViewMoreClick = () => {
    setDisplayCount(displayCount + 6);
  };

  const addProduct = (id) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [id]: (prevQuantities[id] || 0) + 1,
    }));
  };

  const removeProduct = (id) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [id]: prevQuantities[id] > 0 ? prevQuantities[id] - 1 : 0,
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

  const handleImageClick = (product) => {
    setSelectedProduct(product);
  };

  const handleClose = () => {
    setSelectedProduct(null);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
  };

  const filteredProducts = products.filter(
    (product) =>
      (selectedType === "Todos" || product.tipo === selectedType) &&
      product.nome.toLowerCase().includes(search.toLowerCase())
  );

  const types = ["Todos", ...new Set(products.map((product) => product.tipo))];

  return (
    <>
      <Container className="mt-5 mb-5">
        <Row className="mb-5">
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
        </Row>
        <Row>
          {filteredProducts.length > 0 ? (
            <>
              {filteredProducts.slice(0, displayCount).map((product) => (
                <Col sm={12} md={6} lg={4} xl={4} key={product.id}>
                  <div className="product-card">
                    <img
                      src={product.imagem}
                      alt={product.nome}
                      onClick={() => handleImageClick(product)}
                    />
                    <Row className="d-flex align-items-start">
                      <Col>
                        <p>{product.nome}</p>
                        <p>
                          {Number(product.valor).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </p>
                      </Col>
                      <Col className="d-flex flex-column justify-content-end">
                        <Row>
                          <p>Quantidade: {quantities[product.id] || 0}</p>
                          <Button onClick={() => addProduct(product.id)}>
                            <FcPlus />
                          </Button>
                          <Button onClick={() => removeProduct(product.id)}>
                            <FcMinus />
                          </Button>
                        </Row>
                      </Col>
                    </Row>
                  </div>
                </Col>
              ))}
              {filteredProducts.length > displayCount && (
                <Col className="d-flex justify-content-center">
                  <Button onClick={handleViewMoreClick}>Ver Mais</Button>
                </Col>
              )}
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
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Fechar
            </Button>
          </Modal.Footer>
        </Modal>
        {isCartOpen && (
          <div
            style={{
              width: "650px",
              padding: "1rem",
              height: "100%",
              top: 0,
              zIndex: 9,
              overflow: "auto",
              position: "fixed",
              background: "#F0ECE3",
              right: "0",
            }}
          >
            <Button
              onClick={() => setIsCartOpen(false)}
              style={{ position: "absolute", top: "10px", left: "10px" }}
            >
              Fechar
            </Button>
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

                    const valorUnitario = product.valor;
                    const valorTotalProduto = product.valor * quantity;

                    return (
                      <Row key={id} className="mb-3">
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
                          <Button onClick={() => addProduct(product.id)}>
                            <FcPlus />
                          </Button>
                          <Button onClick={() => removeProduct(product.id)}>
                            <FcMinus />
                          </Button>
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
                      return total + (product ? product.valor * quantity : 0);
                    }, 0)
                    .toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                </p>
                <Button onClick={emptyCart}>Esvaziar Carrinho</Button>
                <Link to="/pedidos">Continuar</Link>
              </>
            ) : (
              <p style={{ textAlign: "center" }}>
                Nenhum produto adicionado à lista
              </p>
            )}
          </div>
        )}
      </Container>
    </>
  );
};
