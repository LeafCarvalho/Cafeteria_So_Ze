import React, { useEffect, useState } from 'react';
import { useProducts } from '../../../../Context/ProductProvider';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../../services/firebaseConfig';
import { Col, Modal, Button } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';

const TodosProdutos = () => {
    const { products, setProducts } = useProducts();
    const [isLoading, setIsLoading] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

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

    return (
        <Col>
            {isLoading ? (
                <div className="d-flex justify-content-center">
                    <p>Carregando...</p>
                </div>
            ) : (
                products.map(product => (
                    <div key={product.id} className="product-item">
                        <img src={product.imagem} alt={product.nome} />
                        <p>{product.nome}</p>
                        <p>{product.tipo}</p>
                        <p>{product.valor}</p>
                        <p>{product.descricao}</p>
                        <FaTrash onClick={() => { setShowConfirmModal(true); setSelectedProduct(product); }} />
                    </div>
                ))
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
};

export default TodosProdutos;
