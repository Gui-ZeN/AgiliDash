import { useEffect, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { formatCurrency, calculatePercentage } from '../../utils/formatters';
import { entradasData, saidasData } from '../../data/mockData';
import { useTheme } from '../../context/ThemeContext';
import { getChartColors, getPieChartOptions } from '../../utils/chartTheme';

// Registrar componentes do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Grafico de Distribuicao do Fluxo (Doughnut)
 * Comparativo entrada e saida
 */
const DistribuicaoChart = ({ onDataCalculated }) => {
  const { isDarkMode } = useTheme();
  const colors = getChartColors(isDarkMode);

  // Calcular totais com useMemo para evitar recalculos desnecessarios
  const calculatedData = useMemo(() => {
    const totalEntradas = entradasData.reduce((a, b) => a + b, 0);
    const totalSaidas = saidasData.reduce((a, b) => a + b, 0);
    const totalServicos = 0;
    const totalGeral = totalEntradas + totalSaidas + totalServicos;

    return {
      totalEntradas,
      totalSaidas,
      totalServicos,
      totalGeral,
      percEntradas: calculatePercentage(totalEntradas, totalGeral),
      percSaidas: calculatePercentage(totalSaidas, totalGeral),
      percServicos: calculatePercentage(totalServicos, totalGeral)
    };
  }, []);

  // Notificar o componente pai apenas uma vez na montagem
  useEffect(() => {
    if (onDataCalculated) {
      onDataCalculated(calculatedData);
    }
  }, []);

  const { totalEntradas, totalSaidas, totalServicos, totalGeral } = calculatedData;

  const chartData = {
    labels: ['Entradas', 'Saidas', 'Servicos'],
    datasets: [
      {
        data: [totalEntradas, totalSaidas, totalServicos],
        backgroundColor: isDarkMode
          ? ['#f87171', '#4ade80', '#38bdf8']
          : ['#ef4444', '#22c55e', '#3b82f6'],
        borderWidth: 0,
        hoverOffset: 15
      }
    ]
  };

  const options = getPieChartOptions(isDarkMode, {
    cutout: '60%',
    layout: {
      padding: 20
    },
    plugins: {
      legend: {
        display: false
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
  });

  return (
    <div className="h-[200px] relative">
      <Doughnut key={`distribuicao-${isDarkMode}`} data={chartData} options={options} />
    </div>
  );
};

export default DistribuicaoChart;
