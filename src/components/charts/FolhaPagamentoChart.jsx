import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { meses } from '../../data/mockData';
import { formatCurrency } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';
import { getChartColors, getChartOptions } from '../../utils/chartTheme';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Grafico de Folha de Pagamento por mes
 */
const FolhaPagamentoChart = ({ folhaPorMes, encargosPorMes }) => {
  const { isDarkMode } = useTheme();
  const colors = getChartColors(isDarkMode);

  const data = {
    labels: meses,
    datasets: [
      {
        label: 'Salarios',
        data: folhaPorMes,
        backgroundColor: colors.primary,
        borderRadius: 6,
        barThickness: 20
      },
      {
        label: 'Encargos',
        data: encargosPorMes,
        backgroundColor: colors.primaryLight,
        borderRadius: 6,
        barThickness: 20
      }
    ]
  };

  const options = getChartOptions(isDarkMode, {
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: colors.textColor,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12,
            weight: '600'
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 11, weight: '500' },
          color: colors.textColorSecondary
        }
      },
      y: {
        grid: { color: colors.gridColor },
        ticks: {
          font: { size: 11 },
          color: colors.textColorSecondary,
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  });

  return (
    <div className="h-[300px]">
      <Bar key={`folha-${isDarkMode}`} data={data} options={options} />
    </div>
  );
};

export default FolhaPagamentoChart;
