import { Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { useTheme } from '../../context/ThemeContext';
import { getChartColors, getPieChartOptions } from '../../utils/chartTheme';

ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Grafico de Pizza - Funcionarios por Departamento
 */
export const DepartamentoPizzaChart = ({ porDepartamento }) => {
  const { isDarkMode } = useTheme();
  const colors = getChartColors(isDarkMode);

  const data = {
    labels: porDepartamento.labels,
    datasets: [
      {
        data: porDepartamento.data,
        backgroundColor: isDarkMode
          ? ['#38bdf8', '#4ade80', '#fbbf24', '#a78bfa', '#f87171']
          : ['#0e4f6d', '#58a3a4', '#1a6b8a', '#7cc4c7', '#0d3d54'],
        borderColor: isDarkMode ? '#1e293b' : '#ffffff',
        borderWidth: 3,
        hoverOffset: 10
      }
    ]
  };

  const options = getPieChartOptions(isDarkMode, {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: colors.textColor,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.label}: ${context.raw} (${percentage}%)`;
          }
        }
      }
    }
  });

  return (
    <div className="h-[250px]">
      <Doughnut key={`depto-${isDarkMode}`} data={data} options={options} />
    </div>
  );
};

/**
 * Grafico de Pizza - Funcionarios por Tipo de Contrato
 */
export const ContratoPizzaChart = ({ porContrato }) => {
  const { isDarkMode } = useTheme();
  const colors = getChartColors(isDarkMode);

  const data = {
    labels: porContrato.labels,
    datasets: [
      {
        data: porContrato.data,
        backgroundColor: isDarkMode
          ? ['#4ade80', '#fbbf24', '#a78bfa', '#f87171']
          : ['#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
        borderColor: isDarkMode ? '#1e293b' : '#ffffff',
        borderWidth: 3,
        hoverOffset: 10
      }
    ]
  };

  const options = getPieChartOptions(isDarkMode, {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: colors.textColor,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.label}: ${context.raw} (${percentage}%)`;
          }
        }
      }
    }
  });

  return (
    <div className="h-[250px]">
      <Doughnut key={`contrato-${isDarkMode}`} data={data} options={options} />
    </div>
  );
};

export default DepartamentoPizzaChart;
