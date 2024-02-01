import { Button } from 'react-bootstrap';
import './style.scss';

export const DefaultButton = ({ onClick, children }) => {
  return (
    <Button onClick={onClick}>
      {children}
    </Button>
  )
}