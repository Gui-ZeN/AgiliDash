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
import { meses, faturamentoData } from '../../data/mockData';
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
 * Grafico de Evolucao do Faturamento Bruto
 * Historico mensal de emissao de notas
 */
const FaturamentoChart = () => {
  const { isDarkMode } = useTheme();
  const colors = getChartColors(isDarkMode);

  const chartData = {
    labels: meses,
    datasets: [
      {
        label: 'Faturamento Bruto',
        data: faturamentoData,
        backgroundColor: colors.primary,
        borderRadius: 8,
        barThickness: 24
      }
    ]
  };

  const options = getChartOptions(isDarkMode, {
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 400000,
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
      <Bar key={`faturamento-${isDarkMode}`} data={chartData} options={options} />
    </div>
  );
};

export default FaturamentoChart;
