// Buttons.tsx
import React, { MouseEventHandler, ReactNode, ButtonHTMLAttributes } from 'react';
import { Button } from 'react-bootstrap';
import './style.scss';

export interface DefaultButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
  customizarCSS?: string;
}

export const DefaultButton: React.FC<DefaultButtonProps> = ({ children, customizarCSS = '', ...props }) => {
  return (
    <Button className={`defaultCSSButton ${customizarCSS}`} {...props}>
      {children}
    </Button>
  );
};
