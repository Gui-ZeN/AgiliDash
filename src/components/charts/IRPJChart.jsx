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
import { trimestres, irpjTotalData, irpjAdicional } from '../../data/mockData';
import { useTheme } from '../../context/ThemeContext';
import { getChartColors, getChartOptions } from '../../utils/chartTheme';

// Registrar componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * Grafico IRPJ (Imposto de Renda Pessoa Juridica)
 * Composicao: Base (15%) vs Adicional (10%)
 */
const IRPJChart = () => {
  const { isDarkMode } = useTheme();
  const colors = getChartColors(isDarkMode);

  // Calcular IRPJ base (total - adicional)
  const irpjBase = irpjTotalData.map((total, index) => total - irpjAdicional[index]);

  const chartData = {
    labels: trimestres,
    datasets: [
      {
        label: 'IRPJ Base (15%)',
        data: irpjBase,
        backgroundColor: colors.primary,
        borderRadius: 6,
      },
      {
        label: 'Adicional IRPJ (10%)',
        data: irpjAdicional,
        backgroundColor: colors.danger,
        borderRadius: 6,
      },
    ],
  };

  const options = getChartOptions(isDarkMode, {
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: colors.textColor },
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
      <Bar key={`irpj-${isDarkMode}`} data={chartData} options={options} />
    </div>
  );
};

export default IRPJChart;
