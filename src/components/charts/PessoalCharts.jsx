/**
 * Componentes de Gráficos do Setor Pessoal (RH)
 * Baseados nos relatórios do Sistema Domínio
 */

import { useEffect, useRef, useMemo } from 'react';
import Chart from 'chart.js/auto';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/formatters';

// Cores do tema
const COLORS = {
  primary: '#0e4f6d',
  secondary: '#58a3a4',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  orange: '#f97316',
  cyan: '#06b6d4',
  teal: '#14b8a6',
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.success,
  COLORS.danger,
  COLORS.warning,
  COLORS.info,
  COLORS.purple,
  COLORS.pink,
  COLORS.orange,
  COLORS.cyan,
  COLORS.teal,
];

const MESES_CURTOS = [
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

const FGTSCATEGORIAS = [
  { id: 'mensal', label: 'FGTS Mensal', color: COLORS.primary },
  { id: 'decimo_terceiro', label: 'FGTS 13º', color: COLORS.warning },
  { id: 'rescisao', label: 'FGTS Rescisao', color: COLORS.danger },
  { id: 'consignado', label: 'FGTS Consignado', color: COLORS.secondary },
];

const normalizarTexto = (valor = '') =>
  String(valor)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

const parseCompetencia = (competencia) => {
  if (!competencia) return null;
  const [mesRaw, anoRaw] = String(competencia).split('/');
  const mes = Number(mesRaw);
  const ano = Number(anoRaw);
  if (!Number.isInteger(mes) || !Number.isInteger(ano) || mes < 1 || mes > 12) return null;
  return { mes, ano, competencia: `${String(mes).padStart(2, '0')}/${ano}` };
};

const competenciaFromMesAno = (mes, ano) => {
  if (!Number.isInteger(Number(mes)) || !Number.isInteger(Number(ano))) return null;
  const competencia = parseCompetencia(`${String(mes).padStart(2, '0')}/${ano}`);
  return competencia?.competencia || null;
};

const formatarLabelCompetencia = (competencia) => {
  const parsed = parseCompetencia(competencia);
  if (!parsed) return competencia || '-';
  return `${MESES_CURTOS[parsed.mes - 1]}/${String(parsed.ano).slice(-2)}`;
};

const competenciaNoPeriodo = (competencia, periodFilter) => {
  if (!periodFilter) return true;
  const parsed = parseCompetencia(competencia);
  if (!parsed) return false;

  const anoFiltro = Number(periodFilter.year);
  if (!anoFiltro) return true;
  if (parsed.ano !== anoFiltro) return false;

  if (periodFilter.type === 'month') {
    return parsed.mes === Number(periodFilter.month);
  }

  if (periodFilter.type === 'quarter') {
    const trimestre = Number(periodFilter.quarter);
    return Math.ceil(parsed.mes / 3) === trimestre;
  }

  return true;
};

const ordenarCompetencias = (competencias = []) =>
  [...competencias]
    .map((comp) => parseCompetencia(comp)?.competencia)
    .filter(Boolean)
    .sort((a, b) => {
      const parsedA = parseCompetencia(a);
      const parsedB = parseCompetencia(b);
      if (!parsedA || !parsedB) return 0;
      return parsedA.ano !== parsedB.ano ? parsedA.ano - parsedB.ano : parsedA.mes - parsedB.mes;
    });

const mapearCategoriaFgts = (tipoRaw = '') => {
  const tipo = normalizarTexto(tipoRaw);
  if (tipo.includes('CONSIGN')) return 'consignado';
  if (tipo.includes('RESCIS')) return 'rescisao';
  if (tipo.includes('13') || tipo.includes('DECIMO')) return 'decimo_terceiro';
  if (tipo.includes('MENSAL')) return 'mensal';
  return 'mensal';
};

const criarTotaisFgtsCategorias = () =>
  FGTSCATEGORIAS.reduce((acc, categoria) => {
    acc[categoria.id] = 0;
    return acc;
  }, {});

const consolidarFgtsPorCompetenciaECategoria = (dados) => {
  const mapa = {};

  if (Array.isArray(dados?.registros) && dados.registros.length > 0) {
    dados.registros.forEach((registro) => {
      const competencia =
        parseCompetencia(registro?.competencia)?.competencia ||
        competenciaFromMesAno(Number(registro?.mes), Number(registro?.ano));
      if (!competencia) return;

      const categoria = mapearCategoriaFgts(
        registro?.tipo || registro?.tipoRecolhimento || registro?.descricao || ''
      );
      const valor = Number(registro?.valorFGTS || 0);
      if (!Number.isFinite(valor)) return;

      if (!mapa[competencia]) mapa[competencia] = criarTotaisFgtsCategorias();
      mapa[competencia][categoria] += valor;
    });
    return mapa;
  }

  Object.entries(dados?.totaisPorCompetencia || {}).forEach(([competenciaRaw, valores]) => {
    const competencia = parseCompetencia(competenciaRaw)?.competencia;
    if (!competencia) return;
    if (!mapa[competencia]) mapa[competencia] = criarTotaisFgtsCategorias();
    mapa[competencia].mensal += Number(valores?.valorFGTS || 0);
  });

  return mapa;
};

const obterTotaisFgtsPorCategoria = (dados, periodFilter = null) => {
  const totais = criarTotaisFgtsCategorias();
  const mapaCompetencia = consolidarFgtsPorCompetenciaECategoria(dados);
  const competenciasFiltradas = ordenarCompetencias(Object.keys(mapaCompetencia)).filter((comp) =>
    competenciaNoPeriodo(comp, periodFilter)
  );

  competenciasFiltradas.forEach((competencia) => {
    const categoriaData = mapaCompetencia[competencia] || {};
    FGTSCATEGORIAS.forEach(({ id }) => {
      totais[id] += Number(categoriaData[id] || 0);
    });
  });

  if (competenciasFiltradas.length === 0 && !periodFilter) {
    Object.entries(dados?.totaisPorTipo || {}).forEach(([tipo, valores]) => {
      const categoriaId = mapearCategoriaFgts(tipo);
      totais[categoriaId] += Number(valores?.valorFGTS || 0);
    });
  }

  return totais;
};

const obterTotaisInssPorCategoria = (dados, periodFilter = null) => {
  const totais = {};

  if (Array.isArray(dados?.registros) && dados.registros.length > 0) {
    dados.registros.forEach((registro) => {
      const competencia =
        parseCompetencia(registro?.competencia)?.competencia ||
        competenciaFromMesAno(Number(registro?.mes), Number(registro?.ano));
      if (periodFilter && !competenciaNoPeriodo(competencia, periodFilter)) return;

      const categoria = registro?.categoria || 'Empregados';
      totais[categoria] = Number(totais[categoria] || 0) + Number(registro?.valorINSS || 0);
    });
  }

  if (Object.keys(totais).length === 0 && dados?.totaisPorCompetencia) {
    Object.entries(dados.totaisPorCompetencia).forEach(([competencia, valores]) => {
      if (periodFilter && !competenciaNoPeriodo(competencia, periodFilter)) return;
      totais.Empregados = Number(totais.Empregados || 0) + Number(valores?.valorINSS || 0);
    });
  }

  if (Object.keys(totais).length === 0 && dados?.totaisPorEmpresa) {
    Object.entries(dados.totaisPorEmpresa).forEach(([categoria, valores]) => {
      totais[categoria] = Number(totais[categoria] || 0) + Number(valores?.valorINSS || 0);
    });
  }

  return totais;
};

// ============================================
// GRÁFICOS DE FGTS
// ============================================

/**
 * 1. Gráfico de Barras - FGTS por Tipo de Recolhimento
 */
export const FGTSPorTipoChart = ({ dados, periodFilter }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  const dadosGrafico = useMemo(() => {
    const totais = obterTotaisFgtsPorCategoria(dados, periodFilter);
    const totalGeral = Object.values(totais).reduce((acc, value) => acc + Number(value || 0), 0);
    if (totalGeral <= 0) return { labels: [], valores: [], cores: [] };

    return {
      labels: FGTSCATEGORIAS.map((categoria) => categoria.label),
      valores: FGTSCATEGORIAS.map((categoria) => Number(totais[categoria.id] || 0)),
      cores: FGTSCATEGORIAS.map((categoria) => categoria.color),
    };
  }, [dados, periodFilter]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dadosGrafico.labels,
        datasets: [
          {
            label: 'FGTS',
            data: dadosGrafico.valores,
            backgroundColor: dadosGrafico.cores.map((cor) => cor + 'CC'),
            borderColor: dadosGrafico.cores,
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            titleColor: isDarkMode ? '#f1f5f9' : '#1e293b',
            bodyColor: isDarkMode ? '#cbd5e1' : '#475569',
            borderColor: isDarkMode ? '#334155' : '#e2e8f0',
            borderWidth: 1,
            padding: 16,
            cornerRadius: 12,
            callbacks: {
              label: (context) => `${context.label}: ${formatCurrency(context.raw)}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              font: { weight: '600', size: 11 },
            },
          },
          y: {
            grid: {
              color: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              callback: (value) => formatCurrency(value),
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dadosGrafico, isDarkMode]);

  if (dadosGrafico.valores.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Importe o Demonstrativo de FGTS
        </p>
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <canvas ref={chartRef} />
    </div>
  );
};

/**
 * 2. Gráfico de Barras Horizontais - FGTS Acumulado por Ano
 */
export const FGTSPorAnoChart = ({ dados }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  const dadosGrafico = useMemo(() => {
    if (!dados?.totaisPorAno) return { labels: [], valores: [] };

    const anos = Object.entries(dados.totaisPorAno).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

    return {
      labels: anos.map(([ano]) => ano),
      valores: anos.map(([, val]) => val.valorFGTS),
    };
  }, [dados]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dadosGrafico.labels,
        datasets: [
          {
            label: 'FGTS Acumulado',
            data: dadosGrafico.valores,
            backgroundColor: COLORS.primary + 'CC',
            borderColor: COLORS.primary,
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            titleColor: isDarkMode ? '#f1f5f9' : '#1e293b',
            bodyColor: isDarkMode ? '#cbd5e1' : '#475569',
            borderColor: COLORS.primary,
            borderWidth: 2,
            padding: 16,
            cornerRadius: 12,
            callbacks: {
              label: (context) => `Total: ${formatCurrency(context.raw)}`,
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              callback: (value) => formatCurrency(value),
            },
          },
          y: {
            grid: { display: false },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              font: { weight: '600' },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dadosGrafico, isDarkMode]);

  if (!dados?.totaisPorAno || dadosGrafico.valores.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Sem dados de FGTS por ano
        </p>
      </div>
    );
  }

  return (
    <div className="h-[200px]">
      <canvas ref={chartRef} />
    </div>
  );
};

/**
 * 3. Gráfico de Barras - FGTS por Período
 * Composição por tipo dentro do período selecionado.
 */
export const FGTSPorPeriodoChart = ({ dados, periodFilter }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  const dadosGrafico = useMemo(() => {
    const totais = obterTotaisFgtsPorCategoria(dados, periodFilter);
    const totalPeriodo = Object.values(totais).reduce((acc, value) => acc + Number(value || 0), 0);
    if (totalPeriodo <= 0) return { labels: [], valores: [], cores: [] };

    return {
      labels: FGTSCATEGORIAS.map((categoria) => categoria.label),
      valores: FGTSCATEGORIAS.map((categoria) => Number(totais[categoria.id] || 0)),
      cores: FGTSCATEGORIAS.map((categoria) => categoria.color),
    };
  }, [dados, periodFilter]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dadosGrafico.labels,
        datasets: [
          {
            label: 'FGTS',
            data: dadosGrafico.valores,
            backgroundColor: dadosGrafico.cores.map((cor) => cor + 'CC'),
            borderColor: dadosGrafico.cores,
            borderWidth: 2,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            titleColor: isDarkMode ? '#f1f5f9' : '#1e293b',
            bodyColor: isDarkMode ? '#cbd5e1' : '#475569',
            borderColor: isDarkMode ? '#334155' : '#e2e8f0',
            borderWidth: 1,
            padding: 16,
            cornerRadius: 12,
            callbacks: {
              label: (context) => `${context.label}: ${formatCurrency(context.raw)}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              font: { weight: '600' },
            },
          },
          y: {
            grid: {
              color: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              callback: (value) => formatCurrency(value),
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dadosGrafico, isDarkMode]);

  if (dadosGrafico.valores.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center">
        <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Sem dados de FGTS para o período selecionado
        </p>
      </div>
    );
  }

  return (
    <div className="h-[250px]">
      <canvas ref={chartRef} />
    </div>
  );
};

/**
 * 4. Gráfico de Barras - FGTS Mês a Mês
 */
export const FGTSMensalChart = ({ dados }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  const dadosGrafico = useMemo(() => {
    if (!dados?.competencias || !dados?.totaisPorCompetencia) {
      return { labels: [], valores: [] };
    }

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

    return {
      labels: dados.competencias.map((comp) => {
        const [mes, ano] = comp.split('/');
        return `${mesesNomes[parseInt(mes) - 1]}/${ano.slice(-2)}`;
      }),
      valores: dados.competencias.map((comp) => dados.totaisPorCompetencia[comp]?.valorFGTS || 0),
    };
  }, [dados]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dadosGrafico.labels,
        datasets: [
          {
            label: 'FGTS Mensal',
            data: dadosGrafico.valores,
            backgroundColor: COLORS.primary + 'CC',
            borderColor: COLORS.primary,
            borderWidth: 2,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            titleColor: isDarkMode ? '#f1f5f9' : '#1e293b',
            bodyColor: isDarkMode ? '#cbd5e1' : '#475569',
            borderColor: COLORS.primary,
            borderWidth: 2,
            padding: 16,
            cornerRadius: 12,
            callbacks: {
              label: (context) => `FGTS: ${formatCurrency(context.raw)}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              font: { weight: '600', size: 10 },
              maxRotation: 45,
            },
          },
          y: {
            grid: {
              color: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              callback: (value) => formatCurrency(value),
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dadosGrafico, isDarkMode]);

  if (dadosGrafico.valores.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Sem dados mensais de FGTS
        </p>
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <canvas ref={chartRef} />
    </div>
  );
};

// ============================================
// GRÁFICOS DE INSS
// ============================================

/**
 * 5. Gráfico de Barras Horizontais - INSS por Empresa
 */
export const INSSPorEmpresaChart = ({ dados, periodFilter }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  const dadosGrafico = useMemo(() => {
    let categorias = Object.entries(obterTotaisInssPorCategoria(dados, periodFilter))
      .filter(([, valor]) => Number(valor) > 0)
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .slice(0, 10);

    if (categorias.length === 0 && dados?.totaisPorEmpresa) {
      categorias = Object.entries(dados.totaisPorEmpresa)
        .map(([categoria, valor]) => [categoria, Number(valor?.valorINSS || 0)])
        .filter(([, valor]) => Number(valor) > 0)
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .slice(0, 10);
    }

    return {
      labels: categorias.map(([categoria]) =>
        categoria.length > 30 ? categoria.slice(0, 30) + '...' : categoria
      ),
      valores: categorias.map(([, valor]) => Number(valor || 0)),
    };
  }, [dados, periodFilter]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dadosGrafico.labels,
        datasets: [
          {
            label: 'INSS',
            data: dadosGrafico.valores,
            backgroundColor: CHART_COLORS.slice(0, dadosGrafico.valores.length).map(
              (c) => c + 'CC'
            ),
            borderColor: CHART_COLORS.slice(0, dadosGrafico.valores.length),
            borderWidth: 2,
            borderRadius: 6,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            titleColor: isDarkMode ? '#f1f5f9' : '#1e293b',
            bodyColor: isDarkMode ? '#cbd5e1' : '#475569',
            borderColor: isDarkMode ? '#334155' : '#e2e8f0',
            borderWidth: 1,
            padding: 16,
            cornerRadius: 12,
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.raw / total) * 100).toFixed(1);
                return `INSS: ${formatCurrency(context.raw)} (${percentage}%)`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              callback: (value) => formatCurrency(value),
            },
          },
          y: {
            grid: { display: false },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              font: { weight: '600', size: 10 },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dadosGrafico, isDarkMode]);

  if (dadosGrafico.valores.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Importe a Folha de INSS
        </p>
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <canvas ref={chartRef} />
    </div>
  );
};

/**
 * 6. Gráfico de Rosca - INSS por Tipo (Original/Retificador)
 */
export const INSSPorTipoGuiaChart = ({ dados }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  const dadosGrafico = useMemo(() => {
    if (!dados?.totaisPorTipo) return { labels: [], valores: [] };

    const tipos = [];
    if (dados.totaisPorTipo.original > 0) {
      tipos.push({ label: 'Original', valor: dados.totaisPorTipo.original, cor: COLORS.success });
    }
    if (dados.totaisPorTipo.retificador > 0) {
      tipos.push({
        label: 'Retificador',
        valor: dados.totaisPorTipo.retificador,
        cor: COLORS.warning,
      });
    }

    return {
      labels: tipos.map((t) => t.label),
      valores: tipos.map((t) => t.valor),
      cores: tipos.map((t) => t.cor),
    };
  }, [dados]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: dadosGrafico.labels,
        datasets: [
          {
            data: dadosGrafico.valores,
            backgroundColor: dadosGrafico.cores.map((c) => c + 'CC'),
            borderColor: dadosGrafico.cores,
            borderWidth: 2,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: isDarkMode ? '#e2e8f0' : '#475569',
              font: { weight: 'bold', size: 12 },
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 20,
            },
          },
          tooltip: {
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            titleColor: isDarkMode ? '#f1f5f9' : '#1e293b',
            bodyColor: isDarkMode ? '#cbd5e1' : '#475569',
            borderColor: isDarkMode ? '#334155' : '#e2e8f0',
            borderWidth: 1,
            padding: 16,
            cornerRadius: 12,
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.raw / total) * 100).toFixed(1);
                return `${context.label}: ${context.raw} guias (${percentage}%)`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dadosGrafico, isDarkMode]);

  if (!dados?.totaisPorTipo || dadosGrafico.valores.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center">
        <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Sem dados de tipo de guia
        </p>
      </div>
    );
  }

  return (
    <div className="h-[250px]">
      <canvas ref={chartRef} />
    </div>
  );
};

/**
 * 7. Gráfico de Barras - INSS por Período
 */
export const INSSPorPeriodoChart = ({ dados, periodFilter }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  const dadosGrafico = useMemo(() => {
    const totaisPorCategoria = obterTotaisInssPorCategoria(dados, periodFilter);
    const categorias = Object.entries(totaisPorCategoria)
      .filter(([, valor]) => Number(valor) > 0)
      .sort((a, b) => Number(b[1]) - Number(a[1]));

    if (categorias.length === 0) return { labels: [], valores: [], cores: [] };

    return {
      labels: categorias.map(([categoria]) => categoria),
      valores: categorias.map(([, valor]) => Number(valor || 0)),
      cores: categorias.map((_, index) => CHART_COLORS[index % CHART_COLORS.length]),
    };
  }, [dados, periodFilter]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dadosGrafico.labels,
        datasets: [
          {
            label: 'INSS',
            data: dadosGrafico.valores,
            backgroundColor: dadosGrafico.cores.map((cor) => cor + 'CC'),
            borderColor: dadosGrafico.cores,
            borderWidth: 2,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            titleColor: isDarkMode ? '#f1f5f9' : '#1e293b',
            bodyColor: isDarkMode ? '#cbd5e1' : '#475569',
            borderColor: COLORS.secondary,
            borderWidth: 2,
            padding: 16,
            cornerRadius: 12,
            callbacks: {
              label: (context) => `${context.label}: ${formatCurrency(context.raw)}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              font: { weight: '600', size: 10 },
            },
          },
          y: {
            grid: {
              color: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              callback: (value) => formatCurrency(value),
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dadosGrafico, isDarkMode]);

  if (dadosGrafico.valores.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Sem dados de INSS para o período selecionado
        </p>
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <canvas ref={chartRef} />
    </div>
  );
};

// ============================================
// GRÁFICOS DE EMPREGADOS
// ============================================

/**
 * 8. Gráfico de Barras - Admissões e Demissões
 */
export const AdmissoesDemissoesChart = ({ dados, periodFilter }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  const dadosGrafico = useMemo(() => {
    if (!dados?.admissoesPorMes && !dados?.demissoesPorMes) {
      return { labels: [], admissoes: [], demissoes: [] };
    }

    // Combinar todas as competências
    const todasCompetencias = new Set([
      ...(dados.competenciasAdmissao || []),
      ...(dados.competenciasDemissao || []),
    ]);

    let competenciasOrdenadas = ordenarCompetencias(Array.from(todasCompetencias));

    if (periodFilter) {
      competenciasOrdenadas = competenciasOrdenadas.filter((comp) =>
        competenciaNoPeriodo(comp, periodFilter)
      );
    } else {
      competenciasOrdenadas = competenciasOrdenadas.slice(-12);
    }

    return {
      labels: competenciasOrdenadas.map((comp) => formatarLabelCompetencia(comp)),
      admissoes: competenciasOrdenadas.map((comp) => dados.admissoesPorMes?.[comp] || 0),
      demissoes: competenciasOrdenadas.map((comp) => dados.demissoesPorMes?.[comp] || 0),
    };
  }, [dados, periodFilter]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dadosGrafico.labels,
        datasets: [
          {
            label: 'Admissões',
            data: dadosGrafico.admissoes,
            backgroundColor: COLORS.success + 'CC',
            borderColor: COLORS.success,
            borderWidth: 2,
            borderRadius: 6,
          },
          {
            label: 'Demissões',
            data: dadosGrafico.demissoes,
            backgroundColor: COLORS.danger + 'CC',
            borderColor: COLORS.danger,
            borderWidth: 2,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: isDarkMode ? '#e2e8f0' : '#475569',
              font: { weight: 'bold', size: 12 },
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 20,
            },
          },
          tooltip: {
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            titleColor: isDarkMode ? '#f1f5f9' : '#1e293b',
            bodyColor: isDarkMode ? '#cbd5e1' : '#475569',
            borderColor: isDarkMode ? '#334155' : '#e2e8f0',
            borderWidth: 1,
            padding: 16,
            cornerRadius: 12,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              font: { weight: '600', size: 10 },
              maxRotation: 45,
            },
          },
          y: {
            grid: {
              color: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              stepSize: 1,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dadosGrafico, isDarkMode]);

  if (dadosGrafico.labels.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Importe a Relação de Empregados
        </p>
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <canvas ref={chartRef} />
    </div>
  );
};

/**
 * 9. Gráfico de Rosca - Empregados por Situação
 */
export const EmpregadosPorSituacaoChart = ({ dados, periodFilter }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  const dadosGrafico = useMemo(() => {
    const situacaoCores = {
      Ativo: COLORS.success,
      Demitido: COLORS.danger,
      Afastado: COLORS.warning,
    };

    let situacaoContador = null;

    if (Array.isArray(dados?.empregados) && dados.empregados.length > 0) {
      situacaoContador = {};

      dados.empregados.forEach((empregado) => {
        const situacao = empregado?.situacao || 'Nao informado';
        const dataReferencia =
          situacao === 'Ativo'
            ? empregado?.dataAdmissao
            : empregado?.dataSituacao || empregado?.dataAdmissao;
        const competencia = dataReferencia
          ? competenciaFromMesAno(
              Number(String(dataReferencia).split('/')[1]),
              Number(String(dataReferencia).split('/')[2])
            )
          : null;

        if (periodFilter && !competenciaNoPeriodo(competencia, periodFilter)) return;

        situacaoContador[situacao] = Number(situacaoContador[situacao] || 0) + 1;
      });
    }

    if (!situacaoContador && dados?.empregadosPorSituacao) {
      situacaoContador = { ...dados.empregadosPorSituacao };
    }

    if (!situacaoContador) return { labels: [], valores: [], cores: [] };

    const situacoes = Object.entries(situacaoContador)
      .filter(([, val]) => val > 0)
      .sort((a, b) => b[1] - a[1]);

    return {
      labels: situacoes.map(([sit]) => (sit === 'Nao informado' ? 'Nao informado' : sit)),
      valores: situacoes.map(([, val]) => val),
      cores: situacoes.map(([sit]) => situacaoCores[sit] || COLORS.info),
    };
  }, [dados, periodFilter]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: dadosGrafico.labels,
        datasets: [
          {
            data: dadosGrafico.valores,
            backgroundColor: dadosGrafico.cores.map((c) => c + 'CC'),
            borderColor: dadosGrafico.cores,
            borderWidth: 2,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: isDarkMode ? '#e2e8f0' : '#475569',
              font: { weight: 'bold', size: 12 },
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 20,
            },
          },
          tooltip: {
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            titleColor: isDarkMode ? '#f1f5f9' : '#1e293b',
            bodyColor: isDarkMode ? '#cbd5e1' : '#475569',
            borderColor: isDarkMode ? '#334155' : '#e2e8f0',
            borderWidth: 1,
            padding: 16,
            cornerRadius: 12,
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.raw / total) * 100).toFixed(1);
                return `${context.label}: ${context.raw} (${percentage}%)`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dadosGrafico, isDarkMode]);

  if (dadosGrafico.valores.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center">
        <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Sem dados de situacao para o periodo selecionado
        </p>
      </div>
    );
  }

  return (
    <div className="h-[250px]">
      <canvas ref={chartRef} />
    </div>
  );
};

/**
 * 10. Gráfico de Barras Horizontais - Salário Médio por Cargo
 */
export const SalarioPorCargoChart = ({ dados }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  const dadosGrafico = useMemo(() => {
    if (!dados?.cargosOrdenados) return { labels: [], valores: [] };

    const cargos = dados.cargosOrdenados.filter((c) => c.salarioMedio > 0).slice(0, 10);

    return {
      labels: cargos.map((c) => (c.cargo.length > 25 ? c.cargo.slice(0, 25) + '...' : c.cargo)),
      valores: cargos.map((c) => c.salarioMedio),
      quantidades: cargos.map((c) => c.quantidade),
    };
  }, [dados]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dadosGrafico.labels,
        datasets: [
          {
            label: 'Salário Médio',
            data: dadosGrafico.valores,
            backgroundColor: CHART_COLORS.slice(0, dadosGrafico.valores.length).map(
              (c) => c + 'CC'
            ),
            borderColor: CHART_COLORS.slice(0, dadosGrafico.valores.length),
            borderWidth: 2,
            borderRadius: 6,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            titleColor: isDarkMode ? '#f1f5f9' : '#1e293b',
            bodyColor: isDarkMode ? '#cbd5e1' : '#475569',
            borderColor: isDarkMode ? '#334155' : '#e2e8f0',
            borderWidth: 1,
            padding: 16,
            cornerRadius: 12,
            callbacks: {
              label: (context) => {
                const qtd = dadosGrafico.quantidades[context.dataIndex];
                return `Salário Médio: ${formatCurrency(context.raw)} (${qtd} colaboradores)`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              callback: (value) => formatCurrency(value),
            },
          },
          y: {
            grid: { display: false },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              font: { weight: '600', size: 10 },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dadosGrafico, isDarkMode]);

  if (!dados?.cargosOrdenados || dadosGrafico.valores.length === 0) {
    return (
      <div className="h-[350px] flex items-center justify-center">
        <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Importe o Salário Base
        </p>
      </div>
    );
  }

  return (
    <div className="h-[350px]">
      <canvas ref={chartRef} />
    </div>
  );
};

/**
 * 11. Tabela de Programação de Férias
 * Mostra: Colaborador, Período Aquisitivo, Limite p/ Gozo, Dias Restantes, Status
 */
export const TabelaFerias = ({ dados }) => {
  const { isDarkMode } = useTheme();

  if (!dados?.ferias || dados.ferias.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          {'Importe a Programa\u00e7\u00e3o de F\u00e9rias'}
        </p>
      </div>
    );
  }

  // Função para obter cor do status
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Gozadas':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Programada':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Vencida':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'Parcial':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: // Pendente
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-400';
    }
  };

  return (
    <div className="overflow-x-auto max-h-[400px]">
      <table className="w-full">
        <thead className={`sticky top-0 ${isDarkMode ? 'bg-slate-700/90' : 'bg-slate-50'}`}>
          <tr>
            <th
              className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
            >
              Colaborador
            </th>
            <th
              className={`px-4 py-3 text-center text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
            >
              Per. Aquisitivo
            </th>
            <th
              className={`px-4 py-3 text-center text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
            >
              Limite p/ Gozo
            </th>
            <th
              className={`px-4 py-3 text-center text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
            >
              Dias Rest.
            </th>
            <th
              className={`px-4 py-3 text-center text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
            >
              Status
            </th>
          </tr>
        </thead>
        <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
          {dados.ferias.slice(0, 20).map((item, i) => (
            <tr
              key={i}
              className={`transition-colors ${isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}
            >
              <td className={`px-4 py-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <div className="font-medium">
                  {item.nome.length > 25 ? item.nome.slice(0, 25) + '...' : item.nome}
                </div>
                {item.inicioGozo && (
                  <div className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    Início: {item.inicioGozo}
                  </div>
                )}
              </td>
              <td
                className={`px-4 py-3 text-center font-mono text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
              >
                <div>{item.inicioAquisitivo || '-'}</div>
                <div>{item.fimAquisitivo || '-'}</div>
              </td>
              <td
                className={`px-4 py-3 text-center font-mono text-sm font-semibold ${
                  item.status === 'Vencida'
                    ? isDarkMode
                      ? 'text-red-400'
                      : 'text-red-600'
                    : isDarkMode
                      ? 'text-slate-300'
                      : 'text-slate-700'
                }`}
              >
                {item.limiteGozo || '-'}
              </td>
              <td
                className={`px-4 py-3 text-center font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}
              >
                {item.diasRestantes}/{item.diasDireito}
              </td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(item.status)}`}
                >
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {dados.ferias.length > 20 && (
        <div
          className={`px-4 py-2 text-center text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}
        >
          Mostrando 20 de {dados.ferias.length} registros
        </div>
      )}
    </div>
  );
};

/**
 * Cards de Métricas do Setor Pessoal
 */
export const CardsMetricasPessoal = ({ dadosFGTS, dadosINSS, dadosEmpregados }) => {
  const metricas = useMemo(() => {
    return {
      totalFGTS: dadosFGTS?.totalGeral?.valorFGTS || 0,
      totalINSS: dadosINSS?.totalGeral?.valorINSS || 0,
      totalEmpregados: dadosEmpregados?.estatisticas?.ativos || 0,
    };
  }, [dadosFGTS, dadosINSS, dadosEmpregados]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-[#0e4f6d] p-6 rounded-xl text-white shadow-md">
        <div className="flex items-center justify-between mb-4">
          <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <p className="text-3xl font-bold">{metricas.totalEmpregados}</p>
        <p className="text-white/70 text-sm mt-1">Colaboradores Ativos</p>
      </div>

      <div className="bg-slate-700 p-6 rounded-xl text-white shadow-md">
        <div className="flex items-center justify-between mb-4">
          <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
            />
          </svg>
        </div>
        <p className="text-3xl font-bold">{formatCurrency(metricas.totalFGTS)}</p>
        <p className="text-white/70 text-sm mt-1">Total FGTS</p>
      </div>

      <div className="bg-slate-700 p-6 rounded-xl text-white shadow-md">
        <div className="flex items-center justify-between mb-4">
          <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <p className="text-3xl font-bold">{formatCurrency(metricas.totalINSS)}</p>
        <p className="text-white/70 text-sm mt-1">Total INSS</p>
      </div>
    </div>
  );
};

export default {
  FGTSPorTipoChart,
  FGTSPorAnoChart,
  FGTSPorPeriodoChart,
  FGTSMensalChart,
  INSSPorEmpresaChart,
  INSSPorTipoGuiaChart,
  INSSPorPeriodoChart,
  AdmissoesDemissoesChart,
  EmpregadosPorSituacaoChart,
  SalarioPorCargoChart,
  TabelaFerias,
  CardsMetricasPessoal,
};
