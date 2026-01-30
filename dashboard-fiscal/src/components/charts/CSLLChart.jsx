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
import { trimestres, csllData } from '../../data/mockData';

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
 * Gráfico CSLL (Contribuição Social sobre o Lucro Líquido)
 * Evolução trimestral (Alíquota 9%)
 */
const CSLLChart = () => {
  const chartData = {
    labels: trimestres,
    datasets: [
      {
        label: 'CSLL',
        data: csllData,
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.05)',
        fill: true,
        tension: 0.4,
        borderWidth: 4
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
        beginAtZero: true,
        ticks: {
          callback: (value) => 'R$ ' + value.toLocaleString('pt-BR')
        }
      }
    }
  };

  return (
    <div className="h-[320px] relative">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default CSLLChart;
