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
import { trimestres, csllData } from '../../data/mockData';
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
 * Grafico CSLL (Contribuicao Social sobre o Lucro Liquido)
 * Evolucao trimestral (Aliquota 9%)
 */
const CSLLChart = () => {
  const { isDarkMode } = useTheme();
  const colors = getChartColors(isDarkMode);

  const chartData = {
    labels: trimestres,
    datasets: [
      {
        label: 'CSLL',
        data: csllData,
        borderColor: colors.info,
        backgroundColor: isDarkMode ? 'rgba(56, 189, 248, 0.1)' : 'rgba(6, 182, 212, 0.05)',
        fill: true,
        tension: 0.4,
        borderWidth: 4,
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
        beginAtZero: true,
        grid: { color: colors.gridColor },
        ticks: {
          color: colors.textColorSecondary,
          callback: (value) => 'R$ ' + value.toLocaleString('pt-BR'),
        },
      },
      x: {
        grid: { display: false },
        ticks: { color: colors.textColorSecondary },
      },
    },
  });

  return (
    <div className="h-[320px] relative">
      <Line key={`csll-${isDarkMode}`} data={chartData} options={options} />
    </div>
  );
};

export default CSLLChart;
