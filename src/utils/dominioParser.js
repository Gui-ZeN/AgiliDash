/**
 * Parser para relatórios do Sistema Domínio
 * Suporta: Balancete, Análise Horizontal, DRE Comparativa, DRE Mensal
 */

// Converte valor brasileiro (1.234,56) para número
// Valores com parênteses são NEGATIVOS: (15.777,06) = -15777.06
export const parseValorBR = (valor) => {
  if (!valor || valor === '0,00' || valor === '0' || valor === '-') return 0;

  // Remove espaços e caracteres especiais
  let clean = valor.toString().trim();

  // Se for apenas texto ou cabeçalho, retorna 0
  if (clean.match(/^[a-zA-Z]/)) return 0;

  // Remove indicadores de débito/crédito (usado em balancetes)
  const isCredit = clean.endsWith('c') || clean.endsWith('C');
  const isDebit = clean.endsWith('d') || clean.endsWith('D');
  clean = clean.replace(/[cdCD]$/, '');

  // Verifica se é valor negativo (entre parênteses)
  const isNegative = clean.startsWith('(') && clean.endsWith(')');
  clean = clean.replace(/[()]/g, '');

  // Converte formato BR (1.234,56) para formato JS (1234.56)
  clean = clean.replace(/\./g, '').replace(',', '.');

  let num = parseFloat(clean) || 0;

  // Aplica sinal negativo se estava entre parênteses
  if (isNegative) {
    num = -Math.abs(num);
  }

  // Para débito/crédito em balancetes, manter positivo (será tratado no contexto)
  // Em DREs, valores com parênteses já são negativos

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
  const mesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  let empresaInfo = {};
  let competencia = '';
  const dados = {
    receitaBruta: new Array(12).fill(0),
    deducoes: new Array(12).fill(0),
    receitaLiquida: new Array(12).fill(0),
    cmv: new Array(12).fill(0),
    lucroBruto: new Array(12).fill(0),
    despesasOperacionais: new Array(12).fill(0),
    despesasPessoal: new Array(12).fill(0),
    despesasGerais: new Array(12).fill(0),
    recuperacaoCreditos: new Array(12).fill(0),
    resultadoFinanceiro: new Array(12).fill(0),
    despesasFinanceiras: new Array(12).fill(0),
    receitaFinanceira: new Array(12).fill(0),
    outrasReceitas: new Array(12).fill(0),
    lucroAntesIR: new Array(12).fill(0),
    provisaoCSLL: new Array(12).fill(0),
    provisaoIRPJ: new Array(12).fill(0),
    resultadoLiquido: new Array(12).fill(0)
  };

  // Mapear linha para categoria - usar includes para maior flexibilidade
  const categoriaMap = [
    { match: 'RECEITA BRUTA', key: 'receitaBruta', exact: true },
    { match: '(-) DEDUCOES DA RECEITA BRUTA', key: 'deducoes', exact: true },
    { match: 'RECEITA LIQUIDA', key: 'receitaLiquida', exact: true },
    { match: '(-) CMV', key: 'cmv', exact: false },
    { match: '= LUCRO BRUTO', key: 'lucroBruto', exact: true },
    { match: '(-) DESPESAS OPERACIONAIS', key: 'despesasOperacionais', exact: false },
    { match: 'DESPESAS C/ PESSOAL', key: 'despesasPessoal', exact: true },
    { match: 'DESPESAS GERAIS', key: 'despesasGerais', exact: true },
    { match: 'RECUPERACAO DE CREDITOS', key: 'recuperacaoCreditos', exact: true },
    { match: '+ / - RESULTADO FINANCEIRO', key: 'resultadoFinanceiro', exact: true },
    { match: '(-) DESPESAS FINANCEIRAS', key: 'despesasFinanceiras', exact: true },
    { match: 'RECEITA FINANCEIRA', key: 'receitaFinanceira', exact: true },
    { match: 'OUTRAS RECEITAS OPERACIONAIS', key: 'outrasReceitas', exact: true },
    { match: '= LUCRO ANTES DO IR', key: 'lucroAntesIR', exact: false },
    { match: '(-) PROVISAO PARA A CONTRIBUICAO SOCIAL', key: 'provisaoCSLL', exact: true },
    { match: '(-) PROVISAO PARA O IMPOSTO DE RENDA', key: 'provisaoIRPJ', exact: true },
    { match: '= RESULTADO LIQUIDO DO PERIODO', key: 'resultadoLiquido', exact: true },
    { match: 'LUCRO/PREJU', key: 'resultadoLiquido', exact: false }
  ];

  // Índices CORRETOS das colunas para cada mês no CSV do Domínio
  // Jan=6, Fev=8, Mar=10, Abr=12, Mai=14, Jun=17, Jul=19, Ago=21, Set=23, Out=25, Nov=27, Dez=31
  const indicesMeses = [6, 8, 10, 12, 14, 17, 19, 21, 23, 25, 27, 31];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(';').map(c => c.trim());

    // Extrair informações da empresa
    if (line.includes('C.N.P.J.:')) {
      empresaInfo.cnpj = cols[3] || cols.find(c => c.match(/\d{2}\.\d{3}\.\d{3}/)) || '';
    }
    if (line.includes('Compet')) {
      competencia = cols[3] || cols.find(c => c.match(/\d{2}\/\d{4}/)) || '';
    }

    // Identificar linhas de dados
    const descricao = cols[0];
    if (!descricao) continue;

    // Procurar categoria correspondente
    for (const cat of categoriaMap) {
      const match = cat.exact
        ? descricao === cat.match
        : descricao.includes(cat.match);

      if (match) {
        // Extrair valores de cada mês
        for (let m = 0; m < 12; m++) {
          const colIndex = indicesMeses[m];
          if (colIndex < cols.length) {
            const valorRaw = cols[colIndex];
            const valor = parseValorBR(valorRaw);
            dados[cat.key][m] = valor;
          }
        }
        break; // Encontrou a categoria, não precisa continuar
      }
    }
  }

  // Debug: log dos valores encontrados
  console.log('Parser Análise Horizontal - Receita Bruta:', dados.receitaBruta);
  console.log('Parser Análise Horizontal - Despesas Operacionais:', dados.despesasOperacionais);
  console.log('Parser Análise Horizontal - Resultado Líquido:', dados.resultadoLiquido);

  // Calcular receitas e despesas por mês
  // Regra: valores positivos = receitas, valores negativos = despesas
  const receitasMensais = new Array(12).fill(0);
  const despesasMensais = new Array(12).fill(0);

  // Processar todas as categorias de dados
  Object.values(dados).forEach(valores => {
    valores.forEach((valor, mesIndex) => {
      if (valor > 0) {
        receitasMensais[mesIndex] += valor;
      } else if (valor < 0) {
        despesasMensais[mesIndex] += Math.abs(valor);
      }
    });
  });

  return {
    empresaInfo,
    competencia,
    meses: mesNomes,
    dados,
    // Receitas e Despesas mensais calculadas
    receitasMensais,
    despesasMensais,
    // Calcular totais
    totais: {
      receitaBruta: dados.receitaBruta.reduce((a, b) => a + b, 0),
      despesaTotal: dados.despesasOperacionais.reduce((a, b) => a + Math.abs(b), 0),
      lucroLiquido: dados.resultadoLiquido.reduce((a, b) => a + b, 0),
      // Totais anuais de receitas e despesas
      totalReceitas: receitasMensais.reduce((a, b) => a + b, 0),
      totalDespesas: despesasMensais.reduce((a, b) => a + b, 0)
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
