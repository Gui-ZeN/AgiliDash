import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { formatCurrency } from '../../utils/formatters';
import { custosGrupos } from '../../data/mockData';

// Registrar componentes do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Gráfico de Pizza - Grupos de Custos
 * Mostra a distribuição dos custos por tipo de aquisição
 */
const CustosPizzaChart = () => {
  const chartData = {
    labels: custosGrupos.labels,
    datasets: [
      {
        data: custosGrupos.data,
        backgroundColor: ['#ef4444', '#fca5a5'],
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

export default CustosPizzaChart;
