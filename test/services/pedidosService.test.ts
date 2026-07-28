import { beforeEach, describe, expect, it, vi } from "vitest";

const { rpcMock } = vi.hoisted(() => ({ rpcMock: vi.fn() }));

vi.mock("@/Utils/supabase", () => ({
  supabase: {
    rpc: rpcMock,
  },
}));

import { pedidosService } from "@/services/pedidosService";

describe("pedidosService", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("envia o contrato completo da RPC de criação e converte o total", async () => {
    rpcMock.mockResolvedValue({
      data: [{
        confirmacao_id: "confirmacao-123",
        codigo_retirada: "123456",
        expira_em: "2026-07-25T20:00:00.000Z",
        total: "25.5",
      }],
      error: null,
    });

    const confirmation = await pedidosService.criarPedidoConfirmado({
      nome_cliente: "Rafael Carvalho",
      telefone: "(31) 99999-9999",
      itens: [{ produto_id: "cafe-especial", quantidade: 2 }],
      chave_idempotencia: "fcae762d-89b3-4ed0-a6af-0ee1d02c53d9",
    });

    expect(rpcMock).toHaveBeenCalledWith("criar_pedido_confirmado", {
      p_nome_cliente: "Rafael Carvalho",
      p_telefone: "(31) 99999-9999",
      p_itens: [{ produto_id: "cafe-especial", quantidade: 2 }],
      p_chave_idempotencia: "fcae762d-89b3-4ed0-a6af-0ee1d02c53d9",
    });
    expect(confirmation).toMatchObject({
      confirmacao_id: "confirmacao-123",
      codigo_retirada: "123456",
      total: 25.5,
    });
  });

  it("falha quando a RPC cria o pedido sem retornar confirmação", async () => {
    rpcMock.mockResolvedValue({ data: [], error: null });

    await expect(pedidosService.criarPedidoConfirmado({
      nome_cliente: "Rafael Carvalho",
      telefone: "(31) 99999-9999",
      itens: [{ produto_id: "cafe-especial", quantidade: 1 }],
      chave_idempotencia: "fcae762d-89b3-4ed0-a6af-0ee1d02c53d9",
    })).rejects.toThrow("O pedido foi criado sem uma confirmação válida.");
  });

  it("recupera uma confirmação sem expor o telefone do cliente", async () => {
    rpcMock.mockResolvedValue({
      data: [{
        confirmacao_id: "confirmacao-123",
        nome_cliente: "Rafael Carvalho",
        codigo_retirada: "123456",
        expira_em: "2026-07-25T20:00:00.000Z",
        total: "12.5",
        itens: [{
          produto_id: "cafe-especial",
          nome: "Café especial",
          imagem: "https://example.com/cafe.webp",
          quantidade: "1",
          valor_unitario: "12.5",
        }],
      }],
      error: null,
    });

    const confirmation = await pedidosService.recuperarConfirmacao(
      "confirmacao-123",
      "123456",
    );

    expect(rpcMock).toHaveBeenCalledWith("recuperar_confirmacao_pedido", {
      p_confirmacao_id: "confirmacao-123",
      p_codigo_retirada: "123456",
    });
    expect(confirmation).toEqual({
      confirmacao_id: "confirmacao-123",
      nome_cliente: "Rafael Carvalho",
      senha_retirar_ped: "123456",
      expira_em: "2026-07-25T20:00:00.000Z",
      total: 12.5,
      produtos: [{
        id: "cafe-especial",
        nome: "Café especial",
        imagem: "https://example.com/cafe.webp",
        valor: 12.5,
        quantidade: 1,
      }],
    });
  });

  it("atualiza status somente pela RPC administrativa protegida", async () => {
    rpcMock.mockResolvedValue({ error: null });

    await pedidosService.atualizarStatusPedidoAdmin({
      pedido_id: "pedido-123",
      status_atual: "criado",
      novo_status: "em_preparo",
    });

    expect(rpcMock).toHaveBeenCalledWith("atualizar_status_pedido_admin", {
      p_pedido_id: "pedido-123",
      p_status_esperado: "criado",
      p_novo_status: "em_preparo",
    });
  });
});
