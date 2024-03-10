import React, { useState, useRef, FormEvent, ChangeEvent } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../../services/firebaseConfig';
import { Button, Form } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './style.scss';

interface FormFields {
  nome: string;
  tipo: string;
  valor: string;
  descricao: string;
}

const Cadastro = () => {
  const [formFields, setFormFields] = useState<FormFields>({ nome: '', tipo: '', valor: '', descricao: '' });
  const [imagem, setImagem] = useState<File | null>(null);
  const imagemInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: keyof FormFields, value: string) => {
    setFormFields({ ...formFields, [field]: value });
  };

  const uploadImage = async (imageFile: File) => {
    if (!imageFile) return null;
    const fileRef = ref(storage, `images/${imageFile.name}`);
    await uploadBytes(fileRef, imageFile);
    return getDownloadURL(fileRef);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    try {
      // Inicializa imageUrl como null
      let imageUrl = null;
  
      // Verifica se 'imagem' é um File antes de chamar 'uploadImage'
      if (imagem instanceof File) {
        imageUrl = await uploadImage(imagem);
      }
  
      await addDoc(collection(db, "products"), { ...formFields, valor: Number(formFields.valor), imagem: imageUrl });
  
      toast.success(`Produto '${formFields.nome}' cadastrado com sucesso!`, { position: "top-right", autoClose: 5000 });
      setFormFields({ nome: '', tipo: '', valor: '', descricao: '' });
      setImagem(null);
      if (imagemInputRef.current) imagemInputRef.current.value = "";
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      toast.error('Erro ao cadastrar produto.', { position: "top-right", autoClose: 5000 });
    }
  };
  

  return (
    <div className="cadastro-container">
      <ToastContainer />
      <h2>Cadastrar Novo Produto</h2>
      <Form onSubmit={handleSubmit}>
        {Object.entries(formFields).map(([field, value]) => (
          <Form.Group className="mb-3" key={field}>
            <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
            <Form.Control type={field === 'descricao' ? 'textarea' : 'text'} value={value} onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateField(field as keyof FormFields, e.target.value)} required={field !== 'descricao'} />
          </Form.Group>
        ))}
        <Form.Group className="mb-3">
          <Form.Label>Imagem</Form.Label>
          <Form.Control type="file" ref={imagemInputRef} onChange={(e: ChangeEvent<HTMLInputElement>) => setImagem(e.target.files ? e.target.files[0] : null)} accept="image/png, image/jpeg" />
        </Form.Group>
        <Button variant="primary" type="submit">Cadastrar</Button>
      </Form>
    </div>
  );
};

export default Cadastro;
