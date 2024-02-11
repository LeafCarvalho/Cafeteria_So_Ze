import React, { useState, useRef } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../../services/firebaseConfig';
import { Button, Form } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './style.scss';

const Cadastro = () => {
    const [nome, setNome] = useState('');
    const [tipo, setTipo] = useState('');
    const [valor, setValor] = useState('');
    const [descricao, setDescricao] = useState('');
    const [imagem, setImagem] = useState(null);
    const imagemInputRef = useRef();

    const uploadImage = async (imageFile) => {
        if (!imageFile) return;
        const fileRef = ref(storage, `images/${imageFile.name}`);
        await uploadBytes(fileRef, imageFile);
        return getDownloadURL(fileRef);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const imageUrl = await uploadImage(imagem);

            await addDoc(collection(db, "products"), {
                nome,
                tipo,
                valor: Number(valor),
                descricao,
                imagem: imageUrl
            });

            toast.success(`Produto '${nome}' cadastrado com sucesso!`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            // Limpa os campos após o envio
            setNome('');
            setTipo('');
            setValor('');
            setDescricao('');
            setImagem(null);
            imagemInputRef.current.value = "";
        } catch (error) {
            console.error("Erro ao cadastrar produto:", error);
            toast.error('Erro ao cadastrar produto.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };

    return (
        <div className="cadastro-container">
            <ToastContainer />
            <h2>Cadastrar Novo Produto</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Nome</Form.Label>
                    <Form.Control type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Tipo</Form.Label>
                    <Form.Control type="text" value={tipo} onChange={(e) => setTipo(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Valor</Form.Label>
                    <Form.Control type="number" value={valor} onChange={(e) => setValor(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Descrição</Form.Label>
                    <Form.Control as="textarea" rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Imagem</Form.Label>
                    <Form.Control type="file" ref={imagemInputRef} onChange={(e) => setImagem(e.target.files[0])} accept="image/png, image/jpeg" />
                </Form.Group>
                <Button variant="primary" type="submit">Cadastrar</Button>
            </Form>
        </div>
    );
};

export default Cadastro;
