/**
 * Componentes de Gráficos do Setor Fiscal
 * Baseados nos relatórios do Sistema Domínio
 */

import { useEffect, useRef, useMemo, useState } from 'react';
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
// GRÁFICOS DE FATURAMENTO
// ============================================

/**
 * 1. Gráfico de Rosca - Faturamento por Categoria
 * Mostra Entradas, Serviços e Saídas (totais anuais)
 */
export const FaturamentoPorCategoriaChart = ({ dados }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  const totais = useMemo(() => {
    if (!dados) return { entradas: 0, servicos: 0, saidas: 0 };

    // Se for dados do Resumo por Acumulador
    if (dados.totais) {
      return {
        entradas: dados.totais.entradas || 0,
        servicos: 0, // Serviços vêm separado
        saidas: dados.totais.saidas || 0
      };
    }

    // Se for dados do Demonstrativo Mensal
    if (dados.totais2025) {
      return {
        entradas: dados.totais2025.entradas || 0,
        servicos: dados.totais2025.servicos || 0,
        saidas: dados.totais2025.saidas || 0
      };
    }

    return { entradas: 0, servicos: 0, saidas: 0 };
  }, [dados]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    const valores = [totais.entradas, totais.servicos, totais.saidas].filter(v => v > 0);
    const labels = [];
    const colors = [];

    if (totais.entradas > 0) {
      labels.push('Entradas');
      colors.push(COLORS.success);
    }
    if (totais.servicos > 0) {
      labels.push('Serviços');
      colors.push(COLORS.info);
    }
    if (totais.saidas > 0) {
      labels.push('Saídas');
      colors.push(COLORS.danger);
    }

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: valores,
          backgroundColor: colors.map(c => c + 'CC'),
          borderColor: colors,
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
  }, [totais, isDarkMode]);

  return (
    <div className="h-[300px]">
      <canvas ref={chartRef} />
    </div>
  );
};

/**
 * 2. Gráfico de Barras Verticais - Faturamento por Trimestre
 * Mostra Entradas, Serviços e Saídas por mês agrupados por trimestre
 */
export const FaturamentoPorTrimestreChart = ({ dados, trimestre = null }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  const dadosTrimestre = useMemo(() => {
    if (!dados?.movimentacao2025) return { meses: [], entradas: [], saidas: [], servicos: [] };

    const movimentacao = dados.movimentacao2025;
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    let dadosFiltrados = movimentacao;

    // Filtrar por trimestre se especificado
    if (trimestre) {
      const trimestreRanges = {
        1: [0, 3],  // Jan-Mar
        2: [3, 6],  // Abr-Jun
        3: [6, 9],  // Jul-Set
        4: [9, 12]  // Out-Dez
      };
      const [start, end] = trimestreRanges[trimestre];
      dadosFiltrados = movimentacao.slice(start, end);
    }

    return {
      meses: dadosFiltrados.map((m, i) => trimestre ? mesesNomes[(trimestre - 1) * 3 + i] : mesesNomes[i]),
      entradas: dadosFiltrados.map(m => m.entradas),
      saidas: dadosFiltrados.map(m => m.saidas),
      servicos: dadosFiltrados.map(m => m.servicos)
    };
  }, [dados, trimestre]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dadosTrimestre.meses,
        datasets: [
          {
            label: 'Entradas',
            data: dadosTrimestre.entradas,
            backgroundColor: COLORS.success + 'CC',
            borderColor: COLORS.success,
            borderWidth: 2,
            borderRadius: 6
          },
          {
            label: 'Saídas',
            data: dadosTrimestre.saidas,
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
  }, [dadosTrimestre, isDarkMode]);

  return (
    <div className="h-[350px]">
      <canvas ref={chartRef} />
    </div>
  );
};

/**
 * 3. Tabela de Principais Acumuladores
 * Mostra descrição, percentual e valor das principais categorias
 */
export const TabelaAcumuladores = ({ dados, tipo = 'entradas' }) => {
  const { isDarkMode } = useTheme();

  const itens = useMemo(() => {
    if (!dados) return [];

    const lista = tipo === 'entradas' ? dados.entradas : dados.saidas;
    if (!lista) return [];

    const total = lista.reduce((acc, item) => acc + item.vlrContabil, 0);

    return lista
      .sort((a, b) => b.vlrContabil - a.vlrContabil)
      .slice(0, 10)
      .map(item => ({
        ...item,
        percentual: total > 0 ? ((item.vlrContabil / total) * 100).toFixed(1) : 0
      }));
  }, [dados, tipo]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className={isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}>
          <tr>
            <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Código
            </th>
            <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Descrição
            </th>
            <th className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Valor
            </th>
            <th className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              %
            </th>
          </tr>
        </thead>
        <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
          {itens.map((item, i) => (
            <tr key={i} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}>
              <td className={`px-4 py-3 font-mono text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {item.codigo}
              </td>
              <td className={`px-4 py-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {item.descricao}
              </td>
              <td className={`px-4 py-3 text-right font-semibold ${tipo === 'entradas' ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')}`}>
                {formatCurrency(item.vlrContabil)}
              </td>
              <td className={`px-4 py-3 text-right ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {item.percentual}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================
// GRÁFICOS DE SITUAÇÃO FISCAL
// ============================================

/**
 * 4. Gráfico de Barras Verticais - Impostos por Período
 * Opção de ver ano todo ou meses selecionados
 */
export const ImpostosPorPeriodoChart = ({ dados, mesesSelecionados = null, trimestre = null }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  const dadosGrafico = useMemo(() => {
    if (!dados?.impostosPorMes) return { labels: [], valores: [] };

    const competencias = Object.keys(dados.impostosPorMes).sort();
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    let competenciasFiltradas = competencias;

    // Filtrar por trimestre se especificado
    if (trimestre) {
      const trimestreRanges = {
        1: [1, 2, 3],   // Jan-Mar
        2: [4, 5, 6],   // Abr-Jun
        3: [7, 8, 9],   // Jul-Set
        4: [10, 11, 12] // Out-Dez
      };
      const mesesTrimestre = trimestreRanges[trimestre];
      competenciasFiltradas = competencias.filter(c => {
        const [mes] = c.split('/');
        return mesesTrimestre.includes(parseInt(mes));
      });
    } else if (mesesSelecionados && mesesSelecionados.length > 0) {
      competenciasFiltradas = competencias.filter(c => mesesSelecionados.includes(c));
    }

    const labels = competenciasFiltradas.map(c => {
      const [mes] = c.split('/');
      return mesesNomes[parseInt(mes) - 1];
    });

    const valores = competenciasFiltradas.map(c => {
      const impostos = dados.impostosPorMes[c];
      return impostos.reduce((acc, imp) => acc + imp.impostoRecolher, 0);
    });

    return { labels, valores };
  }, [dados, mesesSelecionados, trimestre]);

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
          label: 'Impostos a Recolher',
          data: dadosGrafico.valores,
          backgroundColor: COLORS.primary + 'CC',
          borderColor: COLORS.primary,
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

  return (
    <div className="h-[300px]">
      <canvas ref={chartRef} />
    </div>
  );
};

/**
 * 5. Gráfico de Barras Horizontais - Por Tipo de Imposto
 * Mostra percentual e valor de cada imposto
 */
export const ImpostosPorTipoChart = ({ dados }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  const dadosGrafico = useMemo(() => {
    if (!dados?.totaisPorImposto) return { labels: [], valores: [] };

    const impostos = Object.entries(dados.totaisPorImposto)
      .map(([nome, val]) => ({ nome, valor: val.recolher }))
      .filter(i => i.valor > 0)
      .sort((a, b) => b.valor - a.valor);

    return {
      labels: impostos.map(i => i.nome),
      valores: impostos.map(i => i.valor)
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
          label: 'Valor',
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
                return `${formatCurrency(context.raw)} (${percentage}%)`;
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
              font: { weight: '600', size: 11 }
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

  return (
    <div className="h-[400px]">
      <canvas ref={chartRef} />
    </div>
  );
};

/**
 * 5.5. Gráfico de Barras Horizontais - Impostos Consolidados
 * Consolida dados de 3 fontes: Resumo Impostos + CSLL + IRPJ
 */
export const ImpostosConsolidadosChart = ({ dadosResumo, dadosCsll, dadosIrpj }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  const dadosGrafico = useMemo(() => {
    const impostos = [];

    // 1. Dados do Resumo de Impostos (mensal)
    if (dadosResumo?.totaisPorImposto) {
      Object.entries(dadosResumo.totaisPorImposto).forEach(([nome, val]) => {
        if (val.recolher > 0) {
          impostos.push({
            nome,
            valor: val.recolher,
            fonte: 'Resumo Impostos'
          });
        }
      });
    }

    // 2. Dados de CSLL (trimestral - somar todos os trimestres)
    if (dadosCsll && Array.isArray(dadosCsll) && dadosCsll.length > 0) {
      const totalCsll = dadosCsll.reduce((acc, trim) => acc + (trim.dados?.csllRecolher || 0), 0);
      if (totalCsll > 0) {
        // Verificar se já existe CSLL no resumo
        const existeCsll = impostos.findIndex(i => i.nome.toUpperCase().includes('CSLL') || i.nome.toUpperCase().includes('CONTRIBUIÇÃO SOCIAL'));
        if (existeCsll >= 0) {
          impostos[existeCsll].valor += totalCsll;
        } else {
          impostos.push({
            nome: 'CSLL',
            valor: totalCsll,
            fonte: 'CSLL Trimestral'
          });
        }
      }
    }

    // 3. Dados de IRPJ (trimestral - somar todos os trimestres)
    if (dadosIrpj && Array.isArray(dadosIrpj) && dadosIrpj.length > 0) {
      const totalIrpj = dadosIrpj.reduce((acc, trim) => acc + (trim.dados?.irpjRecolher || 0), 0);
      if (totalIrpj > 0) {
        // Verificar se já existe IRPJ no resumo
        const existeIrpj = impostos.findIndex(i => i.nome.toUpperCase().includes('IRPJ') || i.nome.toUpperCase().includes('IMPOSTO DE RENDA'));
        if (existeIrpj >= 0) {
          impostos[existeIrpj].valor += totalIrpj;
        } else {
          impostos.push({
            nome: 'IRPJ',
            valor: totalIrpj,
            fonte: 'IRPJ Trimestral'
          });
        }
      }
    }

    // Ordenar por valor decrescente
    impostos.sort((a, b) => b.valor - a.valor);

    // Calcular total para percentuais
    const total = impostos.reduce((acc, i) => acc + i.valor, 0);

    return {
      labels: impostos.map(i => i.nome),
      valores: impostos.map(i => i.valor),
      percentuais: impostos.map(i => total > 0 ? ((i.valor / total) * 100).toFixed(1) : 0),
      total
    };
  }, [dadosResumo, dadosCsll, dadosIrpj]);

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
          label: 'Valor',
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
                const percentage = dadosGrafico.percentuais[context.dataIndex];
                return `${formatCurrency(context.raw)} (${percentage}%)`;
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
              font: { weight: '600', size: 11 }
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

  // Se não há dados, mostrar mensagem
  if (dadosGrafico.valores.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Importe Resumo dos Impostos, CSLL ou IRPJ
        </p>
      </div>
    );
  }

  return (
    <div className="h-[400px]">
      <canvas ref={chartRef} />
    </div>
  );
};

// ============================================
// GRÁFICOS COMPARATIVO 380
// ============================================

/**
 * 6. Gráfico de Rosca - Compra vs Venda
 */
export const CompraVendaChart = ({ dados }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  const totais = useMemo(() => {
    if (!dados?.categorias) return { compra: 0, venda: 0 };
    return {
      compra: dados.categorias.compraComercializacao || 0,
      // Usar total de vendas 380 (Mercadoria + Produto + Exterior)
      venda: dados.categorias.totalVendas380 || dados.categorias.vendaMercadoria || 0
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
        labels: ['Compra', 'Venda'],
        datasets: [{
          data: [totais.compra, totais.venda],
          backgroundColor: [COLORS.info + 'CC', COLORS.success + 'CC'],
          borderColor: [COLORS.info, COLORS.success],
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
                const total = totais.compra + totais.venda;
                const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
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
  }, [totais, isDarkMode]);

  return (
    <div className="h-[300px]">
      <canvas ref={chartRef} />
    </div>
  );
};

/**
 * 6.5. Gráfico de Barras Horizontais - Detalhamento Compra vs Venda (380)
 * Mostra cada categoria de compra e venda separadamente
 */
export const Detalhamento380Chart = ({ dados }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  const dadosGrafico = useMemo(() => {
    if (!dados?.categorias) return { labels: [], valores: [], cores: [] };

    const items = [];

    // Adicionar compras
    if (dados.categorias.compraComercializacao > 0) {
      items.push({
        label: 'Compra p/ Comercialização',
        valor: dados.categorias.compraComercializacao,
        cor: COLORS.info,
        tipo: 'compra'
      });
    }

    // Adicionar vendas
    if (dados.categorias.vendaMercadoria > 0) {
      items.push({
        label: 'Venda de Mercadoria',
        valor: dados.categorias.vendaMercadoria,
        cor: COLORS.success,
        tipo: 'venda'
      });
    }
    if (dados.categorias.vendaProduto > 0) {
      items.push({
        label: 'Venda de Produto',
        valor: dados.categorias.vendaProduto,
        cor: COLORS.secondary,
        tipo: 'venda'
      });
    }
    if (dados.categorias.vendaExterior > 0) {
      items.push({
        label: 'Venda p/ Exterior',
        valor: dados.categorias.vendaExterior,
        cor: COLORS.purple,
        tipo: 'venda'
      });
    }

    // Ordenar por valor
    items.sort((a, b) => b.valor - a.valor);

    return {
      labels: items.map(i => i.label),
      valores: items.map(i => i.valor),
      cores: items.map(i => i.cor)
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
          label: 'Valor',
          data: dadosGrafico.valores,
          backgroundColor: dadosGrafico.cores.map(c => c + 'CC'),
          borderColor: dadosGrafico.cores,
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
                const total = dadosGrafico.valores.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
                return `${formatCurrency(context.raw)} (${percentage}%)`;
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
              font: { weight: '600', size: 11 }
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

  return (
    <div className="h-[250px]">
      <canvas ref={chartRef} />
    </div>
  );
};

/**
 * 7. Gráfico de Rosca - Situação 380
 * Mostra valor vendido vs falta vender
 */
export const Situacao380Chart = ({ dados }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { isDarkMode } = useTheme();

  const situacao = useMemo(() => {
    if (!dados?.categorias) return { vendido: 0, faltaVender: 0 };

    const esperado = dados.categorias.esperado380 || 0;
    // Usar total de vendas 380 (Mercadoria + Produto + Exterior)
    const vendido = dados.categorias.totalVendas380 || dados.categorias.vendaMercadoria || 0;
    const faltaVender = Math.max(0, esperado - vendido);

    return { vendido, faltaVender, esperado };
  }, [dados]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    const valores = [situacao.vendido, situacao.faltaVender];
    const colors = situacao.faltaVender > 0
      ? [COLORS.success, COLORS.warning]
      : [COLORS.success, COLORS.secondary];

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Vendido', 'Falta Vender'],
        datasets: [{
          data: valores,
          backgroundColor: colors.map(c => c + 'CC'),
          borderColor: colors,
          borderWidth: 2,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
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
                const percentage = situacao.esperado > 0
                  ? ((context.raw / situacao.esperado) * 100).toFixed(1)
                  : 0;
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
  }, [situacao, isDarkMode]);

  return (
    <div className="h-[300px]">
      <canvas ref={chartRef} />
    </div>
  );
};

/**
 * 8. Tabela Comparativo 380
 * Período, Compra, Venda, Esperado, Receita Complementar, 380
 */
export const Tabela380 = ({ dados, dadosMensais }) => {
  const { isDarkMode } = useTheme();

  const linhas = useMemo(() => {
    if (!dadosMensais?.movimentacao2025) return [];

    return dadosMensais.movimentacao2025.map(m => {
      // Simplificação: usando saídas como venda e entradas como compra
      const compra = m.entradas * 0.1; // Estimativa: 10% das entradas é comercialização
      const venda = m.saidas;
      const esperado = compra * 1.25;
      const receitaComplementar = Math.max(0, esperado - venda);
      const sit380 = venda >= esperado ? 'OK' : 'Pendente';

      return {
        periodo: m.mes,
        compra,
        venda,
        esperado,
        receitaComplementar,
        sit380
      };
    });
  }, [dadosMensais]);

  // Usar dados do Resumo por Acumulador se disponível
  const resumo = useMemo(() => {
    if (!dados?.categorias) return null;

    const compra = dados.categorias.compraComercializacao || 0;
    // Total de vendas 380 (Mercadoria + Produto + Exterior)
    const venda = dados.categorias.totalVendas380 || dados.categorias.vendaMercadoria || 0;
    const esperado = dados.categorias.esperado380 || (compra * 1.25);
    const receitaComplementar = Math.max(0, esperado - venda);
    const sit380 = venda >= esperado ? 'OK' : 'Pendente';

    return {
      compra,
      venda,
      esperado,
      receitaComplementar,
      sit380
    };
  }, [dados]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className={isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50'}>
          <tr>
            <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Período
            </th>
            <th className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Compra
            </th>
            <th className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Venda
            </th>
            <th className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Esperado
            </th>
            <th className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Rec. Compl.
            </th>
            <th className={`px-4 py-3 text-center text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              380
            </th>
          </tr>
        </thead>
        <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
          {resumo && (
            <tr className={`font-bold ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <td className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                TOTAL ANUAL
              </td>
              <td className={`px-4 py-3 text-right ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {formatCurrency(resumo.compra)}
              </td>
              <td className={`px-4 py-3 text-right ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                {formatCurrency(resumo.venda)}
              </td>
              <td className={`px-4 py-3 text-right ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                {formatCurrency(resumo.esperado)}
              </td>
              <td className={`px-4 py-3 text-right ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                {formatCurrency(resumo.receitaComplementar)}
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  resumo.sit380 === 'OK'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                  {resumo.sit380}
                </span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Cards de Métricas Fiscais
 */
export const CardsMetricasFiscais = ({ dados, dadosImpostos }) => {
  const { isDarkMode } = useTheme();

  const metricas = useMemo(() => {
    let totalImpostos = 0;
    let totalEntradas = 0;
    let totalSaidas = 0;

    if (dadosImpostos?.totaisPorImposto) {
      totalImpostos = Object.values(dadosImpostos.totaisPorImposto)
        .reduce((acc, imp) => acc + imp.recolher, 0);
    }

    if (dados?.totais) {
      totalEntradas = dados.totais.entradas || 0;
      totalSaidas = dados.totais.saidas || 0;
    }

    return {
      totalImpostos,
      totalEntradas,
      totalSaidas,
      saldo: totalEntradas - totalSaidas
    };
  }, [dados, dadosImpostos]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </div>
        <p className="text-3xl font-black">{formatCurrency(metricas.totalEntradas)}</p>
        <p className="text-white/70 text-sm mt-1">Total Entradas</p>
      </div>

      <div className="bg-gradient-to-br from-red-500 to-rose-600 p-6 rounded-2xl text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16V4m0 0l4 4m-4-4l-4 4M7 8v12m0 0l-4-4m4 4l4-4" />
          </svg>
        </div>
        <p className="text-3xl font-black">{formatCurrency(metricas.totalSaidas)}</p>
        <p className="text-white/70 text-sm mt-1">Total Saídas</p>
      </div>

      <div className="bg-gradient-to-br from-[#0e4f6d] to-[#1a6b8a] p-6 rounded-2xl text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
          </svg>
        </div>
        <p className="text-3xl font-black">{formatCurrency(metricas.totalImpostos)}</p>
        <p className="text-white/70 text-sm mt-1">Impostos a Recolher</p>
      </div>

      <div className={`bg-gradient-to-br ${metricas.saldo >= 0 ? 'from-purple-500 to-indigo-600' : 'from-orange-500 to-red-600'} p-6 rounded-2xl text-white shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-3xl font-black">{formatCurrency(metricas.saldo)}</p>
        <p className="text-white/70 text-sm mt-1">Saldo (Ent. - Saí.)</p>
      </div>
    </div>
  );
};

export default {
  FaturamentoPorCategoriaChart,
  FaturamentoPorTrimestreChart,
  TabelaAcumuladores,
  ImpostosPorPeriodoChart,
  ImpostosPorTipoChart,
  ImpostosConsolidadosChart,
  CompraVendaChart,
  Detalhamento380Chart,
  Situacao380Chart,
  Tabela380,
  CardsMetricasFiscais
};
