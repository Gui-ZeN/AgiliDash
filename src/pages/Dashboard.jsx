import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, Layers } from 'lucide-react';
import Header from '../components/layout/Header';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { useEmpresa } from '../context/EmpresaContext';
import { useTheme } from '../context/ThemeContext';
import Breadcrumb from '../components/ui/Breadcrumb';
import PeriodFilter from '../components/ui/PeriodFilter';
import ExportButton from '../components/ui/ExportButton';
import CnpjFilter from '../components/ui/CnpjFilter';
import { shouldUseGroupVisibilityInConsolidado } from '../utils/visibilidadeConfig';

const DashboardGeraisTab = lazy(() => import('./dashboard/tabs/DashboardGeraisTab'));
const DashboardContabilTab = lazy(() => import('./dashboard/tabs/DashboardContabilTab'));
const DashboardFiscalTab = lazy(() => import('./dashboard/tabs/DashboardFiscalTab'));
const DashboardPessoalTab = lazy(() => import('./dashboard/tabs/DashboardPessoalTab'));
const DashboardAdministrativoTab = lazy(() => import('./dashboard/tabs/DashboardAdministrativoTab'));

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

const calcularDespesasCustos = (competencia = {}) => {
  const camposDespesas = [
    'cmv',
    'despesasOperacionais',
    'resultadoFinanceiro',
    'outrasReceitasOperacionais',
    'outrasDespesasReceitas',
    'provisaoCSLL',
    'provisaoIRPJ',
  ];

  const somaDespesas = camposDespesas.reduce((acc, campo) => {
    const valor = Number(competencia?.[campo]);
    return acc + (Number.isFinite(valor) ? valor : 0);
  }, 0);

  return Math.abs(somaDespesas);
};

const obterReceitaCompetencia = (competencia = {}) => {
  if (Object.prototype.hasOwnProperty.call(competencia, 'receita')) {
    const receita = Number(competencia.receita);
    if (Number.isFinite(receita)) return receita;
  }

  const receitaBruta = Number(competencia?.receitaBruta);
  return Number.isFinite(receitaBruta) ? receitaBruta : 0;
};

const obterDespesaCompetencia = (competencia = {}) => {
  if (Object.prototype.hasOwnProperty.call(competencia, 'despesa')) {
    const despesa = Number(competencia.despesa);
    if (Number.isFinite(despesa)) return Math.abs(despesa);
  }

  return calcularDespesasCustos(competencia);
};

const mergeDeep = (target, source) => {
  if (source == null) return target;
  if (target == null) return source;

  if (typeof target === 'number' && typeof source === 'number') {
    return target + source;
  }

  if (Array.isArray(target) && Array.isArray(source)) {
    const arrayNumerico =
      target.every((v) => typeof v === 'number') && source.every((v) => typeof v === 'number');
    if (arrayNumerico) {
      const max = Math.max(target.length, source.length);
      return Array.from({ length: max }, (_, i) => (target[i] || 0) + (source[i] || 0));
    }
    return [...target, ...source];
  }

  if (typeof target === 'object' && typeof source === 'object') {
    const merged = { ...target };
    Object.keys(source).forEach((key) => {
      if (merged[key] === undefined) {
        merged[key] = source[key];
      } else {
        merged[key] = mergeDeep(merged[key], source[key]);
      }
    });
    return merged;
  }

  return target ?? source;
};

const somarArrayNumerico = (arrays, tamanho = 12) => {
  const base = new Array(tamanho).fill(0);
  arrays.forEach((arr) => {
    if (!Array.isArray(arr)) return;
    for (let i = 0; i < tamanho; i += 1) {
      base[i] += Number(arr[i] || 0);
    }
  });
  return base;
};

const MESES_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/**
 * Dashboard Principal - Design Aprimorado
 * Contém as 5 tabs: Info. Gerais, Contábil, Fiscal, Pessoal, Administrativo
 */
const Dashboard = () => {
  // Recupera a aba ativa do localStorage ou usa 'gerais' como padrão
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('dashboard_activeTab');
    return savedTab || 'gerais';
  });
  const [selectedYear, setSelectedYear] = useState(2025);
  const [animateCards, setAnimateCards] = useState(false);
  const [periodFilter, setPeriodFilter] = useState({ type: 'year', year: 2025 });
  const [fiscalTrimestre, setFiscalTrimestre] = useState(null); // 1, 2, 3, 4 ou null (ano todo)

  // Usar contexto da empresa e tema
  const {
    cnpjInfo,
    cnpjDados,
    isConsolidado,
    totaisConsolidados,
    modoVisualizacao,
    grupoAtual,
    empresaAtual,
    listaCnpjs,
    todosCnpjs,
    todasEmpresas,
  } = useEmpresa();
  const { isDarkMode } = useTheme();
  const { isAdmin } = useAuth();
  const {
    getDadosContabeis,
    getDadosFiscais,
    getDadosPessoal,
    isSecaoVisivel,
    isItemVisivel,
    getVisibilidadeScopeConfig,
    previewClienteAtivo,
    setPreviewClienteAtivo,
    getVisibilidadeMeta,
    isVisibilidadeAplicada,
    cnpjs: cnpjsAdmin,
    grupos: gruposAdmin,
  } = useData();

  const usarVisibilidadeGrupoConsolidado = shouldUseGroupVisibilityInConsolidado(
    isConsolidado,
    modoVisualizacao
  );

  const configVisibilidadeGrupoConsolidado = useMemo(() => {
    if (!usarVisibilidadeGrupoConsolidado || !grupoAtual?.id) return null;
    return getVisibilidadeScopeConfig('grupo', grupoAtual.id);
  }, [usarVisibilidadeGrupoConsolidado, grupoAtual?.id, getVisibilidadeScopeConfig]);

  const itemVisivel = (secaoId, itemId) => {
    if (configVisibilidadeGrupoConsolidado) {
      return configVisibilidadeGrupoConsolidado?.[secaoId]?.itens?.[itemId] !== false;
    }
    return isItemVisivel(cnpjInfo?.id, secaoId, itemId);
  };

  // Obter dados contábeis importados para o CNPJ selecionado
  const cnpjIdsEscopo = useMemo(() => {
    if (!isConsolidado) return [cnpjInfo?.id].filter(Boolean);

    if (modoVisualizacao === 'empresa') {
      return [...new Set(listaCnpjs.map((c) => c.id))];
    }

    if (modoVisualizacao === 'grupo') {
      const empresasDoGrupo = todasEmpresas
        .filter((e) => e.grupoId === grupoAtual?.id)
        .map((e) => e.id);
      return [
        ...new Set(
          todosCnpjs.filter((c) => empresasDoGrupo.includes(c.empresaId)).map((c) => c.id)
        ),
      ];
    }

    if (modoVisualizacao === 'todos') {
      return [...new Set(todosCnpjs.map((c) => c.id))];
    }

    return [cnpjInfo?.id].filter(Boolean);
  }, [
    isConsolidado,
    cnpjInfo?.id,
    modoVisualizacao,
    listaCnpjs,
    grupoAtual?.id,
    todosCnpjs,
    todasEmpresas,
  ]);

  const tabsDisponiveisBase = useMemo(() => {
    const tabs = ['gerais', 'contabil', 'fiscal', 'pessoal', 'administrativo'];
    return tabs.filter((tab) => {
      if (configVisibilidadeGrupoConsolidado) {
        return configVisibilidadeGrupoConsolidado?.[tab]?.visivel !== false;
      }
      return isSecaoVisivel(cnpjInfo?.id, tab);
    });
  }, [cnpjInfo?.id, isSecaoVisivel, configVisibilidadeGrupoConsolidado]);

  const dadosContabeisEscopo = useMemo(
    () => cnpjIdsEscopo.map((id) => getDadosContabeis(id)).filter(Boolean),
    [cnpjIdsEscopo, getDadosContabeis]
  );
  const dadosFiscaisEscopo = useMemo(
    () => cnpjIdsEscopo.map((id) => getDadosFiscais(id)).filter(Boolean),
    [cnpjIdsEscopo, getDadosFiscais]
  );
  const dadosPessoalEscopo = useMemo(
    () => cnpjIdsEscopo.map((id) => getDadosPessoal(id)).filter(Boolean),
    [cnpjIdsEscopo, getDadosPessoal]
  );

  const dadosContabeisSelecionado = getDadosContabeis(cnpjInfo?.id);
  const dadosFiscaisSelecionado = getDadosFiscais(cnpjInfo?.id);
  const dadosPessoalSelecionado = getDadosPessoal(cnpjInfo?.id);

  const responsavelInfo = useMemo(() => {
    const responsavelVazio = { nome: 'Nao informado', cargo: 'Nao informado', whatsapp: '' };
    const cnpjAdmin = cnpjsAdmin.find((c) => c.id === cnpjInfo?.id);
    const grupoAdmin = gruposAdmin.find((g) => g.id === (cnpjAdmin?.grupoId || grupoAtual?.id));
    const candidato = [
      cnpjAdmin?.responsavel,
      grupoAdmin?.responsavelPadrao,
      cnpjInfo?.responsavel,
    ].find((r) => r && (r.nome || r.cargo || r.whatsapp));

    if (!candidato) return responsavelVazio;
    return {
      nome: candidato.nome || responsavelVazio.nome,
      cargo: candidato.cargo || responsavelVazio.cargo,
      whatsapp: candidato.whatsapp || '',
    };
  }, [cnpjsAdmin, gruposAdmin, cnpjInfo?.id, cnpjInfo?.responsavel, grupoAtual?.id]);

  const responsavelWhatsappLink = responsavelInfo.whatsapp
    ? `https://wa.me/55${responsavelInfo.whatsapp.replace(/\D/g, '')}`
    : '#';
  const equipeTecnicaData = Array.isArray(cnpjInfo?.equipeTecnica) ? cnpjInfo.equipeTecnica : [];

  const visibilidadeMeta = useMemo(
    () => getVisibilidadeMeta(cnpjInfo?.id),
    [cnpjInfo?.id, getVisibilidadeMeta]
  );

  const dadosContabeisConsolidados = useMemo(() => {
    if (!isConsolidado) return null;

    const competenciasMap = {};
    dadosContabeisEscopo.forEach((item) => {
      const competencias = item?.analiseHorizontal?.dadosPorCompetencia || {};
      Object.entries(competencias).forEach(([chave, valor]) => {
        const atual = competenciasMap[chave] || {};
        const proximo = { ...atual };
        Object.entries(valor).forEach(([campo, conteudo]) => {
          if (typeof conteudo === 'number' && Number.isFinite(conteudo)) {
            proximo[campo] = Number(proximo[campo] || 0) + conteudo;
          } else if (proximo[campo] === undefined) {
            proximo[campo] = conteudo;
          }
        });
        if (!proximo.competencia) proximo.competencia = chave;
        competenciasMap[chave] = proximo;
      });
    });

    const competenciasOrdenadas = Object.keys(competenciasMap).sort(ordenarCompetencia);
    let analiseHorizontal = null;
    if (competenciasOrdenadas.length > 0) {
      const mesesLabels = competenciasOrdenadas.map((comp) => {
        const item = competenciasMap[comp];
        if (item?.mesNome && item?.ano) return `${item.mesNome}/${String(item.ano).slice(-2)}`;
        return comp;
      });
      const receitasMensais = competenciasOrdenadas.map((comp) =>
        obterReceitaCompetencia(competenciasMap[comp])
      );
      const despesasMensais = competenciasOrdenadas.map((comp) =>
        obterDespesaCompetencia(competenciasMap[comp])
      );
      const lucroLiquidoMensal = receitasMensais.map((rec, i) => rec - (despesasMensais[i] || 0));
      const anoExercicio =
        Number(competenciasMap[competenciasOrdenadas[competenciasOrdenadas.length - 1]]?.ano) ||
        selectedYear;
      const totalReceitas = receitasMensais.reduce((acc, val) => acc + val, 0);
      const totalDespesas = despesasMensais.reduce((acc, val) => acc + val, 0);

      analiseHorizontal = {
        anoExercicio,
        dadosPorCompetencia: competenciasMap,
        competenciasOrdenadas,
        meses: mesesLabels,
        receitasMensais,
        despesasMensais,
        lucroLiquidoMensal,
        dados: {
          receitaBruta: competenciasOrdenadas.map((comp) =>
            Number(competenciasMap[comp]?.receitaBruta || 0)
          ),
          cmv: competenciasOrdenadas.map((comp) => Number(competenciasMap[comp]?.cmv || 0)),
          despesasOperacionais: competenciasOrdenadas.map((comp) =>
            Number(competenciasMap[comp]?.despesasOperacionais || 0)
          ),
          resultadoFinanceiro: competenciasOrdenadas.map((comp) =>
            Number(competenciasMap[comp]?.resultadoFinanceiro || 0)
          ),
          outrasReceitasOperacionais: competenciasOrdenadas.map((comp) =>
            Number(competenciasMap[comp]?.outrasReceitasOperacionais || 0)
          ),
          outrasDespesasReceitas: competenciasOrdenadas.map((comp) =>
            Number(competenciasMap[comp]?.outrasDespesasReceitas || 0)
          ),
          provisaoCSLL: competenciasOrdenadas.map((comp) =>
            Number(competenciasMap[comp]?.provisaoCSLL || 0)
          ),
          provisaoIRPJ: competenciasOrdenadas.map((comp) =>
            Number(competenciasMap[comp]?.provisaoIRPJ || 0)
          ),
          lucroAntesIR: competenciasOrdenadas.map((comp) =>
            Number(competenciasMap[comp]?.lucroAntesIR || 0)
          ),
        },
        totais: {
          totalReceitas,
          totalDespesas,
          lucroLiquido: totalReceitas - totalDespesas,
        },
      };
    }

    const balancetesEscopo = dadosContabeisEscopo
      .map((item) => item?.balancetesConsolidados)
      .filter(Boolean);
    let balancetesConsolidados = null;
    if (balancetesEscopo.length > 0) {
      const mesesPadrao = balancetesEscopo[0]?.meses || [
        'Jan',
        'Fev',
        'Mar',
        'Abr',
        'Mai',
        'Jun',
        'Jul',
        'Ago',
        'Set',
        'Out',
        'Nov',
        'Dez',
      ];
      const tamanho = mesesPadrao.length;
      const series = {
        bancosMovimento: somarArrayNumerico(
          balancetesEscopo.map((b) => b?.series?.bancosMovimento || []),
          tamanho
        ),
        aplicacoesFinanceiras: somarArrayNumerico(
          balancetesEscopo.map((b) => b?.series?.aplicacoesFinanceiras || []),
          tamanho
        ),
        estoque: somarArrayNumerico(
          balancetesEscopo.map((b) => b?.series?.estoque || []),
          tamanho
        ),
        receita: somarArrayNumerico(
          balancetesEscopo.map((b) => b?.series?.receita || []),
          tamanho
        ),
        custo: somarArrayNumerico(
          balancetesEscopo.map((b) => b?.series?.custo || []),
          tamanho
        ),
      };
      balancetesConsolidados = { meses: mesesPadrao, series };
    }

    return {
      analiseHorizontal,
      balancetesConsolidados,
    };
  }, [isConsolidado, dadosContabeisEscopo, selectedYear]);

  const dadosFiscaisConsolidados = useMemo(() => {
    if (!isConsolidado) return null;

    const mergeTrimestres = (listas) => {
      const mapa = {};
      listas.flat().forEach((item) => {
        if (!item) return;
        const tri = Number(item.trimestreNumero || 0);
        if (!tri) return;
        if (!mapa[tri]) {
          mapa[tri] = {
            ...item,
            dados: { ...item.dados },
          };
        } else {
          mapa[tri] = mergeDeep(mapa[tri], item);
        }
      });
      return Object.values(mapa).sort(
        (a, b) => (a.trimestreNumero || 0) - (b.trimestreNumero || 0)
      );
    };

    const movimentoMap = {};
    dadosFiscaisEscopo.forEach((item) => {
      const movimentacao = item?.demonstrativoMensal?.movimentacao || [];
      movimentacao.forEach((mov) => {
        const competencia =
          mov.competencia ||
          `${String(mov.mesIndex || 1).padStart(2, '0')}/${mov.ano || selectedYear}`;
        if (!movimentoMap[competencia]) {
          movimentoMap[competencia] = {
            mes: mov.mes,
            mesIndex: mov.mesIndex,
            ano: mov.ano,
            competencia,
            entradas: 0,
            saidas: 0,
            servicos: 0,
          };
        }
        movimentoMap[competencia].entradas += Number(mov.entradas || 0);
        movimentoMap[competencia].saidas += Number(mov.saidas || 0);
        movimentoMap[competencia].servicos += Number(mov.servicos || 0);
      });
    });
    const movimentacaoConsolidada = Object.values(movimentoMap).sort((a, b) => {
      if ((a.ano || 0) !== (b.ano || 0)) return (a.ano || 0) - (b.ano || 0);
      return (a.mesIndex || 0) - (b.mesIndex || 0);
    });
    let demonstrativoMensal = null;
    if (movimentacaoConsolidada.length > 0) {
      const anosUnicos = [...new Set(movimentacaoConsolidada.map((m) => m.ano))].sort();
      const movimentacaoPorAno = {};
      const totaisPorAno = {};
      anosUnicos.forEach((ano) => {
        const lista = movimentacaoConsolidada.filter((m) => m.ano === ano);
        movimentacaoPorAno[ano] = lista;
        totaisPorAno[ano] = {
          entradas: lista.reduce((acc, m) => acc + (m.entradas || 0), 0),
          saidas: lista.reduce((acc, m) => acc + (m.saidas || 0), 0),
          servicos: lista.reduce((acc, m) => acc + (m.servicos || 0), 0),
        };
      });
      demonstrativoMensal = {
        movimentacao: movimentacaoConsolidada,
        movimentacaoPorAno,
        totaisPorAno,
        totaisGerais: {
          entradas: movimentacaoConsolidada.reduce((acc, m) => acc + (m.entradas || 0), 0),
          saidas: movimentacaoConsolidada.reduce((acc, m) => acc + (m.saidas || 0), 0),
          servicos: movimentacaoConsolidada.reduce((acc, m) => acc + (m.servicos || 0), 0),
        },
        anosUnicos,
        movimentacao2024: movimentacaoPorAno[2024] || [],
        movimentacao2025: movimentacaoPorAno[2025] || [],
        totais2024: totaisPorAno[2024] || { entradas: 0, saidas: 0, servicos: 0 },
        totais2025: totaisPorAno[2025] || { entradas: 0, saidas: 0, servicos: 0 },
        tipo: 'demonstrativoMensal',
      };
    }

    const impostosPorMes = {};
    dadosFiscaisEscopo.forEach((item) => {
      const origem = item?.resumoImpostos?.impostosPorMes || {};
      Object.entries(origem).forEach(([competencia, dadosMes]) => {
        if (!impostosPorMes[competencia]) {
          impostosPorMes[competencia] = { impostos: [], totalRecolher: 0, totalCredor: 0 };
        }

        const impostos = Array.isArray(dadosMes) ? dadosMes : dadosMes?.impostos || [];
        impostos.forEach((imp) => {
          const idx = impostosPorMes[competencia].impostos.findIndex((i) => i.nome === imp.nome);
          if (idx === -1) {
            impostosPorMes[competencia].impostos.push({ ...imp });
          } else {
            impostosPorMes[competencia].impostos[idx] = mergeDeep(
              impostosPorMes[competencia].impostos[idx],
              imp
            );
          }
        });

        const totalRecolherMes = Array.isArray(dadosMes)
          ? impostos.reduce((acc, imp) => acc + Number(imp?.impostoRecolher || 0), 0)
          : Number(dadosMes?.totalRecolher || 0);
        const totalCredorMes = Array.isArray(dadosMes)
          ? impostos.reduce((acc, imp) => acc + Number(imp?.saldoCredorFinal || 0), 0)
          : Number(dadosMes?.totalCredor || 0);

        impostosPorMes[competencia].totalRecolher += totalRecolherMes;
        impostosPorMes[competencia].totalCredor += totalCredorMes;
      });
    });

    let resumoImpostos = null;
    if (Object.keys(impostosPorMes).length > 0) {
      const totaisPorImposto = {};
      Object.values(impostosPorMes).forEach((dadosMes) => {
        dadosMes.impostos.forEach((imp) => {
          if (!totaisPorImposto[imp.nome]) {
            totaisPorImposto[imp.nome] = { recolher: 0, credito: 0, debitos: 0, creditos: 0 };
          }
          totaisPorImposto[imp.nome].recolher += Number(imp.impostoRecolher || 0);
          totaisPorImposto[imp.nome].credito += Number(imp.saldoCredorFinal || 0);
          totaisPorImposto[imp.nome].debitos += Number(imp.debitos || 0);
          totaisPorImposto[imp.nome].creditos += Number(imp.creditos || 0);
        });
      });

      resumoImpostos = {
        impostosPorMes,
        totaisPorImposto,
        competencias: Object.keys(impostosPorMes).sort(ordenarCompetencia),
        totalRecolher: Object.values(impostosPorMes).reduce(
          (acc, mes) => acc + Number(mes.totalRecolher || 0),
          0
        ),
        totalCredor: Object.values(impostosPorMes).reduce(
          (acc, mes) => acc + Number(mes.totalCredor || 0),
          0
        ),
        periodosImportados: Object.keys(impostosPorMes).length,
        tipo: 'resumoImpostos',
      };
    }

    const normalizarTexto = (texto = '') =>
      String(texto)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .trim();
    const mesIndexPorNome = {
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
    const getMesIndexByNome = (mesNome = '') => mesIndexPorNome[normalizarTexto(mesNome)] || null;

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

    const consolidarResumoAcumuladorLista = (lista = []) => {
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

      lista.forEach((resumo) => {
        if (!resumo) return;
        somarItens(entradasMap, resumo.entradas || []);
        somarItens(saidasMap, resumo.saidas || []);
        Object.keys(categorias).forEach((campo) => {
          categorias[campo] += Number(resumo?.categorias?.[campo] || 0);
        });
      });

      const entradas = Array.from(entradasMap.values());
      const saidas = Array.from(saidasMap.values());
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
        tipo: 'resumoAcumulador',
      };
    };

    const resumoListaPorCompetencia = {};
    dadosFiscaisEscopo.forEach((item) => {
      const resumo = item?.resumoAcumulador;
      if (!resumo) return;

      const porCompetencia = resumo?.porCompetencia || {};
      if (Object.keys(porCompetencia).length > 0) {
        Object.entries(porCompetencia).forEach(([competencia, dadosCompetencia]) => {
          if (!resumoListaPorCompetencia[competencia]) resumoListaPorCompetencia[competencia] = [];
          resumoListaPorCompetencia[competencia].push(dadosCompetencia);
        });
        return;
      }

      const fallbackCompetencia =
        resumo?.competenciaReferencia ||
        resumo?.competenciaFim ||
        resumo?.competenciaInicio ||
        `${selectedYear}`;
      if (!resumoListaPorCompetencia[fallbackCompetencia])
        resumoListaPorCompetencia[fallbackCompetencia] = [];
      resumoListaPorCompetencia[fallbackCompetencia].push(resumo);
    });

    const resumoPorCompetencia = {};
    Object.entries(resumoListaPorCompetencia).forEach(([competencia, lista]) => {
      resumoPorCompetencia[competencia] = consolidarResumoAcumuladorLista(lista);
    });

    let resumoAcumulador = null;
    if (Object.keys(resumoPorCompetencia).length > 0) {
      const competencias = Object.keys(resumoPorCompetencia).sort(ordenarCompetencia);
      resumoAcumulador = {
        ...consolidarResumoAcumuladorLista(Object.values(resumoPorCompetencia)),
        porCompetencia: resumoPorCompetencia,
        competencias,
      };
    }

    const faturamentoPorCompetencia = {};
    dadosFiscaisEscopo.forEach((item) => {
      const dadosFaturamento = item?.faturamento;
      if (!dadosFaturamento) return;

      const porCompetencia = dadosFaturamento?.porCompetencia || {};
      if (Object.keys(porCompetencia).length > 0) {
        Object.entries(porCompetencia).forEach(([competencia, dadosCompetencia]) => {
          if (!faturamentoPorCompetencia[competencia]) {
            faturamentoPorCompetencia[competencia] = {
              mes: dadosCompetencia?.mes || '',
              ano: Number(dadosCompetencia?.ano || 0),
              saidas: 0,
              servicos: 0,
              outros: 0,
              total: 0,
            };
          }
          faturamentoPorCompetencia[competencia].saidas += Number(dadosCompetencia?.saidas || 0);
          faturamentoPorCompetencia[competencia].servicos += Number(
            dadosCompetencia?.servicos || 0
          );
          faturamentoPorCompetencia[competencia].outros += Number(dadosCompetencia?.outros || 0);
          faturamentoPorCompetencia[competencia].total += Number(
            dadosCompetencia?.total || dadosCompetencia?.saidas || 0
          );
        });
        return;
      }

      (dadosFaturamento?.faturamento || []).forEach((registro) => {
        const mesIndex = Number(registro?.mesIndex || getMesIndexByNome(registro?.mes));
        const ano = Number(registro?.ano || 0);
        if (!mesIndex || !ano) return;
        const competencia = `${String(mesIndex).padStart(2, '0')}/${ano}`;
        if (!faturamentoPorCompetencia[competencia]) {
          faturamentoPorCompetencia[competencia] = {
            mes: registro?.mes || '',
            ano,
            saidas: 0,
            servicos: 0,
            outros: 0,
            total: 0,
          };
        }
        faturamentoPorCompetencia[competencia].saidas += Number(registro?.saidas || 0);
        faturamentoPorCompetencia[competencia].servicos += Number(registro?.servicos || 0);
        faturamentoPorCompetencia[competencia].outros += Number(registro?.outros || 0);
        faturamentoPorCompetencia[competencia].total += Number(
          registro?.total || registro?.saidas || 0
        );
      });
    });

    let faturamento = null;
    if (Object.keys(faturamentoPorCompetencia).length > 0) {
      const competencias = Object.keys(faturamentoPorCompetencia).sort(ordenarCompetencia);
      const registros = competencias.map((competencia) => {
        const [mes, ano] = competencia.split('/').map(Number);
        const item = faturamentoPorCompetencia[competencia] || {};
        return {
          mes: item.mes || '',
          mesIndex: mes,
          ano,
          competencia,
          saidas: Number(item.saidas || 0),
          servicos: Number(item.servicos || 0),
          outros: Number(item.outros || 0),
          total: Number(item.total || 0),
        };
      });
      faturamento = {
        faturamento: registros,
        faturamento2024: registros.filter((r) => r.ano === 2024),
        faturamento2025: registros.filter((r) => r.ano === 2025),
        totais: {
          saidas: registros.reduce((acc, r) => acc + Number(r.saidas || 0), 0),
          servicos: registros.reduce((acc, r) => acc + Number(r.servicos || 0), 0),
          outros: registros.reduce((acc, r) => acc + Number(r.outros || 0), 0),
          total: registros.reduce((acc, r) => acc + Number(r.total || 0), 0),
        },
        porCompetencia: faturamentoPorCompetencia,
        competencias,
        tipo: 'faturamento',
      };
    }

    return {
      csll: mergeTrimestres(dadosFiscaisEscopo.map((item) => item?.csll || [])),
      irpj: mergeTrimestres(dadosFiscaisEscopo.map((item) => item?.irpj || [])),
      demonstrativoMensal,
      faturamento,
      resumoImpostos,
      resumoAcumulador,
    };
  }, [isConsolidado, dadosFiscaisEscopo, selectedYear]);

  const dadosPessoalConsolidados = useMemo(() => {
    if (!isConsolidado) return null;

    const fgts = dadosPessoalEscopo
      .map((item) => item?.fgts)
      .filter(Boolean)
      .reduce((acc, atual) => mergeDeep(acc, atual), null);
    const inss = dadosPessoalEscopo
      .map((item) => item?.inss)
      .filter(Boolean)
      .reduce((acc, atual) => mergeDeep(acc, atual), null);
    const empregados = dadosPessoalEscopo
      .map((item) => item?.empregados)
      .filter(Boolean)
      .reduce((acc, atual) => mergeDeep(acc, atual), null);
    const salarioBase = dadosPessoalEscopo
      .map((item) => item?.salarioBase)
      .filter(Boolean)
      .reduce((acc, atual) => mergeDeep(acc, atual), null);
    const ferias = dadosPessoalEscopo
      .map((item) => item?.ferias)
      .filter(Boolean)
      .reduce((acc, atual) => mergeDeep(acc, atual), null);

    if (fgts?.totaisPorCompetencia) {
      fgts.competencias = Object.keys(fgts.totaisPorCompetencia).sort(ordenarCompetencia);
      fgts.ultimos3Meses = fgts.competencias.slice(-3);
      fgts.anos = Object.keys(fgts.totaisPorAno || {})
        .map(Number)
        .sort();
      fgts.totalGeral = {
        base: Object.values(fgts.totaisPorCompetencia).reduce(
          (acc, item) => acc + Number(item.base || 0),
          0
        ),
        valorFGTS: Object.values(fgts.totaisPorCompetencia).reduce(
          (acc, item) => acc + Number(item.valorFGTS || 0),
          0
        ),
      };
    }

    if (inss?.totaisPorCompetencia) {
      inss.competencias = Object.keys(inss.totaisPorCompetencia).sort(ordenarCompetencia);
      inss.totalGeral = {
        baseCalculo: Object.values(inss.totaisPorCompetencia).reduce(
          (acc, item) => acc + Number(item.baseCalculo || 0),
          0
        ),
        valorINSS: Object.values(inss.totaisPorCompetencia).reduce(
          (acc, item) => acc + Number(item.valorINSS || 0),
          0
        ),
      };
    }

    if (empregados?.admissoesPorMes) {
      empregados.competenciasAdmissao = Object.keys(empregados.admissoesPorMes).sort(
        ordenarCompetencia
      );
      empregados.competenciasDemissao = Object.keys(empregados.demissoesPorMes || {}).sort(
        ordenarCompetencia
      );
      const ativos = Number(empregados.empregadosPorSituacao?.Ativo || 0);
      const demitidos = Number(empregados.empregadosPorSituacao?.Demitido || 0);
      const afastados = Number(empregados.empregadosPorSituacao?.Afastado || 0);
      empregados.estatisticas = {
        total: Number(empregados.empregados?.length || 0),
        ativos,
        demitidos,
        afastados,
      };
    }

    if (salarioBase?.salariosPorCargo) {
      const cargosOrdenados = Object.entries(salarioBase.salariosPorCargo)
        .map(([cargo, dados]) => {
          const quantidade = Number(dados.quantidade || 0);
          const salarioTotal = Number(dados.salarioTotal || 0);
          const salarioMin = Number.isFinite(dados.salarioMin) ? Number(dados.salarioMin) : 0;
          const salarioMax = Number(dados.salarioMax || 0);
          return {
            cargo,
            quantidade,
            salarioTotal,
            salarioMedio: quantidade > 0 ? salarioTotal / quantidade : 0,
            salarioMin,
            salarioMax,
          };
        })
        .sort((a, b) => b.salarioMedio - a.salarioMedio);

      salarioBase.cargosOrdenados = cargosOrdenados;
      const totalSalarios = cargosOrdenados.reduce((acc, item) => acc + item.salarioTotal, 0);
      const totalEmpregados = cargosOrdenados.reduce((acc, item) => acc + item.quantidade, 0);
      salarioBase.estatisticas = {
        totalEmpregados,
        totalSalarios,
        salarioMedioGeral: totalEmpregados > 0 ? totalSalarios / totalEmpregados : 0,
        quantidadeCargos: cargosOrdenados.length,
      };
    }

    if (ferias?.feriasPorMes) {
      ferias.mesesOrdenados = Object.keys(ferias.feriasPorMes).sort(ordenarCompetencia);
      ferias.estatisticas = {
        totalRegistros: Number(ferias.ferias?.length || 0),
        diasTotalProgramados: (ferias.ferias || []).reduce(
          (acc, item) => acc + Number(item.diasDireito || 0),
          0
        ),
        diasTotalGozados: (ferias.ferias || []).reduce(
          (acc, item) => acc + Number(item.diasGozados || 0),
          0
        ),
        diasRestantes: (ferias.ferias || []).reduce(
          (acc, item) => acc + Number(item.diasRestantes || 0),
          0
        ),
      };
    }

    return { fgts, inss, empregados, salarioBase, ferias };
  }, [isConsolidado, dadosPessoalEscopo]);

  const dadosContabeisImportados = isConsolidado
    ? dadosContabeisConsolidados
    : dadosContabeisSelecionado;
  const dadosFiscaisImportados = isConsolidado ? dadosFiscaisConsolidados : dadosFiscaisSelecionado;
  const dadosPessoalImportados = isConsolidado ? dadosPessoalConsolidados : dadosPessoalSelecionado;

  const temDadosContabeis = Boolean(
    dadosContabeisImportados?.analiseHorizontal || dadosContabeisImportados?.balancetesConsolidados
  );
  const temDadosFiscais = Boolean(
    dadosFiscaisImportados?.resumoAcumulador ||
    dadosFiscaisImportados?.faturamento ||
    dadosFiscaisImportados?.demonstrativoMensal ||
    dadosFiscaisImportados?.resumoImpostos ||
    dadosFiscaisImportados?.csll?.length > 0 ||
    dadosFiscaisImportados?.irpj?.length > 0
  );
  const temDadosPessoal = Boolean(
    dadosPessoalImportados?.fgts ||
    dadosPessoalImportados?.inss ||
    dadosPessoalImportados?.empregados ||
    dadosPessoalImportados?.ferias
  );

  const dadosAdministrativoImportados = useMemo(() => {
    if (typeof window === 'undefined') return null;

    const cnpjIds = cnpjIdsEscopo?.length ? cnpjIdsEscopo : [cnpjInfo?.id].filter(Boolean);
    if (!cnpjIds.length) return null;

    const parseNumero = (valor) => {
      if (typeof valor === 'number' && Number.isFinite(valor)) return valor;
      if (valor == null) return 0;
      const texto = String(valor).trim();
      if (!texto) return 0;

      if (texto.includes(',') && texto.includes('.')) {
        const normalizado = texto.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
        const numero = Number(normalizado);
        return Number.isFinite(numero) ? numero : 0;
      }

      const normalizado = texto.replace(',', '.').replace(/[^\d.-]/g, '');
      const numero = Number(normalizado);
      return Number.isFinite(numero) ? numero : 0;
    };

    const parseData = (valor) => {
      if (!valor) return null;
      if (valor instanceof Date && !Number.isNaN(valor.getTime())) return valor;

      const texto = String(valor).trim();
      if (!texto) return null;

      const ddmmyyyy = texto.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
      if (ddmmyyyy) {
        const dia = Number(ddmmyyyy[1]);
        const mes = Number(ddmmyyyy[2]) - 1;
        const ano = Number(ddmmyyyy[3]);
        const data = new Date(ano, mes, dia);
        return Number.isNaN(data.getTime()) ? null : data;
      }

      const data = new Date(texto);
      return Number.isNaN(data.getTime()) ? null : data;
    };

    const carregarRelatorio = (relatorioId) =>
      cnpjIds.flatMap((id) => {
        const key = `agili_import_administrativo_${relatorioId}_${id}`;
        try {
          const parsed = JSON.parse(localStorage.getItem(key) || '[]');
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      });

    const contratosRaw = carregarRelatorio('contratos');
    const despesasRaw = carregarRelatorio('despesas');
    const patrimonioRaw = carregarRelatorio('patrimonio');
    const fornecedoresRaw = carregarRelatorio('fornecedores');

    const totalRegistros =
      contratosRaw.length + despesasRaw.length + patrimonioRaw.length + fornecedoresRaw.length;
    if (!totalRegistros) return null;

    const inicioHoje = new Date();
    inicioHoje.setHours(0, 0, 0, 0);
    const limite30dias = new Date(inicioHoje);
    limite30dias.setDate(limite30dias.getDate() + 30);

    const listaContratos = contratosRaw.map((item = {}, idx) => {
      const vencimentoDate =
        parseData(item.dataFim) || parseData(item.vencimento) || parseData(item.data_fim);
      const status = String(item.status || '').trim() || 'Sem status';
      return {
        id: item.id || item.numero || `contrato-${idx + 1}`,
        fornecedor: item.fornecedor || item.nomeFornecedor || 'Nao informado',
        tipo: item.tipo || item.objeto || 'Contrato',
        valor: parseNumero(item.valor),
        vencimento:
          item.dataFim ||
          item.vencimento ||
          item.data_fim ||
          (vencimentoDate ? vencimentoDate.toISOString().slice(0, 10) : ''),
        status,
      };
    });

    const contratosVigentes = listaContratos.filter((item) => {
      const status = String(item.status || '').toLowerCase();
      if (
        status.includes('ativo') ||
        status.includes('vigente') ||
        status.includes('valido') ||
        status.includes('válido')
      ) {
        return true;
      }
      const vencimentoDate = parseData(item.vencimento);
      return vencimentoDate ? vencimentoDate >= inicioHoje : false;
    }).length;

    const contratosVencendo30dias = listaContratos.filter((item) => {
      const vencimentoDate = parseData(item.vencimento);
      if (!vencimentoDate) return false;
      return vencimentoDate >= inicioHoje && vencimentoDate <= limite30dias;
    }).length;

    const despesasNormalizadas = despesasRaw.map((item = {}, idx) => ({
      id: item.id || `despesa-${idx + 1}`,
      data: parseData(item.data),
      categoria: String(item.categoria || 'Outros').trim() || 'Outros',
      descricao: item.descricao || '',
      fornecedor: item.fornecedor || '',
      centroCusto: item.centroCusto || item.centro_custo || '',
      valor: parseNumero(item.valor),
    }));

    const despesasMensais = new Array(12).fill(0);
    const categoriasMap = {};
    const totalDespesas = despesasNormalizadas.reduce((acc, item) => {
      const valor = Number(item.valor || 0);
      const categoria = item.categoria || 'Outros';
      categoriasMap[categoria] = Number(categoriasMap[categoria] || 0) + valor;

      if (item.data && Number(item.data.getFullYear()) === Number(selectedYear)) {
        const mes = item.data.getMonth();
        if (mes >= 0 && mes <= 11) {
          despesasMensais[mes] += valor;
        }
      }

      return acc + valor;
    }, 0);

    const categoriasOrdenadas = Object.entries(categoriasMap)
      .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
      .slice(0, 8);

    const despesasPorCategoria = {
      labels: categoriasOrdenadas.map(([label]) => label),
      data: categoriasOrdenadas.map(([, valor]) => Number(valor || 0)),
    };

    const mesesComDespesa = despesasMensais.filter((valor) => Number(valor) > 0).length;
    const custoOperacionalMedio = mesesComDespesa
      ? despesasMensais.reduce((acc, valor) => acc + Number(valor || 0), 0) / mesesComDespesa
      : 0;

    return {
      contratos: {
        total: listaContratos.length,
        vigentes: contratosVigentes,
        vencendo30dias: contratosVencendo30dias,
      },
      indicadores: {
        custoOperacional: custoOperacionalMedio,
        ticketMedioVenda: 0,
        margemOperacional: 0,
        inadimplencia: 0,
      },
      certidoes: [],
      listaContratos,
      despesasMensais,
      despesasPorCategoria,
      despesas: despesasNormalizadas,
      patrimonio: patrimonioRaw,
      fornecedores: fornecedoresRaw,
      totalDespesas,
      totalRegistros,
    };
  }, [cnpjIdsEscopo, cnpjInfo?.id, selectedYear]);

  const temDadosAdministrativo = Boolean(dadosAdministrativoImportados?.totalRegistros > 0);

  const tabsDisponiveis = useMemo(() => {
    return tabsDisponiveisBase.filter(
      (tab) => tab !== 'administrativo' || (isAdmin && temDadosAdministrativo)
    );
  }, [tabsDisponiveisBase, isAdmin, temDadosAdministrativo]);

  const competenciasFiltroFiscal = useMemo(() => {
    const ano = Number(periodFilter?.year);
    if (!ano) return [];

    if (periodFilter?.type === 'month') {
      const mes = Number(periodFilter?.month || 0);
      if (!mes) return [];
      return [`${String(mes).padStart(2, '0')}/${ano}`];
    }

    if (periodFilter?.type === 'quarter') {
      const trimestre = Number(periodFilter?.quarter || 0);
      const mesesTrimestre = {
        1: [1, 2, 3],
        2: [4, 5, 6],
        3: [7, 8, 9],
        4: [10, 11, 12],
      };
      return (mesesTrimestre[trimestre] || []).map(
        (mes) => `${String(mes).padStart(2, '0')}/${ano}`
      );
    }

    return Array.from({ length: 12 }, (_, idx) => `${String(idx + 1).padStart(2, '0')}/${ano}`);
  }, [periodFilter]);

  const consolidarResumoAcumuladorLista = (lista = []) => {
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

    lista.forEach((resumo) => {
      if (!resumo) return;
      somarItens(entradasMap, resumo.entradas || []);
      somarItens(saidasMap, resumo.saidas || []);
      Object.keys(categorias).forEach((campo) => {
        categorias[campo] += Number(resumo?.categorias?.[campo] || 0);
      });
    });

    const entradas = Array.from(entradasMap.values());
    const saidas = Array.from(saidasMap.values());
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
      tipo: 'resumoAcumulador',
    };
  };

  const resumoAcumuladorFiltrado = useMemo(() => {
    const resumoBase = dadosFiscaisImportados?.resumoAcumulador;
    if (!resumoBase) return null;

    const porCompetencia = resumoBase?.porCompetencia || {};
    if (!Object.keys(porCompetencia).length) return resumoBase;

    const competenciasAlvo = new Set(competenciasFiltroFiscal);
    const filtrado = Object.entries(porCompetencia)
      .filter(([competencia]) => competenciasAlvo.has(String(competencia)))
      .reduce((acc, [competencia, dados]) => {
        acc[competencia] = dados;
        return acc;
      }, {});

    if (!Object.keys(filtrado).length) {
      return {
        ...resumoBase,
        entradas: [],
        saidas: [],
        totais: { entradas: 0, saidas: 0 },
        categorias: {
          compraComercializacao: 0,
          compraIndustrializacao: 0,
          vendaMercadoria: 0,
          vendaProduto: 0,
          vendaExterior: 0,
          servicos: 0,
          totalVendas380: 0,
          esperado380: 0,
        },
        detalhes380: {
          compras: [],
          vendasMercadoria: [],
          vendasProduto: [],
          vendasExterior: [],
          servicos: [],
        },
        porCompetencia: {},
        competencias: [],
      };
    }

    return {
      ...consolidarResumoAcumuladorLista(Object.values(filtrado)),
      porCompetencia: filtrado,
      competencias: Object.keys(filtrado).sort(ordenarCompetencia),
    };
  }, [dadosFiscaisImportados?.resumoAcumulador, competenciasFiltroFiscal]);

  const totalFaturamentoFiltrado = useMemo(() => {
    const faturamento = dadosFiscaisImportados?.faturamento;
    if (!faturamento) return 0;

    const porCompetencia = faturamento?.porCompetencia || {};
    if (Object.keys(porCompetencia).length) {
      const competenciasAlvo = new Set(competenciasFiltroFiscal);
      return Object.entries(porCompetencia).reduce((acc, [competencia, item]) => {
        if (!competenciasAlvo.has(String(competencia))) return acc;
        return acc + Number(item?.total || item?.saidas || 0);
      }, 0);
    }

    const registros = faturamento?.faturamento || [];
    const competenciasAlvo = new Set(competenciasFiltroFiscal);
    return registros.reduce((acc, item) => {
      const mes = Number(item?.mesIndex || 0);
      const ano = Number(item?.ano || 0);
      if (!mes || !ano) return acc;
      const competencia = `${String(mes).padStart(2, '0')}/${ano}`;
      if (!competenciasAlvo.has(competencia)) return acc;
      return acc + Number(item?.total || item?.saidas || 0);
    }, 0);
  }, [dadosFiscaisImportados?.faturamento, competenciasFiltroFiscal]);

  const resumoImpostosFiltrado = useMemo(() => {
    const resumo = dadosFiscaisImportados?.resumoImpostos;
    if (!resumo?.impostosPorMes) return null;

    const competenciasAlvo = new Set(competenciasFiltroFiscal);
    const impostosPorMes = Object.entries(resumo.impostosPorMes)
      .filter(([competencia]) => competenciasAlvo.has(String(competencia)))
      .reduce((acc, [competencia, dadosCompetencia]) => {
        acc[competencia] = dadosCompetencia;
        return acc;
      }, {});

    if (!Object.keys(impostosPorMes).length) {
      return {
        ...resumo,
        impostosPorMes: {},
        totaisPorImposto: {},
        totalRecolher: 0,
        totalCredor: 0,
        competencias: [],
      };
    }

    const totaisPorImposto = {};
    let totalRecolher = 0;
    let totalCredor = 0;

    Object.values(impostosPorMes).forEach((dadosCompetencia = {}) => {
      totalRecolher += Number(dadosCompetencia?.totalRecolher || 0);
      (dadosCompetencia?.impostos || []).forEach((imposto = {}) => {
        const nome = imposto?.nome || 'Imposto';
        if (!totaisPorImposto[nome]) {
          totaisPorImposto[nome] = { recolher: 0, credito: 0, debitos: 0, creditos: 0 };
        }
        totaisPorImposto[nome].recolher += Number(imposto?.impostoRecolher || 0);
        totaisPorImposto[nome].credito += Number(imposto?.saldoCredorFinal || 0);
        totaisPorImposto[nome].debitos += Number(imposto?.debitos || 0);
        totaisPorImposto[nome].creditos += Number(imposto?.creditos || 0);
        totalCredor += Number(imposto?.saldoCredorFinal || 0);
      });
    });

    return {
      ...resumo,
      impostosPorMes,
      totaisPorImposto,
      totalRecolher,
      totalCredor,
      competencias: Object.keys(impostosPorMes).sort(ordenarCompetencia),
    };
  }, [dadosFiscaisImportados?.resumoImpostos, competenciasFiltroFiscal]);

  // Dados do CNPJ selecionado
  const pessoalData = cnpjDados.pessoalData;

  // Animação ao trocar de tab ou CNPJ
  useEffect(() => {
    setAnimateCards(false);
    const timer = setTimeout(() => setAnimateCards(true), 50);
    return () => clearTimeout(timer);
  }, [activeTab, cnpjInfo?.id]);

  // Persistir aba ativa no localStorage
  useEffect(() => {
    localStorage.setItem('dashboard_activeTab', activeTab);
  }, [activeTab]);

  // Se a aba salva n?o estiver vis?vel para o CNPJ atual, ajusta automaticamente
  useEffect(() => {
    if (tabsDisponiveis.length === 0) return;
    if (!tabsDisponiveis.includes(activeTab)) {
      setActiveTab(tabsDisponiveis[0]);
    }
  }, [activeTab, tabsDisponiveis]);

  // Calcular totais do DRE
  // Se em modo consolidado, usa totaisConsolidados; senão, prioriza dados importados (Análise Horizontal)
  const analiseHorizontal = dadosContabeisImportados?.analiseHorizontal;

  const totalReceita = !temDadosContabeis
    ? 0
    : isConsolidado && totaisConsolidados
      ? totaisConsolidados.receita
      : analiseHorizontal?.totais?.totalReceitas ||
        (analiseHorizontal?.receitasMensais
          ? analiseHorizontal.receitasMensais.reduce((a, b) => a + b, 0)
          : 0);

  const totalDespesa = !temDadosContabeis
    ? 0
    : isConsolidado && totaisConsolidados
      ? totaisConsolidados.despesa
      : analiseHorizontal?.totais?.totalDespesas ||
        (analiseHorizontal?.despesasMensais
          ? analiseHorizontal.despesasMensais.reduce((a, b) => a + b, 0)
          : 0);

  const totalLucro =
    isConsolidado && totaisConsolidados ? totaisConsolidados.lucro : totalReceita - totalDespesa;

  const margemLucro = totalReceita > 0 ? ((totalLucro / totalReceita) * 100).toFixed(1) : '0.0';

  // Dados consolidados extras (funcionários, folha, tributos)
  const totalFuncionarios =
    isConsolidado && totaisConsolidados
      ? totaisConsolidados.funcionarios
      : pessoalData?.totalFuncionarios || 0;
  const qtdCnpjsConsolidado = isConsolidado && totaisConsolidados ? totaisConsolidados.qtdCnpjs : 1;

  // Comparação com ano anterior
  const variacaoReceita = '0.0';

  // Dados combinados para gráfico Receita x Custo x Estoque
  // Custo vem do CMV/CPV da DRE Horizontal, Estoque vem do Balancete
  const dadosReceitaCustoEstoque = useMemo(() => {
    const balancetes = dadosContabeisImportados?.balancetesConsolidados;
    const meses = balancetes?.meses || [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];

    // Receita: prioriza DRE Horizontal, fallback para Balancete
    const receita =
      analiseHorizontal?.receitasMensais || balancetes?.series?.receita || new Array(12).fill(0);

    // Custo: usa CMV/CPV da DRE Horizontal (valor absoluto)
    const custo = analiseHorizontal?.dados?.cmv
      ? analiseHorizontal.dados.cmv.map((v) => Math.abs(v))
      : balancetes?.series?.custo || new Array(12).fill(0);

    // Estoque: usa dados do Balancete
    const estoque = balancetes?.series?.estoque || new Array(12).fill(0);

    return {
      meses,
      series: {
        receita,
        custo,
        estoque,
      },
    };
  }, [dadosContabeisImportados, analiseHorizontal]);

  // Dados para comparação trimestral de lucro (ano atual x ano anterior)
  const dadosComparativoLucro = useMemo(() => {
    const competencias = analiseHorizontal?.dadosPorCompetencia;

    if (!competencias) {
      const anoBase = analiseHorizontal?.anoExercicio || selectedYear;
      return {
        anoAtual: anoBase,
        anoAnterior: anoBase - 1,
        dadosAtual: analiseHorizontal || null,
        dadosAnterior: null,
      };
    }

    const anosDisponiveis = [
      ...new Set(
        Object.values(competencias)
          .map((item) => Number(item.ano))
          .filter((ano) => Number.isFinite(ano))
      ),
    ].sort((a, b) => b - a);

    const anoAtual = anosDisponiveis[0] || analiseHorizontal?.anoExercicio || selectedYear;
    const temAnoAnterior = anosDisponiveis.length > 1;
    const anoAnterior = temAnoAnterior ? anosDisponiveis[1] : anoAtual - 1;

    const montarSerieAno = (ano) => {
      if (!ano) return null;

      const lucroAntesIR = new Array(12).fill(0);

      Object.values(competencias).forEach((competencia) => {
        if (Number(competencia.ano) !== ano) return;

        const mesIndex = Number(competencia.mes) - 1;
        if (mesIndex < 0 || mesIndex > 11) return;

        const lucroAntesIrValor =
          typeof competencia.lucroAntesIR === 'number'
            ? competencia.lucroAntesIR
            : Number(competencia.resultadoLiquidoOriginal || competencia.lucroLiquido || 0) +
              Math.abs(Number(competencia.provisaoCSLL || 0)) +
              Math.abs(Number(competencia.provisaoIRPJ || 0));

        lucroAntesIR[mesIndex] = lucroAntesIrValor;
      });

      return {
        anoExercicio: ano,
        dados: { lucroAntesIR },
      };
    };

    return {
      anoAtual,
      anoAnterior,
      dadosAtual: montarSerieAno(anoAtual) || analiseHorizontal || null,
      dadosAnterior: temAnoAnterior ? montarSerieAno(anoAnterior) : null,
    };
  }, [analiseHorizontal, selectedYear]);

  // Classe de animação
  const cardAnimation = animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4';
  const tabLoadingFallback = (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center text-slate-500 dark:text-slate-400">
      Carregando painel...
    </div>
  );

  // Dados para sparklines (somente importados)
  const receitaSparkline =
    temDadosContabeis && Array.isArray(analiseHorizontal?.receitasMensais)
      ? analiseHorizontal.receitasMensais
      : [0];
  const lucroSparkline =
    temDadosContabeis &&
    Array.isArray(analiseHorizontal?.receitasMensais) &&
    Array.isArray(analiseHorizontal?.despesasMensais)
      ? analiseHorizontal.receitasMensais.map(
          (r, i) => Number(r || 0) - Number(analiseHorizontal?.despesasMensais?.[i] || 0)
        )
      : [0];

  // Dados para exportação
  const exportColumns = [
    { key: 'mes', label: 'Mês' },
    { key: 'receita', label: 'Receita' },
    { key: 'despesa', label: 'Despesa' },
    { key: 'lucro', label: 'Lucro' },
  ];
  const exportData = MESES_LABELS.map((mes, i) => ({
    mes,
    receita: analiseHorizontal?.receitasMensais?.[i] || 0,
    despesa: analiseHorizontal?.despesasMensais?.[i] || 0,
    lucro:
      Number(analiseHorizontal?.receitasMensais?.[i] || 0) -
      Number(analiseHorizontal?.despesasMensais?.[i] || 0),
  }));

  return (
    <div
      className={`min-h-screen ${isDarkMode ? 'dark bg-slate-900' : 'bg-slate-100'} text-slate-800 dark:text-slate-200`}
    >
      <Header activeTab={activeTab} onTabChange={setActiveTab} tabsPermitidas={tabsDisponiveis} />

      <main className="mx-auto w-full max-w-[1680px] px-4 py-6 lg:px-6 lg:py-8 xl:px-8">
        {/* Toolbar com Breadcrumb, Filtros e Export */}
        <div className="relative z-[70] mb-6 flex flex-col gap-4 rounded-2xl border border-white/70 bg-white/85 px-4 py-4 shadow-sm backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-800/70 sm:flex-row sm:items-center sm:justify-between">
          <Breadcrumb />
          <div className="relative z-[80] flex flex-wrap items-center gap-3 sm:justify-end">
            <CnpjFilter />
            <PeriodFilter value={periodFilter} onChange={setPeriodFilter} />
            {isAdmin && (
              <button
                onClick={() => setPreviewClienteAtivo((prev) => !prev)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${
                  previewClienteAtivo
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                }`}
                title="Alterna entre visao administrativa completa e preview do cliente"
              >
                {previewClienteAtivo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Preview cliente {previewClienteAtivo ? 'ativo' : 'inativo'}
              </button>
            )}
            <ExportButton
              data={exportData}
              columns={exportColumns}
              filename={`relatorio-${cnpjInfo?.nomeFantasia || 'empresa'}`}
              title={`Relatório ${cnpjInfo?.nomeFantasia || 'Empresa'}`}
            />
          </div>
        </div>

        {/* Badge de modo consolidado */}
        {isConsolidado && (
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-700/60 bg-gradient-to-r from-[#0e4f6d] to-[#0b3d54] p-4 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5" />
              <div>
                <span className="font-medium block">
                  {modoVisualizacao === 'todos' && 'Visão Consolidada Total'}
                  {modoVisualizacao === 'grupo' && `Consolidado: ${grupoAtual?.nome}`}
                  {modoVisualizacao === 'empresa' && `Consolidado: ${empresaAtual?.nomeFantasia}`}
                </span>
                <span className="text-sm text-white/70">
                  {qtdCnpjsConsolidado} CNPJ(s) • Receita: {formatCurrency(totalReceita)} •
                  Lucro: {formatCurrency(totalLucro)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold">{qtdCnpjsConsolidado}</p>
                <p className="text-xs text-white/70">CNPJs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{totalFuncionarios}</p>
                <p className="text-xs text-white/70">Funcionários</p>
              </div>
            </div>
          </div>
        )}

        {visibilidadeMeta.modoPersonalizadoAtivo && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
            <div className="flex items-center justify-between gap-4">
              <p className="font-medium">
                Modo personalizado ativo ({visibilidadeMeta.origem})
              </p>
              {isAdmin && !isVisibilidadeAplicada && (
                <p className="text-xs">
                  Preview cliente inativo: a visibilidade nao esta sendo aplicada agora.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ===== TAB: INFORMAÇÕES GERAIS ===== */}
        {activeTab === 'gerais' && (
          <Suspense fallback={tabLoadingFallback}>
            <DashboardGeraisTab
              cardAnimation={cardAnimation}
              cnpjInfo={cnpjInfo}
              equipeTecnica={equipeTecnicaData}
              isDarkMode={isDarkMode}
              itemVisivel={itemVisivel}
              margemLucro={margemLucro}
              lucroSparkline={lucroSparkline}
              receitaSparkline={receitaSparkline}
              responsavelInfo={responsavelInfo}
              responsavelWhatsappLink={responsavelWhatsappLink}
              selectedYear={selectedYear}
              totalLucro={totalLucro}
              totalReceita={totalReceita}
              variacaoReceita={variacaoReceita}
            />
          </Suspense>
        )}
        {/* ===== TAB: CONTÁBIL ===== */}
        {activeTab === 'contabil' && (
          <Suspense fallback={tabLoadingFallback}>
            <DashboardContabilTab
              cardAnimation={cardAnimation}
              dadosComparativoLucro={dadosComparativoLucro}
              dadosContabeisImportados={dadosContabeisImportados}
              dadosReceitaCustoEstoque={dadosReceitaCustoEstoque}
              isDarkMode={isDarkMode}
              itemVisivel={itemVisivel}
              margemLucro={margemLucro}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              temDadosContabeis={temDadosContabeis}
              totalDespesa={totalDespesa}
              totalLucro={totalLucro}
              totalReceita={totalReceita}
            />
          </Suspense>
        )}

        {/* ===== TAB: FISCAL ===== */}
        {activeTab === 'fiscal' && (
          <Suspense fallback={tabLoadingFallback}>
            <DashboardFiscalTab
              cardAnimation={cardAnimation}
              dadosFiscaisImportados={dadosFiscaisImportados}
              fiscalTrimestre={fiscalTrimestre}
              isDarkMode={isDarkMode}
              itemVisivel={itemVisivel}
              periodFilter={periodFilter}
              resumoAcumuladorFiltrado={resumoAcumuladorFiltrado}
              resumoImpostosFiltrado={resumoImpostosFiltrado}
              selectedYear={selectedYear}
              setFiscalTrimestre={setFiscalTrimestre}
              temDadosFiscais={temDadosFiscais}
              totalFaturamentoFiltrado={totalFaturamentoFiltrado}
            />
          </Suspense>
        )}

        {/* ===== TAB: PESSOAL ===== */}
        {activeTab === 'pessoal' && (
          <Suspense fallback={tabLoadingFallback}>
            <DashboardPessoalTab
              cardAnimation={cardAnimation}
              dadosPessoalImportados={dadosPessoalImportados}
              isDarkMode={isDarkMode}
              itemVisivel={itemVisivel}
              periodFilter={periodFilter}
              temDadosPessoal={temDadosPessoal}
            />
          </Suspense>
        )}

        {/* ===== TAB: ADMINISTRATIVO ===== */}
        {isAdmin && activeTab === 'administrativo' && (
          <Suspense fallback={tabLoadingFallback}>
            <DashboardAdministrativoTab
              administrativoData={dadosAdministrativoImportados}
              cardAnimation={cardAnimation}
              isDarkMode={isDarkMode}
              itemVisivel={itemVisivel}
              temDadosAdministrativo={temDadosAdministrativo}
            />
          </Suspense>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
