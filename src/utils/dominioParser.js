/**
 * Parser para relatórios do Sistema Domínio
 * Suporta: Balancete, Análise Horizontal, DRE Comparativa, DRE Mensal
 */

// Converte valor brasileiro (1.234,56) para número
export const parseValorBR = (valor) => {
  if (!valor || valor === '0,00' || valor === '0') return 0;

  // Remove espaços e caracteres especiais
  let clean = valor.toString().trim();

  // Remove indicadores de débito/crédito
  const isCredit = clean.endsWith('c');
  const isDebit = clean.endsWith('d');
  clean = clean.replace(/[cd]$/i, '');

  // Remove parênteses (valores negativos)
  const isNegative = clean.startsWith('(') && clean.endsWith(')');
  clean = clean.replace(/[()]/g, '');

  // Converte formato BR para número
  clean = clean.replace(/\./g, '').replace(',', '.');

  let num = parseFloat(clean) || 0;

  // Aplica sinal negativo se necessário
  if (isNegative || isDebit) {
    num = Math.abs(num); // Débito é positivo no ativo
  }
  if (isCredit) {
    num = Math.abs(num); // Crédito é positivo no passivo
  }

  return num;
};

// Extrai porcentagem do formato "(12,34)"
export const parsePercentBR = (valor) => {
  if (!valor) return 0;
  let clean = valor.toString().trim();
  const isNegative = clean.startsWith('(') && clean.endsWith(')');
  clean = clean.replace(/[()%]/g, '').replace(',', '.');
  let num = parseFloat(clean) || 0;
  return isNegative ? -num : num;
};

/**
 * Parser para Balancete Mensal
 * Extrai contas contábeis com saldos
 */
export const parseBalancete = (csvContent) => {
  const lines = csvContent.split('\n');
  const contas = [];
  let empresaInfo = {};
  let periodo = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(';').map(c => c.trim());

    // Extrair informações da empresa
    if (cols[0] === 'Empresa:') {
      empresaInfo.razaoSocial = cols[1];
    }
    if (cols[0] === 'C.N.P.J.:') {
      empresaInfo.cnpj = cols[1];
    }
    if (cols[0] === 'Período:') {
      periodo = cols[1];
    }

    // Pular linhas de cabeçalho
    if (!cols[0] || isNaN(parseInt(cols[0]))) continue;

    // Linha de conta contábil: Código, Classificação, vazio, Descrição, vazios, Saldo Anterior, Débito, vazio, Crédito, vazio, Saldo Atual
    const codigo = parseInt(cols[0]);
    const classificacao = cols[1];
    const descricao = cols[3]?.trim();
    const saldoAnterior = parseValorBR(cols[6]);
    const debito = parseValorBR(cols[7]);
    const credito = parseValorBR(cols[9]);
    const saldoAtual = parseValorBR(cols[11]);

    if (classificacao && descricao) {
      contas.push({
        codigo,
        classificacao,
        descricao,
        saldoAnterior,
        debito,
        credito,
        saldoAtual,
        nivel: classificacao.split('.').length
      });
    }
  }

  return {
    empresaInfo,
    periodo,
    contas,
    // Extrair contas específicas para os gráficos
    bancosMovimento: contas.find(c => c.classificacao === '1.1.1.02'),
    aplicacoesFinanceiras: contas.find(c => c.classificacao === '1.1.1.03'),
    estoque: contas.find(c => c.classificacao === '1.1.5'),
    clientes: contas.find(c => c.classificacao === '1.1.2'),
    fornecedores: contas.find(c => c.classificacao === '2.1.1'),
    receitaBruta: contas.find(c => c.classificacao === '3.1.1'),
    custoVendas: contas.find(c => c.classificacao === '3.1.5'),
    despesasOperacionais: contas.find(c => c.classificacao === '3.2.1'),
    resultadoLiquido: contas.find(c => c.classificacao === '3')
  };
};

/**
 * Parser para Análise Horizontal (DRE Horizontal)
 * Extrai dados mensais comparativos
 */
export const parseAnaliseHorizontal = (csvContent) => {
  const lines = csvContent.split('\n');
  const meses = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const mesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  let empresaInfo = {};
  let competencia = '';
  const dados = {
    receitaBruta: [],
    deducoes: [],
    receitaLiquida: [],
    cmv: [],
    lucroBruto: [],
    despesasOperacionais: [],
    despesasPessoal: [],
    despesasGerais: [],
    recuperacaoCreditos: [],
    resultadoFinanceiro: [],
    despesasFinanceiras: [],
    receitaFinanceira: [],
    outrasReceitas: [],
    lucroAntesIR: [],
    provisaoCSLL: [],
    provisaoIRPJ: [],
    resultadoLiquido: []
  };

  // Mapear linha para categoria
  const categoriaMap = {
    'RECEITA BRUTA': 'receitaBruta',
    '(-) DEDUCOES DA RECEITA BRUTA': 'deducoes',
    'RECEITA LIQUIDA': 'receitaLiquida',
    '(-) CMV/ CPV': 'cmv',
    '= LUCRO BRUTO': 'lucroBruto',
    '(-) DESPESAS OPERACIONAIS DAS ATIVIDADES EM GERAL': 'despesasOperacionais',
    'DESPESAS C/ PESSOAL': 'despesasPessoal',
    'DESPESAS GERAIS': 'despesasGerais',
    'RECUPERACAO DE CREDITOS': 'recuperacaoCreditos',
    '+ / - RESULTADO FINANCEIRO': 'resultadoFinanceiro',
    '(-) DESPESAS FINANCEIRAS': 'despesasFinanceiras',
    'RECEITA FINANCEIRA': 'receitaFinanceira',
    'OUTRAS RECEITAS OPERACIONAIS': 'outrasReceitas',
    '= LUCRO ANTES DO IR E DA CSL': 'lucroAntesIR',
    '(-) PROVISAO PARA A CONTRIBUICAO SOCIAL': 'provisaoCSLL',
    '(-) PROVISAO PARA O IMPOSTO DE RENDA': 'provisaoIRPJ',
    '= RESULTADO LIQUIDO DO PERIODO': 'resultadoLiquido'
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(';').map(c => c.trim());

    // Extrair informações
    if (line.includes('C.N.P.J.:')) {
      empresaInfo.cnpj = cols[3];
    }
    if (line.includes('Competência:')) {
      competencia = cols[3];
    }

    // Identificar linhas de dados
    const descricao = cols[0];
    const categoria = categoriaMap[descricao];

    if (categoria) {
      // Colunas: Descrição, vazio(x5), 01/2025, vazio, 02/2025, %, 03/2025, %, ...
      // Índices aproximados para valores mensais: 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28
      const indices = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 29]; // Ajustado para o formato do CSV

      for (let m = 0; m < 12; m++) {
        const valor = parseValorBR(cols[indices[m]]);
        dados[categoria][m] = valor;
      }
    }
  }

  return {
    empresaInfo,
    competencia,
    meses: mesNomes,
    dados,
    // Calcular totais
    totais: {
      receitaBruta: dados.receitaBruta.reduce((a, b) => a + b, 0),
      despesaTotal: dados.despesasOperacionais.reduce((a, b) => a + Math.abs(b), 0),
      lucroLiquido: dados.resultadoLiquido.reduce((a, b) => a + b, 0)
    }
  };
};

/**
 * Parser para DRE Comparativa (Anual)
 * Compara dois exercícios
 */
export const parseDREComparativa = (csvContent) => {
  const lines = csvContent.split('\n');
  let empresaInfo = {};
  let periodo = '';

  const dados = {
    anoAtual: {},
    anoAnterior: {}
  };

  const categorias = [
    { key: 'receitaBruta', match: 'RECEITA BRUTA' },
    { key: 'deducoes', match: '(-) DEDUCOES DA RECEITA BRUTA' },
    { key: 'receitaLiquida', match: 'RECEITA LIQUIDA' },
    { key: 'cmv', match: '(-) CMV/ CPV' },
    { key: 'lucroBruto', match: '= LUCRO BRUTO' },
    { key: 'despesasOperacionais', match: '(-) DESPESAS OPERACIONAIS DAS ATIVIDADES EM GERAL' },
    { key: 'despesasPessoal', match: 'DESPESAS C/ PESSOAL' },
    { key: 'despesasGerais', match: 'DESPESAS GERAIS' },
    { key: 'resultadoFinanceiro', match: '+ / - RESULTADO FINANCEIRO' },
    { key: 'lucroAntesIR', match: '= LUCRO ANTES DO IR E DA CSL' },
    { key: 'provisaoCSLL', match: '(-) PROVISAO PARA A CONTRIBUICAO SOCIAL' },
    { key: 'provisaoIRPJ', match: '(-) PROVISAO PARA O IMPOSTO DE RENDA' },
    { key: 'resultadoLiquido', match: '= RESULTADO LIQUIDO DO PERIODO' }
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(';').map(c => c.trim());

    // Extrair informações
    if (cols[0] === 'Empresa:') {
      empresaInfo.razaoSocial = cols[3];
    }
    if (cols[0] === 'Período:') {
      periodo = cols[3];
    }

    // Buscar categorias
    for (const cat of categorias) {
      if (cols[0] === cat.match) {
        // Formato: Descrição, vazios, valor 2025, vazios, valor 2024
        dados.anoAtual[cat.key] = parseValorBR(cols[6]);
        dados.anoAnterior[cat.key] = parseValorBR(cols[9]);
        break;
      }
    }
  }

  return {
    empresaInfo,
    periodo,
    dados,
    variacao: {
      receitaBruta: dados.anoAnterior.receitaBruta ?
        ((dados.anoAtual.receitaBruta - dados.anoAnterior.receitaBruta) / Math.abs(dados.anoAnterior.receitaBruta) * 100).toFixed(2) : 0,
      lucroLiquido: dados.anoAnterior.resultadoLiquido ?
        ((dados.anoAtual.resultadoLiquido - dados.anoAnterior.resultadoLiquido) / Math.abs(dados.anoAnterior.resultadoLiquido) * 100).toFixed(2) : 0
    }
  };
};

/**
 * Parser para DRE Mensal
 * Extrai dados acumulados do período
 */
export const parseDREMensal = (csvContent) => {
  const lines = csvContent.split('\n');
  let empresaInfo = {};
  let periodo = '';

  const dados = {};

  const categorias = [
    { key: 'receitaBruta', match: 'RECEITA BRUTA' },
    { key: 'deducoes', match: '(-) DEDUCOES DA RECEITA BRUTA' },
    { key: 'receitaLiquida', match: 'RECEITA LIQUIDA' },
    { key: 'cmv', match: '(-) CMV/ CPV' },
    { key: 'lucroBruto', match: '= LUCRO BRUTO' },
    { key: 'despesasOperacionais', match: '(-) DESPESAS OPERACIONAIS DAS ATIVIDADES EM GERAL' },
    { key: 'despesasPessoal', match: 'DESPESAS C/ PESSOAL' },
    { key: 'despesasGerais', match: 'DESPESAS GERAIS' },
    { key: 'resultadoFinanceiro', match: '+ / - RESULTADO FINANCEIRO' },
    { key: 'lucroAntesIR', match: '= LUCRO ANTES DO IR E DA CSL' },
    { key: 'provisaoCSLL', match: '(-) PROVISAO PARA A CONTRIBUICAO SOCIAL' },
    { key: 'provisaoIRPJ', match: '(-) PROVISAO PARA O IMPOSTO DE RENDA' },
    { key: 'resultadoLiquido', match: '= RESULTADO LIQUIDO DO PERIODO' }
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(';').map(c => c.trim());

    // Extrair informações
    if (cols[0] === 'Empresa:') {
      empresaInfo.razaoSocial = cols[3];
    }
    if (cols[0] === 'Período:') {
      periodo = cols[3];
    }

    // Buscar categorias - coluna 10 contém Saldo Atual
    for (const cat of categorias) {
      if (cols[0] === cat.match) {
        dados[cat.key] = parseValorBR(cols[10]);
        break;
      }
    }
  }

  return {
    empresaInfo,
    periodo,
    dados
  };
};

/**
 * Detecta automaticamente o tipo de relatório pelo conteúdo
 */
export const detectarTipoRelatorio = (csvContent) => {
  if (csvContent.includes('BALANCETE')) return 'balancete';
  if (csvContent.includes('ANÁLISE HORIZONTAL')) return 'analiseHorizontal';
  if (csvContent.includes('DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO')) {
    // Verificar se é comparativa ou mensal
    if (csvContent.includes('2024') && csvContent.includes('2025')) {
      return 'dreComparativa';
    }
    return 'dreMensal';
  }
  return 'desconhecido';
};

/**
 * Parser universal - detecta e processa qualquer relatório
 */
export const parseRelatorioContabil = (csvContent) => {
  const tipo = detectarTipoRelatorio(csvContent);

  switch (tipo) {
    case 'balancete':
      return { tipo, dados: parseBalancete(csvContent) };
    case 'analiseHorizontal':
      return { tipo, dados: parseAnaliseHorizontal(csvContent) };
    case 'dreComparativa':
      return { tipo, dados: parseDREComparativa(csvContent) };
    case 'dreMensal':
      return { tipo, dados: parseDREMensal(csvContent) };
    default:
      throw new Error('Tipo de relatório não reconhecido');
  }
};

/**
 * Consolida dados de múltiplos balancetes mensais
 * para criar série temporal de 12 meses
 */
export const consolidarBalancetesMensais = (balancetes) => {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const series = {
    bancosMovimento: new Array(12).fill(0),
    aplicacoesFinanceiras: new Array(12).fill(0),
    estoque: new Array(12).fill(0),
    receita: new Array(12).fill(0),
    custo: new Array(12).fill(0)
  };

  balancetes.forEach((bal, index) => {
    if (index < 12) {
      series.bancosMovimento[index] = bal.bancosMovimento?.saldoAtual || 0;
      series.aplicacoesFinanceiras[index] = bal.aplicacoesFinanceiras?.saldoAtual || 0;
      series.estoque[index] = bal.estoque?.saldoAtual || 0;
      series.receita[index] = Math.abs(bal.receitaBruta?.saldoAtual || 0);
      series.custo[index] = Math.abs(bal.custoVendas?.saldoAtual || 0);
    }
  });

  return { meses, series };
};
