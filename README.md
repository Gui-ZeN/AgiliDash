# AgiliDash

Dashboard empresarial com foco em Contábil, Fiscal, Pessoal e Administrativo.

## Stack

- React 18
- Vite 5
- Tailwind CSS
- Chart.js + react-chartjs-2
- React Router
- Vitest

## Funcionalidades principais

- Dashboard por setor:
  - Informações Gerais
  - Setor Contábil
  - Setor Fiscal
  - Setor Pessoal
  - Setor Administrativo
- Controle de visibilidade por Grupo e por CNPJ (com herança e sobrescrita)
- Modo preview de cliente para admin
- Importação de relatórios (Domínio) por setor
- Exportação (PDF e Excel) nas telas de dashboard
- Filtros de período (mês, trimestre, ano) conforme cada gráfico/tabela

## Estrutura resumida

```txt
src/
  components/
    charts/
    layout/
    ui/
  context/
    domains/
  pages/
    dashboard/tabs/
  utils/
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm run test
```

## Autenticação e banco

- A autenticação atual ainda é local/mock.
- Integração com backend (ex.: Firebase Auth/Firestore) ficará para a próxima fase, após validação funcional.

## Deploy (Vercel)

- SPA fallback configurado com `rewrites` em `vercel.json`.
- Build de saída: `dist/`.
