/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { useData } from './DataContext';

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
  qtdCnpjs: 0,
};

const criarSet = (lista) => (Array.isArray(lista) && lista.length > 0 ? new Set(lista) : null);

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizarSlug = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const extrairDigitosCnpj = (cnpj = '') => String(cnpj || '').replace(/\D/g, '');

const extrairRaizCnpj = (cnpj = '') => {
  const digitos = extrairDigitosCnpj(cnpj);
  if (digitos.length !== 14) return '';
  return digitos.slice(0, 8);
};

const gerarEmpresaId = (cnpj) => {
  if (cnpj?.empresaId) return cnpj.empresaId;
  const raizCnpj = extrairRaizCnpj(cnpj?.cnpj);
  if (raizCnpj) {
    return `empresa_${cnpj?.grupoId || 'sem_grupo'}_${raizCnpj}`;
  }
  const base = normalizarSlug(cnpj?.razaoSocial || cnpj?.nomeFantasia || cnpj?.id || 'empresa');
  return `empresa_${cnpj?.grupoId || 'sem_grupo'}_${base}`;
};

const normalizarCnpjs = (cnpjs = [], grupos = []) => {
  const grupoDefault = grupos[0]?.id || null;

  return (cnpjs || []).map((cnpj) => {
    const grupoId = cnpj?.grupoId || grupoDefault;
    return {
      ...cnpj,
      grupoId,
      empresaId: gerarEmpresaId({ ...cnpj, grupoId }),
      endereco: cnpj?.endereco || {
        cidade: cnpj?.cidade || '',
        estado: cnpj?.estado || '',
      },
    };
  });
};

const construirEmpresas = (cnpjs = []) => {
  const map = new Map();

  cnpjs.forEach((cnpj) => {
    if (!cnpj?.empresaId) return;

    if (!map.has(cnpj.empresaId)) {
      map.set(cnpj.empresaId, {
        id: cnpj.empresaId,
        grupoId: cnpj.grupoId,
        razaoSocial: cnpj.razaoSocial || cnpj.nomeFantasia || 'Empresa',
        nomeFantasia: cnpj.nomeFantasia || cnpj.razaoSocial || 'Empresa',
        cnpjPrincipal: cnpj.cnpj || '',
        regimeTributario: cnpj.regimeTributario || '',
        status: cnpj.status || 'Ativo',
        tipoPrincipal: cnpj.tipo || '',
      });
      return;
    }

    const empresaAtual = map.get(cnpj.empresaId);
    const empresaTemMatriz = empresaAtual?.tipoPrincipal === 'Matriz';
    const cnpjEhMatriz = cnpj?.tipo === 'Matriz';

    const devePromoverComoPrincipal =
      !empresaAtual?.cnpjPrincipal || (!empresaTemMatriz && cnpjEhMatriz);

    if (devePromoverComoPrincipal) {
      map.set(cnpj.empresaId, {
        ...empresaAtual,
        grupoId: cnpj.grupoId || empresaAtual.grupoId,
        razaoSocial: cnpj.razaoSocial || cnpj.nomeFantasia || empresaAtual.razaoSocial,
        nomeFantasia: cnpj.nomeFantasia || cnpj.razaoSocial || empresaAtual.nomeFantasia,
        cnpjPrincipal: cnpj.cnpj || empresaAtual.cnpjPrincipal,
        regimeTributario: cnpj.regimeTributario || empresaAtual.regimeTributario,
        status: cnpj.status || empresaAtual.status,
        tipoPrincipal: cnpj.tipo || empresaAtual.tipoPrincipal,
      });
    }
  });

  return Array.from(map.values()).map(({ tipoPrincipal: _tipoPrincipal, ...empresa }) => empresa);
};

const getTotaisCnpj = ({ dadosContabeis, dadosFiscais, dadosPessoal }) => {
  const receita = toNumber(dadosContabeis?.analiseHorizontal?.totais?.totalReceitas);
  const despesa = toNumber(dadosContabeis?.analiseHorizontal?.totais?.totalDespesas);
  const lucro = receita - despesa;

  const funcionarios = toNumber(dadosPessoal?.empregados?.estatisticas?.total);
  const folhaMensal = toNumber(dadosPessoal?.inss?.totais?.valorINSS);

  const irpj = (dadosFiscais?.irpj || []).reduce(
    (acc, item) => acc + toNumber(item?.totalImpostoRecolher || item?.totalImpostoDevido),
    0
  );
  const csll = (dadosFiscais?.csll || []).reduce(
    (acc, item) => acc + toNumber(item?.csllApurada || item?.totalRecolher),
    0
  );

  return {
    receita,
    despesa,
    lucro,
    funcionarios,
    folhaMensal,
    irpj,
    csll,
    cargaTributaria: irpj + csll,
  };
};

export const EmpresaProvider = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const {
    grupos: gruposBase,
    cnpjs: cnpjsBase,
    setoresDisponiveis,
    getDadosContabeis,
    getDadosFiscais,
    getDadosPessoal,
  } = useData();

  const [grupoSelecionado, setGrupoSelecionado] = useState(null);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [cnpjSelecionado, setCnpjSelecionado] = useState(null);
  const [modoVisualizacao, setModoVisualizacao] = useState('cnpj');

  const cnpjsNormalizados = useMemo(
    () => normalizarCnpjs(cnpjsBase || [], gruposBase || []),
    [cnpjsBase, gruposBase]
  );
  const empresasBase = useMemo(() => construirEmpresas(cnpjsNormalizados), [cnpjsNormalizados]);

  const grupoIdsPermitidos = useMemo(
    () => (isAdmin ? null : criarSet(user?.acesso?.grupoIds)),
    [isAdmin, user?.acesso?.grupoIds]
  );

  const empresaIdsPermitidas = useMemo(
    () => (isAdmin ? null : criarSet(user?.acesso?.empresaIds)),
    [isAdmin, user?.acesso?.empresaIds]
  );

  const empresaIdsPermitidasValidas = useMemo(() => {
    if (isAdmin || !empresaIdsPermitidas) return null;
    const idsExistentes = new Set(empresasBase.map((e) => e.id));
    const ids = [...empresaIdsPermitidas].filter((id) => idsExistentes.has(id));
    return ids.length > 0 ? new Set(ids) : null;
  }, [isAdmin, empresaIdsPermitidas, empresasBase]);

  const cnpjIdsPermitidos = useMemo(
    () => (isAdmin ? null : criarSet(user?.acesso?.cnpjIds)),
    [isAdmin, user?.acesso?.cnpjIds]
  );

  const empresasPermitidas = useMemo(() => {
    if (isAdmin) return empresasBase;

    const temEscopo = !!(grupoIdsPermitidos || empresaIdsPermitidasValidas || cnpjIdsPermitidos);
    if (!temEscopo) return [];

    let resultado = [...empresasBase];

    if (grupoIdsPermitidos) {
      resultado = resultado.filter((e) => grupoIdsPermitidos.has(e.grupoId));
    }

    if (empresaIdsPermitidasValidas) {
      resultado = resultado.filter((e) => empresaIdsPermitidasValidas.has(e.id));
    }

    if (cnpjIdsPermitidos) {
      const empresaIdsDoCnpj = new Set(
        cnpjsNormalizados.filter((c) => cnpjIdsPermitidos.has(c.id)).map((c) => c.empresaId)
      );
      resultado = resultado.filter((e) => empresaIdsDoCnpj.has(e.id));
    }

    return resultado;
  }, [
    isAdmin,
    empresasBase,
    grupoIdsPermitidos,
    empresaIdsPermitidasValidas,
    cnpjIdsPermitidos,
    cnpjsNormalizados,
  ]);

  const empresaIdsPermitidasSet = useMemo(
    () => new Set(empresasPermitidas.map((e) => e.id)),
    [empresasPermitidas]
  );

  const cnpjsPermitidos = useMemo(() => {
    if (isAdmin) return cnpjsNormalizados;

    let resultado = cnpjsNormalizados.filter((c) => empresaIdsPermitidasSet.has(c.empresaId));

    if (cnpjIdsPermitidos) {
      resultado = resultado.filter((c) => cnpjIdsPermitidos.has(c.id));
    }

    return resultado;
  }, [isAdmin, cnpjsNormalizados, empresaIdsPermitidasSet, cnpjIdsPermitidos]);

  const gruposPermitidos = useMemo(() => {
    const grupoIds = new Set(empresasPermitidas.map((e) => e.grupoId));
    return (gruposBase || []).filter((g) => grupoIds.has(g.id));
  }, [empresasPermitidas, gruposBase]);

  useEffect(() => {
    if (
      empresasPermitidas.length === 0 ||
      cnpjsPermitidos.length === 0 ||
      gruposPermitidos.length === 0
    ) {
      if (grupoSelecionado !== null) setGrupoSelecionado(null);
      if (empresaSelecionada !== null) setEmpresaSelecionada(null);
      if (cnpjSelecionado !== null) setCnpjSelecionado(null);
      if (modoVisualizacao !== 'cnpj') setModoVisualizacao('cnpj');
      return;
    }

    const empresaValida =
      empresasPermitidas.find((e) => e.id === empresaSelecionada) || empresasPermitidas[0];
    const grupoValido = empresaValida.grupoId;
    const cnpjsDaEmpresa = cnpjsPermitidos.filter((c) => c.empresaId === empresaValida.id);
    const cnpjValido =
      cnpjsDaEmpresa.find((c) => c.id === cnpjSelecionado) ||
      cnpjsDaEmpresa[0] ||
      cnpjsPermitidos[0];

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
    modoVisualizacao,
  ]);

  const cnpjInfo = useMemo(
    () => cnpjsPermitidos.find((c) => c.id === cnpjSelecionado) || cnpjsPermitidos[0] || null,
    [cnpjsPermitidos, cnpjSelecionado]
  );

  const cnpjDados = useMemo(() => {
    if (!cnpjInfo?.id) return null;
    const totais = getTotaisCnpj({
      dadosContabeis: getDadosContabeis(cnpjInfo.id),
      dadosFiscais: getDadosFiscais(cnpjInfo.id),
      dadosPessoal: getDadosPessoal(cnpjInfo.id),
    });

    return {
      pessoalData: {
        funcionarios: totais.funcionarios,
        totalFuncionarios: totais.funcionarios,
        folhaMensal: totais.folhaMensal,
      },
      totaisFiscais: {
        irpj: totais.irpj,
        csll: totais.csll,
      },
      dreData2025: {
        receita: [totais.receita],
        despesa: [totais.despesa],
        lucro: [totais.lucro],
      },
    };
  }, [cnpjInfo?.id, getDadosContabeis, getDadosFiscais, getDadosPessoal]);

  const empresaAtual = useMemo(
    () =>
      empresasPermitidas.find((e) => e.id === empresaSelecionada) || empresasPermitidas[0] || null,
    [empresasPermitidas, empresaSelecionada]
  );

  const grupoAtual = useMemo(
    () => gruposPermitidos.find((g) => g.id === grupoSelecionado) || gruposPermitidos[0] || null,
    [gruposPermitidos, grupoSelecionado]
  );

  const listaGrupos = gruposPermitidos;
  const listaEmpresas = useMemo(
    () => empresasPermitidas.filter((e) => e.grupoId === grupoAtual?.id),
    [empresasPermitidas, grupoAtual?.id]
  );
  const listaCnpjs = useMemo(
    () => cnpjsPermitidos.filter((c) => c.empresaId === empresaAtual?.id),
    [cnpjsPermitidos, empresaAtual?.id]
  );

  const todosCnpjs = cnpjsPermitidos;

  const cnpjIdsEscopo = useMemo(() => {
    if (!cnpjInfo?.id) return [];

    switch (modoVisualizacao) {
      case 'empresa':
        return cnpjsPermitidos.filter((c) => c.empresaId === empresaAtual?.id).map((c) => c.id);
      case 'grupo': {
        const empresasDoGrupo = new Set(
          empresasPermitidas.filter((e) => e.grupoId === grupoAtual?.id).map((e) => e.id)
        );
        return cnpjsPermitidos.filter((c) => empresasDoGrupo.has(c.empresaId)).map((c) => c.id);
      }
      case 'todos':
        return cnpjsPermitidos.map((c) => c.id);
      default:
        return [cnpjInfo.id];
    }
  }, [
    cnpjInfo?.id,
    modoVisualizacao,
    cnpjsPermitidos,
    empresaAtual?.id,
    empresasPermitidas,
    grupoAtual?.id,
  ]);

  const isConsolidado = modoVisualizacao !== 'cnpj';

  const totaisConsolidados = useMemo(() => {
    if (!isConsolidado) return null;
    if (!cnpjIdsEscopo.length) return { ...EMPTY_TOTALS };

    return cnpjIdsEscopo.reduce(
      (totais, cnpjId) => {
        const dadosContabeis = getDadosContabeis(cnpjId);
        const dadosFiscais = getDadosFiscais(cnpjId);
        const dadosPessoal = getDadosPessoal(cnpjId);
        const dados = getTotaisCnpj({ dadosContabeis, dadosFiscais, dadosPessoal });

        return {
          receita: totais.receita + dados.receita,
          despesa: totais.despesa + dados.despesa,
          lucro: totais.lucro + dados.lucro,
          funcionarios: totais.funcionarios + dados.funcionarios,
          folhaMensal: totais.folhaMensal + dados.folhaMensal,
          irpj: totais.irpj + dados.irpj,
          csll: totais.csll + dados.csll,
          cargaTributaria: totais.cargaTributaria + dados.cargaTributaria,
          qtdCnpjs: totais.qtdCnpjs + 1,
        };
      },
      { ...EMPTY_TOTALS }
    );
  }, [isConsolidado, cnpjIdsEscopo, getDadosContabeis, getDadosFiscais, getDadosPessoal]);

  const selecionarGrupo = useCallback(
    (grupoId) => {
      const grupoExiste = gruposPermitidos.some((g) => g.id === grupoId);
      if (!grupoExiste) return;

      setGrupoSelecionado(grupoId);

      const empresasDoGrupo = empresasPermitidas.filter((e) => e.grupoId === grupoId);
      if (empresasDoGrupo.length > 0) {
        const primeiraEmpresa = empresasDoGrupo[0];
        setEmpresaSelecionada(primeiraEmpresa.id);

        const cnpjsDaEmpresa = cnpjsPermitidos.filter((c) => c.empresaId === primeiraEmpresa.id);
        if (cnpjsDaEmpresa.length > 0) {
          setCnpjSelecionado(cnpjsDaEmpresa[0].id);
        }
      }

      setModoVisualizacao('cnpj');
    },
    [gruposPermitidos, empresasPermitidas, cnpjsPermitidos]
  );

  const selecionarEmpresa = useCallback(
    (empresaId) => {
      const empresa = empresasPermitidas.find((e) => e.id === empresaId);
      if (!empresa) return;

      setEmpresaSelecionada(empresa.id);
      if (empresa.grupoId !== grupoSelecionado) {
        setGrupoSelecionado(empresa.grupoId);
      }

      const cnpjsDaEmpresa = cnpjsPermitidos.filter((c) => c.empresaId === empresa.id);
      if (cnpjsDaEmpresa.length > 0) {
        setCnpjSelecionado(cnpjsDaEmpresa[0].id);
      }

      setModoVisualizacao('cnpj');
    },
    [empresasPermitidas, cnpjsPermitidos, grupoSelecionado]
  );

  const selecionarCnpj = useCallback(
    (cnpjId) => {
      const cnpj = cnpjsPermitidos.find((c) => c.id === cnpjId);
      if (!cnpj) return;

      setCnpjSelecionado(cnpj.id);

      const empresa = empresasPermitidas.find((e) => e.id === cnpj.empresaId);
      if (empresa) {
        setEmpresaSelecionada(empresa.id);
        setGrupoSelecionado(empresa.grupoId);
      }

      setModoVisualizacao('cnpj');
    },
    [cnpjsPermitidos, empresasPermitidas]
  );

  const toggleModoConsolidado = useCallback((modo) => {
    setModoVisualizacao((prev) => (prev === modo ? 'cnpj' : modo));
  }, []);

  const modoLabel = useMemo(() => {
    switch (modoVisualizacao) {
      case 'empresa':
        return `Consolidado: ${empresaAtual?.nomeFantasia || 'Empresa'}`;
      case 'grupo':
        return `Consolidado: ${grupoAtual?.nome || 'Grupo'}`;
      case 'todos':
        return isAdmin ? 'Visão Consolidada Total' : 'Visão Consolidada Permitida';
      default:
        return cnpjInfo?.nomeFantasia || 'CNPJ';
    }
  }, [
    modoVisualizacao,
    empresaAtual?.nomeFantasia,
    grupoAtual?.nome,
    cnpjInfo?.nomeFantasia,
    isAdmin,
  ]);

  const value = {
    grupoSelecionado,
    empresaSelecionada,
    cnpjSelecionado,
    modoVisualizacao,
    isConsolidado,
    modoLabel,

    cnpjInfo,
    cnpjDados,
    empresaAtual,
    grupoAtual,

    listaGrupos,
    listaEmpresas,
    listaCnpjs,
    todosCnpjs,
    todasEmpresas: empresasPermitidas,
    todosGrupos: gruposPermitidos,
    setoresDisponiveis,

    totaisConsolidados,

    selecionarGrupo,
    selecionarEmpresa,
    selecionarCnpj,
    toggleModoConsolidado,
    setModoVisualizacao,
  };

  return <EmpresaContext.Provider value={value}>{children}</EmpresaContext.Provider>;
};

export const useEmpresa = () => {
  const context = useContext(EmpresaContext);
  if (!context) {
    throw new Error('useEmpresa deve ser usado dentro de EmpresaProvider');
  }
  return context;
};

export default EmpresaContext;
