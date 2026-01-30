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
import { meses, entradasData, saidasData } from '../../data/mockData';

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
 * Gráfico de Movimentação Financeira Anual
 * Mostra entradas vs saídas ao longo do ano
 */
const MovimentacaoChart = () => {
  const chartData = {
    labels: meses,
    datasets: [
      {
        label: 'Entradas',
        data: entradasData,
        borderColor: '#0e4f6d',
        backgroundColor: 'rgba(14, 79, 109, 0.05)',
        fill: true,
        tension: 0.4,
        borderWidth: 3
      },
      {
        label: 'Saídas',
        data: saidasData,
        borderColor: '#58a3a4',
        borderDash: [5, 5],
        tension: 0.4,
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => 'R$ ' + (value / 1000000).toFixed(1) + 'M'
        }
      }
    }
  };

  return (
    <div className="h-[400px] relative">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default MovimentacaoChart;
