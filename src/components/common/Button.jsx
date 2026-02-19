/**
 * Componente Button reutilizável
 * Botões com diferentes variantes de estilo
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  // Classes base
  const baseClasses =
    'font-bold uppercase tracking-wide transition-all rounded-xl inline-flex items-center justify-center gap-2';

  // Variantes de cor
  const variants = {
    primary: 'bg-[#0e4f6d] text-white hover:bg-[#1e5466] disabled:bg-slate-300',
    secondary: 'bg-[#58a3a4] text-white hover:bg-[#42878e] disabled:bg-slate-300',
    outline:
      'border-2 border-[#0e4f6d] text-[#0e4f6d] hover:bg-[#0e4f6d] hover:text-white disabled:border-slate-300 disabled:text-slate-300',
    ghost: 'text-[#0e4f6d] hover:bg-slate-100 disabled:text-slate-300',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-slate-300',
    success: 'bg-green-500 text-white hover:bg-green-600 disabled:bg-slate-300',
  };

  // Tamanhos
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const disabledClasses = disabled ? 'cursor-not-allowed opacity-60' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Grupo de botões para alternância (como os botões 2024/2025)
 */
export const ButtonGroup = ({ options, activeValue, onChange }) => {
  return (
    <div className="flex bg-slate-100 p-1 rounded-xl">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-6 py-2 rounded-lg text-xs font-bold transition-all
            ${
              activeValue === option.value
                ? 'bg-white text-[#0e4f6d] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

/**
 * Botão de ícone (circular)
 */
export const IconButton = ({
  icon: Icon,
  onClick,
  className = '',
  size = 'md',
  variant = 'ghost',
}) => {
  const sizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const variants = {
    ghost: 'hover:bg-slate-100 text-slate-500',
    primary: 'bg-[#0e4f6d] text-white hover:bg-[#1e5466]',
    danger: 'hover:bg-red-50 text-slate-500 hover:text-red-500',
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-lg transition-colors ${sizes[size]} ${variants[variant]} ${className}`}
    >
      <Icon className={iconSizes[size]} />
    </button>
  );
};

export default Button;
