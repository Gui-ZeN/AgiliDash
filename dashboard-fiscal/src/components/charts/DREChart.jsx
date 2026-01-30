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
import { meses } from '../../data/mockData';

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
 * Gráfico DRE (Demonstrativo do Resultado do Exercício)
 * Compara Receita vs Despesa mês a mês
 */
const DREChart = ({ data }) => {
  const chartData = {
    labels: meses,
    datasets: [
      {
        label: 'Receita Bruta',
        data: data.receita,
        backgroundColor: '#16a34a',
        borderRadius: 4
      },
      {
        label: 'Despesas/Custos',
        data: data.despesa,
        backgroundColor: '#ef4444',
        borderRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
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
        ticks: {
          callback: (value) => 'R$ ' + (value / 1000).toFixed(0) + 'k'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="h-[400px] relative">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default DREChart;
