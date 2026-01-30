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
import { meses } from '../../data/mockData';
import { formatCurrency } from '../../utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Gráfico de Folha de Pagamento por mês
 */
const FolhaPagamentoChart = ({ folhaPorMes, encargosPorMes }) => {
  const data = {
    labels: meses,
    datasets: [
      {
        label: 'Salários',
        data: folhaPorMes,
        backgroundColor: '#0e4f6d',
        borderRadius: 6,
        barThickness: 20
      },
      {
        label: 'Encargos',
        data: encargosPorMes,
        backgroundColor: '#58a3a4',
        borderRadius: 6,
        barThickness: 20
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12,
            weight: '600'
          }
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 11, weight: '500' },
          color: '#64748b'
        }
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: {
          font: { size: 11 },
          color: '#64748b',
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  return (
    <div className="h-[300px]">
      <Bar data={data} options={options} />
    </div>
  );
};

export default FolhaPagamentoChart;
