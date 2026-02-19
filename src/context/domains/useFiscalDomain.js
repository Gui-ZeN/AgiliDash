import { useEffect, useState } from 'react';
import { loadFromStorage, saveToStorage } from '../../utils/storage';
import {
  parseContribuicaoSocial,
  parseDemonstrativoFinanceiro,
  parseDemonstrativoMensal,
  parseImpostoRenda,
  parseResumoImpostos,
  parseResumoPorAcumulador,
} from '../../utils/dominioParser';

const initialDadosFiscais = {};

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

export const useFiscalDomain = () => {
  const [dadosFiscais, setDadosFiscais] = useState(() =>
    loadFromStorage('agili_dados_fiscais', initialDadosFiscais)
  );

  useEffect(() => {
    saveToStorage('agili_dados_fiscais', dadosFiscais);
  }, [dadosFiscais]);

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

      if ((tipoRelatorio === 'csll' || tipoRelatorio === 'irpj') && opcoes.trimestre) {
        dadosParsed.trimestreNumero = parseInt(opcoes.trimestre, 10);
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

        if (tipoRelatorio === 'csll') {
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
      console.error('Erro ao importar relatório fiscal:', error);
      return { success: false, error: error.message };
    }
  };

  const getDadosFiscais = (cnpjId) => dadosFiscais[cnpjId] || null;

  const limparDadosFiscais = (cnpjId) => {
    setDadosFiscais((prev) => {
      const newData = { ...prev };
      delete newData[cnpjId];
      return newData;
    });
  };

  return {
    dadosFiscais,
    importarRelatorioFiscal,
    getDadosFiscais,
    limparDadosFiscais,
  };
};
