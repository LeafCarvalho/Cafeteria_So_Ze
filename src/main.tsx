import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import "./Global.css";

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}