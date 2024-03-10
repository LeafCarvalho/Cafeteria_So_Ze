// Buttons.tsx
import React, { MouseEventHandler, ReactNode } from 'react';
import { Button, ButtonProps } from 'react-bootstrap';
import './style.scss';

export interface DefaultButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
  customizarCSS?: string;
}

export const DefaultButton: React.FC<DefaultButtonProps> = ({ onClick, children, customizarCSS = '', ...props }) => {
  return (
    <Button onClick={onClick} className={`defaultCSSButton ${customizarCSS}`} {...props}>
      {children}
    </Button>
  );
};
