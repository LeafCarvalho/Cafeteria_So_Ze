import { afterEach, describe, expect, it, vi } from "vitest";
import { logError } from "@/Utils/logger";

describe("logError", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("registra contexto técnico sem expor a mensagem original do erro", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    logError(
      { code: "PGRST301", message: "telefone: 31999999999" },
      { operation: "pedido.criar", category: "indisponibilidade" },
    );

    expect(consoleError).toHaveBeenCalledWith(
      "[Cafeteria Sô Zé] Falha operacional",
      expect.objectContaining({
        operation: "pedido.criar",
        category: "indisponibilidade",
        code: "PGRST301",
      }),
    );
    expect(consoleError.mock.calls[0][1]).not.toHaveProperty("message");
  });
});
