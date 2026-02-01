import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { formatCurrency } from '../../utils/formatters';
import { meses, dreData2024, dreData2025 } from '../../data/mockData';
import { useTheme } from '../../context/ThemeContext';
import { getChartColors, getChartOptions } from '../../utils/chartTheme';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Grafico Comparativo de Lucro Liquido (2024 vs 2025)
 * Mostra a variacao do lucro ao longo dos meses em ambos os anos
 */
const LucroComparativoChart = () => {
  const { isDarkMode } = useTheme();
  const colors = getChartColors(isDarkMode);

  const chartData = {
    labels: meses,
    datasets: [
      {
        label: 'Lucro Liquido 2024',
        data: dreData2024.lucro,
        borderColor: isDarkMode ? '#64748b' : '#94a3b8',
        backgroundColor: isDarkMode ? 'rgba(100, 116, 139, 0.1)' : 'rgba(148, 163, 184, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 3
      },
      {
        label: 'Lucro Liquido 2025',
        data: dreData2025.lucro,
        borderColor: colors.success,
        backgroundColor: isDarkMode ? 'rgba(74, 222, 128, 0.1)' : 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 4,
        fill: true
      }
    ]
  };

  const options = getChartOptions(isDarkMode, {
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: colors.textColor
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + formatCurrency(context.raw);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: colors.gridColor
        },
        ticks: {
          color: colors.textColorSecondary,
          callback: (value) => 'R$ ' + (value / 1000).toFixed(0) + 'k'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: colors.textColorSecondary
        }
      }
    }
  });

  return (
    <div className="h-[350px] relative">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LucroComparativoChart;
