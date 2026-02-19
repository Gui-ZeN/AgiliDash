import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { formatCurrency } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';
import { getChartColors, getChartOptions, getPieChartOptions } from '../../utils/chartTheme';

const MESES_LABELS = [
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

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

/**
 * Grafico de Despesas Administrativas por mes
 */
export const DespesasMensaisChart = ({ despesasMensais }) => {
  const { isDarkMode } = useTheme();
  const colors = getChartColors(isDarkMode);

  const data = {
    labels: MESES_LABELS,
    datasets: [
      {
        label: 'Despesas Administrativas',
        data: despesasMensais,
        backgroundColor: colors.warning,
        borderRadius: 6,
        barThickness: 24,
      },
    ],
  };

  const options = getChartOptions(isDarkMode, {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return formatCurrency(context.raw);
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 11, weight: '500' },
          color: colors.textColorSecondary,
        },
      },
      y: {
        grid: { color: colors.gridColor },
        ticks: {
          font: { size: 11 },
          color: colors.textColorSecondary,
          callback: function (value) {
            return formatCurrency(value);
          },
        },
      },
    },
  });

  return (
    <div className="h-[280px]">
      <Bar key={`despesas-${isDarkMode}`} data={data} options={options} />
    </div>
  );
};

/**
 * Grafico de Pizza - Despesas por Categoria
 */
export const DespesasCategoriaChart = ({ despesasPorCategoria }) => {
  const { isDarkMode } = useTheme();
  const colors = getChartColors(isDarkMode);

  const data = {
    labels: despesasPorCategoria.labels,
    datasets: [
      {
        data: despesasPorCategoria.data,
        backgroundColor: isDarkMode
          ? ['#fbbf24', '#facc15', '#a3e635', '#4ade80', '#2dd4bf', '#38bdf8']
          : ['#f59e0b', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4'],
        borderColor: isDarkMode ? '#1e293b' : '#ffffff',
        borderWidth: 3,
        hoverOffset: 10,
      },
    ],
  };

  const options = getPieChartOptions(isDarkMode, {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: colors.textColor,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 12,
          font: {
            size: 11,
            weight: '500',
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(context.raw)} (${percentage}%)`;
          },
        },
      },
    },
  });

  return (
    <div className="h-[250px]">
      <Doughnut key={`cat-${isDarkMode}`} data={data} options={options} />
    </div>
  );
};

export default DespesasMensaisChart;
