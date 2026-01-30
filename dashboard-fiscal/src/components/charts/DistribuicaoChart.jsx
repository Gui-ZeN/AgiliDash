import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { formatCurrency, calculatePercentage } from '../../utils/formatters';
import { entradasData, saidasData } from '../../data/mockData';

// Registrar componentes do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Gráfico de Distribuição do Fluxo (Doughnut)
 * Comparativo entrada e saída
 */
const DistribuicaoChart = ({ onDataCalculated }) => {
  // Calcular totais
  const totalEntradas = entradasData.reduce((a, b) => a + b, 0);
  const totalSaidas = saidasData.reduce((a, b) => a + b, 0);
  const totalServicos = 0; // Conforme análise, valores zerados
  const totalGeral = totalEntradas + totalSaidas + totalServicos;

  // Notificar o componente pai sobre os dados calculados
  if (onDataCalculated) {
    onDataCalculated({
      totalEntradas,
      totalSaidas,
      totalServicos,
      totalGeral,
      percEntradas: calculatePercentage(totalEntradas, totalGeral),
      percSaidas: calculatePercentage(totalSaidas, totalGeral),
      percServicos: calculatePercentage(totalServicos, totalGeral)
    });
  }

  const chartData = {
    labels: ['Entradas', 'Saídas', 'Serviços'],
    datasets: [
      {
        data: [totalEntradas, totalSaidas, totalServicos],
        backgroundColor: ['#ef4444', '#22c55e', '#3b82f6'],
        borderWidth: 0,
        hoverOffset: 15
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    layout: {
      padding: 20
    },
    plugins: {
      legend: {
        display: false // Legenda está na tabela ao lado
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) label += ': ';
            const value = context.raw;
            const percentage = calculatePercentage(value, totalGeral);
            return label + formatCurrency(value) + ' (' + percentage + ')';
          }
        }
      }
    }
  };

  return (
    <div className="h-[200px] relative">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default DistribuicaoChart;
