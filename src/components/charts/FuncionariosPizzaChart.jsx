import { Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Gráfico de Pizza - Funcionários por Departamento
 */
export const DepartamentoPizzaChart = ({ porDepartamento }) => {
  const data = {
    labels: porDepartamento.labels,
    datasets: [
      {
        data: porDepartamento.data,
        backgroundColor: [
          '#0e4f6d',
          '#58a3a4',
          '#1a6b8a',
          '#7cc4c7',
          '#0d3d54'
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
          padding: 15,
          font: {
            size: 12,
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
            return `${context.label}: ${context.raw} (${percentage}%)`;
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

/**
 * Gráfico de Pizza - Funcionários por Tipo de Contrato
 */
export const ContratoPizzaChart = ({ porContrato }) => {
  const data = {
    labels: porContrato.labels,
    datasets: [
      {
        data: porContrato.data,
        backgroundColor: [
          '#10b981',
          '#f59e0b',
          '#8b5cf6',
          '#ef4444'
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
          padding: 15,
          font: {
            size: 12,
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
            return `${context.label}: ${context.raw} (${percentage}%)`;
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

export default DepartamentoPizzaChart;
