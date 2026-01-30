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
import { meses, faturamentoData } from '../../data/mockData';

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
 * Gráfico de Evolução do Faturamento Bruto
 * Histórico mensal de emissão de notas
 */
const FaturamentoChart = () => {
  const chartData = {
    labels: meses,
    datasets: [
      {
        label: 'Faturamento Bruto',
        data: faturamentoData,
        backgroundColor: '#0e4f6d',
        borderRadius: 8,
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
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 400000,
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
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default FaturamentoChart;
