/**
 * Componente Card reutilizável
 * Wrapper para cards com estilos consistentes e suporte a dark mode
 */
const Card = ({
  children,
  className = '',
  padding = 'p-6',
  rounded = 'rounded-2xl',
  shadow = true,
  border = true,
  accent = false,
  accentColor = 'bg-[#0e4f6d]'
}) => {
  const baseClasses = 'bg-white dark:bg-slate-800 relative overflow-hidden transition-colors';
  const shadowClass = shadow ? 'shadow-card dark:shadow-card-dark' : '';
  const borderClass = border ? 'border border-slate-200 dark:border-slate-700' : '';

  return (
    <div className={`${baseClasses} ${rounded} ${shadowClass} ${borderClass} ${className}`}>
      {accent && (
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${accentColor}`} />
      )}
      <div className={`${padding} ${accent ? 'pl-8' : ''}`}>
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
    <div className={`bg-[#0e4f6d] p-6 rounded-2xl text-white shadow-lg ${className}`}>
      {children}
    </div>
  );
};

/**
 * Card de alerta/aviso (fundo âmbar)
 */
export const AlertCard = ({ children, className = '' }) => {
  return (
    <div className={`bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-6 rounded-2xl ${className}`}>
      {children}
    </div>
  );
};

/**
 * Card de informação (fundo teal)
 */
export const InfoCard = ({ children, className = '' }) => {
  return (
    <div className={`bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 p-6 rounded-2xl ${className}`}>
      {children}
    </div>
  );
};

/**
 * Card pequeno para métricas/resumos
 */
export const MetricCard = ({
  icon: Icon,
  iconBgColor = 'bg-cyan-50 dark:bg-cyan-900/30',
  iconColor = 'text-cyan-600 dark:text-cyan-400',
  label,
  value,
  className = ''
}) => {
  return (
    <div className={`bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-card dark:shadow-card-dark flex items-center gap-4 ${className}`}>
      <div className={`p-3 ${iconBgColor} rounded-lg`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-lg font-bold text-[#0e4f6d] dark:text-cyan-400">{value}</p>
      </div>
    </div>
  );
};

/**
 * Card de membro da equipe
 */
export const TeamCard = ({
  icon: Icon,
  iconBgColor = 'bg-cyan-50 dark:bg-cyan-900/30',
  iconColor = 'text-[#0e4f6d] dark:text-cyan-400',
  setor,
  nome
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-card dark:shadow-card-dark flex items-center gap-4 group transition-all hover:border-[#0e4f6d] dark:hover:border-cyan-500 hover:shadow-card-hover">
      <div className={`p-3 ${iconBgColor} rounded-lg group-hover:bg-[#0e4f6d] dark:group-hover:bg-cyan-600 transition-colors`}>
        <Icon className={`w-5 h-5 ${iconColor} group-hover:text-white transition-colors`} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {setor}
        </p>
        <h4 className="text-base font-bold text-slate-800 dark:text-white">{nome}</h4>
      </div>
    </div>
  );
};

export default Card;
