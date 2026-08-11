# Matérias da faculdade

Ambiente acadêmico responsivo para organizar matérias, professores, métodos de avaliação e compromissos do curso de Gestão da Produção.

## Funcionalidades

- Dashboard com pendências, próximas entregas e andamento do semestre
- Cadastro e edição de matérias e seus respectivos professores
- Registro de métodos de avaliação, critérios do professor e anotações
- Controle de atividades, trabalhos, provas, entregas e apresentações
- Agenda acadêmica com visualizações mensal e semanal
- Filtros de pendências por status
- Layout profissional e adaptado para celular
- Persistência automática dos dados no navegador

## Executar localmente

Pré-requisitos: Node.js 22.13 ou superior e npm.

```bash
npm install
npm run dev:vercel
```

Acesse [http://localhost:3000](http://localhost:3000).

## Publicar na Vercel

1. Importe este repositório no painel da Vercel.
2. Confirme que o framework detectado é **Next.js**.
3. Clique em **Deploy**.

O arquivo `vercel.json` já define a instalação com `npm ci` e o build com `npm run build:vercel`. O projeto não exige variáveis de ambiente.

## Scripts principais

- `npm run dev:vercel`: inicia o Next.js em desenvolvimento
- `npm run build:vercel`: gera a versão de produção para a Vercel
- `npm run start:vercel`: executa localmente a versão produzida pelo Next.js
- `npm run lint`: verifica a qualidade do código

Os scripts `dev`, `build` e `start` sem o sufixo `:vercel` são mantidos para a versão publicada pelo ChatGPT Sites.

## Armazenamento dos dados

Nesta versão, os dados são guardados no `localStorage` do navegador. Isso torna o site simples e privado, sem necessidade de login ou banco de dados, mas também significa que:

- os registros não são sincronizados entre aparelhos ou navegadores;
- limpar os dados do navegador apaga as informações cadastradas;
- para uma versão futura com login, backup e sincronização, será necessário conectar um banco de dados.

## Tecnologias

Next.js, React, TypeScript, Tailwind CSS e Lucide Icons.
