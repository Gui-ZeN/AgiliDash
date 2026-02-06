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
  teal: '#14b8a6'
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
  COLORS.teal
];

// ============================================
// GRÁFICOS DE FGTS
// ============================================

/**
 * 1. Gráfico de Rosca - FGTS por Tipo de Recolhimento
 * Mostra Mensal, 13º, Rescisão, etc.
 */
export const FGTSPorTipoChart = ({ dados }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  const dadosGrafico = useMemo(() => {
    if (!dados?.totaisPorTipo) return { labels: [], valores: [] };

    const tipos = Object.entries(dados.totaisPorTipo)
      .filter(([, val]) => val.valorFGTS > 0)
      .sort((a, b) => b[1].valorFGTS - a[1].valorFGTS);

    return {
      labels: tipos.map(([tipo]) => tipo),
      valores: tipos.map(([, val]) => val.valorFGTS)
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
        datasets: [{
          data: dadosGrafico.valores,
          backgroundColor: CHART_COLORS.slice(0, dadosGrafico.valores.length).map(c => c + 'CC'),
          borderColor: CHART_COLORS.slice(0, dadosGrafico.valores.length),
          borderWidth: 2,
          hoverOffset: 8
        }]
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
              padding: 20
            }
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
                return `${context.label}: ${formatCurrency(context.raw)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dadosGrafico, isDarkMode]);

  if (!dados?.totaisPorTipo || dadosGrafico.valores.length === 0) {
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

    const anos = Object.entries(dados.totaisPorAno)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

    return {
      labels: anos.map(([ano]) => ano),
      valores: anos.map(([, val]) => val.valorFGTS)
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
        datasets: [{
          label: 'FGTS Acumulado',
          data: dadosGrafico.valores,
          backgroundColor: COLORS.primary + 'CC',
          borderColor: COLORS.primary,
          borderWidth: 2,
          borderRadius: 8
        }]
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
              label: (context) => `Total: ${formatCurrency(context.raw)}`
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              callback: (value) => formatCurrency(value)
            }
          },
          y: {
            grid: { display: false },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              font: { weight: '600' }
            }
          }
        }
      }
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
 * 3. Gráfico de Barras Verticais - FGTS Últimos 3 Meses
 */
export const FGTSUltimos3MesesChart = ({ dados }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  const dadosGrafico = useMemo(() => {
    if (!dados?.ultimos3Meses || !dados?.totaisPorCompetencia) {
      return { labels: [], valores: [] };
    }

    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    return {
      labels: dados.ultimos3Meses.map(comp => {
        const [mes, ano] = comp.split('/');
        return `${mesesNomes[parseInt(mes) - 1]}/${ano.slice(-2)}`;
      }),
      valores: dados.ultimos3Meses.map(comp => dados.totaisPorCompetencia[comp]?.valorFGTS || 0)
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
        datasets: [{
          label: 'FGTS',
          data: dadosGrafico.valores,
          backgroundColor: [COLORS.info + 'CC', COLORS.secondary + 'CC', COLORS.primary + 'CC'],
          borderColor: [COLORS.info, COLORS.secondary, COLORS.primary],
          borderWidth: 2,
          borderRadius: 8
        }]
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
              label: (context) => `FGTS: ${formatCurrency(context.raw)}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              font: { weight: '600' }
            }
          },
          y: {
            grid: {
              color: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              callback: (value) => formatCurrency(value)
            }
          }
        }
      }
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
          Sem dados dos últimos meses
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

    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    return {
      labels: dados.competencias.map(comp => {
        const [mes, ano] = comp.split('/');
        return `${mesesNomes[parseInt(mes) - 1]}/${ano.slice(-2)}`;
      }),
      valores: dados.competencias.map(comp => dados.totaisPorCompetencia[comp]?.valorFGTS || 0)
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
        datasets: [{
          label: 'FGTS Mensal',
          data: dadosGrafico.valores,
          backgroundColor: COLORS.primary + 'CC',
          borderColor: COLORS.primary,
          borderWidth: 2,
          borderRadius: 6
        }]
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
              label: (context) => `FGTS: ${formatCurrency(context.raw)}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              font: { weight: '600', size: 10 },
              maxRotation: 45
            }
          },
          y: {
            grid: {
              color: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              callback: (value) => formatCurrency(value)
            }
          }
        }
      }
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
export const INSSPorEmpresaChart = ({ dados }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  const dadosGrafico = useMemo(() => {
    if (!dados?.totaisPorEmpresa) return { labels: [], valores: [] };

    const empresas = Object.entries(dados.totaisPorEmpresa)
      .filter(([, val]) => val.valorINSS > 0)
      .sort((a, b) => b[1].valorINSS - a[1].valorINSS)
      .slice(0, 10);

    return {
      labels: empresas.map(([empresa]) => empresa.length > 30 ? empresa.slice(0, 30) + '...' : empresa),
      valores: empresas.map(([, val]) => val.valorINSS)
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
        datasets: [{
          label: 'INSS',
          data: dadosGrafico.valores,
          backgroundColor: CHART_COLORS.slice(0, dadosGrafico.valores.length).map(c => c + 'CC'),
          borderColor: CHART_COLORS.slice(0, dadosGrafico.valores.length),
          borderWidth: 2,
          borderRadius: 6
        }]
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
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              callback: (value) => formatCurrency(value)
            }
          },
          y: {
            grid: { display: false },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              font: { weight: '600', size: 10 }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dadosGrafico, isDarkMode]);

  if (!dados?.totaisPorEmpresa || dadosGrafico.valores.length === 0) {
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
      tipos.push({ label: 'Retificador', valor: dados.totaisPorTipo.retificador, cor: COLORS.warning });
    }

    return {
      labels: tipos.map(t => t.label),
      valores: tipos.map(t => t.valor),
      cores: tipos.map(t => t.cor)
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
        datasets: [{
          data: dadosGrafico.valores,
          backgroundColor: dadosGrafico.cores.map(c => c + 'CC'),
          borderColor: dadosGrafico.cores,
          borderWidth: 2,
          hoverOffset: 8
        }]
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
              padding: 20
            }
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
              }
            }
          }
        }
      }
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
 * 7. Gráfico de Barras Verticais - INSS Mês a Mês
 */
export const INSSMensalChart = ({ dados }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  const dadosGrafico = useMemo(() => {
    if (!dados?.competencias || !dados?.totaisPorCompetencia) {
      return { labels: [], valores: [] };
    }

    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    return {
      labels: dados.competencias.map(comp => {
        const [mes, ano] = comp.split('/');
        return `${mesesNomes[parseInt(mes) - 1]}/${ano.slice(-2)}`;
      }),
      valores: dados.competencias.map(comp => dados.totaisPorCompetencia[comp]?.valorINSS || 0)
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
        datasets: [{
          label: 'INSS Mensal',
          data: dadosGrafico.valores,
          backgroundColor: COLORS.secondary + 'CC',
          borderColor: COLORS.secondary,
          borderWidth: 2,
          borderRadius: 6
        }]
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
              label: (context) => `INSS: ${formatCurrency(context.raw)}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              font: { weight: '600', size: 10 },
              maxRotation: 45
            }
          },
          y: {
            grid: {
              color: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              callback: (value) => formatCurrency(value)
            }
          }
        }
      }
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
          Sem dados mensais de INSS
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
export const AdmissoesDemissoesChart = ({ dados }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  const dadosGrafico = useMemo(() => {
    if (!dados?.admissoesPorMes && !dados?.demissoesPorMes) {
      return { labels: [], admissoes: [], demissoes: [] };
    }

    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    // Combinar todas as competências
    const todasCompetencias = new Set([
      ...(dados.competenciasAdmissao || []),
      ...(dados.competenciasDemissao || [])
    ]);

    const competenciasOrdenadas = Array.from(todasCompetencias).sort((a, b) => {
      const [mesA, anoA] = a.split('/').map(Number);
      const [mesB, anoB] = b.split('/').map(Number);
      return anoA !== anoB ? anoA - anoB : mesA - mesB;
    }).slice(-12); // Últimos 12 meses

    return {
      labels: competenciasOrdenadas.map(comp => {
        const [mes, ano] = comp.split('/');
        return `${mesesNomes[parseInt(mes) - 1]}/${ano.slice(-2)}`;
      }),
      admissoes: competenciasOrdenadas.map(comp => dados.admissoesPorMes?.[comp] || 0),
      demissoes: competenciasOrdenadas.map(comp => dados.demissoesPorMes?.[comp] || 0)
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
            label: 'Admissões',
            data: dadosGrafico.admissoes,
            backgroundColor: COLORS.success + 'CC',
            borderColor: COLORS.success,
            borderWidth: 2,
            borderRadius: 6
          },
          {
            label: 'Demissões',
            data: dadosGrafico.demissoes,
            backgroundColor: COLORS.danger + 'CC',
            borderColor: COLORS.danger,
            borderWidth: 2,
            borderRadius: 6
          }
        ]
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
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            titleColor: isDarkMode ? '#f1f5f9' : '#1e293b',
            bodyColor: isDarkMode ? '#cbd5e1' : '#475569',
            borderColor: isDarkMode ? '#334155' : '#e2e8f0',
            borderWidth: 1,
            padding: 16,
            cornerRadius: 12
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              font: { weight: '600', size: 10 },
              maxRotation: 45
            }
          },
          y: {
            grid: {
              color: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              stepSize: 1
            }
          }
        }
      }
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
export const EmpregadosPorSituacaoChart = ({ dados }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  const dadosGrafico = useMemo(() => {
    if (!dados?.empregadosPorSituacao) return { labels: [], valores: [], cores: [] };

    const situacaoCores = {
      'Ativo': COLORS.success,
      'Demitido': COLORS.danger,
      'Afastado': COLORS.warning
    };

    const situacoes = Object.entries(dados.empregadosPorSituacao)
      .filter(([, val]) => val > 0)
      .sort((a, b) => b[1] - a[1]);

    return {
      labels: situacoes.map(([sit]) => sit),
      valores: situacoes.map(([, val]) => val),
      cores: situacoes.map(([sit]) => situacaoCores[sit] || COLORS.info)
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
        datasets: [{
          data: dadosGrafico.valores,
          backgroundColor: dadosGrafico.cores.map(c => c + 'CC'),
          borderColor: dadosGrafico.cores,
          borderWidth: 2,
          hoverOffset: 8
        }]
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
              padding: 20
            }
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
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dadosGrafico, isDarkMode]);

  if (!dados?.empregadosPorSituacao || dadosGrafico.valores.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center">
        <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Sem dados de situação
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

    const cargos = dados.cargosOrdenados
      .filter(c => c.salarioMedio > 0)
      .slice(0, 10);

    return {
      labels: cargos.map(c => c.cargo.length > 25 ? c.cargo.slice(0, 25) + '...' : c.cargo),
      valores: cargos.map(c => c.salarioMedio),
      quantidades: cargos.map(c => c.quantidade)
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
        datasets: [{
          label: 'Salário Médio',
          data: dadosGrafico.valores,
          backgroundColor: CHART_COLORS.slice(0, dadosGrafico.valores.length).map(c => c + 'CC'),
          borderColor: CHART_COLORS.slice(0, dadosGrafico.valores.length),
          borderWidth: 2,
          borderRadius: 6
        }]
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
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              callback: (value) => formatCurrency(value)
            }
          },
          y: {
            grid: { display: false },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              font: { weight: '600', size: 10 }
            }
          }
        }
      }
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
 */
export const TabelaFerias = ({ dados }) => {
  const { isDarkMode } = useTheme();

  if (!dados?.ferias || dados.ferias.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Importe a Programação de Férias
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto max-h-[400px]">
      <table className="w-full">
        <thead className={`sticky top-0 ${isDarkMode ? 'bg-slate-700/90' : 'bg-slate-50'}`}>
          <tr>
            <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Colaborador
            </th>
            <th className={`px-4 py-3 text-center text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Início
            </th>
            <th className={`px-4 py-3 text-center text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Fim
            </th>
            <th className={`px-4 py-3 text-center text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Dias
            </th>
            <th className={`px-4 py-3 text-center text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Status
            </th>
          </tr>
        </thead>
        <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
          {dados.ferias.slice(0, 20).map((item, i) => (
            <tr key={i} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}>
              <td className={`px-4 py-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {item.nome.length > 30 ? item.nome.slice(0, 30) + '...' : item.nome}
              </td>
              <td className={`px-4 py-3 text-center font-mono text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {item.dataInicio || '-'}
              </td>
              <td className={`px-4 py-3 text-center font-mono text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {item.dataFim || '-'}
              </td>
              <td className={`px-4 py-3 text-center font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {item.diasDireito}
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  item.status === 'Gozadas'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : item.status === 'Parcial'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {dados.ferias.length > 20 && (
        <div className={`px-4 py-2 text-center text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Mostrando 20 de {dados.ferias.length} registros
        </div>
      )}
    </div>
  );
};

/**
 * Cards de Métricas do Setor Pessoal
 */
export const CardsMetricasPessoal = ({ dadosFGTS, dadosINSS, dadosEmpregados, dadosSalario }) => {
  const { isDarkMode } = useTheme();

  const metricas = useMemo(() => {
    return {
      totalFGTS: dadosFGTS?.totalGeral?.valorFGTS || 0,
      totalINSS: dadosINSS?.totalGeral?.valorINSS || 0,
      totalEmpregados: dadosEmpregados?.estatisticas?.ativos || 0,
      folhaSalarial: dadosSalario?.estatisticas?.totalSalarios || 0
    };
  }, [dadosFGTS, dadosINSS, dadosEmpregados, dadosSalario]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-[#0e4f6d] to-[#1a6b8a] p-6 rounded-2xl text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-3xl font-black">{metricas.totalEmpregados}</p>
        <p className="text-white/70 text-sm mt-1">Colaboradores Ativos</p>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-3xl font-black">{formatCurrency(metricas.folhaSalarial)}</p>
        <p className="text-white/70 text-sm mt-1">Folha Salarial</p>
      </div>

      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
          </svg>
        </div>
        <p className="text-3xl font-black">{formatCurrency(metricas.totalFGTS)}</p>
        <p className="text-white/70 text-sm mt-1">Total FGTS</p>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-2xl text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-3xl font-black">{formatCurrency(metricas.totalINSS)}</p>
        <p className="text-white/70 text-sm mt-1">Total INSS</p>
      </div>
    </div>
  );
};

export default {
  FGTSPorTipoChart,
  FGTSPorAnoChart,
  FGTSUltimos3MesesChart,
  FGTSMensalChart,
  INSSPorEmpresaChart,
  INSSPorTipoGuiaChart,
  INSSMensalChart,
  AdmissoesDemissoesChart,
  EmpregadosPorSituacaoChart,
  SalarioPorCargoChart,
  TabelaFerias,
  CardsMetricasPessoal
};
