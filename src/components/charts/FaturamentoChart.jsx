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
import { useTheme } from '../../context/ThemeContext';
import { getChartColors, getChartOptions } from '../../utils/chartTheme';

// Registrar componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Mock data para Entradas e Saídas mensais
const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const entradasMock = [
  2595763, 2247713, 2052673, 2498739, 2423405, 3642289, 4958289, 2222369, 10651793, 10616332,
  16392351, 4012352,
];
const saidasMock = [
  577643, 500914, 529673, 616527, 521590, 574772, 692399, 631988, 644739, 526565, 502744, 698934,
];

/**
 * Grafico de Evolucao Mensal - Entradas vs Saidas
 * Historico mensal comparativo
 */
const FaturamentoChart = () => {
  const { isDarkMode } = useTheme();
  const colors = getChartColors(isDarkMode);

  const chartData = {
    labels: meses,
    datasets: [
      {
        label: 'Entradas',
        data: entradasMock,
        backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.8)' : 'rgba(16, 185, 129, 0.7)',
        borderColor: '#10b981',
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: 'Saídas',
        data: saidasMock,
        backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.8)' : 'rgba(239, 68, 68, 0.7)',
        borderColor: '#ef4444',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const options = getChartOptions(isDarkMode, {
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: colors.textColor,
          font: { weight: 'bold', size: 12 },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            return `${context.dataset.label}: R$ ${value.toLocaleString('pt-BR')}`;
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
          callback: (value) => 'R$ ' + (value / 1000000).toFixed(1) + 'M',
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
    <div className="h-[350px] relative">
      <Bar key={`faturamento-${isDarkMode}`} data={chartData} options={options} />
    </div>
  );
};

export default FaturamentoChart;
