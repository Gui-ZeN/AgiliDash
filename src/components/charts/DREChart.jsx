import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { formatCurrency } from '../../utils/formatters';
import { meses } from '../../data/mockData';
import { useTheme } from '../../context/ThemeContext';
import { getChartColors, getChartOptions } from '../../utils/chartTheme';

// Registrar componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * Grafico DRE (Demonstrativo do Resultado do Exercicio)
 * Compara Receita vs Despesa mes a mes
 */
const DREChart = ({ data }) => {
  const { isDarkMode } = useTheme();
  const colors = getChartColors(isDarkMode);

  const chartData = {
    labels: meses,
    datasets: [
      {
        label: 'Receita Bruta',
        data: data.receita,
        backgroundColor: colors.success,
        borderRadius: 4,
      },
      {
        label: 'Despesas/Custos',
        data: data.despesa,
        backgroundColor: colors.danger,
        borderRadius: 4,
      },
    ],
  };

  const options = getChartOptions(isDarkMode, {
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function (context) {
            return context.dataset.label + ': ' + formatCurrency(context.raw);
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: colors.gridColor,
        },
        ticks: {
          color: colors.textColorSecondary,
          callback: (value) => 'R$ ' + (value / 1000).toFixed(0) + 'k',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: colors.textColorSecondary,
        },
      },
    },
  });

  return (
    <div className="h-[400px] relative">
      <Bar key={`dre-${isDarkMode}`} data={chartData} options={options} />
    </div>
  );
};

export default DREChart;
