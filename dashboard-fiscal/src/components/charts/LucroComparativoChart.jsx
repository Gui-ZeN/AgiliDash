import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { formatCurrency } from '../../utils/formatters';
import { meses, dreData2024, dreData2025 } from '../../data/mockData';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Gráfico Comparativo de Lucro Líquido (2024 vs 2025)
 * Mostra a variação do lucro ao longo dos meses em ambos os anos
 */
const LucroComparativoChart = () => {
  const chartData = {
    labels: meses,
    datasets: [
      {
        label: 'Lucro Líquido 2024',
        data: dreData2024.lucro,
        borderColor: '#94a3b8',
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 3
      },
      {
        label: 'Lucro Líquido 2025',
        data: dreData2025.lucro,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 4,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
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
    <div className="h-[350px] relative">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LucroComparativoChart;
