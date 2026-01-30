/**
 * Mock Data para o Dashboard Fiscal
 * TODO: Integrar com Firebase Firestore para dados dinâmicos
 */

// Labels para os meses
export const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// Labels para trimestres (usado em gráficos fiscais)
export const trimestres = ['1º Tri', '2º Tri', '3º Tri', '4º Tri'];

// Dados de faturamento mensal (2025)
export const faturamentoData = [
  559817.75, 495000, 488000, 507000, 565000, 547000,
  628000, 580000, 544000, 638000, 617000, 699000
];

// Dados de entradas (compras/custos)
export const entradasData = [
  2100500, 1950000, 2400000, 2200000, 2423405.49, 3642289.06,
  4958289.94, 2222369.15, 10651793.34, 3800000, 4100000, 5200000
];

// Dados de saídas (vendas/receita)
export const saidasData = [
  450000, 420000, 480000, 460000, 521590.84, 574772.05,
  692399.50, 631988.75, 644739.69, 600000, 650000, 750000
];

// Dados DRE 2025 (Demonstrativo do Resultado do Exercício)
export const dreData2025 = {
  receita: [
    577643.92, 500914.48, 529675.12, 542100.00, 560000.00, 547000.00,
    628000.00, 580000.00, 600000.00, 638000.00, 617000.00, 699000.00
  ],
  despesa: [
    404350.00, 350640.00, 370770.00, 379470.00, 392000.00, 382900.00,
    439600.00, 406000.00, 420000.00, 446600.00, 431900.00, 489300.00
  ],
  lucro: [
    173293.92, 150274.48, 158905.12, 162630.00, 168000.00, 164100.00,
    188400.00, 174000.00, 180000.00, 191400.00, 185100.00, 209700.00
  ]
};

// Dados DRE 2024
export const dreData2024 = {
  receita: [
    542610.55, 479780.80, 472836.00, 491346.32, 548089.67, 530370.20,
    609004.40, 562715.14, 527379.73, 619043.24, 598804.41, 678180.79
  ],
  despesa: [
    379827.38, 335846.56, 330985.20, 343942.42, 383662.77, 371259.14,
    426303.08, 393900.60, 369165.81, 433330.27, 419163.09, 474726.55
  ],
  lucro: [
    162783.17, 143934.24, 141850.80, 147403.90, 164426.90, 159111.06,
    182701.32, 168814.54, 158213.92, 185712.97, 179641.32, 203454.24
  ]
};

// Dados CSLL trimestral
export const csllData = [14497.55, 14230.35, 14322.21, 14430.19];

// Dados IRPJ trimestral (total)
export const irpjTotalData = [34270.97, 33528.75, 33783.92, 34083.85];

// Dados IRPJ adicional (10% sobre o que excede R$ 20.000/mês)
export const irpjAdicional = [10108.39, 9811.5, 9913.57, 10033.54];

// Grupos de receitas (para gráfico de pizza)
export const receitaGrupos = {
  labels: ['Venda de Produtos', 'Venda de Sorvetes', 'Transferências'],
  data: [11959939.48, 1939015.97, 1783255.32]
};

// Grupos de custos (para gráfico de pizza)
export const custosGrupos = {
  labels: ['Compra p/ Industrialização', 'Compra p/ Ind. ST'],
  data: [44609086.27, 1101668.36]
};

// Totais acumulados
export const totaisAcumulados = {
  entradas: 45710754.63,
  saidas: 15682210.77
};

// Informações da empresa (dados cadastrais)
export const empresaInfo = {
  nome: 'EJP COMERCIO DE ALIMENTOS LTDA',
  nomeFantasia: 'EJP MATRIZ',
  cnpj: '30.533.759/0001-09',
  codigoCliente: '260',
  regimeTributario: 'Lucro Real',
  exercicio: '2025',
  responsavel: {
    nome: 'Sr. Emerson Clay Batista Montenegro Filho',
    cargo: 'Sócio-Administrador'
  }
};

// Equipe técnica responsável
export const equipeTecnica = [
  {
    id: 1,
    setor: 'Setor Contábil',
    nome: 'Kallyne Castro',
    icon: 'calculator',
    bgColor: 'bg-cyan-50',
    iconColor: 'text-primary'
  },
  {
    id: 2,
    setor: 'Setor Fiscal',
    nome: 'Alan Severo',
    icon: 'file-spreadsheet',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600'
  },
  {
    id: 3,
    setor: 'Setor Pessoal',
    nome: 'Sarane Ribeiro',
    icon: 'users',
    bgColor: 'bg-teal-50',
    iconColor: 'text-teal-600'
  }
];

// Totais fiscais (cards de resumo)
export const totaisFiscais = {
  irpj: 135667.49,
  csll: 57480.30,
  cargaTributariaTotal: 193147.79
};

// Dados mockados para o painel admin (usuários)
export const usuariosMock = [
  {
    id: 1,
    nome: 'Admin Principal',
    email: 'admin@agilicomplex.com.br',
    perfil: 'Administrador',
    status: 'Ativo'
  },
  {
    id: 2,
    nome: 'Kallyne Castro',
    email: 'kallyne@agilicomplex.com.br',
    perfil: 'Contábil',
    status: 'Ativo'
  },
  {
    id: 3,
    nome: 'Alan Severo',
    email: 'alan@agilicomplex.com.br',
    perfil: 'Fiscal',
    status: 'Ativo'
  },
  {
    id: 4,
    nome: 'Sarane Ribeiro',
    email: 'sarane@agilicomplex.com.br',
    perfil: 'Pessoal',
    status: 'Ativo'
  }
];

// Setores disponíveis para upload de CSV
export const setoresUpload = [
  { value: 'contabil', label: 'Contábil' },
  { value: 'fiscal', label: 'Fiscal' },
  { value: 'pessoal', label: 'Pessoal' }
];
