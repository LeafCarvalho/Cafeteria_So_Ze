import React, { useEffect, useState } from 'react';
import { useProducts } from '../../../../Context/ProductProvider';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../services/firebaseConfig';
import { Col, Modal, Button, Form } from 'react-bootstrap';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import './style.scss';

const TodosProdutos = () => {
    const { products, setProducts } = useProducts();
    const [isLoading, setIsLoading] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editState, setEditState] = useState({ id: null, field: '' });
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            const querySnapshot = await getDocs(collection(db, "products"));
            const productsArray = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
            }));
            setProducts(productsArray);
            setIsLoading(false);
        };
        fetchProducts();
    }, [setProducts]);

    const handleDelete = async () => {
        await deleteDoc(doc(db, "products", selectedProduct.id));
        setProducts(prevProducts => prevProducts.filter(product => product.id !== selectedProduct.id));
        setShowConfirmModal(false);
    };

    const startEdit = (productId, field) => {
        setEditState({ id: productId, field });
        const product = products.find(p => p.id === productId);
        setEditValue(product[field]);
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

    return (
        <Col>
            {isLoading ? (
                <div className="d-flex justify-content-center">
                    <p>Carregando...</p>
                </div>
            ) : (
                <div className="product-list">
                    {products.map(product => (
                        <div key={product.id} className="product-item">
                            <div className="product-info">
                                {editState.id === product.id && editState.field === 'imagem' ? (
                                    <Form.Control type="file" onChange={(e) => setEditValue(e.target.files[0])} />
                                ) : (
                                    <div className="image-container">
                                        <img src={product.imagem} alt={product.nome} />
                                        <FaEdit className="edit-icon" onClick={() => startEdit(product.id, 'imagem')} />
                                    </div>
                                )}
                                <div className="product-details">
                                    {renderEditableField('nome', product)}
                                    {renderEditableField('tipo', product)}
                                    {renderEditableField('valor', product, true)}
                                </div>
                            </div>
                            {editState.id === product.id && editState.field === 'descricao' ? (
                                <div>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                    />
                                    <FaCheck className="action-icon" onClick={saveEdit} />
                                    <FaTimes className="action-icon" onClick={cancelEdit} />
                                </div>
                            ) : (
                                <div className="description-container">
                                    <p>{product.descricao}</p>
                                    <FaEdit className="edit-icon" onClick={() => startEdit(product.id, 'descricao')} />
                                </div>
                            )}
                            <FaTrash className="delete-icon" onClick={() => { setShowConfirmModal(true); setSelectedProduct(product); }} />
                        </div>
                    ))}
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

    function renderEditableField(field, product, isNumber = false) {
        return editState.id === product.id && editState.field === field ? (
            <div className='editInput'>
                <Form.Control
                    type={isNumber ? "number" : "text"}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
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
