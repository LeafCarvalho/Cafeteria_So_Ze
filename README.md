# Cafeteria Sô Zé

O projeto Cafeteria Sô Zé é uma loja online para uma cafeteria gourmet. Foi desenvolvido para demonstrar conhecimentos em React, TypeScript, responsividade, transições e integração com Supabase.
<br>
<a href="https://leafcarvalho.github.io/Cafeteria_So_Ze/" target="_blank">CLIQUE AQUI</a> para navegar pelo projeto.

## Pré-visualização da experiência do usuário

<img width="1885" height="868" alt="Cafeteria Só Zé v2 video" src="https://github.com/user-attachments/assets/bf404554-db8f-4991-8093-8f1fcc21e577" />
<img width="380" height="868" alt="mobile" src="https://github.com/user-attachments/assets/65917b94-9d2a-46ea-9cc4-663e50bbb685" />
<img width="380" height="868" alt="mobile2" src="https://github.com/user-attachments/assets/c9637681-2c63-48d4-b265-7d08ac485b66" />

## Performance e experiência responsiva

<img width="620" height="420" alt="Captura de tela 2026-07-28 174520" src="https://github.com/user-attachments/assets/6aadce68-906f-440b-8911-8b3b415cf200" />
<img width="620" height="420" alt="Captura de tela 2026-07-28 174535" src="https://github.com/user-attachments/assets/648de964-4e49-42c6-8278-059763b36379" />


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
    <td align="center">
      <img src="https://raw.githubusercontent.com/vitest-dev/vitest/main/docs/public/logo.svg" alt="vitest" width="40" height="40"/>
      <br>
      <strong>Vitest</strong>
    </td>
    <td align="center">
      <img src="https://testing-library.com/img/octopus-128x128.png" alt="react-testing-library" width="40" height="40"/>
      <br>
      <strong>React Testing Library</strong>
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

## Testes unitários

Os testes usam **Vitest** como executor e **React Testing Library** para validar a interface pelo comportamento acessível. A primeira suíte cobre o carrinho e os contratos críticos das RPCs de pedido, sem acessar o Supabase real.

```bash
# Executa a suíte uma vez
npm run test

# Reexecuta os testes ao salvar arquivos
npm run test:watch
```

## Comandos úteis

```bash
npm run tsc
npm run test
npm run build
npm run preview
npm run deploy
```

Não publique arquivos `.env`, chaves `service_role`, senhas ou tokens administrativos.
