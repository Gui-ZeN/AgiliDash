/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import {
  grupos,
  empresas,
  cnpjsEmpresa,
  getDadosCnpj,
  setoresDisponiveis
} from '../data/mockData';
import { useAuth } from './AuthContext';

/**
 * Context for global company/CNPJ selection state.
 * Hierarchy: Group -> Company -> CNPJ
 */
const EmpresaContext = createContext(null);

const EMPTY_TOTALS = {
  receita: 0,
  despesa: 0,
  lucro: 0,
  funcionarios: 0,
  folhaMensal: 0,
  irpj: 0,
  csll: 0,
  cargaTributaria: 0,
  qtdCnpjs: 0
};

const criarSet = (lista) => (Array.isArray(lista) && lista.length > 0 ? new Set(lista) : null);

const somarArray = (arr) => (Array.isArray(arr) ? arr.reduce((acc, v) => acc + Number(v || 0), 0) : 0);

const calcularTotaisConsolidados = (cnpjIds) => {
  if (!Array.isArray(cnpjIds) || cnpjIds.length === 0) return EMPTY_TOTALS;

  return cnpjIds.reduce((totais, cnpjId) => {
    const dados = getDadosCnpj(cnpjId);
    if (!dados) return totais;

    const receita = somarArray(dados?.dreData2025?.receita);
    const despesa = somarArray(dados?.dreData2025?.despesa);
    const lucro = somarArray(dados?.dreData2025?.lucro);
    const funcionarios = Number(dados?.pessoalData?.funcionarios || 0);
    const folhaMensal = Number(dados?.pessoalData?.folhaMensal || 0);
    const irpj = Number(dados?.totaisFiscais?.irpj || 0);
    const csll = Number(dados?.totaisFiscais?.csll || 0);

    return {
      receita: totais.receita + receita,
      despesa: totais.despesa + despesa,
      lucro: totais.lucro + lucro,
      funcionarios: totais.funcionarios + funcionarios,
      folhaMensal: totais.folhaMensal + folhaMensal,
      irpj: totais.irpj + irpj,
      csll: totais.csll + csll,
      cargaTributaria: totais.cargaTributaria + irpj + csll,
      qtdCnpjs: totais.qtdCnpjs + 1
    };
  }, { ...EMPTY_TOTALS });
};

export const EmpresaProvider = ({ children }) => {
  const { user, isAdmin } = useAuth();

  const [grupoSelecionado, setGrupoSelecionado] = useState(null);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [cnpjSelecionado, setCnpjSelecionado] = useState(null);

  // View mode: 'cnpj', 'empresa', 'grupo' or 'todos'
  const [modoVisualizacao, setModoVisualizacao] = useState('cnpj');

  const grupoIdsPermitidos = useMemo(() => (isAdmin ? null : criarSet(user?.acesso?.grupoIds)), [isAdmin, user?.acesso?.grupoIds]);
  const empresaIdsPermitidas = useMemo(() => (isAdmin ? null : criarSet(user?.acesso?.empresaIds)), [isAdmin, user?.acesso?.empresaIds]);
  const cnpjIdsPermitidos = useMemo(() => (isAdmin ? null : criarSet(user?.acesso?.cnpjIds)), [isAdmin, user?.acesso?.cnpjIds]);

  const empresasPermitidas = useMemo(() => {
    if (isAdmin) return empresas;

    const temEscopo = !!(grupoIdsPermitidos || empresaIdsPermitidas || cnpjIdsPermitidos);
    if (!temEscopo) return [];

    let resultado = [...empresas];

    if (grupoIdsPermitidos) {
      resultado = resultado.filter(e => grupoIdsPermitidos.has(e.grupoId));
    }

    if (empresaIdsPermitidas) {
      resultado = resultado.filter(e => empresaIdsPermitidas.has(e.id));
    }

    if (cnpjIdsPermitidos) {
      const empresaIdsDoCnpj = new Set(
        cnpjsEmpresa.filter(c => cnpjIdsPermitidos.has(c.id)).map(c => c.empresaId)
      );
      resultado = resultado.filter(e => empresaIdsDoCnpj.has(e.id));
    }

    return resultado;
  }, [isAdmin, grupoIdsPermitidos, empresaIdsPermitidas, cnpjIdsPermitidos]);

  const empresaIdsPermitidasSet = useMemo(
    () => new Set(empresasPermitidas.map(e => e.id)),
    [empresasPermitidas]
  );

  const cnpjsPermitidos = useMemo(() => {
    if (isAdmin) return cnpjsEmpresa;

    let resultado = cnpjsEmpresa.filter(c => empresaIdsPermitidasSet.has(c.empresaId));

    if (cnpjIdsPermitidos) {
      resultado = resultado.filter(c => cnpjIdsPermitidos.has(c.id));
    }

    return resultado;
  }, [isAdmin, empresaIdsPermitidasSet, cnpjIdsPermitidos]);

  const gruposPermitidos = useMemo(() => {
    const grupoIds = new Set(empresasPermitidas.map(e => e.grupoId));
    return grupos.filter(g => grupoIds.has(g.id));
  }, [empresasPermitidas]);

  // Keep selected group/company/CNPJ always inside permitted scope.
  useEffect(() => {
    if (empresasPermitidas.length === 0 || cnpjsPermitidos.length === 0 || gruposPermitidos.length === 0) {
      if (grupoSelecionado !== null) setGrupoSelecionado(null);
      if (empresaSelecionada !== null) setEmpresaSelecionada(null);
      if (cnpjSelecionado !== null) setCnpjSelecionado(null);
      if (modoVisualizacao !== 'cnpj') setModoVisualizacao('cnpj');
      return;
    }

    const empresaValida = empresasPermitidas.find(e => e.id === empresaSelecionada) || empresasPermitidas[0];
    const grupoValido = empresaValida.grupoId;
    const cnpjsDaEmpresa = cnpjsPermitidos.filter(c => c.empresaId === empresaValida.id);
    const cnpjValido = cnpjsDaEmpresa.find(c => c.id === cnpjSelecionado) || cnpjsDaEmpresa[0] || cnpjsPermitidos[0];

    if (grupoSelecionado !== grupoValido) setGrupoSelecionado(grupoValido);
    if (empresaSelecionada !== empresaValida.id) setEmpresaSelecionada(empresaValida.id);
    if (cnpjSelecionado !== cnpjValido?.id) setCnpjSelecionado(cnpjValido?.id || null);
  }, [
    empresasPermitidas,
    cnpjsPermitidos,
    gruposPermitidos,
    grupoSelecionado,
    empresaSelecionada,
    cnpjSelecionado,
    modoVisualizacao
  ]);

  const cnpjInfo = useMemo(
    () => cnpjsPermitidos.find(c => c.id === cnpjSelecionado) || cnpjsPermitidos[0] || null,
    [cnpjsPermitidos, cnpjSelecionado]
  );

  const cnpjDados = useMemo(
    () => (cnpjInfo?.id ? getDadosCnpj(cnpjInfo.id) : null),
    [cnpjInfo?.id]
  );

  const empresaAtual = useMemo(
    () => empresasPermitidas.find(e => e.id === empresaSelecionada) || empresasPermitidas[0] || null,
    [empresasPermitidas, empresaSelecionada]
  );

  const grupoAtual = useMemo(
    () => gruposPermitidos.find(g => g.id === grupoSelecionado) || gruposPermitidos[0] || null,
    [gruposPermitidos, grupoSelecionado]
  );

  const listaGrupos = gruposPermitidos;

  const listaEmpresas = useMemo(
    () => empresasPermitidas.filter(e => e.grupoId === grupoSelecionado),
    [empresasPermitidas, grupoSelecionado]
  );

  const listaCnpjs = useMemo(
    () => cnpjsPermitidos.filter(c => c.empresaId === empresaSelecionada),
    [cnpjsPermitidos, empresaSelecionada]
  );

  const todosCnpjs = cnpjsPermitidos;

  const cnpjIdsEscopo = useMemo(() => {
    if (!cnpjInfo?.id) return [];

    switch (modoVisualizacao) {
      case 'empresa':
        return cnpjsPermitidos.filter(c => c.empresaId === empresaSelecionada).map(c => c.id);
      case 'grupo': {
        const empresasDoGrupo = new Set(empresasPermitidas.filter(e => e.grupoId === grupoSelecionado).map(e => e.id));
        return cnpjsPermitidos.filter(c => empresasDoGrupo.has(c.empresaId)).map(c => c.id);
      }
      case 'todos':
        return cnpjsPermitidos.map(c => c.id);
      default:
        return [cnpjInfo.id];
    }
  }, [cnpjInfo?.id, modoVisualizacao, cnpjsPermitidos, empresaSelecionada, empresasPermitidas, grupoSelecionado]);

  const isConsolidado = modoVisualizacao !== 'cnpj';

  const totaisConsolidados = useMemo(() => {
    if (!isConsolidado) return null;
    return calcularTotaisConsolidados(cnpjIdsEscopo);
  }, [isConsolidado, cnpjIdsEscopo]);

  const selecionarGrupo = useCallback((grupoId) => {
    const grupoExiste = gruposPermitidos.some(g => g.id === grupoId);
    if (!grupoExiste) return;

    setGrupoSelecionado(grupoId);

    const empresasDoGrupo = empresasPermitidas.filter(e => e.grupoId === grupoId);
    if (empresasDoGrupo.length > 0) {
      const primeiraEmpresa = empresasDoGrupo[0];
      setEmpresaSelecionada(primeiraEmpresa.id);

      const cnpjsDaEmpresa = cnpjsPermitidos.filter(c => c.empresaId === primeiraEmpresa.id);
      if (cnpjsDaEmpresa.length > 0) {
        setCnpjSelecionado(cnpjsDaEmpresa[0].id);
      }
    }

    setModoVisualizacao('cnpj');
  }, [gruposPermitidos, empresasPermitidas, cnpjsPermitidos]);

  const selecionarEmpresa = useCallback((empresaId) => {
    const empresa = empresasPermitidas.find(e => e.id === empresaId);
    if (!empresa) return;

    setEmpresaSelecionada(empresa.id);

    if (empresa.grupoId !== grupoSelecionado) {
      setGrupoSelecionado(empresa.grupoId);
    }

    const cnpjsDaEmpresa = cnpjsPermitidos.filter(c => c.empresaId === empresa.id);
    if (cnpjsDaEmpresa.length > 0) {
      setCnpjSelecionado(cnpjsDaEmpresa[0].id);
    }

    setModoVisualizacao('cnpj');
  }, [empresasPermitidas, cnpjsPermitidos, grupoSelecionado]);

  const selecionarCnpj = useCallback((cnpjId) => {
    const cnpj = cnpjsPermitidos.find(c => c.id === cnpjId);
    if (!cnpj) return;

    setCnpjSelecionado(cnpj.id);

    const empresa = empresasPermitidas.find(e => e.id === cnpj.empresaId);
    if (empresa) {
      setEmpresaSelecionada(empresa.id);
      setGrupoSelecionado(empresa.grupoId);
    }

    setModoVisualizacao('cnpj');
  }, [cnpjsPermitidos, empresasPermitidas]);

  const toggleModoConsolidado = useCallback((modo) => {
    setModoVisualizacao(prev => (prev === modo ? 'cnpj' : modo));
  }, []);

  const modoLabel = useMemo(() => {
    switch (modoVisualizacao) {
      case 'empresa':
        return `Consolidado: ${empresaAtual?.nomeFantasia || 'Empresa'}`;
      case 'grupo':
        return `Consolidado: ${grupoAtual?.nome || 'Grupo'}`;
      case 'todos':
        return isAdmin ? 'Visao Consolidada Total' : 'Visao Consolidada Permitida';
      default:
        return cnpjInfo?.nomeFantasia || 'CNPJ';
    }
  }, [modoVisualizacao, empresaAtual?.nomeFantasia, grupoAtual?.nome, cnpjInfo?.nomeFantasia, isAdmin]);

  const value = {
    // Current state
    grupoSelecionado,
    empresaSelecionada,
    cnpjSelecionado,
    modoVisualizacao,
    isConsolidado,
    modoLabel,

    // Current entities
    cnpjInfo,
    cnpjDados,
    empresaAtual,
    grupoAtual,

    // Lists (already filtered by permission)
    listaGrupos,
    listaEmpresas,
    listaCnpjs,
    todosCnpjs,
    todasEmpresas: empresasPermitidas,
    todosGrupos: gruposPermitidos,
    setoresDisponiveis,

    // Totals
    totaisConsolidados,

    // Actions
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

// Hook to consume context
export const useEmpresa = () => {
  const context = useContext(EmpresaContext);
  if (!context) {
    throw new Error('useEmpresa deve ser usado dentro de EmpresaProvider');
  }
  return context;
};

export default EmpresaContext;
