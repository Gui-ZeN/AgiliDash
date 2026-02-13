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
  parseProgramacaoFerias,
} from '../utils/dominioParser';

const DataContext = createContext();

// Dados iniciais
const initialGrupos = [
  {
    id: 'grupo_001',
    nome: 'Grupo EJP',
    descricao: 'Holding principal',
    status: 'Ativo',
    criadoEm: '2024-01-15',
    responsavelPadrao: {
      nome: 'Responsavel Grupo',
      cargo: 'Socio-Administrador',
      whatsapp: '(85) 99999-0000',
    },
  },
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
    responsavel: {
      nome: 'Responsavel CNPJ',
      cargo: 'Diretor',
      whatsapp: '(85) 99999-0001',
    },
    status: 'Ativo',
  },
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
    criadoEm: '2024-01-15',
  },
];

// Estrutura inicial para dados contÃ¡beis
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

  // Estado para dados contÃ¡beis por CNPJ
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
      criadoEm: new Date().toISOString().split('T')[0],
    };
    setGrupos((prev) => [...prev, newGrupo]);
    return newGrupo;
  };

  const updateGrupo = (id, data) => {
    setGrupos((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)));
  };

  const deleteGrupo = (id) => {
    // Excluir CNPJs do grupo
    setCnpjs((prev) => prev.filter((c) => c.grupoId !== id));
    // Excluir usuarios do grupo
    setUsuarios((prev) => prev.filter((u) => u.grupoId !== id));
    // Excluir grupo
    setGrupos((prev) => prev.filter((g) => g.id !== id));
  };

  // ===== CRUD CNPJs =====
  const addCnpj = (cnpj) => {
    const newCnpj = {
      ...cnpj,
      id: `cnpj_${Date.now()}`,
      status: 'Ativo',
    };
    setCnpjs((prev) => [...prev, newCnpj]);
    return newCnpj;
  };

  const updateCnpj = (id, data) => {
    setCnpjs((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  };

  const deleteCnpj = (id) => {
    setCnpjs((prev) => prev.filter((c) => c.id !== id));
  };

  const getCnpjsByGrupo = (grupoId) => {
    return cnpjs.filter((c) => c.grupoId === grupoId);
  };

  // ===== CRUD USUARIOS =====
  const addUsuario = (usuario) => {
    const newUsuario = {
      ...usuario,
      id: `user_${Date.now()}`,
      status: 'Ativo',
      criadoEm: new Date().toISOString().split('T')[0],
    };
    setUsuarios((prev) => [...prev, newUsuario]);
    return newUsuario;
  };

  const updateUsuario = (id, data) => {
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
  };

  const deleteUsuario = (id) => {
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  };

  const getUsuariosByGrupo = (grupoId) => {
    return usuarios.filter((u) => u.grupoId === grupoId);
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
          throw new Error(`Tipo de relatÃ³rio desconhecido: ${tipoRelatorio}`);
      }

      setDadosContabeis((prev) => {
        const cnpjData = prev[cnpjId] || {
          balancetes: [],
          analiseHorizontal: null,
          dreComparativa: null,
          dreMensal: null,
          balancetesConsolidados: null,
        };

        if (tipoRelatorio === 'balancete') {
          // Adicionar ao array de balancetes (mÃ¡ximo 12 para sÃ©rie mensal)
          const newBalancetes = [...cnpjData.balancetes, dadosParsed].slice(-12);
          return {
            ...prev,
            [cnpjId]: {
              ...cnpjData,
              balancetes: newBalancetes,
              balancetesConsolidados: consolidarBalancetesMensais(newBalancetes),
            },
          };
        } else if (tipoRelatorio === 'analiseHorizontal') {
          // MESCLAR dados por competÃªncia - suporta mÃºltiplos anos
          const existingData = cnpjData.analiseHorizontal || {};
          const existingCompetencias = existingData.dadosPorCompetencia || {};

          // Mesclar competÃªncias existentes com novas
          const mergedCompetencias = {
            ...existingCompetencias,
            ...dadosParsed.dadosPorCompetencia,
          };

          // Ordenar competÃªncias cronologicamente
          const competenciasOrdenadas = Object.keys(mergedCompetencias).sort((a, b) => {
            const [mesA, anoA] = a.split('/').map(Number);
            const [mesB, anoB] = b.split('/').map(Number);
            return anoA !== anoB ? anoA - anoB : mesA - mesB;
          });

          // Reconstruir arrays ordenados para grÃ¡ficos
          const mesesLabels = competenciasOrdenadas.map((c) => {
            const dados = mergedCompetencias[c];
            return `${dados.mesNome}/${String(dados.ano).slice(-2)}`;
          });
          const receitasMensais = competenciasOrdenadas.map((c) => mergedCompetencias[c].receita);
          const despesasMensais = competenciasOrdenadas.map((c) => mergedCompetencias[c].despesa);

          // Calcular totais
          const totalReceitas = receitasMensais.reduce((a, b) => a + b, 0);
          const totalDespesas = despesasMensais.reduce((a, b) => a + b, 0);

          return {
            ...prev,
            [cnpjId]: {
              ...cnpjData,
              analiseHorizontal: {
                ...dadosParsed,
                dadosPorCompetencia: mergedCompetencias,
                competenciasOrdenadas,
                meses: mesesLabels, // Labels com ano (ex: "Jan/25", "Jan/26")
                receitasMensais,
                despesasMensais,
                totais: {
                  ...dadosParsed.totais,
                  totalReceitas,
                  totalDespesas,
                },
              },
            },
          };
        } else {
          return {
            ...prev,
            [cnpjId]: {
              ...cnpjData,
              [tipoRelatorio]: dadosParsed,
            },
          };
        }
      });

      return { success: true, dados: dadosParsed };
    } catch (error) {
      console.error('Erro ao importar relatÃ³rio:', error);
      return { success: false, error: error.message };
    }
  };

  const getDadosContabeis = (cnpjId) => {
    return dadosContabeis[cnpjId] || null;
  };

  const limparDadosContabeis = (cnpjId) => {
    setDadosContabeis((prev) => {
      const newData = { ...prev };
      delete newData[cnpjId];
      return newData;
    });
  };

  const normalizarTexto = (texto = '') =>
    String(texto)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim();

  const getMesIndexByNome = (mesNome = '') => {
    const mapaMeses = {
      JANEIRO: 1,
      FEVEREIRO: 2,
      MARCO: 3,
      ABRIL: 4,
      MAIO: 5,
      JUNHO: 6,
      JULHO: 7,
      AGOSTO: 8,
      SETEMBRO: 9,
      OUTUBRO: 10,
      NOVEMBRO: 11,
      DEZEMBRO: 12,
    };
    return mapaMeses[normalizarTexto(mesNome)] || null;
  };

  const normalizarCompetencia = (competencia = '') => {
    const match = String(competencia).match(/^(\d{1,2})\/(\d{4})$/);
    if (!match) return '';
    const mes = String(Number(match[1])).padStart(2, '0');
    const ano = match[2];
    return `${mes}/${ano}`;
  };

  const ordenarCompetencia = (a, b) => {
    const [mesA, anoA] = String(a || '')
      .split('/')
      .map(Number);
    const [mesB, anoB] = String(b || '')
      .split('/')
      .map(Number);
    if (anoA !== anoB) return anoA - anoB;
    return mesA - mesB;
  };

  const consolidarResumoAcumulador = (porCompetencia = {}) => {
    const entradasMap = new Map();
    const saidasMap = new Map();
    const categorias = {
      compraComercializacao: 0,
      compraIndustrializacao: 0,
      vendaMercadoria: 0,
      vendaProduto: 0,
      vendaExterior: 0,
      servicos: 0,
      totalVendas380: 0,
      esperado380: 0,
    };

    const normalizarDescricao = (texto = '') =>
      String(texto)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/\s+/g, ' ')
        .trim();

    const isServicoRelacionado = (descricao = '') => {
      const desc = normalizarDescricao(descricao);
      return (
        desc.includes('SERVICO TOMADO') ||
        desc.includes('SERVICO TOMADO ISS RET') ||
        desc.includes('LANC. COMPRA P/ RECEBIMENTO FUTURO') ||
        desc.includes('COMPRA P/ RECEBIMENTO FUTURO') ||
        desc.includes('COMPRA PARA RECEBIMENTO FUTURO') ||
        desc.includes('SERVICO DE TRANSPORTE') ||
        desc.includes('SISTEMA DE SEGURANCA ELETRONICA') ||
        desc.includes('AQ. SERVICO DE MANUT E REVISAO VEICULAR')
      );
    };

    const somarItens = (mapa, itens = []) => {
      itens.forEach((item) => {
        const chave = `${item.codigo || ''}::${item.descricao || ''}`;
        if (!mapa.has(chave)) {
          mapa.set(chave, { ...item });
          return;
        }
        const atual = mapa.get(chave);
        Object.entries(item).forEach(([campo, valor]) => {
          if (typeof valor === 'number' && Number.isFinite(valor)) {
            atual[campo] = Number(atual[campo] || 0) + valor;
          } else if (atual[campo] === undefined) {
            atual[campo] = valor;
          }
        });
        mapa.set(chave, atual);
      });
    };

    Object.values(porCompetencia).forEach((resumo) => {
      if (!resumo) return;
      somarItens(entradasMap, resumo.entradas || []);
      somarItens(saidasMap, resumo.saidas || []);
      Object.keys(categorias).forEach((campo) => {
        categorias[campo] += Number(resumo?.categorias?.[campo] || 0);
      });
    });

    const entradas = Array.from(entradasMap.values());
    const saidas = Array.from(saidasMap.values());
    const competencias = Object.keys(porCompetencia).sort(ordenarCompetencia);

    const detalhesVendas = saidas.filter((s) => {
      const desc = normalizarDescricao(s.descricao || '');
      return (
        desc.startsWith('VENDA') &&
        !desc.includes('ATIVO') &&
        !desc.includes('IMOBILIZADO') &&
        !desc.includes('CANCEL')
      );
    });

    return {
      entradas,
      saidas,
      totais: {
        entradas: entradas.reduce((acc, e) => acc + Number(e.vlrContabil || 0), 0),
        saidas: saidas.reduce((acc, s) => acc + Number(s.vlrContabil || 0), 0),
      },
      categorias,
      detalhes380: {
        compras: entradas.filter((e) =>
          normalizarDescricao(e.descricao || '').includes('COMPRA P/ COMERCIALIZA')
        ),
        vendasMercadoria: detalhesVendas,
        vendasProduto: detalhesVendas.filter((s) =>
          normalizarDescricao(s.descricao || '').includes('PRODUTO')
        ),
        vendasExterior: detalhesVendas.filter((s) =>
          normalizarDescricao(s.descricao || '').includes('EXTERIOR')
        ),
        servicos: entradas.filter((e) => isServicoRelacionado(e.descricao || '')),
      },
      porCompetencia,
      competencias,
      tipo: 'resumoAcumulador',
    };
  };

  const consolidarFaturamento = (porCompetencia = {}, empresaInfo = {}) => {
    const competencias = Object.keys(porCompetencia).sort(ordenarCompetencia);
    const faturamento = competencias.map((competencia) => {
      const [mes, ano] = competencia.split('/').map(Number);
      const item = porCompetencia[competencia] || {};
      return {
        mes: item.mes || '',
        mesIndex: mes,
        ano,
        competencia,
        saidas: Number(item.saidas || 0),
        servicos: Number(item.servicos || 0),
        outros: Number(item.outros || 0),
        total: Number(item.total || item.saidas || 0),
      };
    });

    const totais = faturamento.reduce(
      (acc, item) => {
        acc.saidas += Number(item.saidas || 0);
        acc.servicos += Number(item.servicos || 0);
        acc.outros += Number(item.outros || 0);
        acc.total += Number(item.total || 0);
        return acc;
      },
      { saidas: 0, servicos: 0, outros: 0, total: 0 }
    );

    return {
      empresaInfo,
      faturamento,
      faturamento2024: faturamento.filter((f) => f.ano === 2024),
      faturamento2025: faturamento.filter((f) => f.ano === 2025),
      totais,
      porCompetencia,
      competencias,
      tipo: 'faturamento',
    };
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
          throw new Error(`Tipo de relatÃ³rio fiscal desconhecido: ${tipoRelatorio}`);
      }

      // Para CSLL e IRPJ, usar trimestre selecionado manualmente
      if ((tipoRelatorio === 'csll' || tipoRelatorio === 'irpj') && opcoes.trimestre) {
        dadosParsed.trimestreNumero = parseInt(opcoes.trimestre);
        dadosParsed.trimestreLabel = `${opcoes.trimestre}o Trimestre`;
      }

      setDadosFiscais((prev) => {
        const cnpjData = prev[cnpjId] || {
          csll: [],
          irpj: [],
          faturamento: null,
          demonstrativoMensal: null,
          resumoImpostos: null,
          resumoAcumulador: null,
        };

        // CSLL e IRPJ sÃ£o trimestrais, guardar por nÃºmero do trimestre
        if (tipoRelatorio === 'csll') {
          // Substituir se ja existir trimestre igual, senao adicionar
          const trimNum = dadosParsed.trimestreNumero || cnpjData.csll.length + 1;
          let newCsll = cnpjData.csll.filter((c) => c.trimestreNumero !== trimNum);
          newCsll.push(dadosParsed);
          newCsll = newCsll.sort((a, b) => (a.trimestreNumero || 0) - (b.trimestreNumero || 0));
          return {
            ...prev,
            [cnpjId]: { ...cnpjData, csll: newCsll },
          };
        }

        if (tipoRelatorio === 'irpj') {
          const trimNum = dadosParsed.trimestreNumero || cnpjData.irpj.length + 1;
          let newIrpj = cnpjData.irpj.filter((i) => i.trimestreNumero !== trimNum);
          newIrpj.push(dadosParsed);
          newIrpj = newIrpj.sort((a, b) => (a.trimestreNumero || 0) - (b.trimestreNumero || 0));
          return {
            ...prev,
            [cnpjId]: { ...cnpjData, irpj: newIrpj },
          };
        }

        if (tipoRelatorio === 'faturamento') {
          const existingPorCompetencia = cnpjData.faturamento?.porCompetencia || {};
          const mergedPorCompetencia = { ...existingPorCompetencia };

          (dadosParsed?.faturamento || []).forEach((item) => {
            const mesIndex = getMesIndexByNome(item?.mes);
            const ano = Number(item?.ano || 0);
            if (!mesIndex || !ano) return;

            const competencia = `${String(mesIndex).padStart(2, '0')}/${ano}`;
            const atual = mergedPorCompetencia[competencia] || {
              mes: item.mes,
              ano,
              saidas: 0,
              servicos: 0,
              outros: 0,
              total: 0,
            };

            mergedPorCompetencia[competencia] = {
              ...atual,
              mes: item.mes || atual.mes,
              ano,
              saidas: Number(atual.saidas || 0) + Number(item.saidas || 0),
              servicos: Number(atual.servicos || 0) + Number(item.servicos || 0),
              outros: Number(atual.outros || 0) + Number(item.outros || 0),
              total: Number(atual.total || 0) + Number(item.total || item.saidas || 0),
            };
          });

          const faturamentoConsolidado = consolidarFaturamento(
            mergedPorCompetencia,
            dadosParsed?.empresaInfo || cnpjData.faturamento?.empresaInfo || {}
          );

          return {
            ...prev,
            [cnpjId]: { ...cnpjData, faturamento: faturamentoConsolidado },
          };
        }

        if (tipoRelatorio === 'resumoAcumulador') {
          const existingPorCompetencia = cnpjData.resumoAcumulador?.porCompetencia || {};
          const competenciaRaw =
            dadosParsed?.competenciaReferencia ||
            dadosParsed?.competenciaFim ||
            dadosParsed?.competenciaInicio;
          const competencia = normalizarCompetencia(competenciaRaw) || `import_${Date.now()}`;
          const mergedPorCompetencia = {
            ...existingPorCompetencia,
            [competencia]: {
              ...dadosParsed,
              competenciaReferencia: competencia,
            },
          };
          const resumoConsolidado = consolidarResumoAcumulador(mergedPorCompetencia);

          return {
            ...prev,
            [cnpjId]: { ...cnpjData, resumoAcumulador: resumoConsolidado },
          };
        }

        return {
          ...prev,
          [cnpjId]: { ...cnpjData, [tipoRelatorio]: dadosParsed },
        };
      });

      return { success: true, dados: dadosParsed };
    } catch (error) {
      console.error('Erro ao importar relatÃ³rio fiscal:', error);
      return { success: false, error: error.message };
    }
  };

  const getDadosFiscais = (cnpjId) => {
    return dadosFiscais[cnpjId] || null;
  };

  const limparDadosFiscais = (cnpjId) => {
    setDadosFiscais((prev) => {
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
          throw new Error(`Tipo de relatÃ³rio pessoal desconhecido: ${tipoRelatorio}`);
      }

      setDadosPessoal((prev) => {
        const cnpjData = prev[cnpjId] || {
          fgts: null,
          inss: null,
          empregados: null,
          salarioBase: null,
          ferias: null,
        };

        return {
          ...prev,
          [cnpjId]: {
            ...cnpjData,
            [tipoRelatorio]: dadosParsed,
          },
        };
      });

      return { success: true, dados: dadosParsed };
    } catch (error) {
      console.error('Erro ao importar relatÃ³rio pessoal:', error);
      return { success: false, error: error.message };
    }
  };

  const getDadosPessoal = (cnpjId) => {
    return dadosPessoal[cnpjId] || null;
  };

  const limparDadosPessoal = (cnpjId) => {
    setDadosPessoal((prev) => {
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
    gruposAtivos: grupos.filter((g) => g.status === 'Ativo').length,
    cnpjsAtivos: cnpjs.filter((c) => c.status === 'Ativo').length,
    usuariosAtivos: usuarios.filter((u) => u.status === 'Ativo').length,
  });

  // Setores disponiveis
  const setoresDisponiveis = [
    { id: 'contabil', nome: 'Contabil', descricao: 'Acesso ao setor contabil' },
    { id: 'fiscal', nome: 'Fiscal', descricao: 'Acesso ao setor fiscal' },
    { id: 'pessoal', nome: 'Pessoal', descricao: 'Acesso ao setor de pessoal/RH' },
    { id: 'administrativo', nome: 'Administrativo', descricao: 'Acesso ao setor administrativo' },
  ];

  const getVisibilidadeStorageConfig = (cnpjId) => {
    if (!cnpjId) return null;

    const saved = localStorage.getItem(`agili_visibilidade_${cnpjId}`);
    if (!saved) return null;

    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && parsed.config) {
        return parsed.config;
      }
      return parsed;
    } catch {
      return null;
    }
  };

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
    setoresDisponiveis,

    // Visibilidade de Dashboards
    getVisibilidadeConfig: (cnpjId) => {
      return getVisibilidadeStorageConfig(cnpjId);
    },

    isSecaoVisivel: (cnpjId, secaoId) => {
      const config = getVisibilidadeStorageConfig(cnpjId);
      if (!config) return true; // Por padrão tudo visível
      return config[secaoId]?.visivel !== false;
    },

    isItemVisivel: (cnpjId, secaoId, itemId) => {
      const config = getVisibilidadeStorageConfig(cnpjId);
      if (!config) return true; // Por padrão tudo visível
      return config[secaoId]?.itens?.[itemId] !== false;
    },
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData deve ser usado dentro de DataProvider');
  }
  return context;
};

export default DataContext;
