import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';

/**
 * Componente PeriodFilter - Filtro de período para análise
 */
const PeriodFilter = ({
  value = { type: 'month', year: 2025, month: 1 },
  onChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const meses = [
    'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const anos = [2025, 2024, 2023, 2022];

  const trimestres = [
    { label: '1o Trimestre', value: 1, months: [1, 2, 3] },
    { label: '2o Trimestre', value: 2, months: [4, 5, 6] },
    { label: '3o Trimestre', value: 3, months: [7, 8, 9] },
    { label: '4o Trimestre', value: 4, months: [10, 11, 12] }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDisplayLabel = () => {
    switch (value.type) {
      case 'month':
        return `${meses[value.month - 1]} ${value.year}`;
      case 'quarter':
        return `${value.quarter}o Tri ${value.year}`;
      case 'year':
        return `Ano ${value.year}`;
      default:
        return 'Selecione';
    }
  };

  const handleSelect = (type, year, extra = null) => {
    let newValue = { type, year };
    if (type === 'month') {
      newValue.month = extra;
    } else if (type === 'quarter') {
      newValue.quarter = extra;
    }
    onChange?.(newValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-[#0e4f6d] dark:hover:border-slate-500 transition-colors"
      >
        <Calendar className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {getDisplayLabel()}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-md z-50 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-700">
            {['month', 'quarter', 'year'].map((type) => (
              <button
                key={type}
                onClick={() => onChange?.({ ...value, type })}
                className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  value.type === type
                    ? 'text-[#0e4f6d] dark:text-teal-500 border-b-2 border-[#0e4f6d] dark:border-teal-500'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {type === 'month' ? 'Mes' : type === 'quarter' ? 'Trimestre' : 'Ano'}
              </button>
            ))}
          </div>

          <div className="p-3 max-h-64 overflow-y-auto">
            {value.type === 'year' && (
              <div className="grid grid-cols-2 gap-2">
                {anos.map((ano) => (
                  <button
                    key={ano}
                    onClick={() => handleSelect('year', ano)}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      value.year === ano && value.type === 'year'
                        ? 'bg-[#0e4f6d] text-white'
                        : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    {ano}
                  </button>
                ))}
              </div>
            )}

            {value.type === 'quarter' && (
              <div className="space-y-3">
                {anos.map((ano) => (
                  <div key={ano}>
                    <p className="text-xs font-semibold text-slate-400 mb-2">{ano}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {trimestres.map((tri) => (
                        <button
                          key={`${ano}-${tri.value}`}
                          onClick={() => handleSelect('quarter', ano, tri.value)}
                          className={`p-2 rounded-lg text-sm transition-colors ${
                            value.year === ano && value.quarter === tri.value
                              ? 'bg-[#0e4f6d] text-white'
                              : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                          }`}
                        >
                          {tri.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {value.type === 'month' && (
              <div className="space-y-3">
                {anos.map((ano) => (
                  <div key={ano}>
                    <p className="text-xs font-semibold text-slate-400 mb-2">{ano}</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {meses.map((mes, idx) => (
                        <button
                          key={`${ano}-${idx}`}
                          onClick={() => handleSelect('month', ano, idx + 1)}
                          className={`p-2 rounded-lg text-xs transition-colors ${
                            value.year === ano && value.month === idx + 1
                              ? 'bg-[#0e4f6d] text-white'
                              : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
                          }`}
                        >
                          {mes.substring(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodFilter;
