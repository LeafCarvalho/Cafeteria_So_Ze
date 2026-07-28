export type ErrorCategory =
  | "autorizacao"
  | "conflito"
  | "indisponibilidade"
  | "rede"
  | "validacao"
  | "desconhecido";

export interface AsyncResource<T> {
  data: T;
  loading: boolean;
  erro: string | null;
  recarregar: () => Promise<void>;
}
