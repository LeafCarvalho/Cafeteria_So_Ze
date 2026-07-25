import { ChangeEvent, FormEvent, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { produtosService } from "../../../../services/produtosService";
import { CriarProdutoDTO } from "../../../../types/produtos";
import "./style.scss";

type FormFields = Record<keyof CriarProdutoDTO, string>;
const initialFormFields: FormFields = { nome: "", tipo: "", valor: "", descricao: "", imagem: "" };
const labels: Record<keyof CriarProdutoDTO, string> = { nome: "Nome", tipo: "Categoria", valor: "Preço", descricao: "Descrição", imagem: "URL da imagem" };

const Cadastro = () => {
  const [formFields, setFormFields] = useState<FormFields>(initialFormFields);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const updateField = (field: keyof CriarProdutoDTO, value: string) => setFormFields((fields) => ({ ...fields, [field]: value }));
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setFeedback(null);
    if (Number(formFields.valor) < 0 || !formFields.valor) { setFeedback({ type: "error", text: "Informe um preço válido." }); return; }
    try { setSalvando(true); await produtosService.criarProduto({ ...formFields, valor: Number(formFields.valor) }); setFeedback({ type: "success", text: `“${formFields.nome}” foi cadastrado com sucesso.` }); setFormFields(initialFormFields); }
    catch { setFeedback({ type: "error", text: "Não foi possível cadastrar o produto. Tente novamente." }); }
    finally { setSalvando(false); }
  };
  return <section className="cadastro-container" aria-labelledby="cadastro-title"><div className="cadastro-heading"><p className="eyebrow">Cardápio</p><h2 id="cadastro-title">Cadastrar novo produto</h2><p>Preencha os detalhes para incluir uma nova opção no cardápio.</p></div>{feedback && <p className={`form-feedback form-feedback--${feedback.type}`} role={feedback.type === "error" ? "alert" : "status"}>{feedback.text}</p>}<Form onSubmit={handleSubmit} noValidate><div className="form-grid">{Object.entries(formFields).map(([field, value]) => { const typedField = field as keyof CriarProdutoDTO; const id = `produto-${typedField}`; const controlProps = { value, onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateField(typedField, e.target.value), required: typedField !== "descricao" }; return <Form.Group className={typedField === "descricao" ? "form-field form-field--full" : "form-field"} controlId={id} key={field}><Form.Label>{labels[typedField]}</Form.Label>{typedField === "descricao" ? <Form.Control as="textarea" rows={4} {...controlProps} /> : <Form.Control type={typedField === "valor" ? "number" : typedField === "imagem" ? "url" : "text"} min={typedField === "valor" ? "0" : undefined} step={typedField === "valor" ? "0.01" : undefined} placeholder={typedField === "imagem" ? "https://..." : undefined} aria-describedby={typedField === "imagem" ? `${id}-help` : undefined} {...controlProps} />}{typedField === "imagem" && <Form.Text id={`${id}-help`}>Use uma URL pública da imagem do produto.</Form.Text>}</Form.Group>; })}</div><Button className="submit-product" type="submit" disabled={salvando}>{salvando ? "Cadastrando…" : "Cadastrar produto"}</Button></Form></section>;
};
export default Cadastro;
