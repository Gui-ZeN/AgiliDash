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

// ============================================
// PARSERS PARA RELATÓRIOS FISCAIS
// ============================================

/**
 * Parser para Contribuição Social (CSLL) Trimestral
 * Extrai dados de CSLL por trimestre
 */
export const parseContribuicaoSocial = (csvContent) => {
  const lines = csvContent.split('\n');
  let empresaInfo = {};
  let trimestre = '';
  let dados = {};

  // Função auxiliar para encontrar o último valor numérico em uma linha
  const findLastValue = (cols) => {
    // Procura de trás pra frente o primeiro valor que parece número brasileiro
    for (let i = cols.length - 1; i >= 0; i--) {
      const val = cols[i].trim();
      // Valor brasileiro: pode ter pontos, vírgula decimal, números
      if (val && /^-?[\d.]+,\d{2}$/.test(val)) {
        return parseValorBR(val);
      }
      // Também aceitar número inteiro (como 0)
      if (val && /^-?\d+$/.test(val)) {
        return parseValorBR(val);
      }
    }
    return 0;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(';').map(c => c.trim());
    // Converte para uppercase para comparação (sem tentar remover acentos)
    const lineUpper = line.toUpperCase();

    // Extrair informações da empresa
    if (line.includes('C.N.P.J.:')) {
      empresaInfo.cnpj = cols.find(c => c.match(/\d{2}\.\d{3}\.\d{3}/)) || cols[2];
    }
    if (line.includes('Trimestre:')) {
      trimestre = cols.find(c => c.match(/\w{3}\/\d{2}/)) || cols[2];
    }

    // Extrair valores usando regex que ignora caracteres acentuados
    // Lucro líquido antes da CSLL - usa regex para pular o í
    if (/LUCRO.+L.QUIDO/i.test(line) && /CSLL/i.test(line)) {
      dados.lucroLiquido = findLastValue(cols);
    }
    // Base de cálculo antes da compensação
    if (/BASE.+C.LCULO/i.test(line) && /ANTES/i.test(line) && /COMPENSA/i.test(line)) {
      dados.baseCalculoAntes = findLastValue(cols);
    }
    // (-) Compensação
    if (/^\s*\(-\)/.test(line) && /COMPENSA/i.test(line)) {
      dados.compensacao = findLastValue(cols);
    }
    // (=) Base de cálculo (sem "antes")
    if (/^\s*\(=\)/.test(line) && /BASE.+C.LCULO/i.test(line) && !/ANTES/i.test(line)) {
      dados.baseCalculo = findLastValue(cols);
    }
    // CSLL devida
    if (/CSLL.+DEVIDA/i.test(line)) {
      dados.csllDevida = findLastValue(cols);
    }
    // CSLL a recolher
    if (/CSLL.+RECOLHER/i.test(line)) {
      dados.csllRecolher = findLastValue(cols);
    }
    // Valor a compensar para o período seguinte
    if (/VALOR.+COMPENSAR/i.test(line) && /PER.ODO.+SEGUINTE/i.test(line)) {
      dados.valorCompensarProximo = findLastValue(cols);
    }
    // Valor a deduzir para o período seguinte
    if (/VALOR.+DEDUZIR/i.test(line) && /PER.ODO.+SEGUINTE/i.test(line)) {
      dados.valorDeduzirProximo = findLastValue(cols);
    }
  }

  return {
    empresaInfo,
    trimestre,
    dados,
    tipo: 'csll'
  };
};

/**
 * Parser para Imposto de Renda (IRPJ) Trimestral
 * Extrai dados de IRPJ por trimestre
 */
export const parseImpostoRenda = (csvContent) => {
  const lines = csvContent.split('\n');
  let empresaInfo = {};
  let trimestre = '';
  let dados = {};

  // Função auxiliar para encontrar o último valor numérico em uma linha
  const findLastValue = (cols) => {
    for (let i = cols.length - 1; i >= 0; i--) {
      const val = cols[i].trim();
      if (val && /^-?[\d.]+,\d{2}$/.test(val)) {
        return parseValorBR(val);
      }
      if (val && /^-?\d+$/.test(val)) {
        return parseValorBR(val);
      }
    }
    return 0;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(';').map(c => c.trim());

    // Extrair informações da empresa
    if (line.includes('C.N.P.J.:')) {
      empresaInfo.cnpj = cols.find(c => c.match(/\d{2}\.\d{3}\.\d{3}/)) || cols[2];
    }
    if (line.includes('Trimestre:')) {
      trimestre = cols.find(c => c.match(/\w{3}\/\d{2}/)) || cols[2];
    }

    // Extrair valores usando regex que ignora caracteres acentuados
    // Lucro líquido antes do IRPJ
    if (/LUCRO.+L.QUIDO/i.test(line) && /IRPJ/i.test(line)) {
      dados.lucroLiquido = findLastValue(cols);
    }
    // (+) Adições
    if (/^\s*\(\+\)/.test(line) && /ADI/i.test(line)) {
      dados.adicoes = findLastValue(cols);
    }
    // Lucro Real antes da compensação
    if (/LUCRO.+REAL/i.test(line) && /ANTES/i.test(line) && /COMPENSA/i.test(line)) {
      dados.lucroRealAntes = findLastValue(cols);
    }
    // (-) Compensação
    if (/^\s*\(-\)/.test(line) && /COMPENSA/i.test(line)) {
      if (!dados.compensacao) dados.compensacao = findLastValue(cols);
    }
    // (=) Lucro Real (sem "antes") - é a Base de Cálculo do IRPJ
    if (/^\s*\(=\)/.test(line) && /LUCRO.+REAL/i.test(line) && !/ANTES/i.test(line)) {
      dados.lucroReal = findLastValue(cols);
      dados.baseCalculo = dados.lucroReal; // UI espera baseCalculo
    }
    // IRPJ devido
    if (/IRPJ.+DEVIDO/i.test(line)) {
      dados.irpjDevido = findLastValue(cols);
    }
    // Adicional de IRPJ
    if (/ADICIONAL.+IRPJ/i.test(line)) {
      dados.adicionalIrpj = findLastValue(cols);
      dados.adicionalIR = dados.adicionalIrpj; // UI espera adicionalIR
    }
    // IRPJ a recolher
    if (/IRPJ.+RECOLHER/i.test(line)) {
      dados.irpjRecolher = findLastValue(cols);
    }
    // Valor a compensar para o período seguinte
    if (/VALOR.+COMPENSAR/i.test(line) && /PER.ODO.+SEGUINTE/i.test(line)) {
      dados.valorCompensarProximo = findLastValue(cols);
    }
    // Valor a deduzir para o período seguinte
    if (/VALOR.+DEDUZIR/i.test(line) && /PER.ODO.+SEGUINTE/i.test(line)) {
      dados.valorDeduzirProximo = findLastValue(cols);
    }
  }

  return {
    empresaInfo,
    trimestre,
    dados,
    tipo: 'irpj'
  };
};

/**
 * Parser para Demonstrativo Financeiro (Faturamento)
 * Extrai faturamento mensal
 */
export const parseDemonstrativoFinanceiro = (csvContent) => {
  const lines = csvContent.split('\n');
  let empresaInfo = {};
  const faturamento = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(';').map(c => c.trim());

    // Extrair informações da empresa
    if (line.includes('Empresa:')) {
      empresaInfo.razaoSocial = cols.find(c => c && !c.includes('Empresa') && c.length > 3) || '';
    }
    if (line.includes('CNPJ:')) {
      empresaInfo.cnpj = cols.find(c => c.match(/\d{2}\.\d{3}\.\d{3}|\d+E\+\d+/)) || '';
    }

    // Identificar linhas de faturamento (começam com mês)
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    if (meses.includes(cols[0])) {
      // Encontrar índices dos valores
      const anoIndex = cols.findIndex(c => c.match(/^\d{4}$/));
      if (anoIndex > 0) {
        const ano = parseInt(cols[anoIndex]);
        // Buscar valores após o ano
        let saidas = 0, servicos = 0, outros = 0, total = 0;

        for (let j = anoIndex + 1; j < cols.length; j++) {
          const val = parseValorBR(cols[j]);
          if (val > 0) {
            if (saidas === 0) saidas = val;
            else if (servicos === 0) servicos = val;
            else if (outros === 0) outros = val;
            else if (total === 0) total = val;
          }
        }

        faturamento.push({
          mes: cols[0],
          ano,
          saidas,
          servicos,
          outros,
          total: total || saidas
        });
      }
    }
  }

  // Separar por ano
  const faturamento2024 = faturamento.filter(f => f.ano === 2024);
  const faturamento2025 = faturamento.filter(f => f.ano === 2025);

  // Calcular totais
  const totalSaidas = faturamento.reduce((acc, f) => acc + f.saidas, 0);
  const totalServicos = faturamento.reduce((acc, f) => acc + f.servicos, 0);
  const totalOutros = faturamento.reduce((acc, f) => acc + f.outros, 0);

  return {
    empresaInfo,
    faturamento,
    faturamento2024,
    faturamento2025,
    totais: {
      saidas: totalSaidas,
      servicos: totalServicos,
      outros: totalOutros,
      total: totalSaidas + totalServicos + totalOutros
    },
    tipo: 'faturamento'
  };
};

/**
 * Parser para Demonstrativo Mensal (Entradas e Saídas)
 * Extrai movimentação mensal detalhada
 */
export const parseDemonstrativoMensal = (csvContent) => {
  const lines = csvContent.split('\n');
  let empresaInfo = {};
  const movimentacao = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(';').map(c => c.trim());

    // Extrair informações da empresa
    if (line.includes('Empresa:')) {
      empresaInfo.razaoSocial = cols.find(c => c && !c.includes('Empresa') && c.length > 3) || '';
    }
    if (line.includes('CNPJ:')) {
      empresaInfo.cnpj = cols.find(c => c.match(/\d{2}\.\d{3}\.\d{3}|\d+E\+\d+/)) || '';
    }

    // Identificar linhas de movimentação (começam com mês)
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    if (meses.includes(cols[0])) {
      const anoIndex = cols.findIndex(c => c.match(/^\d{4}$/));
      if (anoIndex > 0) {
        const ano = parseInt(cols[anoIndex]);
        // Buscar valores de entradas e saídas
        let entradas = 0, saidas = 0, servicos = 0;
        let valorCount = 0;

        for (let j = anoIndex + 1; j < cols.length; j++) {
          const val = parseValorBR(cols[j]);
          if (val > 0) {
            valorCount++;
            if (valorCount === 1) entradas = val;
            else if (valorCount === 2) saidas = val;
            else if (valorCount === 3) servicos = val;
          }
        }

        movimentacao.push({
          mes: cols[0],
          ano,
          entradas,
          saidas,
          servicos
        });
      }
    }
  }

  // Separar por ano
  const movimentacao2024 = movimentacao.filter(m => m.ano === 2024);
  const movimentacao2025 = movimentacao.filter(m => m.ano === 2025);

  // Calcular totais por ano
  const totais2024 = {
    entradas: movimentacao2024.reduce((acc, m) => acc + m.entradas, 0),
    saidas: movimentacao2024.reduce((acc, m) => acc + m.saidas, 0),
    servicos: movimentacao2024.reduce((acc, m) => acc + m.servicos, 0)
  };
  const totais2025 = {
    entradas: movimentacao2025.reduce((acc, m) => acc + m.entradas, 0),
    saidas: movimentacao2025.reduce((acc, m) => acc + m.saidas, 0),
    servicos: movimentacao2025.reduce((acc, m) => acc + m.servicos, 0)
  };

  return {
    empresaInfo,
    movimentacao,
    movimentacao2024,
    movimentacao2025,
    totais2024,
    totais2025,
    tipo: 'demonstrativoMensal'
  };
};

/**
 * Parser para Resumo dos Impostos
 * Extrai impostos mensais com débitos, créditos e valores a recolher
 */
export const parseResumoImpostos = (csvContent) => {
  const lines = csvContent.split('\n');
  let empresaInfo = {};
  const impostosPorMes = {};
  let competenciaAtual = '';
  let totalGeralRecolher = 0;

  // Lista de impostos conhecidos (sem acentos para matching mais robusto)
  const impostosPatterns = [
    { pattern: /^ICMS$/i, nome: 'ICMS' },
    { pattern: /^IPI/i, nome: 'IPI' },
    { pattern: /^ISS$/i, nome: 'ISS' },
    { pattern: /SUBSTITUI/i, nome: 'Substituição Tributária' },
    { pattern: /^ISS.+RETIDO/i, nome: 'ISS Retido' },
    { pattern: /^IRRF/i, nome: 'IRRF' },
    { pattern: /^PIS.+CUMULATIV/i, nome: 'PIS' },
    { pattern: /^COFINS.+CUMULATIV/i, nome: 'COFINS' },
    { pattern: /^INSS.+RETIDO/i, nome: 'INSS Retido' },
    { pattern: /CONTRIBUI.*RETID/i, nome: 'Contribuições Retidas' }
  ];

  // Função para extrair todos os valores numéricos de uma linha
  const extrairValores = (cols) => {
    const valores = [];
    for (let i = 0; i < cols.length; i++) {
      const val = cols[i].trim();
      if (val && /^-?[\d.]+,\d{2}$/.test(val)) {
        valores.push({ index: i, valor: parseValorBR(val) });
      }
    }
    return valores;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(';').map(c => c.trim());

    // Extrair informações da empresa
    if (/C\.?N\.?P\.?J\.?:/i.test(line) || /CNPJ:/i.test(line)) {
      empresaInfo.cnpj = cols.find(c => c.match(/\d{8,}|\d{2}\.\d{3}\.\d{3}/)) || '';
    }

    // Identificar competência (mês) - usando regex para evitar problemas com acento
    if (/COMPET.NCIA:/i.test(line)) {
      const match = line.match(/(\d{2})\/(\d{4})/);
      if (match) {
        competenciaAtual = `${match[1]}/${match[2]}`;
        if (!impostosPorMes[competenciaAtual]) {
          impostosPorMes[competenciaAtual] = {
            impostos: [],
            totalRecolher: 0,
            totalDiferido: 0
          };
        }
      }
    }

    // Capturar total da competência
    if (/Total.+compet/i.test(line) && competenciaAtual) {
      const valores = extrairValores(cols);
      if (valores.length >= 1) {
        // Primeiro valor não-zero geralmente é o total a recolher
        const totalRecolher = valores.find(v => v.valor > 0)?.valor || 0;
        impostosPorMes[competenciaAtual].totalRecolher = totalRecolher;
      }
    }

    // Capturar total geral
    if (/Total.+geral/i.test(line)) {
      const valores = extrairValores(cols);
      if (valores.length >= 1) {
        totalGeralRecolher += valores[0]?.valor || 0;
      }
    }

    // Identificar linhas de impostos
    const primeiraCol = cols[0] || '';
    let impostoMatch = null;

    for (const imp of impostosPatterns) {
      if (imp.pattern.test(primeiraCol)) {
        impostoMatch = imp;
        break;
      }
    }

    if (impostoMatch && competenciaAtual) {
      const valores = extrairValores(cols);

      // Estrutura do CSV: muitos valores em posições diferentes
      // O "Imposto a recolher" está próximo ao final (3o ou 4o do fim)
      // O "Saldo credor" é o último valor
      let imposto = {
        nome: impostoMatch.nome,
        nomeOriginal: primeiraCol.split('-')[0].trim(),
        saldoCredorAnterior: 0,
        debitos: 0,
        creditos: 0,
        impostoRecolher: 0,
        saldoCredorFinal: 0
      };

      if (valores.length >= 1) {
        // Primeiro valor: saldo credor anterior
        imposto.saldoCredorAnterior = valores[0]?.valor || 0;

        // Valores do meio: débitos e créditos
        if (valores.length >= 3) {
          imposto.debitos = valores[2]?.valor || 0;
        }
        if (valores.length >= 4) {
          imposto.creditos = valores[3]?.valor || 0;
        }

        // Imposto a recolher: geralmente é o 3o ou 4o do final
        if (valores.length >= 4) {
          // Procurar valor de imposto a recolher (não zero, próximo ao fim)
          const indexRecolher = valores.length - 3;
          if (indexRecolher >= 0) {
            imposto.impostoRecolher = valores[indexRecolher]?.valor || 0;
          }
        }

        // Último valor: saldo credor final
        imposto.saldoCredorFinal = valores[valores.length - 1]?.valor || 0;
      }

      impostosPorMes[competenciaAtual].impostos.push(imposto);
    }
  }

  // Calcular totais por imposto
  const totaisPorImposto = {};
  Object.entries(impostosPorMes).forEach(([mes, dados]) => {
    dados.impostos.forEach(imp => {
      if (!totaisPorImposto[imp.nome]) {
        totaisPorImposto[imp.nome] = { recolher: 0, credito: 0 };
      }
      totaisPorImposto[imp.nome].recolher += imp.impostoRecolher;
      totaisPorImposto[imp.nome].credito += imp.saldoCredorFinal;
    });
  });

  // Calcular total geral a recolher
  let totalRecolher = 0;
  Object.values(impostosPorMes).forEach(dados => {
    totalRecolher += dados.totalRecolher;
  });

  // Se não capturou dos totais de competência, usar o total calculado
  if (totalRecolher === 0) {
    totalRecolher = totalGeralRecolher;
  }

  return {
    empresaInfo,
    impostosPorMes,
    totaisPorImposto,
    competencias: Object.keys(impostosPorMes),
    totalRecolher,
    periodosImportados: Object.keys(impostosPorMes).length,
    tipo: 'resumoImpostos'
  };
};

/**
 * Parser para Resumo por Acumulador
 * Extrai entradas e saídas por código de acumulador
 */
export const parseResumoPorAcumulador = (csvContent) => {
  const lines = csvContent.split('\n');
  let empresaInfo = {};
  let periodo = '';
  const entradas = [];
  const saidas = [];
  let secaoAtual = null; // 'ENTRADAS' ou 'SAIDAS'

  // Função para verificar se é seção SAIDAS (com ou sem acento, qualquer encoding)
  const isSaidas = (texto) => {
    if (!texto) return false;
    const t = texto.toUpperCase().trim();
    // Verificar múltiplas formas: SAÍDAS, SAIDAS, SA[qualquer char]DAS
    return t === 'SAIDAS' ||
           t === 'SAÍDAS' ||
           (t.startsWith('SA') && t.endsWith('DAS') && t.length <= 7);
  };

  // Função para verificar se é seção ENTRADAS
  const isEntradas = (texto) => {
    if (!texto) return false;
    const t = texto.toUpperCase().trim();
    return t === 'ENTRADAS';
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(';').map(c => c.trim());

    // Extrair informações da empresa
    if (line.includes('CNPJ:')) {
      empresaInfo.cnpj = cols.find(c => c.match(/\d{8,}/)) || '';
    }
    if (line.toUpperCase().includes('PER') && line.includes(':')) {
      periodo = cols.find(c => c.match(/\d{2}\/\d{2}\/\d{4}/)) || '';
    }

    // Identificar seção
    if (isEntradas(cols[0])) {
      secaoAtual = 'ENTRADAS';
      continue;
    }
    if (isSaidas(cols[0])) {
      secaoAtual = 'SAIDAS';
      continue;
    }
    if (cols[0]?.includes('Total:')) {
      continue;
    }

    // Processar linhas de dados
    if (secaoAtual && cols[0] && /^\d+$/.test(cols[0])) {
      const codigo = parseInt(cols[0]);
      // Encontrar descrição (geralmente na coluna 2 ou 3)
      let descricao = '';
      let vlrContabil = 0;
      let baseIcms = 0;
      let vlrIcms = 0;
      let isentas = 0;
      let outras = 0;
      let vlrIpi = 0;
      let bcIcmsSt = 0;
      let vlrIcmsSt = 0;

      // Buscar descrição (texto com mais de 5 caracteres)
      for (let j = 1; j < Math.min(cols.length, 10); j++) {
        if (cols[j] && cols[j].length > 5 && isNaN(parseFloat(cols[j].replace(/\./g, '').replace(',', '.')))) {
          descricao = cols[j];
          break;
        }
      }

      // Buscar valores numéricos - COMEÇAR A PARTIR DA COLUNA 5 para pular código e descrição
      // O formato do CSV é: Código;;Descrição;;;;;;Vlr Contábil;;;;;;;Base ICMS;;etc
      const valores = [];
      for (let j = 5; j < cols.length; j++) {
        const colValue = cols[j];
        // Só considerar valores no formato brasileiro (com vírgula decimal)
        if (colValue && colValue.includes(',')) {
          const val = parseValorBR(colValue);
          valores.push(val); // Incluir mesmo 0,00 para manter posição
        }
      }

      // Valores na ordem do CSV: Vlr Contábil, Base ICMS, Vlr ICMS, Isentas, Outras, Vlr IPI, BC ICMS ST, Vlr ICMS ST
      if (valores.length >= 1) vlrContabil = valores[0];
      if (valores.length >= 2) baseIcms = valores[1];
      if (valores.length >= 3) vlrIcms = valores[2];
      if (valores.length >= 4) isentas = valores[3];
      if (valores.length >= 5) outras = valores[4];
      if (valores.length >= 6) vlrIpi = valores[5];
      if (valores.length >= 7) bcIcmsSt = valores[6];
      if (valores.length >= 8) vlrIcmsSt = valores[7];

      const item = {
        codigo,
        descricao,
        vlrContabil,
        baseIcms,
        vlrIcms,
        isentas,
        outras,
        vlrIpi,
        bcIcmsSt,
        vlrIcmsSt
      };

      if (secaoAtual === 'ENTRADAS') {
        entradas.push(item);
      } else if (secaoAtual === 'SAIDAS') {
        saidas.push(item);
      }
    }
  }

  // Calcular totais
  const totalEntradas = entradas.reduce((acc, e) => acc + e.vlrContabil, 0);
  const totalSaidas = saidas.reduce((acc, s) => acc + s.vlrContabil, 0);

  // Categorias específicas para 380
  // Compras para comercialização (códigos 5, 7 e similares)
  const itensCompraComercializacao = entradas.filter(e =>
    e.descricao.toUpperCase().includes('COMERCIALIZA') ||
    e.descricao.toUpperCase().includes('COMERCIALIZAÇÃO')
  );
  const compraComercializacao = itensCompraComercializacao.reduce((acc, e) => acc + e.vlrContabil, 0);

  // Vendas - pegar todas que começam com "VENDA" (exceto ativo imobilizado)
  const itensVendas = saidas.filter(s => {
    const desc = s.descricao.toUpperCase();
    // Começa com VENDA mas não é venda de ativo imobilizado
    return desc.startsWith('VENDA') && !desc.includes('ATIVO') && !desc.includes('IMOBILIZADO');
  });

  // Total de vendas para 380 = TODAS as vendas (exceto ativo imobilizado)
  const totalVendas380 = itensVendas.reduce((acc, s) => acc + s.vlrContabil, 0);

  // Para o 380, vendaMercadoria = total de todas as vendas
  // (inclui VENDA DE SORVETES, VENDA DE PRODUTOS, VENDA DE MERCADORIA, etc)
  const vendaMercadoria = totalVendas380;

  // Detalhamento por categoria (para gráfico de barras horizontais)
  const itensVendaProduto = itensVendas.filter(s =>
    s.descricao.toUpperCase().includes('PRODUTO') ||
    s.descricao.toUpperCase().includes('PRODUÇÃO')
  );
  const vendaProduto = itensVendaProduto.reduce((acc, s) => acc + s.vlrContabil, 0);

  const itensVendaExterior = itensVendas.filter(s =>
    s.descricao.toUpperCase().includes('EXTERIOR')
  );
  const vendaExterior = itensVendaExterior.reduce((acc, s) => acc + s.vlrContabil, 0);

  // Vendas de mercadoria específicas (para detalhamento)
  const itensVendaMercadoriaEspecifica = itensVendas.filter(s =>
    s.descricao.toUpperCase().includes('MERCADORIA') ||
    s.descricao.toUpperCase().includes('SORVETE')
  );
  const vendaMercadoriaEspecifica = itensVendaMercadoriaEspecifica.reduce((acc, s) => acc + s.vlrContabil, 0);

  return {
    empresaInfo,
    periodo,
    entradas,
    saidas,
    totais: {
      entradas: totalEntradas,
      saidas: totalSaidas
    },
    categorias: {
      compraComercializacao,
      vendaMercadoria,
      vendaProduto,
      vendaExterior,
      totalVendas380,
      // Cálculo 380: Esperado = Compra Comercialização + 25%
      esperado380: compraComercializacao * 1.25
    },
    // Detalhes para gráfico de barras horizontais
    detalhes380: {
      compras: itensCompraComercializacao,
      vendasMercadoria: itensVendas,
      vendasProduto: itensVendaProduto,
      vendasExterior: itensVendaExterior
    },
    tipo: 'resumoAcumulador'
  };
};

/**
 * Detecta tipo de relatório fiscal
 */
export const detectarTipoRelatorioFiscal = (csvContent) => {
  const upper = csvContent.toUpperCase();

  if (upper.includes('CONTRIBUIÇÃO SOCIAL') || upper.includes('CONTRIBUICAO SOCIAL')) {
    if (upper.includes('CSLL DEVIDA') || upper.includes('CSLL A RECOLHER')) {
      return 'csll';
    }
  }
  if (upper.includes('IMPOSTO DE RENDA') && upper.includes('IRPJ')) {
    return 'irpj';
  }
  if (upper.includes('DEMONSTRATIVO DE FATURAMENTO')) {
    return 'faturamento';
  }
  if (upper.includes('DEMONSTRATIVO MENSAL') && upper.includes('ENTRADAS')) {
    return 'demonstrativoMensal';
  }
  if (upper.includes('RESUMO DOS IMPOSTOS')) {
    return 'resumoImpostos';
  }
  if (upper.includes('RESUMO POR ACUMULADOR')) {
    return 'resumoAcumulador';
  }

  return 'desconhecido';
};

/**
 * Parser universal para relatórios fiscais
 */
export const parseRelatorioFiscal = (csvContent) => {
  const tipo = detectarTipoRelatorioFiscal(csvContent);

  switch (tipo) {
    case 'csll':
      return { tipo, dados: parseContribuicaoSocial(csvContent) };
    case 'irpj':
      return { tipo, dados: parseImpostoRenda(csvContent) };
    case 'faturamento':
      return { tipo, dados: parseDemonstrativoFinanceiro(csvContent) };
    case 'demonstrativoMensal':
      return { tipo, dados: parseDemonstrativoMensal(csvContent) };
    case 'resumoImpostos':
      return { tipo, dados: parseResumoImpostos(csvContent) };
    case 'resumoAcumulador':
      return { tipo, dados: parseResumoPorAcumulador(csvContent) };
    default:
      throw new Error('Tipo de relatório fiscal não reconhecido');
  }
};
