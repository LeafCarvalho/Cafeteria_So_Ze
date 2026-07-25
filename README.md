# Cafeteria Sô Zé

O projeto Cafeteria Sô Zé é uma loja online para uma cafeteria gourmet. Foi desenvolvido para demonstrar conhecimentos em React, TypeScript, responsividade, transições e integração com Supabase.
<br>
<a href="https://leafcarvalho.github.io/Cafeteria_So_Ze/" target="_blank">CLIQUE AQUI</a> para navegar pelo projeto.

## Pré-visualização da experiência do usuário

![Design sem nome (2)](https://github.com/LeafCarvalho/Cafeteria_So_Ze/assets/79648062/0dc7105c-ec0f-4d2c-afa6-f685f0b7f755)

## Tecnologias Utilizadas

<table>
  <tr>
    <td align="center">
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" alt="react" width="40" height="40"/>
      <br>
      <strong>React</strong>
    </td>
    <td align="center">
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" alt="typescript" width="40" height="40"/>
      <br>
      <strong>TypeScript</strong>
    </td>
    <td align="center">
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/supabase/supabase-original.svg" alt="supabase" width="40" height="40"/>
      <br>
      <strong>Supabase</strong>
    </td>
    <td align="center">
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/bootstrap/bootstrap-plain.svg" alt="react-bootstrap" width="40" height="40"/>
      <br>
      <strong>React Bootstrap</strong>
    </td>
    <td align="center">
      <img src="https://www.chartjs.org/media/logo-title.svg" alt="chartjs" width="40" height="40"/>
      <br>
      <strong>Chart.js</strong>
    </td>
    <td align="center">
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/sass/sass-original.svg" alt="sass" width="40" height="40"/>
      <br>
      <strong>Sass</strong>
    </td>
    <td align="center">
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" alt="react-router-dom" width="40" height="40"/>
      <br>
      <strong>React Router</strong>
    </td>
    <td align="center">
      <img src="https://img.icons8.com/fluency/48/000000/ms-excel.png" alt="xlsx" width="40" height="40"/>
      <br>
      <strong>XLSX</strong>
    </td>
  </tr>
</table>

## Objetivo do Projeto

A ideia é demonstrar capacidade de uso das ferramentas e cuidado com a experiência de clientes e administradores:

- Interface dark gourmet, responsiva e acessível;
- Catálogo com busca, filtros, carrinho e confirmação de pedido;
- Área administrativa para produtos, pedidos e indicadores;
- Autenticação por e-mail e senha com Supabase;
- Persistência segura de pedidos, recuperação por código e proteção contra duplicidade de envio;
- Publicação estática pelo GitHub Pages.

## Instalação

Para configurar o projeto localmente:

```bash
git clone https://github.com/LeafCarvalho/Cafeteria_So_Ze.git
cd Cafeteria_So_Ze
npm install
```

Crie o arquivo `.env` na raiz:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica
```

Em seguida, inicie o projeto:

```bash
npm run dev
```

## Configuração do Supabase

As migrations em [`supabase/migrations`](supabase/migrations) devem ser aplicadas no SQL Editor do Supabase nesta ordem:

1. `20260719000000_confirmacao_pedido.sql`
2. `20260724000000_rls_operacao_administrativa.sql`
3. `20260724000001_idempotencia_e_status_pedido.sql`

Pedidos públicos usam RPCs; preços, códigos de retirada e total são definidos pelo banco. RLS restringe a área administrativa a perfis com `perfis.papel = 'admin'`.

> A última migration altera a RPC de criação de pedidos. Aplique-a junto à publicação do frontend correspondente.

## Comandos úteis

```bash
npm run tsc
npm run build
npm run preview
npm run deploy
```

Não publique arquivos `.env`, chaves `service_role`, senhas ou tokens administrativos.
