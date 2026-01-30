import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { formatCurrency } from '../../utils/formatters';
import { receitaGrupos } from '../../data/mockData';

// Registrar componentes do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Gráfico de Pizza - Grupos de Receitas
 * Mostra a distribuição das receitas por natureza de venda
 */
const ReceitaPizzaChart = () => {
  const chartData = {
    labels: receitaGrupos.labels,
    datasets: [
      {
        data: receitaGrupos.data,
        backgroundColor: ['#22c55e', '#86efac', '#166534'],
        borderWidth: 0,
        hoverOffset: 10
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
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
  };

  return (
    <div className="h-[300px] relative flex justify-center">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default ReceitaPizzaChart;
