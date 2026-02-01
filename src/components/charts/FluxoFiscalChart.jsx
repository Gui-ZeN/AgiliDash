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
import { formatCurrency } from '../../utils/formatters';
import { meses, entradasData, saidasData } from '../../data/mockData';
import { useTheme } from '../../context/ThemeContext';
import { getChartColors, getChartOptions } from '../../utils/chartTheme';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Grafico de Fluxo Mensal Fiscal (Barras Horizontais)
 * Comparativo mes a mes: Entradas vs Saidas
 */
const FluxoFiscalChart = () => {
  const { isDarkMode } = useTheme();
  const colors = getChartColors(isDarkMode);

  const chartData = {
    labels: meses,
    datasets: [
      {
        label: 'Entradas',
        data: entradasData,
        backgroundColor: colors.danger,
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.8
      },
      {
        label: 'Saidas',
        data: saidasData,
        backgroundColor: colors.success,
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.8
      }
    ]
  };

  const options = getChartOptions(isDarkMode, {
    indexAxis: 'y', // Barras horizontais
    plugins: {
      legend: {
        position: 'top',
        labels: { color: colors.textColor }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + formatCurrency(context.raw);
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: colors.gridColor },
        ticks: {
          color: colors.textColorSecondary,
          callback: (value) => 'R$ ' + (value / 1000000).toFixed(1) + 'M'
        }
      },
      y: {
        grid: { display: false },
        ticks: { color: colors.textColorSecondary }
      }
    }
  });

  return (
    <div className="h-[500px] relative">
      <Bar key={`fluxo-${isDarkMode}`} data={chartData} options={options} />
    </div>
  );
};

export default FluxoFiscalChart;
