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
  Filler,
} from 'chart.js';
import { meses, entradasData, saidasData } from '../../data/mockData';
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
 * Grafico de Movimentacao Financeira Anual
 * Mostra entradas vs saidas ao longo do ano
 */
const MovimentacaoChart = () => {
  const { isDarkMode } = useTheme();
  const colors = getChartColors(isDarkMode);

  const chartData = {
    labels: meses,
    datasets: [
      {
        label: 'Entradas',
        data: entradasData,
        borderColor: colors.primary,
        backgroundColor: isDarkMode ? 'rgba(14, 79, 109, 0.2)' : 'rgba(14, 79, 109, 0.05)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
      },
      {
        label: 'Saidas',
        data: saidasData,
        borderColor: colors.primaryLight,
        borderDash: [5, 5],
        tension: 0.4,
        borderWidth: 2,
      },
    ],
  };

  const options = getChartOptions(isDarkMode, {
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        grid: { color: colors.gridColor },
        ticks: {
          color: colors.textColorSecondary,
          callback: (value) => 'R$ ' + (value / 1000000).toFixed(1) + 'M',
        },
      },
      x: {
        grid: { display: false },
        ticks: { color: colors.textColorSecondary },
      },
    },
  });

  return (
    <div className="h-[400px] relative">
      <Line key={`movimentacao-${isDarkMode}`} data={chartData} options={options} />
    </div>
  );
};

export default MovimentacaoChart;
