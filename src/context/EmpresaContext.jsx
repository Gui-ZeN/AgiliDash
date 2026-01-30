import { createContext, useContext, useState, useCallback } from 'react';
import { cnpjsEmpresa, getDadosCnpj, getInfoCnpj, getTotaisConsolidados, empresaUsuario } from '../data/mockData';

/**
 * Contexto para gerenciar estado global da empresa e CNPJ selecionado
 */
const EmpresaContext = createContext(null);

export const EmpresaProvider = ({ children }) => {
  // CNPJ selecionado (default: primeiro CNPJ - Matriz)
  const [cnpjSelecionado, setCnpjSelecionado] = useState('cnpj_001');

  // Modo de visualização: 'individual' ou 'consolidado'
  const [modoVisualizacao, setModoVisualizacao] = useState('individual');

  // Obtém informações do CNPJ atual
  const cnpjInfo = getInfoCnpj(cnpjSelecionado);

  // Obtém dados financeiros do CNPJ atual
  const cnpjDados = getDadosCnpj(cnpjSelecionado);

  // Lista de todos os CNPJs disponíveis
  const listaCnpjs = cnpjsEmpresa;

  // Totais consolidados (todos os CNPJs)
  const totaisConsolidados = getTotaisConsolidados();

  // Dados da empresa (usuário)
  const empresa = empresaUsuario;

  // Função para trocar CNPJ
  const selecionarCnpj = useCallback((cnpjId) => {
    setCnpjSelecionado(cnpjId);
    setModoVisualizacao('individual');
  }, []);

  // Função para alternar modo consolidado
  const toggleModoConsolidado = useCallback(() => {
    setModoVisualizacao(prev => prev === 'consolidado' ? 'individual' : 'consolidado');
  }, []);

  // Verifica se está em modo consolidado
  const isConsolidado = modoVisualizacao === 'consolidado';

  const value = {
    // Estado atual
    cnpjSelecionado,
    cnpjInfo,
    cnpjDados,
    modoVisualizacao,
    isConsolidado,

    // Listas
    listaCnpjs,
    empresa,

    // Totais
    totaisConsolidados,

    // Ações
    selecionarCnpj,
    toggleModoConsolidado,
    setModoVisualizacao
  };

  return (
    <EmpresaContext.Provider value={value}>
      {children}
    </EmpresaContext.Provider>
  );
};

// Hook para usar o contexto
export const useEmpresa = () => {
  const context = useContext(EmpresaContext);
  if (!context) {
    throw new Error('useEmpresa deve ser usado dentro de EmpresaProvider');
  }
  return context;
};

export default EmpresaContext;
