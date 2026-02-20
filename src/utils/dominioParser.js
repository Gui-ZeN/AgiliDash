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
  clean = clean.replace(/^"+|"+$/g, '').trim();

  // Se for apenas texto ou cabeçalho, retorna 0
  if (clean.match(/^[a-zA-Z]/)) return 0;

  // Remove indicadores de débito/crédito (usado em balancetes)
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

const parseCsvLine = (line = '', delimiter = ';') => {
  const cols = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      cols.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cols.push(current.trim());
  return cols;
};

const detectarDelimitadorResumoAcumulador = (line = '') => {
  if (line.includes(';')) return ';';
  if (line.includes(',')) return ',';
  return ';';
};

const detectarDelimitadorCsv = (line = '') => {
  if (line.includes(';')) return ';';
  if (line.includes(',')) return ',';
  return ';';
};

const extrairCnpjDaLinha = (line = '') => {
  const match = String(line).match(/(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{14})/);
  return match ? match[1] : '';
};

const extrairTrimestreDaLinha = (line = '', cols = []) => {
  const lineMatch = String(line).match(
    /TRIMESTRE:\s*[,; ]*"?([A-Za-z]{3}\/\d{2}|\d{1,2}\/\d{4})"?/i
  );
  if (lineMatch) return lineMatch[1];

  const colMatch = (cols || [])
    .map((col) => String(col || '').replace(/^"+|"+$/g, '').trim())
    .find((col) => /^([A-Za-z]{3}\/\d{2}|\d{1,2}\/\d{4})$/i.test(col));

  return colMatch || '';
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

const normalizeText = (text = '') =>
  String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const NUMERIC_BR_REGEX = /^-?\(?[\d.]+(?:,\d+)?\)?$/;

const isNumericBRValue = (value = '') =>
  NUMERIC_BR_REGEX.test(String(value || '').replace(/^"+|"+$/g, '').trim());

const extrairValoresNumericosCols = (cols = []) =>
  (cols || [])
    .map((col) => String(col || '').replace(/^"+|"+$/g, '').trim())
    .filter((col) => isNumericBRValue(col))
    .map((col) => parseValorBR(col));

const MONTH_PREFIXES = [
  ['jan', 1],
  ['fev', 2],
  ['mar', 3],
  ['abr', 4],
  ['mai', 5],
  ['jun', 6],
  ['jul', 7],
  ['ago', 8],
  ['set', 9],
  ['out', 10],
  ['nov', 11],
  ['dez', 12],
];

const MONTHS_FULL = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const getMonthIndexFromText = (monthText = '') => {
  const normalized = normalizeText(monthText).replace(/[^a-z]/g, '');
  if (!normalized) return 0;
  const prefix = MONTH_PREFIXES.find(([abbr]) => normalized.startsWith(abbr));
  return prefix ? prefix[1] : 0;
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

  const normalizarTexto = (texto = '') =>
    texto
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim();

  const encontrarConta = ({ classificacoes = [], descricoes = [] }) => {
    const classificacoesAlvo = new Set(classificacoes.map((c) => c.trim()));
    const descricoesAlvo = descricoes.map(normalizarTexto);

    return contas.find((conta) => {
      if (!conta) return false;

      const classificacaoConta = (conta.classificacao || '').trim();
      if (classificacoesAlvo.has(classificacaoConta)) {
        return true;
      }

      const descricaoConta = normalizarTexto(conta.descricao || '');
      return descricoesAlvo.some((alvo) => descricaoConta.includes(alvo));
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(';').map((c) => c.trim());

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
        nivel: classificacao.split('.').length,
      });
    }
  }

  return {
    empresaInfo,
    periodo,
    contas,
    // Extrair contas específicas para os gráficos
    bancosMovimento: encontrarConta({
      classificacoes: ['1.1.1.02'],
      descricoes: ['BANCOS CONTA MOVIMENTO'],
    }),
    aplicacoesFinanceiras: encontrarConta({
      classificacoes: ['1.1.1.03'],
      descricoes: ['APLICACOES FINANCEIRAS DE LIQUIDEZ IMEDIATA'],
    }),
    estoque: encontrarConta({
      classificacoes: ['1.1.5'],
      descricoes: ['ESTOQUE'],
    }),
    clientes: encontrarConta({
      classificacoes: ['1.1.2'],
      descricoes: ['CLIENTES'],
    }),
    fornecedores: encontrarConta({
      classificacoes: ['2.1.1'],
      descricoes: ['FORNECEDORES'],
    }),
    receitaBruta: encontrarConta({
      classificacoes: ['3.1.1'],
      descricoes: ['RECEITA BRUTA'],
    }),
    custoVendas: encontrarConta({
      classificacoes: ['3.1.5'],
      descricoes: ['CMV', 'CPV', 'CUSTO DAS MERCADORIAS VENDIDAS', 'CUSTO DOS PRODUTOS VENDIDOS'],
    }),
    despesasOperacionais: encontrarConta({
      classificacoes: ['3.2.1'],
      descricoes: ['DESPESAS OPERACIONAIS'],
    }),
    resultadoLiquido: encontrarConta({
      classificacoes: ['3'],
      descricoes: ['RESULTADO LIQUIDO'],
    }),
  };
};

/**
 * Parser para Análise Horizontal (DRE Horizontal)
 * Extrai dados mensais comparativos - SUPORTA MÚLTIPLOS ANOS
 */
export const parseAnaliseHorizontal = (csvContent) => {
  const lines = csvContent.split('\n');
  const mesNomes = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];

  let empresaInfo = {};
  let competencia = '';
  let anoExercicio = new Date().getFullYear(); // Ano padrão

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
    outrasReceitasOperacionais: new Array(12).fill(0),
    outrasDespesasReceitas: new Array(12).fill(0),
    lucroAntesIR: new Array(12).fill(0),
    provisaoCSLL: new Array(12).fill(0),
    provisaoIRPJ: new Array(12).fill(0),
    resultadoLiquido: new Array(12).fill(0),
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
    { match: 'OUTRAS RECEITAS OPERACIONAIS', key: 'outrasReceitasOperacionais', exact: true },
    { match: 'OUTRAS DESPESAS E OUTRAS RECEITAS', key: 'outrasDespesasReceitas', exact: true },
    { match: '= LUCRO ANTES DO IR', key: 'lucroAntesIR', exact: false },
    { match: '(-) PROVISAO PARA A CONTRIBUICAO SOCIAL', key: 'provisaoCSLL', exact: true },
    { match: '(-) PROVISAO PARA O IMPOSTO DE RENDA', key: 'provisaoIRPJ', exact: true },
    { match: '= RESULTADO LIQUIDO DO PERIODO', key: 'resultadoLiquido', exact: true },
    { match: 'LUCRO/PREJU', key: 'resultadoLiquido', exact: false },
  ];

  // Índices CORRETOS das colunas para cada mês no CSV do Domínio
  // Jan=6, Fev=8, Mar=10, Abr=12, Mai=14, Jun=17, Jul=19, Ago=21, Set=23, Out=25, Nov=27, Dez=31
  const indicesMeses = [6, 8, 10, 12, 14, 17, 19, 21, 23, 25, 27, 31];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(';').map((c) => c.trim());

    // Extrair informações da empresa
    if (line.includes('C.N.P.J.:')) {
      empresaInfo.cnpj = cols[3] || cols.find((c) => c.match(/\d{2}\.\d{3}\.\d{3}/)) || '';
    }
    // Extrair competência E ano do exercício
    if (line.includes('Compet')) {
      competencia = cols[3] || cols.find((c) => c.match(/\d{2}\/\d{4}/)) || '';
      // Extrair ano da competência (formato: MM/YYYY ou similar)
      const anoMatch = competencia.match(/\/(\d{4})/);
      if (anoMatch) {
        anoExercicio = parseInt(anoMatch[1]);
      }
    }
    // Também tentar extrair de "Exercício" ou "Periodo"
    if (line.includes('Exerc') || line.includes('Periodo')) {
      const anoMatch = line.match(/(\d{4})/);
      if (anoMatch) {
        anoExercicio = parseInt(anoMatch[1]);
      }
    }

    // Identificar linhas de dados
    const descricao = cols[0];
    if (!descricao) continue;

    // Procurar categoria correspondente
    for (const cat of categoriaMap) {
      const match = cat.exact ? descricao === cat.match : descricao.includes(cat.match);

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
        break; // Encontrou a categoria, Não precisa continuar
      }
    }
  }

  // Calcular receitas e despesas por mês usando LINHAS ESPECÍFICAS do DRE
  // RECEITA = RECEITA BRUTA
  const receitasMensais = [...dados.receitaBruta];

  // DESPESAS/CUSTOS = Soma das seguintes linhas:
  // (-) CMV/CPV
  // (-) DESPESAS OPERACIONAIS DAS ATIVIDADES EM GERAL
  // + / - RESULTADO FINANCEIRO
  // OUTRAS RECEITAS OPERACIONAIS
  // OUTRAS DESPESAS E OUTRAS RECEITAS
  // (-) PROVISAO PARA A CONTRIBUICAO SOCIAL
  // (-) PROVISAO PARA O IMPOSTO DE RENDA
  const despesasMensais = new Array(12).fill(0);
  for (let m = 0; m < 12; m++) {
    const somaDespesas =
      dados.cmv[m] +
      dados.despesasOperacionais[m] +
      dados.resultadoFinanceiro[m] +
      dados.outrasReceitasOperacionais[m] +
      dados.outrasDespesasReceitas[m] +
      dados.provisaoCSLL[m] +
      dados.provisaoIRPJ[m];
    // Converter para valor positivo (as despesas vêm negativas do CSV)
    despesasMensais[m] = Math.abs(somaDespesas);
  }

  // LUCRO LÍQUIDO = Receita - Despesas (calculado no retorno)

  // Calcular lucro líquido mensal (Receita - Despesas)
  const lucroLiquidoMensal = new Array(12).fill(0);
  for (let m = 0; m < 12; m++) {
    lucroLiquidoMensal[m] = receitasMensais[m] - despesasMensais[m];
  }

  // Criar estrutura de dados por competência (MM/YYYY)
  const dadosPorCompetencia = {};
  for (let m = 0; m < 12; m++) {
    const competenciaKey = `${String(m + 1).padStart(2, '0')}/${anoExercicio}`;
    dadosPorCompetencia[competenciaKey] = {
      mes: m + 1,
      ano: anoExercicio,
      mesNome: mesNomes[m],
      receitaBruta: dados.receitaBruta[m],
      deducoes: dados.deducoes[m],
      receitaLiquida: dados.receitaLiquida[m],
      cmv: dados.cmv[m],
      lucroBruto: dados.lucroBruto[m],
      despesasOperacionais: dados.despesasOperacionais[m],
      despesasPessoal: dados.despesasPessoal[m],
      despesasGerais: dados.despesasGerais[m],
      resultadoFinanceiro: dados.resultadoFinanceiro[m],
      outrasReceitasOperacionais: dados.outrasReceitasOperacionais[m],
      outrasDespesasReceitas: dados.outrasDespesasReceitas[m],
      lucroAntesIR: dados.lucroAntesIR[m],
      provisaoCSLL: dados.provisaoCSLL[m],
      provisaoIRPJ: dados.provisaoIRPJ[m],
      resultadoLiquidoOriginal: dados.resultadoLiquido[m],
      // Valores calculados com base nas linhas específicas
      receita: receitasMensais[m],
      despesa: despesasMensais[m],
      lucroLiquido: lucroLiquidoMensal[m],
    };
  }

  // Totais
  const totalReceitas = receitasMensais.reduce((a, b) => a + b, 0);
  const totalDespesas = despesasMensais.reduce((a, b) => a + b, 0);
  const totalLucroLiquido = totalReceitas - totalDespesas;

  return {
    empresaInfo,
    competencia,
    anoExercicio, // ANO EXTRAÍDO DO ARQUIVO
    meses: mesNomes,
    dados,
    dadosPorCompetencia, // NOVA ESTRUTURA POR COMPETÊNCIA
    // Receitas e Despesas mensais calculadas (usando linhas específicas)
    receitasMensais,
    despesasMensais,
    lucroLiquidoMensal,
    // Calcular totais
    totais: {
      receitaBruta: totalReceitas,
      despesaTotal: totalDespesas,
      lucroLiquido: totalLucroLiquido,
      totalReceitas,
      totalDespesas,
    },
  };
};

/**
 * Parser para DRE Comparativa (Anual)
 * Compara dois exercícios
 */
export const parseDREComparativa = (csvContent) => {
  const lines = csvContent.split('\n');
  const delimiter = detectarDelimitadorCsv(lines.find((line) => line && line.trim()) || '');
  let empresaInfo = {};
  let periodo = '';

  const dados = {
    anoAtual: {},
    anoAnterior: {},
  };

  const isComparativoCalculo = lines.some((line) =>
    normalizeText(line).includes('comparativo de calculo')
  );

  if (isComparativoCalculo) {
    const trimestres = [];
    let periodoComparativo = '';

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const cols = parseCsvLine(line, delimiter);
      const lineNormalized = normalizeText(line);

      if (!empresaInfo.razaoSocial) {
        const primeiraColuna = String(cols[0] || '').replace(/^"+|"+$/g, '').trim();
        if (primeiraColuna && !lineNormalized.includes('c.n.p.j') && !lineNormalized.includes('trimestre:')) {
          empresaInfo.razaoSocial = primeiraColuna;
        }
      }

      if (!empresaInfo.cnpj) {
        const cnpj = extrairCnpjDaLinha(line);
        if (cnpj) empresaInfo.cnpj = cnpj;
      }

      if (!periodoComparativo && lineNormalized.includes('trimestre:')) {
        const faixaMatch = line.match(/(\d{1,2}\/\d{4}\s*a\s*\d{1,2}\/\d{4})/i);
        if (faixaMatch?.[1]) {
          periodoComparativo = faixaMatch[1].replace(/\s+/g, ' ');
        } else {
          periodoComparativo = extrairTrimestreDaLinha(line, cols);
        }
      }

      const trimestreIndex = cols.findIndex((col) =>
        /^\d{1,2}\/\d{4}$/.test(String(col || '').replace(/^"+|"+$/g, '').trim())
      );
      if (trimestreIndex < 0) continue;

      const trimestreRaw = String(cols[trimestreIndex] || '').replace(/^"+|"+$/g, '').trim();
      const [trimestreNumeroRaw, anoRaw] = trimestreRaw.split('/');
      const trimestreNumero = Number(trimestreNumeroRaw);
      const ano = Number(anoRaw);
      if (!Number.isFinite(trimestreNumero) || !Number.isFinite(ano)) continue;

      const valores = extrairValoresNumericosCols(cols.slice(trimestreIndex + 1));
      if (valores.length < 2) continue;

      const csllReal = Number(valores[0] || 0);
      const irpjReal = Number(valores[1] || 0);
      const totalReal = Number(valores[2] || csllReal + irpjReal);
      const csllEstimado = Number(valores[3] || 0);
      const irpjEstimado = Number(valores[4] || 0);
      const totalEstimado = Number(valores[5] || csllEstimado + irpjEstimado);
      const diferencaRealEstimado = Number(valores[6] || totalReal - totalEstimado);

      trimestres.push({
        trimestre: trimestreRaw,
        trimestreNumero,
        ano,
        csllReal,
        irpjReal,
        totalReal,
        csllEstimado,
        irpjEstimado,
        totalEstimado,
        diferencaRealEstimado,
      });
    }

    trimestres.sort((a, b) =>
      a.ano !== b.ano ? a.ano - b.ano : a.trimestreNumero - b.trimestreNumero
    );

    const anosDisponiveis = [...new Set(trimestres.map((item) => item.ano))].sort((a, b) => b - a);
    const anoAtual = anosDisponiveis[0];
    const anoAnterior = anosDisponiveis[1];

    const serieTrimestralPorAno = (ano) => {
      if (!ano) return [0, 0, 0, 0];
      const serie = [0, 0, 0, 0];
      trimestres
        .filter((item) => item.ano === ano)
        .forEach((item) => {
          const index = item.trimestreNumero - 1;
          if (index >= 0 && index < 4) {
            serie[index] = Number(item.totalReal || 0);
          }
        });
      return serie;
    };

    const lucroAtual = serieTrimestralPorAno(anoAtual);
    const lucroAnterior = serieTrimestralPorAno(anoAnterior);
    const totalAtual = lucroAtual.reduce((acc, value) => acc + Number(value || 0), 0);
    const totalAnterior = lucroAnterior.reduce((acc, value) => acc + Number(value || 0), 0);

    if (anoAtual) {
      dados.anoAtual = {
        ano: anoAtual,
        lucroAntesIR: lucroAtual,
        resultadoLiquido: totalAtual,
      };
    }

    if (anoAnterior) {
      dados.anoAnterior = {
        ano: anoAnterior,
        lucroAntesIR: lucroAnterior,
        resultadoLiquido: totalAnterior,
      };
    }

    return {
      empresaInfo,
      periodo: periodoComparativo,
      dados,
      comparativoCalculo: {
        trimestres,
        periodo: periodoComparativo,
        anoAtual,
        anoAnterior,
      },
      variacao: {
        receitaBruta: 0,
        lucroLiquido: totalAnterior
          ? (((totalAtual - totalAnterior) / Math.abs(totalAnterior)) * 100).toFixed(2)
          : 0,
      },
    };
  }

  const categorias = [
    {
      key: 'receitaBruta',
      match: (desc) => desc === 'receita bruta',
    },
    {
      key: 'deducoes',
      match: (desc) => desc.includes('deducoes da receita bruta'),
    },
    {
      key: 'receitaLiquida',
      match: (desc) => desc.includes('receita liquida'),
    },
    {
      key: 'cmv',
      match: (desc) =>
        desc.includes('cmv/ cpv') || desc.includes('cpv/ cmv') || desc.includes(' cmv') || desc.includes(' cpv'),
    },
    {
      key: 'lucroBruto',
      match: (desc) => desc.includes('lucro bruto'),
    },
    {
      key: 'despesasOperacionais',
      match: (desc) => desc.includes('despesas operacionais das atividades em geral'),
    },
    {
      key: 'despesasPessoal',
      match: (desc) => desc.includes('despesas c/ pessoal'),
    },
    {
      key: 'despesasGerais',
      match: (desc) => desc === 'despesas gerais',
    },
    {
      key: 'resultadoFinanceiro',
      match: (desc) => desc.includes('resultado financeiro'),
    },
    {
      key: 'lucroAntesIR',
      match: (desc) =>
        desc.includes('lucro antes do ir') || desc.includes('resultado antes do irpj e da csll'),
    },
    {
      key: 'provisaoCSLL',
      match: (desc) => desc.includes('provisao para a contribuicao social'),
    },
    {
      key: 'provisaoIRPJ',
      match: (desc) => desc.includes('provisao para o imposto de renda'),
    },
    {
      key: 'resultadoLiquido',
      match: (desc) =>
        desc.includes('resultado liquido do periodo') || desc.includes('resultado liquido do exercicio'),
    },
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = parseCsvLine(line, delimiter);
    const descricaoLinha = normalizeText(String(cols[0] || ''))
      .replace(/[=]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Extrair informações
    if (cols[0] === 'Empresa:' || normalizeText(line).includes('empresa:')) {
      empresaInfo.razaoSocial = cols[3] || cols[1] || empresaInfo.razaoSocial;
    }
    if (cols[0] === 'Período:' || normalizeText(line).includes('periodo:')) {
      periodo = cols[3] || cols[1] || periodo;
    }
    if (!empresaInfo.cnpj) {
      const cnpj = extrairCnpjDaLinha(line);
      if (cnpj) empresaInfo.cnpj = cnpj;
    }

    // Buscar categorias
    for (const cat of categorias) {
      if (cat.match(descricaoLinha)) {
        // Formato: Descrição, vazios, valor 2025, vazios, valor 2024
        const valores = extrairValoresNumericosCols(cols.slice(1));
        dados.anoAtual[cat.key] = Number(valores[0] || 0);
        dados.anoAnterior[cat.key] = Number(valores[1] || 0);
        break;
      }
    }
  }

  return {
    empresaInfo,
    periodo,
    dados,
    variacao: {
      receitaBruta: dados.anoAnterior.receitaBruta
        ? (
            ((dados.anoAtual.receitaBruta - dados.anoAnterior.receitaBruta) /
              Math.abs(dados.anoAnterior.receitaBruta)) *
            100
          ).toFixed(2)
        : 0,
      lucroLiquido: dados.anoAnterior.resultadoLiquido
        ? (
            ((dados.anoAtual.resultadoLiquido - dados.anoAnterior.resultadoLiquido) /
              Math.abs(dados.anoAnterior.resultadoLiquido)) *
            100
          ).toFixed(2)
        : 0,
    },
  };
};

/**
 * Parser para DRE Mensal
 * Extrai dados acumulados do período
 */
export const parseDREMensal = (csvContent) => {
  const lines = csvContent.split('\n');
  const delimiter = detectarDelimitadorCsv(lines.find((line) => line && line.trim()) || '');
  let empresaInfo = {};
  let periodo = '';

  const dados = {};
  const dadosAnoAtual = {};
  const dadosAnoAnterior = {};
  let anoAtual = null;
  let anoAnterior = null;
  let layoutComAnos = false;

  const categorias = [
    { key: 'receitaBruta', match: (desc) => desc === 'receita bruta' },
    { key: 'deducoes', match: (desc) => desc.includes('deducoes da receita bruta') },
    { key: 'receitaLiquida', match: (desc) => desc.includes('receita liquida') },
    {
      key: 'cmv',
      match: (desc) =>
        desc.includes('cmv/ cpv') || desc.includes('cpv/ cmv') || desc.includes(' cmv') || desc.includes(' cpv'),
    },
    { key: 'lucroBruto', match: (desc) => desc.includes('lucro bruto') },
    { key: 'despesasOperacionais', match: (desc) => desc.includes('despesas operacionais das atividades em geral') },
    { key: 'despesasPessoal', match: (desc) => desc.includes('despesas c/ pessoal') },
    { key: 'despesasGerais', match: (desc) => desc === 'despesas gerais' },
    { key: 'resultadoFinanceiro', match: (desc) => desc.includes('resultado financeiro') },
    {
      key: 'lucroAntesIR',
      match: (desc) =>
        desc.includes('lucro antes do ir e da csl') ||
        desc.includes('lucro antes do ir') ||
        desc.includes('resultado antes do irpj e da csll'),
    },
    { key: 'provisaoCSLL', match: (desc) => desc.includes('provisao para a contribuicao social') },
    { key: 'provisaoIRPJ', match: (desc) => desc.includes('provisao para o imposto de renda') },
    {
      key: 'resultadoLiquido',
      match: (desc) =>
        desc.includes('resultado liquido do periodo') || desc.includes('resultado liquido do exercicio'),
    },
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = parseCsvLine(line, delimiter);
    const lineNormalized = normalizeText(line);

    // Extrair informações
    if (lineNormalized.includes('empresa:') && !empresaInfo.razaoSocial) {
      empresaInfo.razaoSocial = cols[3] || cols[1] || empresaInfo.razaoSocial;
    }
    if (lineNormalized.includes('periodo:')) {
      periodo = cols[3] || cols[1] || periodo;
    }
    if (!empresaInfo.cnpj) {
      const cnpj = extrairCnpjDaLinha(line);
      if (cnpj) empresaInfo.cnpj = cnpj;
    }

    if (lineNormalized.includes('descricao')) {
      const anos = cols
        .map((col) => String(col || '').replace(/^"+|"+$/g, '').trim())
        .filter((col) => /^\d{4}$/.test(col))
        .map((col) => Number(col));
      if (anos.length >= 2) {
        [anoAtual, anoAnterior] = anos;
        layoutComAnos = true;
      }
    }

    const descricaoBruta = String(cols.find((col) => String(col || '').trim()) || '');
    const descricaoLinha = normalizeText(descricaoBruta)
      .replace(/[=]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!descricaoLinha) continue;

    for (const cat of categorias) {
      if (!cat.match(descricaoLinha)) continue;

      const valores = extrairValoresNumericosCols(cols.slice(1));

      const valorColuna10Raw = String(cols[10] || '').replace(/^"+|"+$/g, '').trim();
      const valorColuna10Valido = isNumericBRValue(valorColuna10Raw);

      let valorPrincipal = 0;
      let valorSecundario = null;

      if (layoutComAnos && valores.length) {
        valorPrincipal = Number(valores[0] || 0);
        valorSecundario = Number(valores[1] ?? 0);
      } else if (valorColuna10Valido) {
        valorPrincipal = parseValorBR(valorColuna10Raw);
      } else if (valores.length) {
        valorPrincipal = Number(valores[0] || 0);
      }

      dados[cat.key] = valorPrincipal;
      dadosAnoAtual[cat.key] = valorPrincipal;
      if (valorSecundario !== null) {
        dadosAnoAnterior[cat.key] = valorSecundario;
      }
      break;
    }
  }

  const retorno = {
    empresaInfo,
    periodo,
    dados,
  };

  if (layoutComAnos) {
    retorno.comparativo = {
      anoAtual,
      anoAnterior,
      dadosAnoAtual,
      dadosAnoAnterior,
    };
  }

  return retorno;
};

/**
 * Detecta automaticamente o tipo de relatório pelo conteúdo
 */
export const detectarTipoRelatorio = (csvContent) => {
  if (csvContent.includes('BALANCETE')) return 'balancete';
  if (csvContent.includes('ANÁLISE HORIZONTAL')) return 'analiseHorizontal';
  if (normalizeText(csvContent).includes('comparativo de calculo')) return 'dreComparativa';
  if (csvContent.includes('DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO')) {
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
      throw new Error('Tipo de Relatório Não reconhecido');
  }
};

/**
 * Consolida dados de múltiplos balancetes mensais
 * para criar série temporal de 12 meses
 */
export const consolidarBalancetesMensais = (balancetes) => {
  const meses = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];

  const series = {
    bancosMovimento: new Array(12).fill(0),
    aplicacoesFinanceiras: new Array(12).fill(0),
    estoque: new Array(12).fill(0),
    receita: new Array(12).fill(0),
    custo: new Array(12).fill(0),
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
  const delimiter = detectarDelimitadorCsv(lines.find((line) => line && line.trim()) || '');
  let empresaInfo = {};
  let trimestre = '';
  let dados = {};

  // Função auxiliar para encontrar o Último valor numérico em uma linha
  const findLastValue = (cols) => {
    // Procura de trás pra frente o primeiro valor que parece número brasileiro
    for (let i = cols.length - 1; i >= 0; i--) {
      const val = cols[i].trim().replace(/^"+|"+$/g, '');
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
    const cols = parseCsvLine(line, delimiter);
    // Converte para uppercase para comparação (sem tentar remover acentos)

    // Extrair informações da empresa
    if (line.includes('C.N.P.J.:')) {
      empresaInfo.cnpj = extrairCnpjDaLinha(line) || empresaInfo.cnpj;
    }
    if (line.includes('Trimestre:')) {
      trimestre = extrairTrimestreDaLinha(line, cols) || trimestre;
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
    tipo: 'csll',
  };
};

/**
 * Parser para Imposto de Renda (IRPJ) Trimestral
 * Extrai dados de IRPJ por trimestre
 */
export const parseImpostoRenda = (csvContent) => {
  const lines = csvContent.split('\n');
  const delimiter = detectarDelimitadorCsv(lines.find((line) => line && line.trim()) || '');
  let empresaInfo = {};
  let trimestre = '';
  let dados = {};

  // Função auxiliar para encontrar o Último valor numérico em uma linha
  const findLastValue = (cols) => {
    for (let i = cols.length - 1; i >= 0; i--) {
      const val = cols[i].trim().replace(/^"+|"+$/g, '');
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
    const cols = parseCsvLine(line, delimiter);

    // Extrair informações da empresa
    if (line.includes('C.N.P.J.:')) {
      empresaInfo.cnpj = extrairCnpjDaLinha(line) || empresaInfo.cnpj;
    }
    if (line.includes('Trimestre:')) {
      trimestre = extrairTrimestreDaLinha(line, cols) || trimestre;
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
    tipo: 'irpj',
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
    const cols = line.split(';').map((c) => c.trim());

    // Extrair informações da empresa
    if (line.includes('Empresa:')) {
      empresaInfo.razaoSocial = cols.find((c) => c && !c.includes('Empresa') && c.length > 3) || '';
    }
    if (line.includes('CNPJ:')) {
      empresaInfo.cnpj = cols.find((c) => c.match(/\d{2}\.\d{3}\.\d{3}|\d+E\+\d+/)) || '';
    }

    // Identificar linhas de faturamento (começam com mês)
    const mesIndex = getMonthIndexFromText(cols[0]);
    if (mesIndex > 0) {
      // Encontrar índices dos valores
      const anoIndex = cols.findIndex((c) => c.match(/^\d{4}$/));
      if (anoIndex > 0) {
        const ano = parseInt(cols[anoIndex]);
        // Buscar valores após o ano
        let saidas = 0,
          servicos = 0,
          outros = 0,
          total = 0;

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
          mes: MONTHS_FULL[mesIndex - 1] || cols[0],
          mesIndex,
          ano,
          saidas,
          servicos,
          outros,
          total: total || saidas,
        });
      }
    }
  }

  // Separar por ano
  const faturamento2024 = faturamento.filter((f) => f.ano === 2024);
  const faturamento2025 = faturamento.filter((f) => f.ano === 2025);

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
      total: totalSaidas + totalServicos + totalOutros,
    },
    tipo: 'faturamento',
  };
};

/**
 * Parser para Demonstrativo Mensal (Entradas e Saídas)
 * Extrai Movimentação mensal detalhada
 */
export const parseDemonstrativoMensal = (csvContent) => {
  const lines = csvContent.split('\n');
  let empresaInfo = {};
  const movimentacao = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(';').map((c) => c.trim());

    // Extrair informações da empresa
    if (line.includes('Empresa:')) {
      empresaInfo.razaoSocial = cols.find((c) => c && !c.includes('Empresa') && c.length > 3) || '';
    }
    if (line.includes('CNPJ:')) {
      empresaInfo.cnpj = cols.find((c) => c.match(/\d{2}\.\d{3}\.\d{3}|\d+E\+\d+/)) || '';
    }

    // Identificar linhas de Movimentação (começam com mês)
    const mesIndex = getMonthIndexFromText(cols[0]);
    if (mesIndex > 0) {
      const anoIndex = cols.findIndex((c) => c.match(/^\d{4}$/));
      if (anoIndex > 0) {
        const ano = parseInt(cols[anoIndex]);
        // Buscar valores de entradas, saídas e serviços
        // Pegar os 3 primeiros valores numéricos (incluindo 0)
        let entradas = 0,
          saidas = 0,
          servicos = 0;
        const valoresEncontrados = [];

        for (let j = anoIndex + 1; j < cols.length && valoresEncontrados.length < 3; j++) {
          const colVal = cols[j];
          // Verificar se é um valor numérico (formato brasileiro ou inteiro)
          if (colVal && (/^[\d.]+,\d{2}$/.test(colVal) || /^\d+$/.test(colVal))) {
            valoresEncontrados.push(parseValorBR(colVal));
          }
        }

        if (valoresEncontrados.length >= 1) entradas = valoresEncontrados[0];
        if (valoresEncontrados.length >= 2) saidas = valoresEncontrados[1];
        if (valoresEncontrados.length >= 3) servicos = valoresEncontrados[2];

        movimentacao.push({
          mes: MONTHS_FULL[mesIndex - 1] || cols[0],
          mesIndex,
          ano,
          entradas,
          saidas,
          servicos,
          competencia: `${String(mesIndex).padStart(2, '0')}/${ano}`,
        });
      }
    }
  }

  // Identificar anos únicos
  const anosUnicos = [...new Set(movimentacao.map((m) => m.ano))].sort();

  // Separar por ano dinamicamente
  const movimentacaoPorAno = {};
  const totaisPorAno = {};

  anosUnicos.forEach((ano) => {
    movimentacaoPorAno[ano] = movimentacao.filter((m) => m.ano === ano);
    totaisPorAno[ano] = {
      entradas: movimentacaoPorAno[ano].reduce((acc, m) => acc + m.entradas, 0),
      saidas: movimentacaoPorAno[ano].reduce((acc, m) => acc + m.saidas, 0),
      servicos: movimentacaoPorAno[ano].reduce((acc, m) => acc + m.servicos, 0),
    };
  });

  // Totais gerais (todos os anos)
  const totaisGerais = {
    entradas: movimentacao.reduce((acc, m) => acc + m.entradas, 0),
    saidas: movimentacao.reduce((acc, m) => acc + m.saidas, 0),
    servicos: movimentacao.reduce((acc, m) => acc + m.servicos, 0),
  };

  // Manter compatibilidade com estrutura antiga
  const movimentacao2024 = movimentacaoPorAno[2024] || [];
  const movimentacao2025 = movimentacaoPorAno[2025] || [];
  const totais2024 = totaisPorAno[2024] || { entradas: 0, saidas: 0, servicos: 0 };
  const totais2025 = totaisPorAno[2025] || { entradas: 0, saidas: 0, servicos: 0 };

  return {
    empresaInfo,
    movimentacao,
    movimentacaoPorAno,
    totaisPorAno,
    totaisGerais,
    anosUnicos,
    // Compatibilidade
    movimentacao2024,
    movimentacao2025,
    totais2024,
    totais2025,
    tipo: 'demonstrativoMensal',
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
  let secaoAtual = 'lancados'; // 'lancados' ou 'calculados'

  // Lista de impostos conhecidos (padrões flexíveis, mais específicos primeiro)
  const impostosPatterns = [
    { pattern: /SUBSTITUI/i, nome: 'Substitui\u00e7\u00e3o Tribut\u00e1ria', tipo: 'lancado' },
    { pattern: /ISS.*RETIDO/i, nome: 'ISS Retido', tipo: 'lancado' },
    { pattern: /INSS.*RETIDO/i, nome: 'INSS Retido', tipo: 'lancado' },
    { pattern: /CONTRIBUI.*RETID/i, nome: 'Contribuições Retidas', tipo: 'lancado' },
    { pattern: /PIS/i, nome: 'PIS', tipo: 'calculado' },
    { pattern: /COFINS/i, nome: 'COFINS', tipo: 'calculado' },
    { pattern: /^ICMS/i, nome: 'ICMS', tipo: 'lancado' },
    { pattern: /^IPI/i, nome: 'IPI', tipo: 'lancado' },
    { pattern: /^ISS\b/i, nome: 'ISS', tipo: 'lancado' },
    { pattern: /^IRRF/i, nome: 'IRRF', tipo: 'lancado' },
  ];

  // Função para extrair todos os valores numéricos de uma linha (preservando ordem)
  const extrairValores = (cols) => {
    const valores = [];
    for (let i = 0; i < cols.length; i++) {
      const val = cols[i].trim();
      if (val && /^-?[\d.]+,\d{2}$/.test(val)) {
        valores.push(parseValorBR(val));
      }
    }
    return valores;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(';').map((c) => c.trim());

    // Detectar Seção do Relatório
    if (/RESUMO DOS IMPOSTOS LAN/i.test(line)) {
      secaoAtual = 'lancados';
      continue;
    }
    if (/RESUMO DOS IMPOSTOS CALCUL/i.test(line)) {
      secaoAtual = 'calculados';
      continue;
    }

    // Extrair informações da empresa
    if (/C\.?N\.?P\.?J\.?:/i.test(line) || /CNPJ:/i.test(line)) {
      const cnpjMatch = line.match(/\d{14}|\d{2}\.?\d{3}\.?\d{3}/);
      if (cnpjMatch) {
        empresaInfo.cnpj = cnpjMatch[0];
      }
    }

    // Identificar competência (mês)
    const col0Lower = (cols[0] || '').toLowerCase();
    if (
      col0Lower.startsWith('compet') ||
      (cols[0] === '' && cols[1] === '' && /\d{2}\/\d{4}/.test(line))
    ) {
      const match = line.match(/(\d{2})\/(\d{4})/);
      if (match) {
        competenciaAtual = `${match[1]}/${match[2]}`;
        if (!impostosPorMes[competenciaAtual]) {
          impostosPorMes[competenciaAtual] = {
            impostos: [],
            totalRecolher: 0,
            totalCredor: 0,
          };
        }
      }
      continue;
    }

    // Ignorar linhas de cabeçalho e totais
    if (/^Total/i.test(cols[0]) || /^Imposto$/i.test(cols[0]) || cols[0] === '') {
      // Capturar total da competência
      if (/Total.+compet/i.test(line) && competenciaAtual) {
        const valores = extrairValores(cols);
        if (valores.length >= 1) {
          // Pegar primeiro valor > 0 como total a recolher
          const totalRecolher = valores.find((v) => v > 0) || 0;
          impostosPorMes[competenciaAtual].totalRecolher += totalRecolher;
        }
      }
      // Capturar total geral
      if (/Total.+geral/i.test(line)) {
        const valores = extrairValores(cols);
        if (valores.length >= 1) {
          totalGeralRecolher += valores[0] || 0;
        }
      }
      continue;
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

      // Estrutura do CSV para impostos LANÇADOS:
      // [0] Saldo credor anterior, [1] Saldo diferido anterior, [2] Débitos, [3] Créditos,
      // [4] Acréscimos, [5] Outras deduções, [6] Imposto a recolher, [7] Imposto diferido, [8] Saldo credor final

      // Estrutura do CSV para impostos CALCULADOS (PIS/COFINS):
      // Menos valores, foco em: Imposto a recolher e Saldo credor

      let imposto = {
        nome: impostoMatch.nome,
        nomeOriginal: primeiraCol.split('-')[0].trim(),
        secao: secaoAtual,
        saldoCredorAnterior: 0,
        saldoDiferidoAnterior: 0,
        debitos: 0,
        creditos: 0,
        acrescimos: 0,
        outrasDeducoes: 0,
        impostoRecolher: 0,
        impostoDiferido: 0,
        saldoCredorFinal: 0,
      };

      if (valores.length >= 9) {
        // Linha completa de impostos lançados
        imposto.saldoCredorAnterior = valores[0] || 0;
        imposto.saldoDiferidoAnterior = valores[1] || 0;
        imposto.debitos = valores[2] || 0;
        imposto.creditos = valores[3] || 0;
        imposto.acrescimos = valores[4] || 0;
        imposto.outrasDeducoes = valores[5] || 0;
        imposto.impostoRecolher = valores[6] || 0;
        imposto.impostoDiferido = valores[7] || 0;
        imposto.saldoCredorFinal = valores[8] || 0;
      } else if (valores.length >= 3) {
        // Linha de impostos calculados (PIS/COFINS) ou linha reduzida
        // Geralmente: [imposto a recolher, imposto diferido, saldo credor]
        imposto.impostoRecolher = valores[valores.length - 3] || 0;
        imposto.impostoDiferido = valores[valores.length - 2] || 0;
        imposto.saldoCredorFinal = valores[valores.length - 1] || 0;
      } else if (valores.length >= 1) {
        // Linha com poucos valores
        imposto.saldoCredorFinal = valores[valores.length - 1] || 0;
      }

      impostosPorMes[competenciaAtual].impostos.push(imposto);
    }
  }

  // Calcular totais por imposto
  const totaisPorImposto = {};
  Object.entries(impostosPorMes).forEach(([_mes, dados]) => {
    dados.impostos.forEach((imp) => {
      if (!totaisPorImposto[imp.nome]) {
        totaisPorImposto[imp.nome] = {
          recolher: 0,
          credito: 0,
          debitos: 0,
          creditos: 0,
        };
      }
      totaisPorImposto[imp.nome].recolher += imp.impostoRecolher;
      totaisPorImposto[imp.nome].credito += imp.saldoCredorFinal;
      totaisPorImposto[imp.nome].debitos += imp.debitos;
      totaisPorImposto[imp.nome].creditos += imp.creditos;
    });
  });

  // Calcular total geral a recolher
  let totalRecolher = 0;
  let totalCredor = 0;
  Object.values(impostosPorMes).forEach((dados) => {
    totalRecolher += dados.totalRecolher;
    dados.impostos.forEach((imp) => {
      totalCredor += imp.saldoCredorFinal;
    });
  });

  return {
    empresaInfo,
    impostosPorMes,
    totaisPorImposto,
    competencias: Object.keys(impostosPorMes).sort(),
    totalRecolher: totalRecolher || totalGeralRecolher,
    totalCredor,
    periodosImportados: Object.keys(impostosPorMes).length,
    tipo: 'resumoImpostos',
  };
};

/**
 * Parser para Resumo por Acumulador
 * Extrai entradas e saídas por código de acumulador
 */
export const parseResumoPorAcumulador = (csvContent) => {
  const lines = csvContent.split('\n');
  const delimiter = detectarDelimitadorResumoAcumulador(
    lines.find((line) => line && line.trim()) || ''
  );
  let empresaInfo = {};
  let periodo = '';
  let periodoInicio = '';
  let periodoFim = '';
  const entradas = [];
  const saidas = [];
  let secaoAtual = null; // 'ENTRADAS' ou 'SAIDAS'

  // Função para verificar se é Seção SAIDAS (com ou sem acento, qualquer encoding)
  const isSaidas = (texto) => {
    if (!texto) return false;
    const t = texto.toUpperCase().trim();
    // Verificar múltiplas formas: SAÍDAS, SAIDAS, SA[qualquer char]DAS
    return (
      t === 'SAIDAS' || t === 'SAÍDAS' || (t.startsWith('SA') && t.endsWith('DAS') && t.length <= 7)
    );
  };

  // Função para verificar se é Seção ENTRADAS
  const isEntradas = (texto) => {
    if (!texto) return false;
    const t = texto.toUpperCase().trim();
    return t === 'ENTRADAS';
  };

  const dataParaCompetencia = (data = '') => {
    const match = String(data).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return '';
    const [, , mes, ano] = match;
    return `${mes}/${ano}`;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = parseCsvLine(line, delimiter);

    // Extrair informações da empresa
    if (line.includes('CNPJ:')) {
      empresaInfo.cnpj = cols.find((c) => c.match(/\d{8,}/)) || '';
    }
    if (line.toUpperCase().includes('PER') && line.includes(':')) {
      const datas = line.match(/\d{2}\/\d{2}\/\d{4}/g) || [];
      periodoInicio = datas[0] || '';
      periodoFim = datas[1] || datas[0] || '';
      periodo =
        periodoInicio && periodoFim
          ? `${periodoInicio} até ${periodoFim}`
          : periodoInicio || periodoFim || '';
    }

    // Identificar Seção
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
      // Encontrar Descrição (geralmente na coluna 2 ou 3)
      let descricao = '';
      let vlrContabil = 0;
      let baseIcms = 0;
      let vlrIcms = 0;
      let isentas = 0;
      let outras = 0;
      let vlrIpi = 0;
      let bcIcmsSt = 0;
      let vlrIcmsSt = 0;

      // Buscar Descrição (texto com mais de 5 caracteres)
      for (let j = 1; j < Math.min(cols.length, 10); j++) {
        const valorSemAspas = String(cols[j] || '').replace(/^"+|"+$/g, '').trim();
        if (
          valorSemAspas &&
          valorSemAspas.length > 5 &&
          isNaN(parseFloat(valorSemAspas.replace(/\./g, '').replace(',', '.')))
        ) {
          descricao = cols[j];
          break;
        }
      }

      // Buscar valores numéricos - COMEÇAR A PARTIR DA COLUNA 5 para pular Código e Descrição
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
        vlrIcmsSt,
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

  // Categorias espec?ficas para 380
  const normalizarDescricao = (texto = '') =>
    String(texto)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/\s+/g, ' ')
      .trim();

  const isServicoRelacionado = (descricao = '') => {
    const desc = normalizarDescricao(descricao);
    return (
      desc.includes('SERVICO TOMADO') ||
      desc.includes('SERVICO TOMADO ISS RET') ||
      desc.includes('LANC. COMPRA P/ RECEBIMENTO FUTURO') ||
      desc.includes('COMPRA P/ RECEBIMENTO FUTURO') ||
      desc.includes('COMPRA PARA RECEBIMENTO FUTURO') ||
      desc.includes('SERVICO DE TRANSPORTE') ||
      desc.includes('SISTEMA DE SEGURANCA ELETRONICA') ||
      desc.includes('AQ. SERVICO DE MANUT E REVISAO VEICULAR')
    );
  };

  // Compras para comercializacao (unificando variacoes de acentuacao)
  const itensCompraComercializacao = entradas.filter((e) =>
    normalizarDescricao(e.descricao).includes('COMPRA P/ COMERCIALIZA')
  );
  const compraComercializacao = itensCompraComercializacao.reduce(
    (acc, e) => acc + e.vlrContabil,
    0
  );

  // Compras para industrializacao (inclui ST)
  const itensCompraIndustrializacao = entradas.filter((e) =>
    normalizarDescricao(e.descricao).includes('COMPRA P/ INDUSTRIALIZA')
  );
  const compraIndustrializacao = itensCompraIndustrializacao.reduce(
    (acc, e) => acc + e.vlrContabil,
    0
  );

  // Servicos relacionados
  const itensServicos = entradas.filter((e) => isServicoRelacionado(e.descricao));
  const servicos = itensServicos.reduce((acc, e) => acc + e.vlrContabil, 0);

  // Em Sa?das, ignorar cancelamentos para os c?lculos do 380
  const saidasSemCancelamento = saidas.filter(
    (s) => !normalizarDescricao(s.descricao).includes('CANCEL')
  );

  // Vendas (exceto ativo imobilizado)
  const itensVendas = saidasSemCancelamento.filter((s) => {
    const desc = normalizarDescricao(s.descricao);
    return desc.startsWith('VENDA') && !desc.includes('ATIVO') && !desc.includes('IMOBILIZADO');
  });

  // Vendas agrupadas (somente vendas)
  const totalVendasAgrupadas = itensVendas.reduce((acc, s) => acc + s.vlrContabil, 0);

  // Para o c?lculo 380: venda = vendas + servi?os
  const totalVendas380 = totalVendasAgrupadas + servicos;

  // Campo legado para componentes atuais (representa vendas agrupadas)
  const vendaMercadoria = totalVendasAgrupadas;

  // Detalhamento de vendas
  const itensVendaProduto = itensVendas.filter(
    (s) =>
      normalizarDescricao(s.descricao).includes('PRODUTO') ||
      normalizarDescricao(s.descricao).includes('PRODUCAO')
  );
  const vendaProduto = itensVendaProduto.reduce((acc, s) => acc + s.vlrContabil, 0);

  const itensVendaExterior = itensVendas.filter((s) =>
    normalizarDescricao(s.descricao).includes('EXTERIOR')
  );
  const vendaExterior = itensVendaExterior.reduce((acc, s) => acc + s.vlrContabil, 0);

  const competenciaInicio = dataParaCompetencia(periodoInicio);
  const competenciaFim = dataParaCompetencia(periodoFim);
  const competenciaReferencia = competenciaFim || competenciaInicio || '';
  const anoReferencia = competenciaReferencia ? Number(competenciaReferencia.split('/')[1]) : null;
  const mesReferencia = competenciaReferencia ? Number(competenciaReferencia.split('/')[0]) : null;

  return {
    empresaInfo,
    periodo,
    periodoInicio,
    periodoFim,
    competenciaInicio,
    competenciaFim,
    competenciaReferencia,
    anoReferencia,
    mesReferencia,
    entradas,
    saidas,
    totais: {
      entradas: totalEntradas,
      saidas: totalSaidas,
    },
    categorias: {
      compraComercializacao,
      compraIndustrializacao,
      vendaMercadoria,
      vendaProduto,
      vendaExterior,
      servicos,
      totalVendas380,
      // Cálculo 380: Esperado = Compra Comercialização + 25%
      esperado380: compraComercializacao * 1.25,
    },
    // Detalhes para gráfico de barras horizontais
    detalhes380: {
      compras: itensCompraComercializacao,
      vendasMercadoria: itensVendas,
      vendasProduto: itensVendaProduto,
      vendasExterior: itensVendaExterior,
      servicos: itensServicos,
    },
    tipo: 'resumoAcumulador',
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
      throw new Error('Tipo de Relatório fiscal Não reconhecido');
  }
};

// ============================================
// PARSERS PARA SETOR PESSOAL (RH)
// ============================================

/**
 * Parser para Demonstrativo FGTS Folha e e-Social
 * Extrai dados de FGTS por competência
 */
export const parseDemonstrativoFGTS = (csvContent) => {
  const lines = csvContent.split('\n');
  let empresaInfo = {};
  const registros = [];
  let competenciaAtual = '';
  const normalizeText = (text = '') =>
    String(text)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();

  const detectarTipoRecolhimento = (text = '') => {
    const normalized = normalizeText(text);
    if (!normalized) return null;

    if (/CONSIGN/.test(normalized)) return 'Consignado';
    if (/RESCISAO|GRRF|MULTA RESCISORIA/.test(normalized)) return 'Rescisao';
    if (/DECIMO TERCEIRO|13[Oº]?\s*SALARIO|13[Oº]\b/.test(normalized)) return '13o';
    if (/MENSAL|FOLHA/.test(normalized)) return 'Mensal';
    return null;
  };

  const tipoArquivo = detectarTipoRecolhimento(csvContent) || 'Mensal';
  let tipoRecolhimentoAtual = tipoArquivo;

  // Totais por tipo de recolhimento
  const totaisPorTipo = {
    Mensal: { quantidade: 0, base: 0, valorFGTS: 0 },
    '13o': { quantidade: 0, base: 0, valorFGTS: 0 },
    Rescisao: { quantidade: 0, base: 0, valorFGTS: 0 },
    Consignado: { quantidade: 0, base: 0, valorFGTS: 0 },
  };
  // Totais por competência
  const totaisPorCompetencia = {};
  // Totais por ano
  const totaisPorAno = {};

  // Totais extraídos do totalizador
  let totalBaseSistema = 0;
  let totalValorSistema = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(';').map((c) => c.trim());
    const tipoDetectadoNaLinha = detectarTipoRecolhimento(line);
    if (tipoDetectadoNaLinha) {
      tipoRecolhimentoAtual = tipoDetectadoNaLinha;
    }

    // Extrair informações da empresa (formato: Empresa:;;;;;;;NOME DA EMPRESA)
    if (/^Empresa:/i.test(line)) {
      // Procurar texto significativo após "Empresa:"
      for (const col of cols) {
        if (
          col &&
          !col.includes('Empresa') &&
          col.length > 5 &&
          !/^\d+$/.test(col) &&
          !col.includes('Página')
        ) {
          empresaInfo.razaoSocial = col.replace(/^\d+\s*-\s*/, ''); // Remove código numérico do início
          break;
        }
      }
    }

    // Extrair CNPJ
    if (/^CNPJ:/i.test(line)) {
      const cnpjMatch = line.match(/\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/);
      if (cnpjMatch) empresaInfo.cnpj = cnpjMatch[0];
    }

    // Identificar competência (formato: Competência:;;;;;;;12/2025)
    if (/^Compet/i.test(line)) {
      const compMatch = line.match(/(\d{2})\/(\d{4})/);
      if (compMatch) {
        competenciaAtual = `${compMatch[1]}/${compMatch[2]}`;
      }
      continue;
    }

    // Capturar totais do totalizador (Base sistema: e Valor sistema:)
    if (/Base sistema:/i.test(line)) {
      for (const col of cols) {
        if (col && /^[\d.]+,\d{2}$/.test(col)) {
          totalBaseSistema = parseValorBR(col);
          break;
        }
      }
      continue;
    }
    if (/Valor sistema:/i.test(line)) {
      for (const col of cols) {
        if (col && /^[\d.]+,\d{2}$/.test(col)) {
          totalValorSistema = parseValorBR(col);
          break;
        }
      }
      continue;
    }

    // Identificar linhas de dados de funcionários
    // Formato: ;Código;;CódigoEsocial;;nome;;;;;;base;;valor;;;baseEsocial;;valorEsocial;;;;Situação
    // Critério: deve ter um código numérico e um nome de pessoa
    let codigo = null;
    let nome = null;
    let base = 0;
    let valorFGTS = 0;
    let situacao = '';

    // Procurar código (número de 1-4 dígitos)
    for (let j = 0; j < Math.min(5, cols.length); j++) {
      if (cols[j] && /^\d{1,4}$/.test(cols[j])) {
        codigo = parseInt(cols[j]);
        break;
      }
    }

    // Se Não tem Código, Não é linha de dados
    if (codigo === null) continue;

    // Procurar nome (texto longo com espaços, provavelmente nome de pessoa)
    for (let j = 0; j < cols.length; j++) {
      const col = cols[j];
      if (
        col &&
        col.length > 10 &&
        /[A-Za-z]/.test(col) &&
        col.includes(' ') &&
        !/sistema|esocial|total|base|valor|enviado|pendente|p\u00e1gina|emiss\u00e3o/i.test(col)
      ) {
        nome = col;
        break;
      }
    }

    // Se Não tem nome, Não é linha de dados
    if (!nome) continue;

    // Procurar valores monetários (formato 0,00 ou 1.234,56)
    const valoresMonetarios = [];
    for (let j = 0; j < cols.length; j++) {
      const col = cols[j];
      if (col && /^[\d.]+,\d{2}$/.test(col)) {
        valoresMonetarios.push(parseValorBR(col));
      }
    }

    // Os valores vêm em pares: Base sistema, Valor sistema, Base eSocial, Valor eSocial
    // Geralmente os 2 primeiros são do sistema
    if (valoresMonetarios.length >= 2) {
      base = valoresMonetarios[0];
      valorFGTS = valoresMonetarios[1];
    } else if (valoresMonetarios.length === 1) {
      valorFGTS = valoresMonetarios[0];
    }

    // Procurar Situação (Enviado, Pendente, etc)
    for (let j = cols.length - 1; j >= 0; j--) {
      const col = cols[j].toLowerCase();
      if (col === 'enviado' || col === 'pendente' || col === 'erro') {
        situacao = cols[j];
        break;
      }
    }

    // Extrair ano e mês da competência
    let ano = new Date().getFullYear();
    let _mes = new Date().getMonth() + 1;
    if (competenciaAtual) {
      const parts = competenciaAtual.split('/');
      if (parts.length === 2) {
        _mes = parseInt(parts[0]);
        ano = parseInt(parts[1]);
      }
    }

    // Determinar tipo de recolhimento
    const tipo = tipoRecolhimentoAtual || tipoArquivo || 'Mensal';

    const registro = {
      codigo,
      nome,
      competencia: competenciaAtual,
      mes: _mes,
      ano,
      base,
      valorFGTS,
      situacao,
      tipo,
    };

    registros.push(registro);

    // Acumular totais por tipo
    if (!totaisPorTipo[tipo]) totaisPorTipo[tipo] = { quantidade: 0, base: 0, valorFGTS: 0 };
    totaisPorTipo[tipo].quantidade++;
    totaisPorTipo[tipo].base += base;
    totaisPorTipo[tipo].valorFGTS += valorFGTS;

    // Acumular totais por competência
    if (competenciaAtual) {
      if (!totaisPorCompetencia[competenciaAtual]) {
        totaisPorCompetencia[competenciaAtual] = { colaboradores: 0, base: 0, valorFGTS: 0 };
      }
      totaisPorCompetencia[competenciaAtual].colaboradores++;
      totaisPorCompetencia[competenciaAtual].base += base;
      totaisPorCompetencia[competenciaAtual].valorFGTS += valorFGTS;
    }

    // Acumular totais por ano
    if (!totaisPorAno[ano]) {
      totaisPorAno[ano] = { base: 0, valorFGTS: 0, meses: 0 };
    }
    totaisPorAno[ano].base += base;
    totaisPorAno[ano].valorFGTS += valorFGTS;
  }

  // Se Não encontrou registros mas tem totalizador, usar os valores do totalizador
  if (registros.length === 0 && (totalBaseSistema > 0 || totalValorSistema > 0)) {
    let ano = new Date().getFullYear();
    let _mes = new Date().getMonth() + 1;
    if (competenciaAtual) {
      const parts = competenciaAtual.split('/');
      if (parts.length === 2) {
        _mes = parseInt(parts[0]);
        ano = parseInt(parts[1]);
      }
    }

    const tipo = tipoRecolhimentoAtual || tipoArquivo || 'Mensal';
    totaisPorTipo[tipo] = { quantidade: 1, base: totalBaseSistema, valorFGTS: totalValorSistema };
    if (competenciaAtual) {
      totaisPorCompetencia[competenciaAtual] = {
        colaboradores: 1,
        base: totalBaseSistema,
        valorFGTS: totalValorSistema,
      };
    }
    totaisPorAno[ano] = { base: totalBaseSistema, valorFGTS: totalValorSistema, meses: 1 };
  }

  // Ordenar competências
  const competencias = Object.keys(totaisPorCompetencia).sort((a, b) => {
    const [mesA, anoA] = a.split('/').map(Number);
    const [mesB, anoB] = b.split('/').map(Number);
    return anoA !== anoB ? anoA - anoB : mesA - mesB;
  });

  // Últimos 3 meses para gráfico
  const ultimos3Meses = competencias.slice(-3);

  // Total geral (usar totalizador se disponível, seNão somar registros)
  const totalGeral = {
    base: totalBaseSistema > 0 ? totalBaseSistema : registros.reduce((acc, r) => acc + r.base, 0),
    valorFGTS:
      totalValorSistema > 0
        ? totalValorSistema
        : registros.reduce((acc, r) => acc + r.valorFGTS, 0),
  };

  return {
    empresaInfo,
    registros,
    totaisPorTipo,
    totaisPorCompetencia,
    totaisPorAno,
    competencias,
    ultimos3Meses,
    totalGeral,
    anos: Object.keys(totaisPorAno).map(Number).sort(),
    tipo: 'fgts',
  };
};

/**
 * Parser para Folha de INSS
 * Extrai dados de INSS por competência e empresa
 */
export const parseFolhaINSS = (csvContent) => {
  const lines = csvContent.split('\n');
  let empresaInfo = {};
  const registros = [];
  let competenciaAtual = '';
  let categoriaAtual = 'Empregados'; // Empregados ou Contribuintes

  // Totais por empresa
  const totaisPorEmpresa = {};
  // Totais por competência
  const totaisPorCompetencia = {};
  // Contagem por tipo (Original/Retificador)
  const totaisPorTipo = { original: 0, retificador: 0 };

  // Totais extraídos do resumo geral
  let totalBaseCalculo = 0;
  let totalValorINSS = 0;
  let totalEmpregados = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(';').map((c) => c.trim());

    // Extrair informações da empresa (formato: Empresa:;;;;;;NOME)
    if (/^Empresa:/i.test(line)) {
      for (const col of cols) {
        if (
          col &&
          !col.includes('Empresa') &&
          col.length > 5 &&
          !/^\d+$/.test(col) &&
          !col.includes('Página')
        ) {
          empresaInfo.razaoSocial = col.replace(/^\d+\s*-\s*/, '');
          break;
        }
      }
    }

    // Extrair CNPJ
    if (/^CNPJ:/i.test(line)) {
      const cnpjMatch = line.match(/\d{14}|\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/);
      if (cnpjMatch) empresaInfo.cnpj = cnpjMatch[0];
    }

    // Identificar competência (formato: Competência:;;;;;;01/12/2025 ou similar)
    if (/^Compet/i.test(line)) {
      // Tentar formato DD/MM/AAAA primeiro
      let compMatch = line.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (compMatch) {
        // Formato DD/MM/AAAA - usar mês e ano
        competenciaAtual = `${compMatch[2]}/${compMatch[3]}`;
      } else {
        // Tentar formato MM/AAAA
        compMatch = line.match(/(\d{2})\/(\d{4})/);
        if (compMatch) {
          competenciaAtual = `${compMatch[1]}/${compMatch[2]}`;
        }
      }
      continue;
    }

    // Identificar categoria (EMPREGADOS ou CONTRIBUINTES)
    if (/^EMPREGADOS/i.test(line)) {
      categoriaAtual = 'Empregados';
      continue;
    }
    if (/^CONTRIBUINTES/i.test(line)) {
      categoriaAtual = 'Contribuintes';
      continue;
    }

    // Capturar totais do resumo geral
    if (/^Total/i.test(cols[0]) && cols.length > 5) {
      const valoresMonetarios = [];
      for (const col of cols) {
        if (col && /^[\d.]+,\d{2}$/.test(col)) {
          valoresMonetarios.push(parseValorBR(col));
        }
      }
      // No resumo geral, primeiro valor é base, depois segurados (INSS empregado), etc
      if (valoresMonetarios.length >= 2) {
        totalBaseCalculo = valoresMonetarios[0];
        // Procurar o valor total de INSS (geralmente é o último ou um dos últimos)
        if (valoresMonetarios.length >= 3) {
          totalValorINSS = valoresMonetarios[2]; // Segurados geralmente é o 3º valor
        }
      }
      continue;
    }

    // Capturar linha de total de empregados/contribuintes
    if (/Empregados:/i.test(line) || /Contribuintes:/i.test(line)) {
      // Extrair contagem
      for (const col of cols) {
        if (col && /^\d+$/.test(col)) {
          totalEmpregados += parseInt(col);
          break;
        }
      }
      continue;
    }

    // Identificar linhas de dados de funcionários
    // Formato: código;;;nome;;;;...;;;;base;;;;...;;;;taxa;;;;valor;;
    let codigo = null;
    let nome = null;
    let baseCalculo = 0;
    let taxa = 0;
    let valorINSS = 0;

    // Procurar código numérico no início
    for (let j = 0; j < Math.min(5, cols.length); j++) {
      if (cols[j] && /^\d{1,4}$/.test(cols[j])) {
        codigo = parseInt(cols[j]);
        break;
      }
    }

    // Se Não tem Código, Não é linha de dados de funcionário
    if (codigo === null) continue;

    // Procurar nome (texto longo com espaços)
    for (let j = 0; j < cols.length; j++) {
      const col = cols[j];
      if (
        col &&
        col.length > 10 &&
        /[A-Za-z]/.test(col) &&
        col.includes(' ') &&
        !/sistema|total|base|valor|p\u00e1gina|emiss\u00e3o|folha|inss|empregados|contribuintes/i.test(
          col
        )
      ) {
        nome = col;
        break;
      }
    }

    // Se Não tem nome, Não é linha de dados
    if (!nome) continue;

    // Procurar valores monetários
    const valoresMonetarios = [];
    for (let j = 0; j < cols.length; j++) {
      const col = cols[j];
      if (col && /^[\d.]+,\d{2}$/.test(col)) {
        valoresMonetarios.push(parseValorBR(col));
      }
    }

    // Estrutura: Base cálculo, Excedente, Ded.sal.mat.13, Deduções, Taxa, Valor
    // O primeiro valor Não-zero é base, o Último é valor INSS, penÚltimo é taxa
    if (valoresMonetarios.length >= 2) {
      baseCalculo = valoresMonetarios[0]; // Primeiro valor é base de cálculo
      valorINSS = valoresMonetarios[valoresMonetarios.length - 1]; // Último é valor INSS
      if (valoresMonetarios.length >= 3) {
        taxa = valoresMonetarios[valoresMonetarios.length - 2]; // Penúltimo é taxa
      }
    } else if (valoresMonetarios.length === 1) {
      valorINSS = valoresMonetarios[0];
    }

    // Extrair ano e mês da competência
    let ano = new Date().getFullYear();
    let mes = new Date().getMonth() + 1;
    if (competenciaAtual) {
      const parts = competenciaAtual.split('/');
      if (parts.length === 2) {
        mes = parseInt(parts[0]);
        ano = parseInt(parts[1]);
      }
    }

    const tipoGuia = 'Original'; // Padrao
    totaisPorTipo.original++;

    const registro = {
      codigo,
      nome,
      competencia: competenciaAtual,
      mes,
      ano,
      categoria: categoriaAtual,
      baseCalculo,
      taxa,
      valorINSS,
      tipoGuia,
    };

    registros.push(registro);

    // Acumular por categoria/empresa
    const nomeCategoria = categoriaAtual;
    if (!totaisPorEmpresa[nomeCategoria]) {
      totaisPorEmpresa[nomeCategoria] = { empregados: 0, baseCalculo: 0, valorINSS: 0 };
    }
    totaisPorEmpresa[nomeCategoria].empregados++;
    totaisPorEmpresa[nomeCategoria].baseCalculo += baseCalculo;
    totaisPorEmpresa[nomeCategoria].valorINSS += valorINSS;

    // Acumular por competência
    if (competenciaAtual) {
      if (!totaisPorCompetencia[competenciaAtual]) {
        totaisPorCompetencia[competenciaAtual] = { empregados: 0, baseCalculo: 0, valorINSS: 0 };
      }
      totaisPorCompetencia[competenciaAtual].empregados++;
      totaisPorCompetencia[competenciaAtual].baseCalculo += baseCalculo;
      totaisPorCompetencia[competenciaAtual].valorINSS += valorINSS;
    }
  }

  // Se Não encontrou registros mas tem competência, criar entrada com totais
  if (Object.keys(totaisPorCompetencia).length === 0 && competenciaAtual) {
    totaisPorCompetencia[competenciaAtual] = {
      empregados: totalEmpregados || registros.length,
      baseCalculo: totalBaseCalculo || registros.reduce((acc, r) => acc + r.baseCalculo, 0),
      valorINSS: totalValorINSS || registros.reduce((acc, r) => acc + r.valorINSS, 0),
    };
  }

  // Ordenar competências
  const competencias = Object.keys(totaisPorCompetencia).sort((a, b) => {
    const [mesA, anoA] = a.split('/').map(Number);
    const [mesB, anoB] = b.split('/').map(Number);
    return anoA !== anoB ? anoA - anoB : mesA - mesB;
  });

  // Total geral (usar totais do resumo se disponíveis)
  const totalGeral = {
    baseCalculo:
      totalBaseCalculo > 0
        ? totalBaseCalculo
        : registros.reduce((acc, r) => acc + r.baseCalculo, 0),
    valorINSS:
      totalValorINSS > 0 ? totalValorINSS : registros.reduce((acc, r) => acc + r.valorINSS, 0),
  };

  return {
    empresaInfo,
    registros,
    totaisPorEmpresa,
    totaisPorCompetencia,
    totaisPorTipo,
    competencias,
    totalGeral,
    tipo: 'inss',
  };
};

/**
 * Parser para Relação de Empregados - Formato Domínio
 *
 * Formato CSV:
 * - Seções: "Trabalhando", "Demitido", etc. indicam Situação
 * - Linha empregado: Código;;;;NOME;;;;;;;;;;CodCargo;;CARGO;;;;;Vin;;Cat;;Fpg;;H.mes;;;Admissão;;ST;;DataST
 * - ST (Situação): 1=Trabalhando, 8=Demitido, 2-7/9-24=Afastados
 * - Linhas com "Total" devem ser ignoradas
 */
export const parseRelacaoEmpregados = (csvContent) => {
  const lines = csvContent.split('\n');
  let empresaInfo = {};
  const empregados = [];

  // Estatísticas
  let totalAtivos = 0;
  let totalDemitidos = 0;
  let totalAfastados = 0;
  const admissoesPorMes = {};
  const demissoesPorMes = {};
  const empregadosPorCargo = {};
  const empregadosPorSituacao = {};

  // Situação atual baseada na Seção do CSV
  let secaoAtual = 'Trabalhando';

  // Mapeamento de Códigos ST para Situação
  // 1=Trabalhando, 8=Demitido, outros=Afastado
  const mapearSituacaoST = (st) => {
    const codigo = parseInt(st);
    if (codigo === 1) return 'Ativo';
    if (codigo === 8) return 'Demitido';
    // 2-7, 9-24 são tipos de afastamento
    return 'Afastado';
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(';').map((c) => c.trim());
    const lineUpper = line.toUpperCase();

    // Ignorar linhas de total
    if (
      lineUpper.includes('TOTAL') ||
      lineUpper.includes('PÁGINA') ||
      lineUpper.includes('EMISS\u00c3O') ||
      lineUpper.includes('RELA\u00c7\u00c3O DE EMPREGADOS')
    ) {
      continue;
    }

    // Extrair informações da empresa (primeira coluna Não vazia com texto longo)
    if (
      cols[0] &&
      cols[0].length > 10 &&
      !cols[0].includes('Código') &&
      /[A-Z]/.test(cols[0]) &&
      !empresaInfo.razaoSocial
    ) {
      empresaInfo.razaoSocial = cols[0];
    }

    // Detectar Seção atual
    if (cols[0] === 'Trabalhando' || lineUpper.startsWith('TRABALHANDO')) {
      secaoAtual = 'Trabalhando';
      continue;
    }
    if (cols[0] === 'Demitido' || lineUpper.startsWith('DEMITIDO')) {
      secaoAtual = 'Demitido';
      continue;
    }
    if (cols[0] === 'Afastado' || lineUpper.includes('AFASTADO')) {
      secaoAtual = 'Afastado';
      continue;
    }

    // Ignorar cabeçalhos de coluna
    if (lineUpper.includes('CÓDIGO') && lineUpper.includes('NOME') && lineUpper.includes('CARGO')) {
      continue;
    }

    // Verificar se é linha de empregado
    // Formato: Código;;;;NOME;;;;;;;;;;CodCargo;;CARGO;;;;;Vin;;Cat;;Fpg;;H.mes;;;Admissão;;ST;;DataST
    let codigo = null;
    let codigoIndex = -1;

    // Procurar código nas primeiras colunas
    for (let j = 0; j < Math.min(5, cols.length); j++) {
      if (cols[j] && /^\d{1,4}$/.test(cols[j])) {
        codigo = parseInt(cols[j]);
        codigoIndex = j;
        break;
      }
    }

    if (codigo === null || cols.length < 10) continue;

    // Procurar nome (texto longo com espaços, após o código)
    let nome = '';
    let nomeIndex = -1;
    for (let j = codigoIndex + 1; j < Math.min(codigoIndex + 15, cols.length); j++) {
      const val = cols[j];
      if (
        val &&
        val.length > 5 &&
        /[A-Za-z]/.test(val) &&
        val.includes(' ') &&
        !/^\d{2}\/\d{2}\/\d{4}$/.test(val) &&
        !/^[\d.,]+$/.test(val)
      ) {
        nome = val;
        nomeIndex = j;
        break;
      }
    }

    if (!nome) continue; // Se nao encontrou nome, nao e linha de empregado

    // Procurar cargo (texto após o código do cargo, que vem depois do nome)
    let cargo = '';
    for (let j = nomeIndex + 1; j < cols.length; j++) {
      const val = cols[j];
      // Cargo é texto que Não é data nem Número, com pelo menos 3 caracteres
      if (
        val &&
        val.length >= 3 &&
        /[A-Za-z]/.test(val) &&
        !/^\d{2}\/\d{2}\/\d{4}$/.test(val) &&
        !/^[\d.,]+$/.test(val) &&
        !/^[A-Z]$/.test(val) &&
        val !== 'D' &&
        val !== 'M'
      ) {
        // Excluir letras soltas como Fpg=D
        cargo = val;
        break;
      }
    }

    // Procurar datas (formato DD/MM/AAAA)
    const datas = [];
    for (let j = 1; j < cols.length; j++) {
      const val = cols[j];
      if (val && /^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
        datas.push({ index: j, valor: val });
      }
    }

    let dataAdmissao = datas.length >= 1 ? datas[0].valor : null;
    let dataSituacao = datas.length >= 2 ? datas[1].valor : null;

    // Procurar ST (Situação) - Número de 1-2 dígitos que vem após a data de admissão
    let stValue = null;
    if (datas.length >= 1) {
      // ST vem logo após a primeira data
      for (let j = datas[0].index + 1; j < Math.min(datas[0].index + 5, cols.length); j++) {
        if (cols[j] && /^[1-9]$|^1[0-9]$|^2[0-4]$/.test(cols[j])) {
          stValue = cols[j];
          break;
        }
      }
    }

    // Determinar Situação: usar ST se disponível, seNão usar Seção atual
    let situacaoNormalizada;
    if (stValue) {
      situacaoNormalizada = mapearSituacaoST(stValue);
    } else {
      // Usar Seção atual do CSV
      if (secaoAtual === 'Demitido') {
        situacaoNormalizada = 'Demitido';
      } else if (secaoAtual === 'Afastado') {
        situacaoNormalizada = 'Afastado';
      } else {
        situacaoNormalizada = 'Ativo';
      }
    }

    // Procurar salário/horas (valor monetário como 220,00)
    let salario = 0;
    for (let j = 1; j < cols.length; j++) {
      const val = cols[j];
      if (val && /^[\d.]+,\d{2}$/.test(val)) {
        const valor = parseValorBR(val);
        // Ignorar valores muito baixos que são horas (220,00 = horas)
        if (valor > 500) {
          salario = valor;
          break;
        }
      }
    }

    // Contabilizar por Situação
    if (situacaoNormalizada === 'Demitido') {
      totalDemitidos++;
    } else if (situacaoNormalizada === 'Afastado') {
      totalAfastados++;
    } else {
      totalAtivos++;
    }

    const empregado = {
      codigo,
      nome,
      cargo: cargo || 'Não informado',
      dataAdmissao,
      situacao: situacaoNormalizada,
      dataSituacao,
      salario,
    };

    empregados.push(empregado);

    // Contabilizar por cargo
    if (!empregadosPorCargo[empregado.cargo]) {
      empregadosPorCargo[empregado.cargo] = { total: 0, ativos: 0, salarioTotal: 0 };
    }
    empregadosPorCargo[empregado.cargo].total++;
    if (situacaoNormalizada === 'Ativo') {
      empregadosPorCargo[empregado.cargo].ativos++;
      empregadosPorCargo[empregado.cargo].salarioTotal += salario;
    }

    // Contabilizar por Situação
    if (!empregadosPorSituacao[situacaoNormalizada]) {
      empregadosPorSituacao[situacaoNormalizada] = 0;
    }
    empregadosPorSituacao[situacaoNormalizada]++;

    // Contabilizar admissões por mês
    if (dataAdmissao) {
      const [, mes, ano] = dataAdmissao.split('/');
      const competencia = `${mes}/${ano}`;
      if (!admissoesPorMes[competencia]) admissoesPorMes[competencia] = 0;
      admissoesPorMes[competencia]++;
    }

    // Contabilizar demissões por mês (usar dataSituacao para demitidos)
    if (situacaoNormalizada === 'Demitido' && dataSituacao) {
      const [, mes, ano] = dataSituacao.split('/');
      const competencia = `${mes}/${ano}`;
      if (!demissoesPorMes[competencia]) demissoesPorMes[competencia] = 0;
      demissoesPorMes[competencia]++;
    }
  }

  // Ordenar competências de admissão e demissão
  const ordenarCompetencias = (obj) => {
    return Object.keys(obj).sort((a, b) => {
      const [mesA, anoA] = a.split('/').map(Number);
      const [mesB, anoB] = b.split('/').map(Number);
      return anoA !== anoB ? anoA - anoB : mesA - mesB;
    });
  };

  return {
    empresaInfo,
    empregados,
    estatisticas: {
      total: empregados.length,
      ativos: totalAtivos,
      demitidos: totalDemitidos,
      afastados: totalAfastados,
    },
    empregadosPorCargo,
    empregadosPorSituacao,
    admissoesPorMes,
    demissoesPorMes,
    competenciasAdmissao: ordenarCompetencias(admissoesPorMes),
    competenciasDemissao: ordenarCompetencias(demissoesPorMes),
    tipo: 'empregados',
  };
};

/**
 * Parser para Salário Base
 * Extrai dados de salário por cargo
 */
export const parseSalarioBase = (csvContent) => {
  const lines = csvContent.split('\n');
  let empresaInfo = {};
  const empregados = [];
  const salariosPorCargo = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(';').map((c) => c.trim());

    // Extrair informações da empresa
    if (line.includes('Empresa:') || line.includes('EMPRESA:')) {
      empresaInfo.razaoSocial =
        cols.find((c) => c && !c.includes('Empresa') && !c.includes('EMPRESA') && c.length > 3) ||
        '';
    }
    if (/C\.?N\.?P\.?J\.?:/i.test(line) || /CNPJ:/i.test(line)) {
      const cnpjMatch = line.match(/\d{14}|\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/);
      if (cnpjMatch) empresaInfo.cnpj = cnpjMatch[0];
    }

    // Verificar se é linha de empregado (buscar código nas primeiras colunas)
    let codigo = null;
    let codigoIndex = -1;
    for (let j = 0; j < Math.min(10, cols.length); j++) {
      if (cols[j] && /^\d{1,6}$/.test(cols[j])) {
        codigo = parseInt(cols[j]);
        codigoIndex = j;
        break;
      }
    }

    if (codigo !== null && cols.length >= 3) {
      let nome = '';
      let cargo = '';
      let salario = 0;

      // Procurar nome (após o código)
      for (let j = codigoIndex + 1; j < cols.length; j++) {
        const val = cols[j];
        if (val && val.length > 5 && !/^[\d.,]+$/.test(val) && !/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
          nome = val;
          break;
        }
      }

      // Procurar cargo (segundo texto, após o nome)
      let foundNome = false;
      for (let j = codigoIndex + 1; j < cols.length; j++) {
        const val = cols[j];
        if (val && val.length > 2 && !/^[\d.,]+$/.test(val)) {
          if (!foundNome) {
            foundNome = true;
          } else {
            cargo = val;
            break;
          }
        }
      }

      // Procurar salário (último valor monetário)
      for (let j = cols.length - 1; j >= 0; j--) {
        const val = cols[j];
        if (val && /^[\d.]+,\d{2}$/.test(val)) {
          salario = parseValorBR(val);
          break;
        }
      }

      if (nome || salario > 0) {
        empregados.push({
          codigo,
          nome: nome || `Empregado ${codigo}`,
          cargo: cargo || 'Não informado',
          salario,
        });

        // Agrupar por cargo
        const cargoNome = cargo || 'Não informado';
        if (!salariosPorCargo[cargoNome]) {
          salariosPorCargo[cargoNome] = {
            quantidade: 0,
            salarioTotal: 0,
            salarioMedio: 0,
            salarioMin: Infinity,
            salarioMax: 0,
          };
        }
        salariosPorCargo[cargoNome].quantidade++;
        salariosPorCargo[cargoNome].salarioTotal += salario;
        salariosPorCargo[cargoNome].salarioMin = Math.min(
          salariosPorCargo[cargoNome].salarioMin,
          salario
        );
        salariosPorCargo[cargoNome].salarioMax = Math.max(
          salariosPorCargo[cargoNome].salarioMax,
          salario
        );
      }
    }
  }

  // Calcular médias
  Object.keys(salariosPorCargo).forEach((cargo) => {
    const dados = salariosPorCargo[cargo];
    dados.salarioMedio = dados.quantidade > 0 ? dados.salarioTotal / dados.quantidade : 0;
    if (dados.salarioMin === Infinity) dados.salarioMin = 0;
  });

  // Ordenar cargos por salário médio (decrescente)
  const cargosOrdenados = Object.entries(salariosPorCargo)
    .sort((a, b) => b[1].salarioMedio - a[1].salarioMedio)
    .map(([cargo, dados]) => ({ cargo, ...dados }));

  // Totais
  const totalSalarios = empregados.reduce((acc, e) => acc + e.salario, 0);
  const salarioMedioGeral = empregados.length > 0 ? totalSalarios / empregados.length : 0;

  return {
    empresaInfo,
    empregados,
    salariosPorCargo,
    cargosOrdenados,
    estatisticas: {
      totalEmpregados: empregados.length,
      totalSalarios,
      salarioMedioGeral,
      quantidadeCargos: Object.keys(salariosPorCargo).length,
    },
    tipo: 'salarioBase',
  };
};

/**
 * Parser para Programação de Férias
 * Extrai dados de férias programadas do Sistema Domínio
 *
 * Estrutura do CSV (índices das colunas):
 * - [0] = Código
 * - [2] = Nome do Empregado
 * - [9] = Data Admissão
 * - [10] = Vencto. Férias
 * - [16] = Início Período Aquisitivo
 * - [17] = Fim Período Aquisitivo
 * - [23] = Início Gozo Férias (pode estar vazio: ..../..../......)
 * - [28] = Dias Direito
 * - [30] = Dias Gozados
 * - [32] = Dias Restantes
 * - [33] = Limite p/ Gozo
 */
export const parseProgramacaoFerias = (csvContent) => {
  const lines = csvContent.split('\n');
  let empresaInfo = {};
  const ferias = [];
  const feriasPorMes = {};
  const feriasPorStatus = { programadas: 0, gozadas: 0, pendentes: 0, vencidas: 0 };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(';').map((c) => c.trim());

    // Extrair informações da empresa (primeira linha geralmente tem razão social)
    if (i === 0 && cols[0] && cols[0].length > 10 && !cols[0].includes('Código')) {
      empresaInfo.razaoSocial = cols[0];
    }
    if (/C\.?N\.?P\.?J\.?:/i.test(line) || /CNPJ:/i.test(line)) {
      const cnpjMatch = line.match(/\d{14}|\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}|\d[,\.]\d+E\+\d+/);
      if (cnpjMatch) {
        // Converter notação científica se necessário (3,05338E+13)
        let cnpj = cnpjMatch[0];
        if (cnpj.includes('E+')) {
          cnpj = parseFloat(cnpj.replace(',', '.')).toFixed(0).padStart(14, '0');
        }
        empresaInfo.cnpj = cnpj;
      }
    }

    // Verificar se é linha de dados de férias (código na primeira coluna)
    const codigo = cols[0] && /^\d{1,6}$/.test(cols[0]) ? parseInt(cols[0]) : null;

    if (codigo !== null && cols.length >= 30) {
      // Extrair nome do empregado (coluna 2)
      const nome = cols[2] || `Empregado ${codigo}`;

      // Coletar TODAS as datas válidas na linha e suas posições
      const datasEncontradas = [];
      for (let j = 0; j < cols.length; j++) {
        const val = cols[j];
        if (val && /^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
          datasEncontradas.push({ idx: j, data: val });
        }
      }

      // Mapear as datas por posição conhecida
      // Ordem típica: admissão(~9), vencto(~10), inicioAq(~16), fimAq(~17), limiteGozo(última)
      const dataAdmissao = datasEncontradas.find((d) => d.idx >= 8 && d.idx <= 11)?.data || null;
      const inicioAquisitivo =
        datasEncontradas.find((d) => d.idx >= 14 && d.idx <= 18)?.data || null;
      const fimAquisitivo =
        datasEncontradas.find(
          (d) =>
            d.idx >= 15 &&
            d.idx <= 19 &&
            d.idx !== datasEncontradas.find((x) => x.data === inicioAquisitivo)?.idx
        )?.data || null;

      // Limite p/ Gozo é geralmente a última data válida (posição ~33)
      const limiteGozo =
        datasEncontradas.length > 0 ? datasEncontradas[datasEncontradas.length - 1].data : null;

      // início Gozo Férias - procurar na posição ~23, verificar se Não é ..../..../......
      let inicioGozo = null;
      const possivelInicioGozo = cols[23];
      if (possivelInicioGozo && /^\d{2}\/\d{2}\/\d{4}$/.test(possivelInicioGozo)) {
        inicioGozo = possivelInicioGozo;
      }

      // Extrair dias - padrão do CSV: ...;DIAS_PROP;;DIAS_GOZ;;DIAS_REST;DATA_LIMITE;...
      // Onde: DIAS_PROP = dias proporcionais (decimal), DIAS_GOZ = gozados, DIAS_REST = restantes
      // DIAS_DIREITO = DIAS_REST + DIAS_GOZ (o direito total de férias)
      let diasDireito = 0;
      let diasGozados = 0;
      let diasRestantes = 0;

      // Encontrar índice do Limite p/ Gozo (última data válida)
      let indiceLimiteGozo = -1;
      for (let j = cols.length - 1; j >= 20; j--) {
        if (cols[j] && /^\d{2}\/\d{2}\/\d{4}$/.test(cols[j])) {
          indiceLimiteGozo = j;
          break;
        }
      }

      if (indiceLimiteGozo > 0) {
        // Procurar os números inteiros ANTES do Limite p/ Gozo
        // O padrão é: ...;DIAS_REST;DATA;... onde DIAS_REST é inteiro (30, 24, etc)
        // DIAS_GOZ geralmente é 0 e fica antes do DIAS_REST
        const numerosInteiros = [];
        for (let j = indiceLimiteGozo - 1; j >= Math.max(0, indiceLimiteGozo - 10); j--) {
          const val = cols[j];
          // Só pegar números INTEIROS (ignorar decimais como 2,5 que são dias proporcionais)
          if (val && /^\d+$/.test(val)) {
            numerosInteiros.unshift({ idx: j, val: parseInt(val) });
          }
          if (numerosInteiros.length >= 2) break;
        }

        // O ÚLTIMO inteiro antes da data é diasRestantes
        // O inteiro antes dele é diasGozados
        if (numerosInteiros.length >= 1) {
          diasRestantes = numerosInteiros[numerosInteiros.length - 1].val;
        }
        if (numerosInteiros.length >= 2) {
          diasGozados = numerosInteiros[numerosInteiros.length - 2].val;
        }
      }

      // Dias Direito = Dias Restantes + Dias Gozados (fórmula correta)
      diasDireito = diasRestantes + diasGozados;

      // Determinar status baseado nos dados
      let status = 'Pendente';
      const hoje = new Date();

      if (diasGozados >= diasDireito && diasDireito > 0) {
        status = 'Gozadas';
        feriasPorStatus.gozadas++;
      } else if (inicioGozo) {
        status = 'Programada';
        feriasPorStatus.programadas++;
      } else if (limiteGozo) {
        // Verificar se o limite já passou
        const [diaLim, mesLim, anoLim] = limiteGozo.split('/').map(Number);
        const dataLimite = new Date(anoLim, mesLim - 1, diaLim);
        if (dataLimite < hoje) {
          status = 'Vencida';
          feriasPorStatus.vencidas++;
        } else {
          status = 'Pendente';
          feriasPorStatus.pendentes++;
        }
      } else {
        feriasPorStatus.pendentes++;
      }

      const registro = {
        codigo,
        nome,
        dataAdmissao,
        inicioAquisitivo,
        fimAquisitivo,
        inicioGozo,
        limiteGozo,
        diasDireito,
        diasGozados,
        diasRestantes,
        status,
        // Para compatibilidade com gráficos existentes
        dataInicio: inicioGozo || inicioAquisitivo,
        dataFim: limiteGozo,
      };

      ferias.push(registro);

      // Agrupar por mês do limite de gozo (mais relevante para planejamento)
      const dataAgrupamento = limiteGozo || inicioAquisitivo;
      if (dataAgrupamento) {
        const [, mes, ano] = dataAgrupamento.split('/');
        const competencia = `${mes}/${ano}`;
        if (!feriasPorMes[competencia]) {
          feriasPorMes[competencia] = { quantidade: 0, diasTotal: 0, empregados: [] };
        }
        feriasPorMes[competencia].quantidade++;
        feriasPorMes[competencia].diasTotal += diasDireito;
        feriasPorMes[competencia].empregados.push(nome);
      }
    }
  }

  // Ordenar por limite de gozo (quem precisa tirar férias primeiro)
  ferias.sort((a, b) => {
    const dataA = a.limiteGozo || a.inicioAquisitivo;
    const dataB = b.limiteGozo || b.inicioAquisitivo;
    if (!dataA) return 1;
    if (!dataB) return -1;
    const [diaA, mesA, anoA] = dataA.split('/').map(Number);
    const [diaB, mesB, anoB] = dataB.split('/').map(Number);
    if (anoA !== anoB) return anoA - anoB;
    if (mesA !== mesB) return mesA - mesB;
    return diaA - diaB;
  });

  // Ordenar meses
  const mesesOrdenados = Object.keys(feriasPorMes).sort((a, b) => {
    const [mesA, anoA] = a.split('/').map(Number);
    const [mesB, anoB] = b.split('/').map(Number);
    return anoA !== anoB ? anoA - anoB : mesA - mesB;
  });

  return {
    empresaInfo,
    ferias,
    feriasPorMes,
    feriasPorStatus,
    mesesOrdenados,
    estatisticas: {
      totalRegistros: ferias.length,
      diasTotalProgramados: ferias.reduce((acc, f) => acc + f.diasDireito, 0),
      diasTotalGozados: ferias.reduce((acc, f) => acc + f.diasGozados, 0),
      diasRestantes: ferias.reduce((acc, f) => acc + f.diasRestantes, 0),
    },
    tipo: 'ferias',
  };
};

/**
 * Detecta tipo de relatório do Setor Pessoal
 */
export const detectarTipoRelatorioPessoal = (csvContent) => {
  const upper = csvContent.toUpperCase();

  if (upper.includes('FGTS') || (upper.includes('DEMONSTRATIVO') && upper.includes('FOLHA'))) {
    if (upper.includes('E-SOCIAL') || upper.includes('ESOCIAL') || upper.includes('FGTS')) {
      return 'fgts';
    }
  }
  if (upper.includes('INSS') || (upper.includes('FOLHA') && upper.includes('PREVIDENCIA'))) {
    return 'inss';
  }
  if (upper.includes('EMPREGADO') || upper.includes('COLABORADOR')) {
    if (upper.includes('ADMISS') || upper.includes('SITUA')) {
      return 'empregados';
    }
    if (upper.includes('SAL') && upper.includes('BASE')) {
      return 'salarioBase';
    }
  }
  if (upper.includes('FÉRIAS') || upper.includes('FERIAS') || upper.includes('PROGRAMA')) {
    if (upper.includes('FÉRIAS') || upper.includes('FERIAS')) {
      return 'ferias';
    }
  }
  if (upper.includes('SALÁRIO') || upper.includes('SALARIO')) {
    return 'salarioBase';
  }

  return 'desconhecido';
};

/**
 * Parser universal para relatórios do Setor Pessoal
 */
export const parseRelatorioPessoal = (csvContent) => {
  const tipo = detectarTipoRelatorioPessoal(csvContent);

  switch (tipo) {
    case 'fgts':
      return { tipo, dados: parseDemonstrativoFGTS(csvContent) };
    case 'inss':
      return { tipo, dados: parseFolhaINSS(csvContent) };
    case 'empregados':
      return { tipo, dados: parseRelacaoEmpregados(csvContent) };
    case 'salarioBase':
      return { tipo, dados: parseSalarioBase(csvContent) };
    case 'ferias':
      return { tipo, dados: parseProgramacaoFerias(csvContent) };
    default:
      throw new Error('Tipo de Relatório pessoal Não reconhecido');
  }
};
