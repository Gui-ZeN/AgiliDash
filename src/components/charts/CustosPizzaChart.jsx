import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { formatCurrency } from '../../utils/formatters';
import { custosGrupos } from '../../data/mockData';
import { useTheme } from '../../context/ThemeContext';
import { getChartColors, getPieChartOptions } from '../../utils/chartTheme';

// Registrar componentes do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Grafico de Pizza - Grupos de Custos
 * Mostra a distribuicao dos custos por tipo de aquisicao
 */
const CustosPizzaChart = () => {
  const { isDarkMode } = useTheme();
  const colors = getChartColors(isDarkMode);

  const chartData = {
    labels: custosGrupos.labels,
    datasets: [
      {
        data: custosGrupos.data,
        backgroundColor: isDarkMode
          ? ['#f87171', '#fca5a5']
          : ['#ef4444', '#fca5a5'],
        borderWidth: 0,
        hoverOffset: 10
      }
    ]
  };

  const options = getPieChartOptions(isDarkMode, {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: colors.textColor,
          usePointStyle: true,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) label += ': ';
            const value = context.raw;
            const total = context.chart._metasets[context.datasetIndex].total;
            const percentage = ((value / total) * 100).toFixed(1) + '%';
            return label + formatCurrency(value) + ' (' + percentage + ')';
          }
        }
      }
    },
    cutout: '65%'
  });

  return (
    <div className="h-[300px] relative flex justify-center">
      <Doughnut key={`custos-${isDarkMode}`} data={chartData} options={options} />
    </div>
  );
};

export default CustosPizzaChart;
