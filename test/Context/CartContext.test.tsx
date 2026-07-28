import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CartProvider, useCart } from "@/Context/CartContext";
import { Produto } from "@/types/produtos";

const cartProduct: Produto = {
  id: "cafe-especial",
  nome: "Café especial",
  tipo: "Bebida",
  valor: 12.5,
  descricao: "Café coado na hora.",
  imagem: "https://example.com/cafe.webp",
};

const CartHarness = () => {
  const {
    cartProducts,
    confirmationAccessData,
    itemQuantities,
    setCartProducts,
    setConfirmationAccessData,
    setItemQuantities,
    total,
  } = useCart();

  return (
    <>
      <output data-testid="cart-product-count">{cartProducts.length}</output>
      <output data-testid="cart-total">{total}</output>
      <output data-testid="cart-quantity">
        {itemQuantities[cartProduct.id] ?? 0}
      </output>
      <output data-testid="confirmation-id">
        {confirmationAccessData?.confirmacaoId ?? ""}
      </output>
      <button
        onClick={() => {
          setCartProducts([cartProduct]);
          setItemQuantities({ [cartProduct.id]: 2 });
        }}
        type="button"
      >
        Preencher carrinho
      </button>
      <button
        onClick={() =>
          setConfirmationAccessData({
            confirmacaoId: "confirmacao-123",
            codigoRetirada: "123456",
          })
        }
        type="button"
      >
        Salvar confirmação
      </button>
      <button onClick={() => setConfirmationAccessData(null)} type="button">
        Limpar confirmação
      </button>
    </>
  );
};

const renderCart = () =>
  render(
    <CartProvider>
      <CartHarness />
    </CartProvider>,
  );

describe("CartContext", () => {
  it("inicia com o carrinho vazio e calcula o total pelas quantidades selecionadas", async () => {
    const user = userEvent.setup();
    renderCart();

    expect(screen.getByTestId("cart-product-count")).toHaveTextContent("0");
    expect(screen.getByTestId("cart-quantity")).toHaveTextContent("0");
    expect(screen.getByTestId("cart-total")).toHaveTextContent("0");

    await user.click(
      screen.getByRole("button", { name: "Preencher carrinho" }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("cart-total")).toHaveTextContent("25");
    });
    expect(screen.getByTestId("cart-product-count")).toHaveTextContent("1");
    expect(screen.getByTestId("cart-quantity")).toHaveTextContent("2");
  });

  it("persiste somente os dados de acesso da confirmação e os remove ao limpar", async () => {
    const user = userEvent.setup();
    renderCart();

    await user.click(
      screen.getByRole("button", { name: "Salvar confirmação" }),
    );

    await waitFor(() => {
      expect(sessionStorage.getItem("cafeteria-so-ze-confirmacao")).toBe(
        JSON.stringify({
          confirmacaoId: "confirmacao-123",
          codigoRetirada: "123456",
        }),
      );
    });
    expect(screen.getByTestId("confirmation-id")).toHaveTextContent(
      "confirmacao-123",
    );

    await user.click(
      screen.getByRole("button", { name: "Limpar confirmação" }),
    );

    await waitFor(() => {
      expect(sessionStorage.getItem("cafeteria-so-ze-confirmacao")).toBeNull();
    });
  });
});
