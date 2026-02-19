const normalizeText = (text = '') =>
  String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

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

export const getMonthIndexFromMovimentacao = (item = {}) => {
  const fromMesIndex = Number(item?.mesIndex || 0);
  if (fromMesIndex >= 1 && fromMesIndex <= 12) return fromMesIndex;

  const competencia = String(item?.competencia || '');
  const matchCompetencia = competencia.match(/^(\d{2})\/\d{4}$/);
  if (matchCompetencia) {
    const mes = Number(matchCompetencia[1]);
    if (mes >= 1 && mes <= 12) return mes;
  }

  const mesNormalizado = normalizeText(item?.mes || '').replace(/[^a-z]/g, '');
  const prefix = MONTH_PREFIXES.find(([abbr]) => mesNormalizado.startsWith(abbr));
  return prefix ? prefix[1] : 0;
};

export const buildFaturamentoTrimestreSeries = (dados, trimestre = null, year) => {
  if (!dados) return { meses: [], entradas: [], saidas: [], servicos: [] };

  const anoSelecionado = Number(year || 0);
  let movimentacao = [];

  if (anoSelecionado && Array.isArray(dados.movimentacaoPorAno?.[anoSelecionado])) {
    movimentacao = dados.movimentacaoPorAno[anoSelecionado];
  } else if (Array.isArray(dados.movimentacao2025) && dados.movimentacao2025.length) {
    movimentacao = dados.movimentacao2025;
  } else if (Array.isArray(dados.movimentacao) && dados.movimentacao.length) {
    if (anoSelecionado) {
      movimentacao = dados.movimentacao.filter((m) => Number(m?.ano || 0) === anoSelecionado);
    }
    if (!movimentacao.length) {
      movimentacao = dados.movimentacao;
    }
  }

  if (!movimentacao.length) return { meses: [], entradas: [], saidas: [], servicos: [] };

  const mesesNomes = [
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

  let dadosFiltrados = movimentacao
    .map((m) => ({ ...m, _mesIndex: getMonthIndexFromMovimentacao(m) }))
    .filter((m) => m._mesIndex >= 1 && m._mesIndex <= 12);

  if (trimestre) {
    const trimestreMeses = {
      1: [1, 2, 3],
      2: [4, 5, 6],
      3: [7, 8, 9],
      4: [10, 11, 12],
    };
    const mesesPermitidos = trimestreMeses[trimestre] || [];
    dadosFiltrados = dadosFiltrados.filter((m) =>
      mesesPermitidos.includes(Number(m?._mesIndex || 0))
    );
  }

  dadosFiltrados.sort((a, b) => Number(a?._mesIndex || 0) - Number(b?._mesIndex || 0));

  return {
    meses: dadosFiltrados.map(
      (m) => mesesNomes[Math.max(0, Number(m?._mesIndex || 1) - 1)] || m?.mes || ''
    ),
    entradas: dadosFiltrados.map((m) => Number(m?.entradas || 0)),
    saidas: dadosFiltrados.map((m) => Number(m?.saidas || 0)),
    servicos: dadosFiltrados.map((m) => Number(m?.servicos || 0)),
  };
};
