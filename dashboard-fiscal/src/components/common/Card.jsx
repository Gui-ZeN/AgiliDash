/**
 * Componente Card reutilizável
 * Wrapper para cards com estilos consistentes
 */
const Card = ({
  children,
  className = '',
  padding = 'p-8',
  rounded = 'rounded-[2rem]',
  shadow = true,
  border = true,
  accent = false, // Barra lateral de destaque
  accentColor = 'bg-[#0e4f6d]'
}) => {
  const baseClasses = 'bg-white relative overflow-hidden';
  const shadowClass = shadow ? 'custom-shadow' : '';
  const borderClass = border ? 'border border-slate-200' : '';

  return (
    <div className={`${baseClasses} ${rounded} ${shadowClass} ${borderClass} ${className}`}>
      {accent && (
        <div className={`absolute left-0 top-0 bottom-0 w-2 ${accentColor}`} />
      )}
      <div className={`${padding} ${accent ? 'pl-12' : ''}`}>
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
    <div className={`bg-[#0e4f6d] p-8 rounded-[2rem] text-white shadow-xl ${className}`}>
      {children}
    </div>
  );
};

/**
 * Card de alerta/aviso (fundo âmbar)
 */
export const AlertCard = ({ children, className = '', icon: Icon }) => {
  return (
    <div className={`bg-amber-50 border border-amber-100 p-8 rounded-[2rem] ${className}`}>
      {children}
    </div>
  );
};

/**
 * Card de informação (fundo teal)
 */
export const InfoCard = ({ children, className = '' }) => {
  return (
    <div className={`bg-teal-50 border border-teal-100 p-8 rounded-[2rem] ${className}`}>
      {children}
    </div>
  );
};

/**
 * Card pequeno para métricas/resumos
 */
export const MetricCard = ({
  icon: Icon,
  iconBgColor = 'bg-cyan-50',
  iconColor = 'text-cyan-600',
  label,
  value,
  className = ''
}) => {
  return (
    <div className={`bg-white p-6 rounded-[1.5rem] border border-slate-200 custom-shadow flex items-center gap-4 ${className}`}>
      <div className={`p-3 ${iconBgColor} rounded-xl`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-xl font-black text-[#0e4f6d]">{value}</p>
      </div>
    </div>
  );
};

/**
 * Card de membro da equipe
 */
export const TeamCard = ({
  icon: Icon,
  iconBgColor = 'bg-cyan-50',
  iconColor = 'text-[#0e4f6d]',
  setor,
  nome
}) => {
  return (
    <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 custom-shadow flex items-center gap-4 group transition-all hover:border-[#0e4f6d] hover:bg-slate-50/30">
      <div className={`p-4 ${iconBgColor} rounded-2xl group-hover:bg-[#0e4f6d] transition-colors`}>
        <Icon className={`w-6 h-6 ${iconColor} group-hover:text-white`} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {setor}
        </p>
        <h4 className="text-lg font-bold text-slate-800">{nome}</h4>
      </div>
    </div>
  );
};

export default Card;
