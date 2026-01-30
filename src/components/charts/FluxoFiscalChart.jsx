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
import { meses, entradasData, saidasData } from '../../data/mockData';

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
 * Gráfico de Fluxo Mensal Fiscal (Barras Horizontais)
 * Comparativo mês a mês: Entradas vs Saídas
 */
const FluxoFiscalChart = () => {
  const chartData = {
    labels: meses,
    datasets: [
      {
        label: 'Entradas',
        data: entradasData,
        backgroundColor: '#ef4444',
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.8
      },
      {
        label: 'Saídas',
        data: saidasData,
        backgroundColor: '#22c55e',
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.8
      }
    ]
  };

  const options = {
    indexAxis: 'y', // Barras horizontais
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + formatCurrency(context.raw);
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: '#f1f5f9'
        },
        ticks: {
          callback: (value) => 'R$ ' + (value / 1000000).toFixed(1) + 'M'
        }
      },
      y: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="h-[500px] relative">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default FluxoFiscalChart;
