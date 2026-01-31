import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  grupos,
  empresas,
  cnpjsEmpresa,
  getDadosCnpj,
  getInfoCnpj,
  getTotaisConsolidados,
  getTotaisConsolidadosPorEmpresa,
  getTotaisConsolidadosPorGrupo,
  getCnpjsByEmpresa,
  getEmpresasByGrupo,
  getEmpresaByCnpj,
  getGrupoByEmpresa,
  setoresDisponiveis
} from '../data/mockData';

/**
 * Contexto para gerenciar estado global da empresa e CNPJ selecionado
 * Suporta hierarquia: Grupo → Empresa → CNPJ
 */
const EmpresaContext = createContext(null);

export const EmpresaProvider = ({ children }) => {
  // Seleções atuais
  const [grupoSelecionado, setGrupoSelecionado] = useState('grupo_001');
  const [empresaSelecionada, setEmpresaSelecionada] = useState('empresa_001');
  const [cnpjSelecionado, setCnpjSelecionado] = useState('cnpj_001');

  // Modo de visualização: 'cnpj', 'empresa', 'grupo' ou 'todos'
  const [modoVisualizacao, setModoVisualizacao] = useState('cnpj');

  // Obtém informações do CNPJ atual
  const cnpjInfo = useMemo(() => getInfoCnpj(cnpjSelecionado), [cnpjSelecionado]);

  // Obtém dados financeiros do CNPJ atual
  const cnpjDados = useMemo(() => getDadosCnpj(cnpjSelecionado), [cnpjSelecionado]);

  // Obtém empresa atual
  const empresaAtual = useMemo(() =>
    empresas.find(e => e.id === empresaSelecionada),
    [empresaSelecionada]
  );

  // Obtém grupo atual
  const grupoAtual = useMemo(() =>
    grupos.find(g => g.id === grupoSelecionado),
    [grupoSelecionado]
  );

  // Lista de grupos
  const listaGrupos = grupos;

  // Lista de empresas do grupo selecionado
  const listaEmpresas = useMemo(() =>
    getEmpresasByGrupo(grupoSelecionado),
    [grupoSelecionado]
  );

  // Lista de CNPJs da empresa selecionada
  const listaCnpjs = useMemo(() =>
    getCnpjsByEmpresa(empresaSelecionada),
    [empresaSelecionada]
  );

  // Todos os CNPJs (para visualização consolidada)
  const todosCnpjs = cnpjsEmpresa;

  // Totais consolidados baseado no modo de visualização
  const totaisConsolidados = useMemo(() => {
    switch (modoVisualizacao) {
      case 'empresa':
        return getTotaisConsolidadosPorEmpresa(empresaSelecionada);
      case 'grupo':
        return getTotaisConsolidadosPorGrupo(grupoSelecionado);
      case 'todos':
        return getTotaisConsolidados();
      default:
        return null;
    }
  }, [modoVisualizacao, empresaSelecionada, grupoSelecionado]);

  // Função para selecionar grupo
  const selecionarGrupo = useCallback((grupoId) => {
    setGrupoSelecionado(grupoId);
    // Seleciona primeira empresa do grupo
    const empresasDoGrupo = getEmpresasByGrupo(grupoId);
    if (empresasDoGrupo.length > 0) {
      const primeiraEmpresa = empresasDoGrupo[0];
      setEmpresaSelecionada(primeiraEmpresa.id);
      // Seleciona primeiro CNPJ da empresa
      const cnpjsDaEmpresa = getCnpjsByEmpresa(primeiraEmpresa.id);
      if (cnpjsDaEmpresa.length > 0) {
        setCnpjSelecionado(cnpjsDaEmpresa[0].id);
      }
    }
    setModoVisualizacao('cnpj');
  }, []);

  // Função para selecionar empresa
  const selecionarEmpresa = useCallback((empresaId) => {
    setEmpresaSelecionada(empresaId);
    // Atualiza grupo se necessário
    const empresa = empresas.find(e => e.id === empresaId);
    if (empresa && empresa.grupoId !== grupoSelecionado) {
      setGrupoSelecionado(empresa.grupoId);
    }
    // Seleciona primeiro CNPJ da empresa
    const cnpjsDaEmpresa = getCnpjsByEmpresa(empresaId);
    if (cnpjsDaEmpresa.length > 0) {
      setCnpjSelecionado(cnpjsDaEmpresa[0].id);
    }
    setModoVisualizacao('cnpj');
  }, [grupoSelecionado]);

  // Função para trocar CNPJ
  const selecionarCnpj = useCallback((cnpjId) => {
    setCnpjSelecionado(cnpjId);
    // Atualiza empresa e grupo se necessário
    const empresa = getEmpresaByCnpj(cnpjId);
    if (empresa) {
      setEmpresaSelecionada(empresa.id);
      const grupo = getGrupoByEmpresa(empresa.id);
      if (grupo) {
        setGrupoSelecionado(grupo.id);
      }
    }
    setModoVisualizacao('cnpj');
  }, []);

  // Função para alternar modo consolidado
  const toggleModoConsolidado = useCallback((modo) => {
    setModoVisualizacao(prev => prev === modo ? 'cnpj' : modo);
  }, []);

  // Verifica se está em modo consolidado
  const isConsolidado = modoVisualizacao !== 'cnpj';

  // Label do modo atual
  const modoLabel = useMemo(() => {
    switch (modoVisualizacao) {
      case 'empresa':
        return `Consolidado: ${empresaAtual?.nomeFantasia || 'Empresa'}`;
      case 'grupo':
        return `Consolidado: ${grupoAtual?.nome || 'Grupo'}`;
      case 'todos':
        return 'Visão Consolidada Total';
      default:
        return cnpjInfo?.nomeFantasia || 'CNPJ';
    }
  }, [modoVisualizacao, empresaAtual, grupoAtual, cnpjInfo]);

  const value = {
    // Estado atual
    grupoSelecionado,
    empresaSelecionada,
    cnpjSelecionado,
    modoVisualizacao,
    isConsolidado,
    modoLabel,

    // Informações atuais
    cnpjInfo,
    cnpjDados,
    empresaAtual,
    grupoAtual,

    // Listas
    listaGrupos,
    listaEmpresas,
    listaCnpjs,
    todosCnpjs,
    todasEmpresas: empresas,
    todosGrupos: grupos,
    setoresDisponiveis,

    // Totais
    totaisConsolidados,

    // Ações
    selecionarGrupo,
    selecionarEmpresa,
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
