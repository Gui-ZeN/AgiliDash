import { useState, useRef, useEffect } from 'react';
import { Building2, ChevronDown, Check, Layers, FolderTree, Building } from 'lucide-react';
import { useEmpresa } from '../../context/EmpresaContext';

/**
 * Componente CnpjFilter - Filtro rapido por CNPJ/Empresa/Grupo
 */
const CnpjFilter = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const {
    grupoAtual,
    empresaAtual,
    cnpjInfo,
    listaGrupos,
    listaEmpresas,
    listaCnpjs,
    selecionarGrupo,
    selecionarEmpresa,
    selecionarCnpj,
    cnpjSelecionado,
    modoVisualizacao,
    isConsolidado,
    toggleModoConsolidado
  } = useEmpresa();

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
    if (modoVisualizacao === 'todos') return 'Todos os Grupos';
    if (modoVisualizacao === 'grupo') return grupoAtual?.nome || 'Grupo';
    if (modoVisualizacao === 'empresa') return empresaAtual?.nomeFantasia || 'Empresa';
    return cnpjInfo?.nomeFantasia || 'CNPJ';
  };

  const getDisplayIcon = () => {
    if (modoVisualizacao === 'todos') return Layers;
    if (modoVisualizacao === 'grupo') return FolderTree;
    if (modoVisualizacao === 'empresa') return Building;
    return Building2;
  };

  const handleSelect = (type, id) => {
    if (type === 'consolidado') {
      toggleModoConsolidado(id);
    } else if (type === 'grupo') {
      selecionarGrupo(id);
    } else if (type === 'empresa') {
      selecionarEmpresa(id);
    } else if (type === 'cnpj') {
      selecionarCnpj(id);
    }
    setIsOpen(false);
  };

  const DisplayIcon = getDisplayIcon();

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-[#0e4f6d] dark:hover:border-cyan-500 transition-colors min-w-[180px]"
      >
        <div className="w-6 h-6 rounded-lg bg-[#0e4f6d] flex items-center justify-center">
          <DisplayIcon className="w-3 h-3 text-white" />
        </div>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate flex-1 text-left">
          {getDisplayLabel()}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden max-h-[400px] overflow-y-auto">
          {/* Consolidado */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-700">
            <p className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">Consolidado</p>
            {['todos', 'grupo', 'empresa'].map((modo) => (
              <button
                key={modo}
                onClick={() => handleSelect('consolidado', modo)}
                className={`w-full px-2 py-2 flex items-center gap-2 rounded-lg transition-colors ${
                  modoVisualizacao === modo
                    ? 'bg-[#0e4f6d]/10 dark:bg-[#0e4f6d]/20'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {modo === 'todos' && <Layers className="w-4 h-4 text-slate-500" />}
                {modo === 'grupo' && <FolderTree className="w-4 h-4 text-slate-500" />}
                {modo === 'empresa' && <Building className="w-4 h-4 text-slate-500" />}
                <span className="text-sm text-slate-700 dark:text-slate-300 flex-1 text-left">
                  {modo === 'todos' && 'Todos os Grupos'}
                  {modo === 'grupo' && `Grupo: ${grupoAtual?.nome}`}
                  {modo === 'empresa' && `Empresa: ${empresaAtual?.nomeFantasia}`}
                </span>
                {modoVisualizacao === modo && <Check className="w-4 h-4 text-[#0e4f6d] dark:text-cyan-400" />}
              </button>
            ))}
          </div>

          {/* CNPJs */}
          <div className="p-2">
            <p className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">
              CNPJs ({listaCnpjs.length})
            </p>
            {listaCnpjs.map((cnpj) => (
              <button
                key={cnpj.id}
                onClick={() => handleSelect('cnpj', cnpj.id)}
                className={`w-full px-2 py-2 flex items-center gap-2 rounded-lg transition-colors ${
                  cnpjSelecionado === cnpj.id && modoVisualizacao === 'cnpj'
                    ? 'bg-[#0e4f6d]/10 dark:bg-[#0e4f6d]/20'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <Building2 className="w-4 h-4 text-slate-400" />
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{cnpj.nomeFantasia}</p>
                  <p className="text-xs text-slate-400">{cnpj.cnpj}</p>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                  cnpj.tipo === 'Matriz'
                    ? 'bg-[#0e4f6d]/10 text-[#0e4f6d] dark:bg-cyan-900/30 dark:text-cyan-400'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                }`}>
                  {cnpj.tipo}
                </span>
                {cnpjSelecionado === cnpj.id && modoVisualizacao === 'cnpj' && (
                  <Check className="w-4 h-4 text-[#0e4f6d] dark:text-cyan-400 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CnpjFilter;
