import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { CartProvider } from "@/Context/CartContext";
import { Header } from "@/components/Header/Header";

const renderHeader = () =>
  render(
    <CartProvider>
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    </CartProvider>,
  );

describe("Header", () => {
  it("não exibe o atalho público para login", () => {
    renderHeader();

    expect(
      screen.queryByRole("link", { name: "Entrar" }),
    ).not.toBeInTheDocument();
  });

  it("fecha o menu pelo Escape e devolve o foco ao botão que o abriu", async () => {
    const user = userEvent.setup();
    renderHeader();
    const menuToggle = screen.getByRole("button", {
      name: "Abrir menu principal",
    });

    await user.click(menuToggle);

    expect(menuToggle).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(menuToggle).toHaveAttribute("aria-expanded", "false");
      expect(menuToggle).toHaveFocus();
    });
  });

  it("fecha o menu quando há interação fora da navegação", async () => {
    const user = userEvent.setup();
    renderHeader();
    const menuToggle = screen.getByRole("button", {
      name: "Abrir menu principal",
    });

    await user.click(menuToggle);
    fireEvent.pointerDown(document.body);

    expect(menuToggle).toHaveAttribute("aria-expanded", "false");
  });
});
