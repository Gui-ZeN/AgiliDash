import { ChevronRight, Home, FolderTree, Building, Building2 } from 'lucide-react';
import { useEmpresa } from '../../context/EmpresaContext';

/**
 * Componente Breadcrumb - Navegação hierárquica
 * Mostra: Home > Grupo > Empresa > CNPJ
 */
const Breadcrumb = ({ className = '' }) => {
  const {
    grupoAtual,
    empresaAtual,
    cnpjInfo,
    modoVisualizacao,
    isConsolidado,
    selecionarGrupo,
    selecionarEmpresa,
    setModoVisualizacao
  } = useEmpresa();

  const handleHomeClick = () => {
    setModoVisualizacao('todos');
  };

  const handleGrupoClick = () => {
    if (grupoAtual) {
      selecionarGrupo(grupoAtual.id);
      setModoVisualizacao('grupo');
    }
  };

  const handleEmpresaClick = () => {
    if (empresaAtual) {
      selecionarEmpresa(empresaAtual.id);
      setModoVisualizacao('empresa');
    }
  };

  const items = [
    {
      label: 'Todos',
      icon: Home,
      onClick: handleHomeClick,
      active: modoVisualizacao === 'todos'
    }
  ];

  if (grupoAtual) {
    items.push({
      label: grupoAtual.nome,
      icon: FolderTree,
      onClick: handleGrupoClick,
      active: modoVisualizacao === 'grupo'
    });
  }

  if (empresaAtual && modoVisualizacao !== 'todos') {
    items.push({
      label: empresaAtual.nomeFantasia,
      icon: Building,
      onClick: handleEmpresaClick,
      active: modoVisualizacao === 'empresa'
    });
  }

  if (cnpjInfo && !isConsolidado) {
    items.push({
      label: cnpjInfo.nomeFantasia,
      icon: Building2,
      onClick: null,
      active: true
    });
  }

  return (
    <nav className={`flex items-center gap-1 text-sm ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />
          )}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors ${
                item.active
                  ? 'bg-[#0e4f6d]/10 dark:bg-[#0e4f6d]/20 text-[#0e4f6d] dark:text-teal-500 font-medium'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              <span className="max-w-[120px] truncate">{item.label}</span>
            </button>
          ) : (
            <span className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${
              item.active
                ? 'bg-[#0e4f6d]/10 dark:bg-[#0e4f6d]/20 text-[#0e4f6d] dark:text-teal-500 font-medium'
                : 'text-slate-500 dark:text-slate-400'
            }`}>
              <item.icon className="w-3.5 h-3.5" />
              <span className="max-w-[120px] truncate">{item.label}</span>
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
