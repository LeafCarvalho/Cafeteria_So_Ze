import { useProdutosContext } from "../../../../Context/ProdutosProvider";
import { useState, ChangeEvent } from "react";
import {
  AtualizarProdutoDTO,
  EditState,
  Produto,
} from "../../../../types/produtos";
import { Col, Modal, Button, Form, Pagination } from "react-bootstrap";
import { FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import "./style.scss";
import { useProdutos } from "../../../../hooks/useProdutos";

const TodosProdutos = () => {
  const { produtos, loading, erro, atualizarProduto, deletarProduto } =
    useProdutosContext();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  const [editState, setEditState] = useState<EditState>({
    id: null,
    field: "",
  });
  const [editValue, setEditValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 3;
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = produtos.slice(
    indexOfFirstProduct,
    indexOfLastProduct,
  );
  const totalPages = Math.ceil(produtos.length / productsPerPage);

  console.log(produtos);

  const handleDelete = async () => {
    if (!selectedProduct) return;

    const deletou = await deletarProduto(selectedProduct.id);
    if (!deletou) return;

    setShowConfirmModal(false);
    setSelectedProduct(null);
  };

  const startEdit = (productId: string, field: keyof Produto) => {
    setEditState({ id: productId, field });
    const product = produtos.find((p) => p.id === productId);
    if (product) setEditValue(String(product[field]));
  };

  const cancelEdit = () => {
    setEditState({ id: null, field: "" });
    setEditValue("");
  };

  const saveEdit = async () => {
    if (!editState.id || editState.field === "") return;

    const field = editState.field as keyof AtualizarProdutoDTO;

    const data: AtualizarProdutoDTO = {
      [field]: field === "valor" ? Number(editValue) : editValue,
    };

    const atualizou = await atualizarProduto(editState.id, data);

    if (!atualizou) return;

    cancelEdit();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const fileURL = URL.createObjectURL(files[0]);
      setEditValue(fileURL);
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (erro) return <p>{erro}</p>;

  return (
    <Col className="my-col">
      <div className="product-list">
        {currentProducts.map((product) => (
          <div key={product.id} className="product-item">
            <div className="product-info">
              {editState.id === product.id && editState.field === "imagem" ? (
                <Form.Control type="file" onChange={handleFileChange} />
              ) : (
                <div className="image-container">
                  <img src={product.imagem} alt={product.nome} />
                  <FaEdit
                    className="edit-icon"
                    onClick={() => startEdit(String(product.id), "imagem")}
                  />
                </div>
              )}
              <div className="product-details w-100">
                {renderEditableField("nome", product as Produto)}
                {renderEditableField("tipo", product as Produto)}
                {renderEditableField("valor", product as Produto, true)}
              </div>
            </div>
            {editState.id === product.id && editState.field === "descricao" ? (
              <div className="w-100">
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editValue}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setEditValue(e.target.value)
                  }
                />
                <FaCheck className="action-icon" onClick={saveEdit} />
                <FaTimes className="action-icon" onClick={cancelEdit} />
              </div>
            ) : (
              <div className="description-container">
                <p>{product.descricao}</p>
                <FaEdit
                  className="edit-icon"
                  onClick={() => startEdit(String(product.id), "descricao")}
                />
              </div>
            )}
            <FaTrash
              className="delete-icon"
              onClick={() => {
                setShowConfirmModal(true);
                setSelectedProduct(product as Produto);
              }}
            />
          </div>
        ))}
        <Pagination className="pagination-container">
          <Pagination.First
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 1}
          />
          {[...Array(totalPages).keys()].map((page) => (
            <Pagination.Item
              key={page + 1}
              active={page + 1 === currentPage}
              onClick={() => setCurrentPage(page + 1)}
            >
              {page + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === totalPages}
          />
          <Pagination.Last
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </div>
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmação</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza de que deseja excluir {selectedProduct?.nome}?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>
    </Col>
  );

  function renderEditableField(
    field: keyof Produto,
    product: Produto,
    isNumber: boolean = false,
  ) {
    return editState.id === product.id && editState.field === field ? (
      <div className="editInput">
        <Form.Control
          type={isNumber ? "number" : "text"}
          value={editValue}
          onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setEditValue(e.target.value)
          }
        />
        <FaCheck className="action-icon" onClick={saveEdit} />
        <FaTimes className="action-icon" onClick={cancelEdit} />
      </div>
    ) : (
      <div className="editable-field">
        <p>{product[field]}</p>
        <FaEdit
          className="edit-icon"
          onClick={() => startEdit(product.id, field)}
        />
      </div>
    );
  }
};

export default TodosProdutos;
