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
import { trimestres, irpjTotalData, irpjAdicional } from '../../data/mockData';

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
 * Gráfico IRPJ (Imposto de Renda Pessoa Jurídica)
 * Composição: Base (15%) vs Adicional (10%)
 */
const IRPJChart = () => {
  // Calcular IRPJ base (total - adicional)
  const irpjBase = irpjTotalData.map((total, index) => total - irpjAdicional[index]);

  const chartData = {
    labels: trimestres,
    datasets: [
      {
        label: 'IRPJ Base (15%)',
        data: irpjBase,
        backgroundColor: '#0e4f6d',
        borderRadius: 6
      },
      {
        label: 'Adicional IRPJ (10%)',
        data: irpjAdicional,
        backgroundColor: '#ef4444',
        borderRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
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
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default IRPJChart;
