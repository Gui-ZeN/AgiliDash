# Dashboard Fiscal - Ágili Complex

Sistema de dashboard fiscal/contábil/pessoal para visualização de dados empresariais desenvolvido em React + Vite + Tailwind CSS + Chart.js.

## Tecnologias Utilizadas

- **React 18** - Biblioteca para construção de interfaces
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **Chart.js + react-chartjs-2** - Biblioteca de gráficos
- **React Router** - Navegação entre páginas
- **Lucide React** - Ícones

## Estrutura do Projeto

```
dashboard-fiscal/
├── src/
│   ├── pages/
│   │   ├── Login.jsx           # Página de login
│   │   ├── Dashboard.jsx       # Dashboard principal (com tabs)
│   │   └── AdminPanel.jsx      # Painel administrativo
│   ├── components/
│   │   ├── charts/
│   │   │   ├── DREChart.jsx           # Gráfico DRE (Receita vs Despesa)
│   │   │   ├── MovimentacaoChart.jsx  # Gráfico de movimentação financeira
│   │   │   ├── LucroComparativoChart.jsx # Comparativo de lucro 2024/2025
│   │   │   ├── ReceitaPizzaChart.jsx  # Pizza de grupos de receitas
│   │   │   ├── CustosPizzaChart.jsx   # Pizza de grupos de custos
│   │   │   ├── FaturamentoChart.jsx   # Gráfico de faturamento
│   │   │   ├── IRPJChart.jsx          # Gráfico IRPJ trimestral
│   │   │   ├── CSLLChart.jsx          # Gráfico CSLL trimestral
│   │   │   ├── FluxoFiscalChart.jsx   # Fluxo mensal (barras horizontais)
│   │   │   └── DistribuicaoChart.jsx  # Distribuição entrada/saída
│   │   ├── layout/
│   │   │   ├── Header.jsx      # Cabeçalho com navegação
│   │   │   └── Logo.jsx        # Logo SVG Ágili Complex
│   │   └── common/
│   │       ├── Card.jsx        # Componentes de card reutilizáveis
│   │       └── Button.jsx      # Botões reutilizáveis
│   ├── data/
│   │   └── mockData.js         # Dados mockados (hardcoded)
│   ├── utils/
│   │   └── formatters.js       # Funções de formatação
│   ├── App.jsx                 # Configuração de rotas
│   ├── main.jsx                # Entry point
│   └── index.css               # Estilos globais + Tailwind
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── index.html
```

## Instalação

1. **Clone o repositório** (ou navegue até a pasta do projeto):
   ```bash
   cd dashboard-fiscal
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Acesse no navegador**:
   ```
   http://localhost:3000
   ```

## Funcionalidades

### Página de Login
- Design empresarial moderno
- Qualquer credencial funciona (mock)
- Redirecionamento para o dashboard após login

### Dashboard Principal (4 tabs)

#### Tab 1: Informações Gerais
- Dados cadastrais da empresa
- Equipe técnica responsável (Contábil, Fiscal, Pessoal)

#### Tab 2: Contábil
- Gráfico comparativo Receita vs Despesa (barras)
- Alternância entre anos 2024/2025
- Card com totais anuais
- Gráficos de pizza (Grupos de Receitas e Custos)
- Gráfico de linha (Variação do Lucro Líquido)
- Gráfico de movimentação financeira
- Tabela com dados mensais

#### Tab 3: Fiscal
- Gráfico de distribuição entrada/saída (pizza)
- Tabela de resumo operacional
- Gráfico de faturamento (barras)
- Gráficos IRPJ e CSLL
- Cards com totais tributários
- Gráfico de fluxo mensal (barras horizontais)

#### Tab 4: Pessoal
- Placeholder "Em desenvolvimento"

### Painel Admin
- Upload de CSV (UI apenas, sem funcionalidade)
- Gerenciamento de usuários (tabela mockada)

## Cores do Tema

```css
Primary:   #0e4f6d (azul escuro)
Secondary: #58a3a4 (azul claro)
Background: #f8fafc
Success:   #22c55e
Error:     #ef4444
```

## Próximos Passos (TODO)

1. **Integração Firebase Auth** - Autenticação real
2. **Integração Firestore** - Dados dinâmicos
3. **Upload funcional** - Firebase Storage
4. **Seção Pessoal** - Implementar funcionalidades
5. **PWA** - Tornar instalável

## Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Gera build de produção
npm run preview  # Preview do build de produção
npm run lint     # Executa linter
```

## Licença

Projeto proprietário - Ágili Complex © 2025
