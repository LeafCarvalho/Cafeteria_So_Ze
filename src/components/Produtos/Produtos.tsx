import { useCallback, useEffect, useRef, useState } from "react";
import { Col, Container, Modal, Row } from "react-bootstrap";
import { FiChevronDown, FiMinus, FiPlus } from "react-icons/fi";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { useCart } from "@/Context/CartContext";
import { produtosService } from "@/services/produtosService";
import { Produto } from "@/types/produtos";
import { DefaultButton } from "@/Utils/Buttons/Buttons";
import "./style.scss";

const getInitialDisplayCount = () =>
  window.matchMedia("(max-width: 576px)").matches ? 3 : 6;

export const Produtos = () => {
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("Todos");
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(getInitialDisplayCount);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const cartRef = useRef<HTMLDivElement>(null);
  const closeCartButtonRef = useRef<HTMLButtonElement>(null);
  const {
    isCartOpen,
    setIsCartOpen,
    cartTriggerId,
    cartProducts,
    setCartProducts,
    itemQuantities,
    setItemQuantities,
    total,
  } = useCart();

  const carregarProdutos = useCallback(async () => {
    try {
      setIsLoading(true);
      setErro(null);
      const produtos = await produtosService.listarProdutos();
      setCartProducts(produtos);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar os produtos.");
    } finally {
      setIsLoading(false);
    }
  }, [setCartProducts]);

  useEffect(() => {
    if (cartProducts.length === 0) {
      void carregarProdutos();
      return;
    }

    setIsLoading(false);
  }, [carregarProdutos, cartProducts.length]);

  useEffect(() => {
    if (!isCartOpen) return;

    const previousOverflow = document.body.style.overflow;
    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCartOpen(false);
        return;
      }

      if (event.key !== "Tab" || !cartRef.current) return;

      const focusableElements = Array.from(
        cartRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      );
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    window.setTimeout(() => closeCartButtonRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartOpen, setIsCartOpen]);

  const cartItems = Object.entries(itemQuantities)
    .filter(([, quantity]) => quantity > 0)
    .map(([id, quantity]) => {
      const product = cartProducts.find((item) => item.id === id);
      return product ? { product, quantity } : null;
    })
    .filter((item): item is { product: Produto; quantity: number } => Boolean(item));

  const totalItems = cartItems.reduce((count, item) => count + item.quantity, 0);
  const filteredProducts = cartProducts.filter(
    (product) =>
      (selectedType === "Todos" || product.tipo === selectedType) &&
      product.nome.toLowerCase().includes(search.toLowerCase()),
  );
  const types = ["Todos", ...new Set(cartProducts.map((product) => product.tipo))];

  const addProduct = (product: Produto) => {
    const nextQuantity = (itemQuantities[product.id] || 0) + 1;
    setItemQuantities((prevQuantities) => ({
      ...prevQuantities,
      [product.id]: nextQuantity,
    }));
    setAnnouncement(`${product.nome}: ${nextQuantity} ${nextQuantity === 1 ? "unidade" : "unidades"} no carrinho.`);
  };

  const addSelectedProductToCart = () => {
    if (!selectedProduct) return;

    addProduct(selectedProduct);
    setSelectedProduct(null);
  };

  const removeProduct = (product: Produto) => {
    const nextQuantity = Math.max(0, (itemQuantities[product.id] || 0) - 1);
    setItemQuantities((prevQuantities) => ({ ...prevQuantities, [product.id]: nextQuantity }));
    setAnnouncement(
      nextQuantity > 0
        ? `${product.nome}: ${nextQuantity} unidades no carrinho.`
        : `${product.nome} removido do carrinho.`,
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedType("Todos");
    setIsCategoryMenuOpen(false);
    setDisplayCount(getInitialDisplayCount());
  };

  const handleFilterChange = (callback: () => void) => {
    callback();
    setDisplayCount(getInitialDisplayCount());
  };

  const closeCart = () => {
    setIsCartOpen(false);
    window.setTimeout(() => {
      if (cartTriggerId) document.getElementById(cartTriggerId)?.focus();
    }, 0);
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <section aria-labelledby="produtos-titulo" className="produtos-section">
      <Container className="py-5">
        <div className="produtos-section__heading">
          <p className="produtos-section__eyebrow">Escolha o seu favorito</p>
          <h2 id="produtos-titulo">Cardápio</h2>
          <p>Produtos preparados para acompanhar os seus melhores momentos.</p>
        </div>

        <div className="search-and-filter">
          <div className="field-group">
            <label htmlFor="pesquisa-produtos">Buscar no cardápio</label>
            <input
              id="pesquisa-produtos"
              onChange={(event) => handleFilterChange(() => setSearch(event.target.value))}
              placeholder="Ex.: cappuccino"
              type="search"
              value={search}
            />
          </div>
          <div className="field-group field-group--category">
            <span id="filtro-categoria-label">Categoria</span>
            <button
              aria-controls="filtro-categoria-menu"
              aria-expanded={isCategoryMenuOpen}
              aria-haspopup="menu"
              aria-labelledby="filtro-categoria-label filtro-categoria"
              className="category-select__trigger"
              id="filtro-categoria"
              onClick={() => setIsCategoryMenuOpen((isOpen) => !isOpen)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setIsCategoryMenuOpen(false);
              }}
              type="button"
            >
              <span>{selectedType}</span>
              <FiChevronDown aria-hidden="true" />
            </button>
            {isCategoryMenuOpen && (
              <ul aria-labelledby="filtro-categoria-label" className="category-select__menu" id="filtro-categoria-menu" role="menu">
              {types.map((type) => (
                <li key={type}>
                  <button
                    aria-checked={selectedType === type}
                    onClick={() => {
                      handleFilterChange(() => setSelectedType(type));
                      setIsCategoryMenuOpen(false);
                    }}
                    role="menuitemradio"
                    type="button"
                  >
                    {type}
                  </button>
                </li>
              ))}
              </ul>
            )}
          </div>
          {(search || selectedType !== "Todos") && (
            <button className="clear-filters" onClick={clearFilters} type="button">
              Limpar filtros
            </button>
          )}
        </div>

        <p aria-live="polite" className="results-summary">
          {isLoading ? "Carregando produtos…" : `${filteredProducts.length} ${filteredProducts.length === 1 ? "produto encontrado" : "produtos encontrados"}.`}
        </p>
        <p aria-live="polite" className="visually-hidden">{announcement}</p>

        <Row className="g-4">
          {isLoading ? (
            <Col className="d-flex justify-content-center" role="status">
              <Skeleton count={6} height={100} width={200} />
              <span className="visually-hidden">Carregando produtos…</span>
            </Col>
          ) : erro ? (
            <Col className="catalog-feedback" role="alert">
              <h3>Não foi possível carregar o cardápio</h3>
              <p>Tente novamente em instantes.</p>
              <DefaultButton onClick={() => void carregarProdutos()} type="button">Tentar novamente</DefaultButton>
            </Col>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.slice(0, displayCount).map((product) => {
              const quantity = itemQuantities[product.id] ?? 0;
              return (
                <Col key={product.id} lg={4} md={6} sm={12} xl={4}>
                  <article className="product-card">
                    <button
                      aria-haspopup="dialog"
                      aria-label={`Ver detalhes de ${product.nome}`}
                      className="product-card__details"
                      onClick={() => setSelectedProduct(product)}
                      type="button"
                    >
                      <img alt="" src={product.imagem} />
                      <span>Ver detalhes</span>
                    </button>
                    <div className="product-card__content">
                      <div>
                        <h3>{product.nome}</h3>
                        <p className="product-card__type">{product.tipo}</p>
                        <p className="product-card__price">{formatCurrency(product.valor)}</p>
                      </div>
                      <div aria-label={`Quantidade de ${product.nome}`} className="quantity-control" role="group">
                        <button
                          aria-label={`Remover uma unidade de ${product.nome}`}
                          disabled={quantity === 0}
                          onClick={() => removeProduct(product)}
                          type="button"
                        >
                          <FiMinus aria-hidden="true" />
                        </button>
                        <output aria-live="polite" className="quantity-control__value">{quantity}</output>
                        <button
                          aria-label={`Adicionar uma unidade de ${product.nome}`}
                          onClick={() => addProduct(product)}
                          type="button"
                        >
                          <FiPlus aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </article>
                </Col>
              );
            })
          ) : (
            <Col className="catalog-feedback" role="status">
              <h3>Nenhum produto encontrado</h3>
              <p>Experimente outra busca ou categoria.</p>
              <DefaultButton onClick={clearFilters} type="button">Limpar filtros</DefaultButton>
            </Col>
          )}
        </Row>

        {filteredProducts.length > getInitialDisplayCount() && (
          <div className="catalog-pagination">
            {filteredProducts.length > displayCount ? (
              <DefaultButton onClick={() => setDisplayCount((count) => count + getInitialDisplayCount())} type="button">Ver mais produtos</DefaultButton>
            ) : (
              <DefaultButton onClick={() => setDisplayCount(getInitialDisplayCount())} type="button">Ver menos</DefaultButton>
            )}
          </div>
        )}
      </Container>

      <Modal centered onHide={() => setSelectedProduct(null)} show={selectedProduct !== null}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedProduct?.nome}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <img alt="" className="product-modal__image" src={selectedProduct?.imagem} />
          <p className="mt-3">{selectedProduct?.descricao}</p>
          {selectedProduct && (
            <DefaultButton onClick={addSelectedProductToCart} type="button">
              Adicionar ao carrinho
            </DefaultButton>
          )}
        </Modal.Body>
      </Modal>

      <button aria-label="Fechar carrinho" className={`cart-backdrop ${isCartOpen ? "open" : ""}`} onClick={closeCart} type="button" />
      <aside
        aria-hidden={!isCartOpen}
        aria-labelledby="cart-title"
        aria-modal="true"
        className={`cart-overlay ${isCartOpen ? "open" : ""}`}
        id="cart-drawer"
        ref={cartRef}
        role="dialog"
      >
        <div className="cart-overlay__header">
          <div>
            <p className="cart-overlay__eyebrow">Seu pedido</p>
            <h2 id="cart-title">Carrinho</h2>
          </div>
          <button aria-label="Fechar carrinho" className="cart-close" onClick={closeCart} ref={closeCartButtonRef} type="button">×</button>
        </div>
        {cartItems.length > 0 ? (
          <>
            <p className="cart-summary" aria-live="polite">{totalItems} {totalItems === 1 ? "item" : "itens"} · {formatCurrency(total)}</p>
            <div className="cart-items">
              {cartItems.map(({ product, quantity }) => (
                <article className="cart-item" key={product.id}>
                  <img alt="" src={product.imagem} />
                  <div className="cart-item__content">
                    <h3>{product.nome}</h3>
                    <p>{formatCurrency(product.valor)}</p>
                    <div aria-label={`Quantidade de ${product.nome} no carrinho`} className="quantity-control" role="group">
                      <button aria-label={`Remover uma unidade de ${product.nome}`} onClick={() => removeProduct(product)} type="button"><FiMinus aria-hidden="true" /></button>
                      <output>{quantity}</output>
                      <button aria-label={`Adicionar uma unidade de ${product.nome}`} onClick={() => addProduct(product)} type="button"><FiPlus aria-hidden="true" /></button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="cart-overlay__footer">
              <p>Total: <strong>{formatCurrency(total)}</strong></p>
              <Link className="continueButton" onClick={() => setIsCartOpen(false)} to="/pedidos">Ir para finalizar pedido</Link>
              <button className="empty-cart" onClick={() => { setItemQuantities({}); setAnnouncement("Carrinho esvaziado."); }} type="button">Esvaziar carrinho</button>
            </div>
          </>
        ) : (
          <div className="cart-empty">
            <p>Seu carrinho está vazio.</p>
            <DefaultButton customizarCSS="cart-empty__action" onClick={closeCart} type="button">
              Ver produtos
            </DefaultButton>
          </div>
        )}
      </aside>
    </section>
  );
};
