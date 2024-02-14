import { Button } from 'react-bootstrap';
import './style.scss';

export const DefaultButton = ({ onClick, children, customizarCSS, ...props }) => {
  return (
    <Button onClick={onClick} className={`defaultCSSButton ${customizarCSS}`} {...props}>
      {children}
    </Button>
  )
}