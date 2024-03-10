interface ImportMetaEnv {
    readonly VITE_REACT_APP_API_KEY: string;
    readonly VITE_REACT_APP_authDomain: string;
    readonly VITE_REACT_APP_projectId: string;
    readonly VITE_REACT_APP_storageBucket: string;
    readonly VITE_REACT_APP_messagingSenderId: string;
    readonly VITE_REACT_APP_appId: string;
    readonly VITE_REACT_APP_measurementId: string;
    // Adicione mais variáveis de ambiente conforme necessário
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare module '*.png' {
    const value: string;
    export = value;
  }
  
  declare module '*.jpg' {
    const value: string;
    export = value;
  }
  
  declare module '*.jpeg' {
    const value: string;
    export = value;
  }
  
  declare module '*.gif' {
    const value: string;
    export = value;
  }
  
  declare module 'file-saver';

  