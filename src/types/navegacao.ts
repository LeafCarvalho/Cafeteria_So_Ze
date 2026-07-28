import type { MouseEvent, ReactNode } from "react";

export interface ScrollOrRouteLinkProps {
  to: string;
  scroll: boolean;
  children: ReactNode;
  className?: string;
  onClick?: (event?: MouseEvent<HTMLElement>) => void;
}

export interface ScrollPosition {
  x: number;
  y: number;
}
