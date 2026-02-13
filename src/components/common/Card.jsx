/**
 * Componente Card reutilizável
 * Design premium com estilos consistentes e suporte a dark mode
 */
const Card = ({
  children,
  className = '',
  padding = 'p-6',
  rounded = 'rounded-lg',
  shadow = true,
  border = true,
  accent = false,
  accentColor = 'bg-primary-600',
  hover = false
}) => {
  const baseClasses = 'bg-white dark:bg-slate-800 relative overflow-hidden transition-all duration-200';
  const shadowClass = shadow ? 'shadow-sm hover:shadow-md' : '';
  const borderClass = border ? 'border border-slate-200/80 dark:border-slate-700/80' : '';
  const hoverClass = hover ? 'hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer' : '';

  return (
    <div className={`${baseClasses} ${rounded} ${shadowClass} ${borderClass} ${hoverClass} ${className}`}>
      {accent && (
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor}`} />
      )}
      <div className={`${padding} ${accent ? 'pl-7' : ''}`}>
        {children}
      </div>
    </div>
  );
};

/**
 * Card com estilo primário (fundo azul escuro)
 */
export const PrimaryCard = ({ children, className = '' }) => {
  return (
    <div className={`bg-primary-600 p-6 rounded-lg text-white shadow-sm ${className}`}>
      {children}
    </div>
  );
};

/**
 * Card de alerta/aviso (fundo âmbar sutil)
 */
export const AlertCard = ({ children, className = '' }) => {
  return (
    <div className={`bg-amber-50/80 dark:bg-amber-900/10 border border-amber-200/80 dark:border-amber-800/50 p-5 rounded-lg ${className}`}>
      {children}
    </div>
  );
};

/**
 * Card de informação (fundo teal sutil)
 */
export const InfoCard = ({ children, className = '' }) => {
  return (
    <div className={`bg-teal-50/80 dark:bg-teal-900/10 border border-teal-200/80 dark:border-teal-800/50 p-5 rounded-lg ${className}`}>
      {children}
    </div>
  );
};

/**
 * Card pequeno para métricas/resumos
 */
export const MetricCard = ({
  icon: Icon,
  iconBgColor = 'bg-slate-100 dark:bg-slate-700/50',
  iconColor = 'text-slate-600 dark:text-slate-300',
  label,
  value,
  className = ''
}) => {
  return (
    <div className={`bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center gap-4 ${className}`}>
      <div className={`p-2.5 ${iconBgColor} rounded-md`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{value}</p>
      </div>
    </div>
  );
};

/**
 * Card de membro da equipe
 */
export const TeamCard = ({
  icon: Icon,
  iconBgColor = 'bg-slate-100 dark:bg-slate-700/50',
  iconColor = 'text-slate-600 dark:text-slate-300',
  setor,
  nome
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center gap-4 group transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md">
      <div className={`p-2.5 ${iconBgColor} rounded-md group-hover:bg-primary-600 dark:group-hover:bg-primary-600 transition-colors duration-200`}>
        <Icon className={`w-5 h-5 ${iconColor} group-hover:text-white transition-colors duration-200`} />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {setor}
        </p>
        <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">{nome}</h4>
      </div>
    </div>
  );
};

export default Card;
