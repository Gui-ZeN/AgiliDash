/**
 * Configuracoes de tema para graficos Chart.js
 * Fornece cores e estilos baseados no dark mode
 */

export const getChartColors = (isDarkMode) => ({
  // Cores de texto
  textColor: isDarkMode ? '#e2e8f0' : '#334155',
  textColorSecondary: isDarkMode ? '#94a3b8' : '#64748b',

  // Cores de grid
  gridColor: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)',

  // Cores de fundo
  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
  tooltipBackground: isDarkMode ? '#334155' : '#1e293b',

  // Cores primarias
  primary: '#0e4f6d',
  primaryLight: '#58a3a4',

  // Cores semanticas
  success: isDarkMode ? '#4ade80' : '#16a34a',
  danger: isDarkMode ? '#f87171' : '#ef4444',
  warning: isDarkMode ? '#fbbf24' : '#f59e0b',
  info: isDarkMode ? '#38bdf8' : '#0ea5e9',

  // Paleta para graficos de pizza
  palette: isDarkMode
    ? ['#38bdf8', '#4ade80', '#fbbf24', '#f87171', '#a78bfa', '#fb923c', '#2dd4bf', '#f472b6']
    : ['#0ea5e9', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316', '#14b8a6', '#ec4899']
});

export const getChartOptions = (isDarkMode, customOptions = {}) => {
  const colors = getChartColors(isDarkMode);

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: colors.textColor,
          padding: 16,
          usePointStyle: true,
          font: {
            family: 'Inter',
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: colors.tooltipBackground,
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          family: 'Inter',
          size: 13,
          weight: '600'
        },
        bodyFont: {
          family: 'Inter',
          size: 12
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: colors.textColorSecondary,
          font: {
            family: 'Inter',
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: colors.gridColor
        },
        ticks: {
          color: colors.textColorSecondary,
          font: {
            family: 'Inter',
            size: 11
          }
        }
      }
    },
    ...customOptions
  };
};

export const getPieChartOptions = (isDarkMode, customOptions = {}) => {
  const colors = getChartColors(isDarkMode);

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: colors.textColor,
          padding: 16,
          usePointStyle: true,
          font: {
            family: 'Inter',
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: colors.tooltipBackground,
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          family: 'Inter',
          size: 13,
          weight: '600'
        },
        bodyFont: {
          family: 'Inter',
          size: 12
        }
      }
    },
    ...customOptions
  };
};
