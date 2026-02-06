import { AlertTriangle, AlertCircle, Info, CheckCircle, X, Bell, Calendar } from 'lucide-react';
import { useState } from 'react';

/**
 * Componente AlertBanner - Alertas visuais para vencimentos e notificações
 */
const AlertBanner = ({
  type = 'info', // 'warning', 'error', 'success', 'info'
  title,
  message,
  dismissible = true,
  onDismiss,
  action,
  actionLabel,
  className = ''
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const configs = {
    warning: {
      icon: AlertTriangle,
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      iconColor: 'text-amber-500',
      titleColor: 'text-amber-800 dark:text-amber-300',
      textColor: 'text-amber-700 dark:text-amber-400',
      buttonBg: 'bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-800/60 text-amber-800 dark:text-amber-300'
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      iconColor: 'text-red-500',
      titleColor: 'text-red-800 dark:text-red-300',
      textColor: 'text-red-700 dark:text-red-400',
      buttonBg: 'bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-800/60 text-red-800 dark:text-red-300'
    },
    success: {
      icon: CheckCircle,
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      iconColor: 'text-emerald-700',
      titleColor: 'text-emerald-800 dark:text-emerald-300',
      textColor: 'text-emerald-700 dark:text-emerald-700',
      buttonBg: 'bg-emerald-100 dark:bg-emerald-900/40 hover:bg-emerald-200 dark:hover:bg-emerald-800/60 text-emerald-800 dark:text-emerald-300'
    },
    info: {
      icon: Info,
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-800 dark:text-blue-300',
      textColor: 'text-blue-700 dark:text-blue-400',
      buttonBg: 'bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-800/60 text-blue-800 dark:text-blue-300'
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className={`${config.bg} ${config.border} border rounded-xl p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`font-semibold ${config.titleColor} mb-1`}>{title}</h4>
          )}
          <p className={`text-sm ${config.textColor}`}>{message}</p>
          {action && (
            <button
              onClick={action}
              className={`mt-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${config.buttonBg}`}
            >
              {actionLabel || 'Ver detalhes'}
            </button>
          )}
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className={`p-1 rounded-lg transition-colors ${config.textColor} hover:bg-black/5 dark:hover:bg-white/5`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Componente para alertas de vencimento
 */
export const VencimentoAlert = ({ vencimentos = [], className = '' }) => {
  if (!vencimentos.length) return null;

  const hoje = new Date();
  const alertas = vencimentos.filter(v => {
    const dataVenc = new Date(v.dataVencimento);
    const diasRestantes = Math.ceil((dataVenc - hoje) / (1000 * 60 * 60 * 24));
    return diasRestantes <= 7 && diasRestantes >= 0;
  });

  if (!alertas.length) return null;

  return (
    <div className={`bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-5 h-5 text-amber-500" />
        <h4 className="font-semibold text-amber-800 dark:text-amber-300">
          Vencimentos Proximos ({alertas.length})
        </h4>
      </div>
      <div className="space-y-2">
        {alertas.slice(0, 3).map((item, index) => {
          const dataVenc = new Date(item.dataVencimento);
          const diasRestantes = Math.ceil((dataVenc - hoje) / (1000 * 60 * 60 * 24));

          return (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {item.descricao}
                </span>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                diasRestantes <= 2
                  ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                  : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
              }`}>
                {diasRestantes === 0 ? 'Hoje' : diasRestantes === 1 ? 'Amanha' : `${diasRestantes} dias`}
              </span>
            </div>
          );
        })}
      </div>
      {alertas.length > 3 && (
        <button className="mt-3 text-sm font-medium text-amber-700 dark:text-amber-400 hover:underline">
          Ver todos os {alertas.length} vencimentos →
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
