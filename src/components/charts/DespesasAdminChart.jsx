import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
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
  ArcElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Gráfico de Despesas Administrativas por mês
 */
export const DespesasMensaisChart = ({ despesasMensais }) => {
  const data = {
    labels: meses,
    datasets: [
      {
        label: 'Despesas Administrativas',
        data: despesasMensais,
        backgroundColor: '#f59e0b',
        borderRadius: 6,
        barThickness: 24
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return formatCurrency(context.raw);
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
    <div className="h-[280px]">
      <Bar data={data} options={options} />
    </div>
  );
};

/**
 * Gráfico de Pizza - Despesas por Categoria
 */
export const DespesasCategoriaChart = ({ despesasPorCategoria }) => {
  const data = {
    labels: despesasPorCategoria.labels,
    datasets: [
      {
        data: despesasPorCategoria.data,
        backgroundColor: [
          '#f59e0b',
          '#eab308',
          '#84cc16',
          '#22c55e',
          '#14b8a6',
          '#06b6d4'
        ],
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 10
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 12,
          font: {
            size: 11,
            weight: '500'
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
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(context.raw)} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="h-[250px]">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default DespesasMensaisChart;
