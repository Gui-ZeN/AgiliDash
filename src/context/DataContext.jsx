import { createContext, useContext, useState, useEffect } from 'react';
import {
  parseBalancete,
  parseAnaliseHorizontal,
  parseDREComparativa,
  parseDREMensal,
  consolidarBalancetesMensais,
  parseContribuicaoSocial,
  parseImpostoRenda,
  parseDemonstrativoFinanceiro,
  parseDemonstrativoMensal,
  parseResumoImpostos,
  parseResumoPorAcumulador,
  // Parsers do Setor Pessoal
  parseDemonstrativoFGTS,
  parseFolhaINSS,
  parseRelacaoEmpregados,
  parseSalarioBase,
  parseProgramacaoFerias
} from '../utils/dominioParser';

const DataContext = createContext();

// Dados iniciais
const initialGrupos = [
  { id: 'grupo_001', nome: 'Grupo EJP', descricao: 'Holding principal', status: 'Ativo', criadoEm: '2024-01-15' }
];

const initialCnpjs = [
  {
    id: 'cnpj_001',
    grupoId: 'grupo_001',
    cnpj: '12.345.678/0001-90',
    razaoSocial: 'EJP Comercio e Servicos Ltda',
    nomeFantasia: 'EJP Matriz',
    tipo: 'Matriz',
    regimeTributario: 'Lucro Real',
    cidade: 'Sao Paulo',
    estado: 'SP',
    status: 'Ativo'
  }
];

const initialUsuarios = [
  {
    id: 'user_001',
    nome: 'Administrador',
    email: 'admin@agili.com.br',
    perfil: 'Admin',
    grupoId: 'grupo_001',
    setoresAcesso: ['contabil', 'fiscal', 'pessoal', 'administrativo'],
    status: 'Ativo',
    criadoEm: '2024-01-15'
  }
];

// Estrutura inicial para dados contábeis
const initialDadosContabeis = {
  // cnpjId -> { balancetes: [], analiseHorizontal: null, dreComparativa: null, dreMensal: null }
};

// Estrutura inicial para dados fiscais
const initialDadosFiscais = {
  // cnpjId -> { csll: [], irpj: [], faturamento: null, demonstrativoMensal: null, resumoImpostos: null, resumoAcumulador: null }
};

// Estrutura inicial para dados do setor pessoal
const initialDadosPessoal = {
  // cnpjId -> { fgts: null, inss: null, empregados: null, salarioBase: null, ferias: null }
};

export const DataProvider = ({ children }) => {
  // Estado para Grupos
  const [grupos, setGrupos] = useState(() => {
    const saved = localStorage.getItem('agili_grupos');
    return saved ? JSON.parse(saved) : initialGrupos;
  });

  // Estado para CNPJs
  const [cnpjs, setCnpjs] = useState(() => {
    const saved = localStorage.getItem('agili_cnpjs');
    return saved ? JSON.parse(saved) : initialCnpjs;
  });

  // Estado para Usuarios
  const [usuarios, setUsuarios] = useState(() => {
    const saved = localStorage.getItem('agili_usuarios');
    return saved ? JSON.parse(saved) : initialUsuarios;
  });

  // Estado para dados contábeis por CNPJ
  const [dadosContabeis, setDadosContabeis] = useState(() => {
    const saved = localStorage.getItem('agili_dados_contabeis');
    return saved ? JSON.parse(saved) : initialDadosContabeis;
  });

  // Estado para dados fiscais por CNPJ
  const [dadosFiscais, setDadosFiscais] = useState(() => {
    const saved = localStorage.getItem('agili_dados_fiscais');
    return saved ? JSON.parse(saved) : initialDadosFiscais;
  });

  // Estado para dados do setor pessoal por CNPJ
  const [dadosPessoal, setDadosPessoal] = useState(() => {
    const saved = localStorage.getItem('agili_dados_pessoal');
    return saved ? JSON.parse(saved) : initialDadosPessoal;
  });

  // Persistir no localStorage
  useEffect(() => {
    localStorage.setItem('agili_grupos', JSON.stringify(grupos));
  }, [grupos]);

  useEffect(() => {
    localStorage.setItem('agili_cnpjs', JSON.stringify(cnpjs));
  }, [cnpjs]);

  useEffect(() => {
    localStorage.setItem('agili_usuarios', JSON.stringify(usuarios));
  }, [usuarios]);

  useEffect(() => {
    localStorage.setItem('agili_dados_contabeis', JSON.stringify(dadosContabeis));
  }, [dadosContabeis]);

  useEffect(() => {
    localStorage.setItem('agili_dados_fiscais', JSON.stringify(dadosFiscais));
  }, [dadosFiscais]);

  useEffect(() => {
    localStorage.setItem('agili_dados_pessoal', JSON.stringify(dadosPessoal));
  }, [dadosPessoal]);

  // ===== CRUD GRUPOS =====
  const addGrupo = (grupo) => {
    const newGrupo = {
      ...grupo,
      id: `grupo_${Date.now()}`,
      status: 'Ativo',
      criadoEm: new Date().toISOString().split('T')[0]
    };
    setGrupos(prev => [...prev, newGrupo]);
    return newGrupo;
  };

  const updateGrupo = (id, data) => {
    setGrupos(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
  };

  const deleteGrupo = (id) => {
    // Excluir CNPJs do grupo
    setCnpjs(prev => prev.filter(c => c.grupoId !== id));
    // Excluir usuarios do grupo
    setUsuarios(prev => prev.filter(u => u.grupoId !== id));
    // Excluir grupo
    setGrupos(prev => prev.filter(g => g.id !== id));
  };

  // ===== CRUD CNPJs =====
  const addCnpj = (cnpj) => {
    const newCnpj = {
      ...cnpj,
      id: `cnpj_${Date.now()}`,
      status: 'Ativo'
    };
    setCnpjs(prev => [...prev, newCnpj]);
    return newCnpj;
  };

  const updateCnpj = (id, data) => {
    setCnpjs(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCnpj = (id) => {
    setCnpjs(prev => prev.filter(c => c.id !== id));
  };

  const getCnpjsByGrupo = (grupoId) => {
    return cnpjs.filter(c => c.grupoId === grupoId);
  };

  // ===== CRUD USUARIOS =====
  const addUsuario = (usuario) => {
    const newUsuario = {
      ...usuario,
      id: `user_${Date.now()}`,
      status: 'Ativo',
      criadoEm: new Date().toISOString().split('T')[0]
    };
    setUsuarios(prev => [...prev, newUsuario]);
    return newUsuario;
  };

  const updateUsuario = (id, data) => {
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
  };

  const deleteUsuario = (id) => {
    setUsuarios(prev => prev.filter(u => u.id !== id));
  };

  const getUsuariosByGrupo = (grupoId) => {
    return usuarios.filter(u => u.grupoId === grupoId);
  };

  // ===== DADOS CONTABEIS =====
  const importarRelatorioContabil = (cnpjId, tipoRelatorio, csvContent) => {
    try {
      let dadosParsed;

      switch (tipoRelatorio) {
        case 'balancete':
          dadosParsed = parseBalancete(csvContent);
          break;
        case 'analiseHorizontal':
          dadosParsed = parseAnaliseHorizontal(csvContent);
          break;
        case 'dreComparativa':
          dadosParsed = parseDREComparativa(csvContent);
          break;
        case 'dreMensal':
          dadosParsed = parseDREMensal(csvContent);
          break;
        default:
          throw new Error(`Tipo de relatório desconhecido: ${tipoRelatorio}`);
      }

      setDadosContabeis(prev => {
        const cnpjData = prev[cnpjId] || {
          balancetes: [],
          analiseHorizontal: null,
          dreComparativa: null,
          dreMensal: null,
          balancetesConsolidados: null
        };

        if (tipoRelatorio === 'balancete') {
          // Adicionar ao array de balancetes (máximo 12 para série mensal)
          const newBalancetes = [...cnpjData.balancetes, dadosParsed].slice(-12);
          return {
            ...prev,
            [cnpjId]: {
              ...cnpjData,
              balancetes: newBalancetes,
              balancetesConsolidados: consolidarBalancetesMensais(newBalancetes)
            }
          };
        } else {
          return {
            ...prev,
            [cnpjId]: {
              ...cnpjData,
              [tipoRelatorio]: dadosParsed
            }
          };
        }
      });

      return { success: true, dados: dadosParsed };
    } catch (error) {
      console.error('Erro ao importar relatório:', error);
      return { success: false, error: error.message };
    }
  };

  const getDadosContabeis = (cnpjId) => {
    return dadosContabeis[cnpjId] || null;
  };

  const limparDadosContabeis = (cnpjId) => {
    setDadosContabeis(prev => {
      const newData = { ...prev };
      delete newData[cnpjId];
      return newData;
    });
  };

  // ===== DADOS FISCAIS =====
  const importarRelatorioFiscal = (cnpjId, tipoRelatorio, csvContent, opcoes = {}) => {
    try {
      let dadosParsed;

      switch (tipoRelatorio) {
        case 'csll':
          dadosParsed = parseContribuicaoSocial(csvContent);
          break;
        case 'irpj':
          dadosParsed = parseImpostoRenda(csvContent);
          break;
        case 'faturamento':
          dadosParsed = parseDemonstrativoFinanceiro(csvContent);
          break;
        case 'demonstrativoMensal':
          dadosParsed = parseDemonstrativoMensal(csvContent);
          break;
        case 'resumoImpostos':
          dadosParsed = parseResumoImpostos(csvContent);
          break;
        case 'resumoAcumulador':
          dadosParsed = parseResumoPorAcumulador(csvContent);
          break;
        default:
          throw new Error(`Tipo de relatório fiscal desconhecido: ${tipoRelatorio}`);
      }

      // Para CSLL e IRPJ, usar trimestre selecionado manualmente
      if ((tipoRelatorio === 'csll' || tipoRelatorio === 'irpj') && opcoes.trimestre) {
        dadosParsed.trimestreNumero = parseInt(opcoes.trimestre);
        dadosParsed.trimestreLabel = `${opcoes.trimestre}o Trimestre`;
      }

      setDadosFiscais(prev => {
        const cnpjData = prev[cnpjId] || {
          csll: [],
          irpj: [],
          faturamento: null,
          demonstrativoMensal: null,
          resumoImpostos: null,
          resumoAcumulador: null
        };

        // CSLL e IRPJ são trimestrais, guardar por número do trimestre
        if (tipoRelatorio === 'csll') {
          // Substituir se já existir trimestre igual, senão adicionar
          const trimNum = dadosParsed.trimestreNumero || cnpjData.csll.length + 1;
          let newCsll = cnpjData.csll.filter(c => c.trimestreNumero !== trimNum);
          newCsll.push(dadosParsed);
          newCsll = newCsll.sort((a, b) => (a.trimestreNumero || 0) - (b.trimestreNumero || 0));
          return {
            ...prev,
            [cnpjId]: { ...cnpjData, csll: newCsll }
          };
        } else if (tipoRelatorio === 'irpj') {
          const trimNum = dadosParsed.trimestreNumero || cnpjData.irpj.length + 1;
          let newIrpj = cnpjData.irpj.filter(i => i.trimestreNumero !== trimNum);
          newIrpj.push(dadosParsed);
          newIrpj = newIrpj.sort((a, b) => (a.trimestreNumero || 0) - (b.trimestreNumero || 0));
          return {
            ...prev,
            [cnpjId]: { ...cnpjData, irpj: newIrpj }
          };
        } else {
          return {
            ...prev,
            [cnpjId]: { ...cnpjData, [tipoRelatorio]: dadosParsed }
          };
        }
      });

      return { success: true, dados: dadosParsed };
    } catch (error) {
      console.error('Erro ao importar relatório fiscal:', error);
      return { success: false, error: error.message };
    }
  };

  const getDadosFiscais = (cnpjId) => {
    return dadosFiscais[cnpjId] || null;
  };

  const limparDadosFiscais = (cnpjId) => {
    setDadosFiscais(prev => {
      const newData = { ...prev };
      delete newData[cnpjId];
      return newData;
    });
  };

  // ===== DADOS PESSOAL (RH) =====
  const importarRelatorioPessoal = (cnpjId, tipoRelatorio, csvContent) => {
    try {
      let dadosParsed;

      switch (tipoRelatorio) {
        case 'fgts':
          dadosParsed = parseDemonstrativoFGTS(csvContent);
          break;
        case 'inss':
          dadosParsed = parseFolhaINSS(csvContent);
          break;
        case 'empregados':
          dadosParsed = parseRelacaoEmpregados(csvContent);
          break;
        case 'salarioBase':
          dadosParsed = parseSalarioBase(csvContent);
          break;
        case 'ferias':
          dadosParsed = parseProgramacaoFerias(csvContent);
          break;
        default:
          throw new Error(`Tipo de relatório pessoal desconhecido: ${tipoRelatorio}`);
      }

      setDadosPessoal(prev => {
        const cnpjData = prev[cnpjId] || {
          fgts: null,
          inss: null,
          empregados: null,
          salarioBase: null,
          ferias: null
        };

        return {
          ...prev,
          [cnpjId]: {
            ...cnpjData,
            [tipoRelatorio]: dadosParsed
          }
        };
      });

      return { success: true, dados: dadosParsed };
    } catch (error) {
      console.error('Erro ao importar relatório pessoal:', error);
      return { success: false, error: error.message };
    }
  };

  const getDadosPessoal = (cnpjId) => {
    return dadosPessoal[cnpjId] || null;
  };

  const limparDadosPessoal = (cnpjId) => {
    setDadosPessoal(prev => {
      const newData = { ...prev };
      delete newData[cnpjId];
      return newData;
    });
  };

  // ===== ESTATISTICAS =====
  const getStats = () => ({
    totalGrupos: grupos.length,
    totalCnpjs: cnpjs.length,
    totalUsuarios: usuarios.length,
    gruposAtivos: grupos.filter(g => g.status === 'Ativo').length,
    cnpjsAtivos: cnpjs.filter(c => c.status === 'Ativo').length,
    usuariosAtivos: usuarios.filter(u => u.status === 'Ativo').length
  });

  // Setores disponiveis
  const setoresDisponiveis = [
    { id: 'contabil', nome: 'Contabil', descricao: 'Acesso ao setor contabil' },
    { id: 'fiscal', nome: 'Fiscal', descricao: 'Acesso ao setor fiscal' },
    { id: 'pessoal', nome: 'Pessoal', descricao: 'Acesso ao setor de pessoal/RH' },
    { id: 'administrativo', nome: 'Administrativo', descricao: 'Acesso ao setor administrativo' }
  ];

  const value = {
    // Grupos
    grupos,
    addGrupo,
    updateGrupo,
    deleteGrupo,

    // CNPJs
    cnpjs,
    addCnpj,
    updateCnpj,
    deleteCnpj,
    getCnpjsByGrupo,

    // Usuarios
    usuarios,
    addUsuario,
    updateUsuario,
    deleteUsuario,
    getUsuariosByGrupo,

    // Dados Contabeis
    dadosContabeis,
    importarRelatorioContabil,
    getDadosContabeis,
    limparDadosContabeis,

    // Dados Fiscais
    dadosFiscais,
    importarRelatorioFiscal,
    getDadosFiscais,
    limparDadosFiscais,

    // Dados Pessoal (RH)
    dadosPessoal,
    importarRelatorioPessoal,
    getDadosPessoal,
    limparDadosPessoal,

    // Utils
    getStats,
    setoresDisponiveis
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData deve ser usado dentro de DataProvider');
  }
  return context;
};

export default DataContext;
