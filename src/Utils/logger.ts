import type { ErrorCategory } from "@/types/async";

interface ErrorWithCode {
  code?: unknown;
}

export interface ErrorLogContext {
  operation: string;
  category: ErrorCategory;
  code?: string;
}

const getErrorCode = (error: unknown): string | undefined => {
  if (!error || typeof error !== "object") return undefined;

  const code = (error as ErrorWithCode).code;
  return code === undefined ? undefined : String(code);
};

export const logError = (error: unknown, context: ErrorLogContext): void => {
  if (!import.meta.env.DEV) return;

  console.error("[Cafeteria Sô Zé] Falha operacional", {
    operation: context.operation,
    category: context.category,
    code: context.code ?? getErrorCode(error) ?? "sem-codigo",
    errorType: error instanceof Error ? error.name : typeof error,
  });
};
