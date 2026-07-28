import { ChangeEvent, useEffect, useState } from "react";
import { Button, Col, Form, Modal, Pagination } from "react-bootstrap";
import { FaCheck, FaEdit, FaTimes, FaTrash } from "react-icons/fa";
import { useProdutosContext } from "@/Context/ProdutosProvider";
import { AtualizarProdutoDTO, EditState, Produto } from "@/types/produtos";
import "./style.scss";

const PRODUCTS_PER_PAGE = 3;

const TodosProdutos = () => {
  const { produtos, loading, erro, atualizarProduto, deletarProduto } =
    useProdutosContext();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  const [editState, setEditState] = useState<EditState>({
    id: null,
    field: "",
  });
  const [editValue, setEditValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);

  const totalPages = Math.ceil(produtos.length / PRODUCTS_PER_PAGE);
  const safePage = totalPages ? Math.min(currentPage, totalPages) : 1;
  const currentProducts = produtos.slice(
    (safePage - 1) * PRODUCTS_PER_PAGE,
    safePage * PRODUCTS_PER_PAGE,
  );

  useEffect(() => {
    if (currentPage !== safePage) setCurrentPage(safePage);
  }, [currentPage, safePage]);

  const closeModal = () => {
    setShowConfirmModal(false);
    setSelectedProduct(null);
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    setActionError(null);
    const deleted = await deletarProduto(selectedProduct.id);
    if (!deleted) {
      setActionError("Não foi possível excluir o produto. Tente novamente.");
      return;
    }
    closeModal();
  };

  const startEdit = (product: Produto, field: keyof AtualizarProdutoDTO) => {
    setActionError(null);
    setEditState({ id: product.id, field });
    setEditValue(String(product[field]));
  };

  const cancelEdit = () => {
    setEditState({ id: null, field: "" });
    setEditValue("");
    setActionError(null);
  };

  const saveEdit = async () => {
    if (!editState.id || !editState.field) return;
    if (
      editState.field === "valor" &&
      (!editValue || Number.isNaN(Number(editValue)))
    ) {
      setActionError("Informe um preço válido.");
      return;
    }
    const field = editState.field as keyof AtualizarProdutoDTO;
    const updated = await atualizarProduto(editState.id, {
      [field]: field === "valor" ? Number(editValue) : editValue,
    });
    if (!updated) {
      setActionError("Não foi possível salvar a alteração. Tente novamente.");
      return;
    }
    cancelEdit();
  };

  if (loading)
    return (
      <Col className="my-col">
        <p className="product-feedback" role="status">
          Carregando produtos…
        </p>
      </Col>
    );
  if (erro)
    return (
      <Col className="my-col">
        <p className="product-feedback product-feedback--error" role="alert">
          {erro}
        </p>
      </Col>
    );

  const renderEditorActions = () => (
    <div className="inline-actions">
      <button
        className="icon-button icon-button--confirm"
        type="button"
        onClick={saveEdit}
        aria-label="Salvar alteração"
      >
        <FaCheck aria-hidden="true" />
      </button>
      <button
        className="icon-button"
        type="button"
        onClick={cancelEdit}
        aria-label="Cancelar edição"
      >
        <FaTimes aria-hidden="true" />
      </button>
    </div>
  );

  const renderEditableField = (
    field: keyof AtualizarProdutoDTO,
    product: Produto,
    isNumber = false,
  ) => {
    const isEditing = editState.id === product.id && editState.field === field;
    const fieldName = field === "valor" ? "preço" : field;
    return isEditing ? (
      <div className="edit-input">
        <Form.Control
          aria-label={`Editar ${fieldName} de ${product.nome}`}
          type={isNumber ? "number" : "text"}
          min={isNumber ? "0" : undefined}
          step={isNumber ? "0.01" : undefined}
          value={editValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setEditValue(event.target.value)
          }
          autoFocus
        />
        {renderEditorActions()}
      </div>
    ) : (
      <div className="editable-field">
        <p>
          {field === "valor"
            ? `R$ ${Number(product.valor).toFixed(2).replace(".", ",")}`
            : product[field]}
        </p>
        <button
          className="icon-button"
          type="button"
          onClick={() => startEdit(product, field)}
          aria-label={`Editar ${fieldName} de ${product.nome}`}
        >
          <FaEdit aria-hidden="true" />
        </button>
      </div>
    );
  };

  return (
    <Col className="my-col">
      <div className="product-list" aria-live="polite">
        {actionError && (
          <p className="product-feedback product-feedback--error" role="alert">
            {actionError}
          </p>
        )}
        {!currentProducts.length ? (
          <p className="product-feedback">Nenhum produto cadastrado.</p>
        ) : (
          currentProducts.map((product) => (
            <article key={product.id} className="product-item">
              <div className="product-info">
                {editState.id === product.id && editState.field === "imagem" ? (
                  <div className="image-editor">
                    <Form.Control
                      aria-label={`Editar URL da imagem de ${product.nome}`}
                      value={editValue}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setEditValue(event.target.value)
                      }
                      autoFocus
                    />
                    {renderEditorActions()}
                  </div>
                ) : (
                  <div className="image-container">
                    <img src={product.imagem} alt={product.nome} />
                    <button
                      className="icon-button image-edit-button"
                      type="button"
                      onClick={() => startEdit(product, "imagem")}
                      aria-label={`Editar imagem de ${product.nome}`}
                    >
                      <FaEdit aria-hidden="true" />
                    </button>
                  </div>
                )}
                <div className="product-details">
                  {renderEditableField("nome", product)}
                  {renderEditableField("tipo", product)}
                  {renderEditableField("valor", product, true)}
                </div>
              </div>
              {editState.id === product.id &&
              editState.field === "descricao" ? (
                <div className="description-editor">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    aria-label={`Editar descrição de ${product.nome}`}
                    value={editValue}
                    onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                      setEditValue(event.target.value)
                    }
                    autoFocus
                  />
                  {renderEditorActions()}
                </div>
              ) : (
                <div className="description-container">
                  <p>{product.descricao || "Sem descrição."}</p>
                  <button
                    className="icon-button"
                    type="button"
                    onClick={() => startEdit(product, "descricao")}
                    aria-label={`Editar descrição de ${product.nome}`}
                  >
                    <FaEdit aria-hidden="true" />
                  </button>
                </div>
              )}
              <button
                className="icon-button icon-button--delete"
                type="button"
                onClick={() => {
                  setActionError(null);
                  setSelectedProduct(product);
                  setShowConfirmModal(true);
                }}
                aria-label={`Excluir ${product.nome}`}
              >
                <FaTrash aria-hidden="true" />
              </button>
            </article>
          ))
        )}
        {totalPages > 1 && (
          <Pagination
            className="pagination-container"
            aria-label="Paginação de produtos"
          >
            <Pagination.First
              onClick={() => setCurrentPage(1)}
              disabled={safePage === 1}
              aria-label="Primeira página"
            />
            <Pagination.Prev
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={safePage === 1}
              aria-label="Página anterior"
            />
            {Array.from({ length: totalPages }, (_, index) => (
              <Pagination.Item
                key={index + 1}
                active={index + 1 === safePage}
                onClick={() => setCurrentPage(index + 1)}
                aria-label={`Página ${index + 1}`}
              >
                {index + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={safePage === totalPages}
              aria-label="Próxima página"
            />
            <Pagination.Last
              onClick={() => setCurrentPage(totalPages)}
              disabled={safePage === totalPages}
              aria-label="Última página"
            />
          </Pagination>
        )}
      </div>
      <Modal
        className="product-modal"
        show={showConfirmModal}
        onHide={closeModal}
        centered
        aria-labelledby="delete-product-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="delete-product-title">Excluir produto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Deseja realmente excluir <strong>{selectedProduct?.nome}</strong>?
          Esta ação não pode ser desfeita.
        </Modal.Body>
        <Modal.Footer>
          <Button className="button-secondary" onClick={closeModal}>
            Cancelar
          </Button>
          <Button className="button-danger" onClick={handleDelete}>
            Excluir produto
          </Button>
        </Modal.Footer>
      </Modal>
    </Col>
  );
};

export default TodosProdutos;
