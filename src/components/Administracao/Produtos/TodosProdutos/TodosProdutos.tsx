import React, { useEffect, useState, ChangeEvent } from 'react';
import { useProducts } from '../../../../Context/ProductProvider';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../services/firebaseConfig';
import { Col, Modal, Button, Form, Pagination } from 'react-bootstrap';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import './style.scss';

interface Product {
  id: string;
  nome: string;
  tipo: string;
  valor: number;
  descricao: string;
  imagem: string;
}

interface EditState {
    id: string | null;
    field: keyof Product | '';
}

const TodosProdutos = () => {
  const { products, setProducts } = useProducts();
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editState, setEditState] = useState<EditState>({ id: null, field: '' });
  const [editValue, setEditValue] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 3;
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsArray = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as Product[];
      setProducts(productsArray);
      setIsLoading(false);
    };
    fetchProducts();
  }, [setProducts]);

  const handleDelete = async () => {
    if (!selectedProduct) return;
    await deleteDoc(doc(db, "products", selectedProduct.id));
    setProducts(prevProducts => prevProducts.filter(product => product.id !== selectedProduct.id));
    setShowConfirmModal(false);
  };

  const startEdit = (productId: string, field: keyof Product) => {
    setEditState({ id: productId, field });
    const product = products.find(p => p.id === productId);
    if (product) setEditValue(String(product[field]));
  };

  const cancelEdit = () => {
    setEditState({ id: null, field: '' });
    setEditValue('');
  };

  const saveEdit = async () => {
    if (!editState.id || editState.field === '') return;

    const updatedProduct = { [editState.field]: editValue };
    await updateDoc(doc(db, "products", editState.id), updatedProduct);

    setProducts(prevProducts => prevProducts.map(product => {
      if (product.id === editState.id) {
        return { ...product, [editState.field]: editValue };
      }
      return product;
    }));

    cancelEdit();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const fileURL = URL.createObjectURL(files[0]);
      setEditValue(fileURL);
    }
  };
  

  return (
    <Col className="my-col">
      {isLoading ? (
        <div className="loading-container">
          <p>Carregando...</p>
        </div>
      ) : (
        <div className="product-list">
          {currentProducts.map(product => (
            <div key={product.id} className="product-item">
            <div className="product-info">
                {editState.id === product.id && editState.field === 'imagem' ? (
                    <Form.Control type="file" onChange={handleFileChange} />
                ) : (
                    <div className="image-container">
                        <img src={product.imagem} alt={product.nome} />
                        <FaEdit className="edit-icon" onClick={() => startEdit(String(product.id), 'imagem')} />
                    </div>
                )}
                <div className="product-details w-100">
                    {renderEditableField('nome', product as Product)}
                    {renderEditableField('tipo', product as Product)}
                    {renderEditableField('valor', product as Product, true)}
                </div>
            </div>
              {editState.id === product.id && editState.field === 'descricao' ? (
                <div className='w-100'>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={editValue}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditValue(e.target.value)}
                  />
                  <FaCheck className="action-icon" onClick={saveEdit} />
                  <FaTimes className="action-icon" onClick={cancelEdit} />
                </div>
              ) : (
                <div className="description-container">
                  <p>{product.descricao}</p>
                  <FaEdit className="edit-icon" onClick={() => startEdit(String(product.id), 'descricao')} />
                </div>
              )}
              <FaTrash className="delete-icon" onClick={() => { setShowConfirmModal(true); setSelectedProduct(product as Product); }} />
            </div>
          ))}
          <Pagination className="pagination-container">
            <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
            <Pagination.Prev onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1} />
            {[...Array(totalPages).keys()].map(page => (
              <Pagination.Item key={page + 1} active={page + 1 === currentPage} onClick={() => setCurrentPage(page + 1)}>
                {page + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === totalPages} />
            <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
          </Pagination>
        </div>
      )}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmação</Modal.Title>
        </Modal.Header>
        <Modal.Body>Tem certeza de que deseja excluir {selectedProduct?.nome}?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Excluir</Button>
        </Modal.Footer>
      </Modal>
    </Col>
  );

  function renderEditableField(field: keyof Product, product: Product, isNumber: boolean = false) {
    return editState.id === product.id && editState.field === field ? (
      <div className='editInput'>
        <Form.Control
          type={isNumber ? "number" : "text"}
          value={editValue}
          onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEditValue(e.target.value)}
        />
        <FaCheck className="action-icon" onClick={saveEdit} />
        <FaTimes className="action-icon" onClick={cancelEdit} />
      </div>
    ) : (
      <div className="editable-field">
        <p>{product[field]}</p>
        <FaEdit className="edit-icon" onClick={() => startEdit(product.id, field)} />
      </div>
    );
  }
};

export default TodosProdutos;
