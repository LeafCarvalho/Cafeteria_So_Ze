import React, { ChangeEvent, FormEvent, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { produtosService } from "../../../../services/produtosService";
import { CriarProdutoDTO } from "../../../../types/produtos";
import "./style.scss";

type FormFields = Record<keyof CriarProdutoDTO, string>;

const initialFormFields: FormFields = {
  nome: "",
  tipo: "",
  valor: "",
  descricao: "",
  imagem: "",
};

const labels: Record<keyof CriarProdutoDTO, string> = {
  nome: "Nome",
  tipo: "Tipo",
  valor: "Valor",
  descricao: "Descrição",
  imagem: "URL da imagem",
};

const Cadastro = () => {
  const [formFields, setFormFields] = useState<FormFields>(initialFormFields);
  const [salvando, setSalvando] = useState(false);

  const updateField = (field: keyof CriarProdutoDTO, value: string) => {
    setFormFields((fields) => ({ ...fields, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSalvando(true);

      await produtosService.criarProduto({
        ...formFields,
        valor: Number(formFields.valor),
      });

      toast.success(`Produto '${formFields.nome}' cadastrado com sucesso!`, {
        position: "top-right",
        autoClose: 5000,
      });
      setFormFields(initialFormFields);
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      toast.error("Erro ao cadastrar produto.", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="cadastro-container">
      <ToastContainer />
      <h2>Cadastrar Novo Produto</h2>
      <Form onSubmit={handleSubmit}>
        {Object.entries(formFields).map(([field, value]) => {
          const typedField = field as keyof CriarProdutoDTO;

          return (
            <Form.Group className="mb-3" key={field}>
              <Form.Label>{labels[typedField]}</Form.Label>
              <Form.Control
                as={typedField === "descricao" ? "textarea" : "input"}
                type={typedField === "valor" ? "number" : "text"}
                value={value}
                onChange={(
                  event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
                ) => updateField(typedField, event.target.value)}
                required={typedField !== "descricao"}
              />
            </Form.Group>
          );
        })}
        <Button variant="primary" type="submit" disabled={salvando}>
          {salvando ? "Cadastrando..." : "Cadastrar"}
        </Button>
      </Form>
    </div>
  );
};

export default Cadastro;
