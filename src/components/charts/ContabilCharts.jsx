/**
 * Componentes de Gráficos do Setor Contábil
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
  pink: '#ec4899'
};

// Arrays padrão (constantes para evitar recriação em cada render)
const DEFAULT_MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const DEFAULT_VALORES = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

/**
 * 1. Gráfico de Barras - Comparativo Receita x Despesa
 * Fonte: DRE Horizontal
 */
export const ComparativoReceitaDespesaChart = ({ dados }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  // Usar useMemo para evitar recriação de arrays em cada render
  // Prioriza receitasMensais/despesasMensais (soma de todos positivos/negativos)
  // Fallback para receitaBruta/despesasOperacionais se não disponível
  const meses = useMemo(() => dados?.meses || DEFAULT_MESES, [dados?.meses]);
  const receitas = useMemo(() => {
    // Usa receitasMensais (todos positivos) se disponível
    if (dados?.receitasMensais) return dados.receitasMensais;
    return dados?.dados?.receitaBruta || DEFAULT_VALORES;
  }, [dados?.receitasMensais, dados?.dados?.receitaBruta]);
  const despesas = useMemo(() => {
    // Usa despesasMensais (todos negativos) se disponível
    if (dados?.despesasMensais) return dados.despesasMensais;
    if (dados?.dados?.despesasOperacionais) {
      return dados.dados.despesasOperacionais.map(d => Math.abs(d));
    }
    return DEFAULT_VALORES;
  }, [dados?.despesasMensais, dados?.dados?.despesasOperacionais]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: meses,
        datasets: [
          {
            label: 'Receita',
            data: receitas,
            backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.8)' : 'rgba(16, 185, 129, 0.7)',
            borderColor: COLORS.success,
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false
          },
          {
            label: 'Despesa',
            data: despesas,
            backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.8)' : 'rgba(239, 68, 68, 0.7)',
            borderColor: COLORS.danger,
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
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
            cornerRadius: 12,
            displayColors: true,
            callbacks: {
              label: (context) => `${context.dataset.label}: ${formatCurrency(context.raw)}`
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
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
  }, [meses, receitas, despesas, isDarkMode]);

  return (
    <div className="h-[350px]">
      <canvas ref={chartRef} />
    </div>
  );
};

/**
 * 2. Gráfico de Linhas - Variação Anual do Lucro
 * Linha sólida (ano atual) e pontilhada (ano anterior)
 * Fonte: DRE Horizontal
 */
export const VariacaoLucroChart = ({ dadosAtual, dadosAnterior }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  // Calcular lucro mensal (Receita - Despesa) usando useMemo
  // Prioriza receitasMensais/despesasMensais (classificação automática)
  const lucroAtual = useMemo(() => {
    // Se tiver a classificação automática, usa ela
    if (dadosAtual?.receitasMensais && dadosAtual?.despesasMensais) {
      return dadosAtual.receitasMensais.map((rec, i) => rec - dadosAtual.despesasMensais[i]);
    }
    // Fallback para método antigo
    if (!dadosAtual?.dados?.receitaBruta) return DEFAULT_VALORES;
    return dadosAtual.dados.receitaBruta.map((rec, i) => {
      const desp = Math.abs(dadosAtual.dados.despesasOperacionais?.[i] || 0);
      return rec - desp;
    });
  }, [dadosAtual]);

  const lucroAnterior = useMemo(() => {
    // Se tiver a classificação automática, usa ela
    if (dadosAnterior?.receitasMensais && dadosAnterior?.despesasMensais) {
      return dadosAnterior.receitasMensais.map((rec, i) => rec - dadosAnterior.despesasMensais[i]);
    }
    // Fallback para método antigo
    if (!dadosAnterior?.dados?.receitaBruta) return DEFAULT_VALORES;
    return dadosAnterior.dados.receitaBruta.map((rec, i) => {
      const desp = Math.abs(dadosAnterior.dados.despesasOperacionais?.[i] || 0);
      return rec - desp;
    });
  }, [dadosAnterior]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: DEFAULT_MESES,
        datasets: [
          {
            label: '2025',
            data: lucroAtual,
            borderColor: COLORS.primary,
            backgroundColor: isDarkMode ? 'rgba(14, 79, 109, 0.2)' : 'rgba(14, 79, 109, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointBackgroundColor: COLORS.primary,
            pointBorderColor: isDarkMode ? '#1e293b' : 'white',
            pointBorderWidth: 2,
            pointHoverRadius: 8
          },
          {
            label: '2024',
            data: lucroAnterior,
            borderColor: COLORS.secondary,
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [8, 4],
            fill: false,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: COLORS.secondary,
            pointBorderColor: isDarkMode ? '#1e293b' : 'white',
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
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
            cornerRadius: 12,
            callbacks: {
              label: (context) => `${context.dataset.label}: ${formatCurrency(context.raw)}`
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
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
  }, [lucroAtual, lucroAnterior, isDarkMode]);

  return (
    <div className="h-[350px]">
      <canvas ref={chartRef} />
    </div>
  );
};

/**
 * 3. Gráfico de Linhas - Receita x Custo x Estoque
 * Fonte: Balancete (consolidado 12 meses)
 */
export const ReceitaCustoEstoqueChart = ({ dados }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  const meses = useMemo(() => dados?.meses || DEFAULT_MESES, [dados?.meses]);
  const receita = useMemo(() => dados?.series?.receita || DEFAULT_VALORES, [dados?.series?.receita]);
  const custo = useMemo(() => dados?.series?.custo || DEFAULT_VALORES, [dados?.series?.custo]);
  const estoque = useMemo(() => dados?.series?.estoque || DEFAULT_VALORES, [dados?.series?.estoque]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: meses,
        datasets: [
          {
            label: 'Receita',
            data: receita,
            borderColor: COLORS.success,
            backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: COLORS.success,
            pointBorderColor: isDarkMode ? '#1e293b' : 'white',
            pointBorderWidth: 2
          },
          {
            label: 'Custo',
            data: custo,
            borderColor: COLORS.danger,
            backgroundColor: 'transparent',
            borderWidth: 3,
            fill: false,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: COLORS.danger,
            pointBorderColor: isDarkMode ? '#1e293b' : 'white',
            pointBorderWidth: 2
          },
          {
            label: 'Estoque',
            data: estoque,
            borderColor: COLORS.info,
            backgroundColor: 'transparent',
            borderWidth: 3,
            fill: false,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: COLORS.info,
            pointBorderColor: isDarkMode ? '#1e293b' : 'white',
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
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
            cornerRadius: 12,
            callbacks: {
              label: (context) => `${context.dataset.label}: ${formatCurrency(context.raw)}`
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
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
  }, [meses, receita, custo, estoque, isDarkMode]);

  return (
    <div className="h-[350px]">
      <canvas ref={chartRef} />
    </div>
  );
};

/**
 * 4. Gráfico de Linhas - Movimentação Bancária
 * Fonte: Balancete - BANCOS CONTA MOVIMENTO
 */
export const MovimentacaoBancariaChart = ({ dados }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  const meses = useMemo(() => dados?.meses || DEFAULT_MESES, [dados?.meses]);
  const saldos = useMemo(() => dados?.series?.bancosMovimento || DEFAULT_VALORES, [dados?.series?.bancosMovimento]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    // Gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, isDarkMode ? 'rgba(14, 79, 109, 0.4)' : 'rgba(14, 79, 109, 0.3)');
    gradient.addColorStop(1, isDarkMode ? 'rgba(14, 79, 109, 0)' : 'rgba(14, 79, 109, 0)');

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: meses,
        datasets: [
          {
            label: 'Saldo Bancário',
            data: saldos,
            borderColor: COLORS.primary,
            backgroundColor: gradient,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointBackgroundColor: COLORS.primary,
            pointBorderColor: isDarkMode ? '#1e293b' : 'white',
            pointBorderWidth: 3,
            pointHoverRadius: 10
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            titleColor: isDarkMode ? '#f1f5f9' : '#1e293b',
            bodyColor: isDarkMode ? '#cbd5e1' : '#475569',
            borderColor: COLORS.primary,
            borderWidth: 2,
            padding: 16,
            cornerRadius: 12,
            callbacks: {
              label: (context) => `Saldo: ${formatCurrency(context.raw)}`
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
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
  }, [meses, saldos, isDarkMode]);

  return (
    <div className="h-[300px]">
      <canvas ref={chartRef} />
    </div>
  );
};

/**
 * 5. Gráfico de Linhas - Aplicações Financeiras
 * Fonte: Balancete - APLICAÇÕES FINANCEIRAS DE LIQUIDEZ IMEDIATA
 */
export const AplicacoesFinanceirasChart = ({ dados }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  const meses = useMemo(() => dados?.meses || DEFAULT_MESES, [dados?.meses]);
  const saldos = useMemo(() => dados?.series?.aplicacoesFinanceiras || DEFAULT_VALORES, [dados?.series?.aplicacoesFinanceiras]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    // Gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, isDarkMode ? 'rgba(88, 163, 164, 0.4)' : 'rgba(88, 163, 164, 0.3)');
    gradient.addColorStop(1, isDarkMode ? 'rgba(88, 163, 164, 0)' : 'rgba(88, 163, 164, 0)');

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: meses,
        datasets: [
          {
            label: 'Aplicações',
            data: saldos,
            borderColor: COLORS.secondary,
            backgroundColor: gradient,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointBackgroundColor: COLORS.secondary,
            pointBorderColor: isDarkMode ? '#1e293b' : 'white',
            pointBorderWidth: 3,
            pointHoverRadius: 10
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            titleColor: isDarkMode ? '#f1f5f9' : '#1e293b',
            bodyColor: isDarkMode ? '#cbd5e1' : '#475569',
            borderColor: COLORS.secondary,
            borderWidth: 2,
            padding: 16,
            cornerRadius: 12,
            callbacks: {
              label: (context) => `Aplicações: ${formatCurrency(context.raw)}`
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
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
  }, [meses, saldos, isDarkMode]);

  return (
    <div className="h-[300px]">
      <canvas ref={chartRef} />
    </div>
  );
};

/**
 * Tabela de Comparativo Mensal
 * Mês | Entradas | Saídas | Lucro
 */
export const TabelaComparativoMensal = ({ dados }) => {
  const { isDarkMode } = useTheme();

  // Prioriza receitasMensais/despesasMensais (classificação automática)
  const receitas = useMemo(() => {
    if (dados?.receitasMensais) return dados.receitasMensais;
    return dados?.dados?.receitaBruta || DEFAULT_VALORES;
  }, [dados?.receitasMensais, dados?.dados?.receitaBruta]);
  const despesas = useMemo(() => {
    if (dados?.despesasMensais) return dados.despesasMensais;
    if (dados?.dados?.despesasOperacionais) {
      return dados.dados.despesasOperacionais.map(d => Math.abs(d));
    }
    return DEFAULT_VALORES;
  }, [dados?.despesasMensais, dados?.dados?.despesasOperacionais]);

  const { totalReceita, totalDespesa, totalLucro } = useMemo(() => {
    const totalRec = receitas.reduce((a, b) => a + b, 0);
    const totalDesp = despesas.reduce((a, b) => a + b, 0);
    return {
      totalReceita: totalRec,
      totalDespesa: totalDesp,
      totalLucro: totalRec - totalDesp
    };
  }, [receitas, despesas]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className={isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}>
          <tr>
            <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Mês
            </th>
            <th className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Entradas (R$)
            </th>
            <th className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Saídas (R$)
            </th>
            <th className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Lucro Líquido
            </th>
          </tr>
        </thead>
        <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
          {DEFAULT_MESES.map((mes, i) => {
            const lucro = receitas[i] - despesas[i];
            return (
              <tr
                key={mes}
                className={`transition-colors ${isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}
              >
                <td className={`px-4 py-3 font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {mes}/2025
                </td>
                <td className={`px-4 py-3 text-right ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {formatCurrency(receitas[i])}
                </td>
                <td className={`px-4 py-3 text-right ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>
                  {formatCurrency(despesas[i])}
                </td>
                <td className={`px-4 py-3 text-right font-bold ${lucro >= 0
                  ? (isDarkMode ? 'text-emerald-700' : 'text-emerald-700')
                  : (isDarkMode ? 'text-red-400' : 'text-red-600')
                  }`}>
                  {formatCurrency(lucro)}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className={isDarkMode ? 'bg-slate-700/50' : 'bg-slate-100'}>
          <tr>
            <td className={`px-4 py-3 font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              TOTAL
            </td>
            <td className={`px-4 py-3 text-right font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
              {formatCurrency(totalReceita)}
            </td>
            <td className={`px-4 py-3 text-right font-bold ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>
              {formatCurrency(totalDespesa)}
            </td>
            <td className={`px-4 py-3 text-right font-bold text-lg ${totalLucro >= 0
              ? (isDarkMode ? 'text-emerald-700' : 'text-emerald-700')
              : (isDarkMode ? 'text-red-400' : 'text-red-600')
              }`}>
              {formatCurrency(totalLucro)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

/**
 * Cards de Métricas (Receita, Despesa, Lucro)
 */
export const CardsMetricasContabil = ({ dados }) => {
  const { isDarkMode } = useTheme();

  // Prioriza receitasMensais/despesasMensais (classificação automática)
  const receitas = useMemo(() => {
    if (dados?.receitasMensais) return dados.receitasMensais;
    return dados?.dados?.receitaBruta || DEFAULT_VALORES;
  }, [dados?.receitasMensais, dados?.dados?.receitaBruta]);
  const despesas = useMemo(() => {
    if (dados?.despesasMensais) return dados.despesasMensais;
    if (dados?.dados?.despesasOperacionais) {
      return dados.dados.despesasOperacionais.map(d => Math.abs(d));
    }
    return DEFAULT_VALORES;
  }, [dados?.despesasMensais, dados?.dados?.despesasOperacionais]);

  const { totalReceita, totalDespesa, totalLucro, margem, variacaoReceita } = useMemo(() => {
    const totalRec = receitas.reduce((a, b) => a + b, 0);
    const totalDesp = despesas.reduce((a, b) => a + b, 0);
    const lucro = totalRec - totalDesp;
    const marg = totalRec > 0 ? ((lucro / totalRec) * 100).toFixed(1) : 0;

    // Variação vs mês anterior
    const receitaAtual = receitas[receitas.length - 1] || 0;
    const receitaAnterior = receitas[receitas.length - 2] || 0;
    const variacao = receitaAnterior > 0
      ? (((receitaAtual - receitaAnterior) / receitaAnterior) * 100).toFixed(1)
      : 0;

    return {
      totalReceita: totalRec,
      totalDespesa: totalDesp,
      totalLucro: lucro,
      margem: marg,
      variacaoReceita: variacao
    };
  }, [receitas, despesas]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Receita */}
      <div className="bg-emerald-700 p-6 rounded-xl text-white shadow-md">
        <div className="flex items-center justify-between mb-4">
          <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
            {variacaoReceita > 0 ? '+' : ''}{variacaoReceita}%
          </span>
        </div>
        <p className="text-3xl font-bold">{formatCurrency(totalReceita)}</p>
        <p className="text-white/70 text-sm mt-1">Receita Total</p>
      </div>

      {/* Despesa */}
      <div className="bg-red-600 p-6 rounded-xl text-white shadow-md">
        <div className="flex items-center justify-between mb-4">
          <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        </div>
        <p className="text-3xl font-bold">{formatCurrency(totalDespesa)}</p>
        <p className="text-white/70 text-sm mt-1">Despesas Total</p>
      </div>

      {/* Lucro */}
      <div className={`${totalLucro >= 0 ? 'bg-[#0e4f6d]' : 'bg-orange-600'} p-6 rounded-xl text-white shadow-md`}>
        <div className="flex items-center justify-between mb-4">
          <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-3xl font-bold">{formatCurrency(totalLucro)}</p>
        <p className="text-white/70 text-sm mt-1">Lucro Líquido</p>
      </div>

      {/* Margem */}
      <div className="bg-slate-700 p-6 rounded-xl text-white shadow-md">
        <div className="flex items-center justify-between mb-4">
          <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-3xl font-bold">{margem}%</p>
        <p className="text-white/70 text-sm mt-1">Margem de Lucro</p>
      </div>
    </div>
  );
};

export default {
  ComparativoReceitaDespesaChart,
  VariacaoLucroChart,
  ReceitaCustoEstoqueChart,
  MovimentacaoBancariaChart,
  AplicacoesFinanceirasChart,
  TabelaComparativoMensal,
  CardsMetricasContabil
};
