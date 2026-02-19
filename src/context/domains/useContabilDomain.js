import { useEffect, useState } from 'react';
import { loadFromStorage, saveToStorage } from '../../utils/storage';
import {
  consolidarBalancetesMensais,
  parseAnaliseHorizontal,
  parseBalancete,
  parseDREComparativa,
  parseDREMensal,
} from '../../utils/dominioParser';

const initialDadosContabeis = {};

export const useContabilDomain = () => {
  const [dadosContabeis, setDadosContabeis] = useState(() =>
    loadFromStorage('agili_dados_contabeis', initialDadosContabeis)
  );

  useEffect(() => {
    saveToStorage('agili_dados_contabeis', dadosContabeis);
  }, [dadosContabeis]);

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

      setDadosContabeis((prev) => {
        const cnpjData = prev[cnpjId] || {
          balancetes: [],
          analiseHorizontal: null,
          dreComparativa: null,
          dreMensal: null,
          balancetesConsolidados: null,
        };

        if (tipoRelatorio === 'balancete') {
          const newBalancetes = [...cnpjData.balancetes, dadosParsed].slice(-12);
          return {
            ...prev,
            [cnpjId]: {
              ...cnpjData,
              balancetes: newBalancetes,
              balancetesConsolidados: consolidarBalancetesMensais(newBalancetes),
            },
          };
        }

        if (tipoRelatorio === 'analiseHorizontal') {
          const existingData = cnpjData.analiseHorizontal || {};
          const existingCompetencias = existingData.dadosPorCompetencia || {};
          const mergedCompetencias = {
            ...existingCompetencias,
            ...dadosParsed.dadosPorCompetencia,
          };

          const competenciasOrdenadas = Object.keys(mergedCompetencias).sort((a, b) => {
            const [mesA, anoA] = a.split('/').map(Number);
            const [mesB, anoB] = b.split('/').map(Number);
            return anoA !== anoB ? anoA - anoB : mesA - mesB;
          });

          const mesesLabels = competenciasOrdenadas.map((c) => {
            const dados = mergedCompetencias[c];
            return `${dados.mesNome}/${String(dados.ano).slice(-2)}`;
          });
          const receitasMensais = competenciasOrdenadas.map((c) => mergedCompetencias[c].receita);
          const despesasMensais = competenciasOrdenadas.map((c) => mergedCompetencias[c].despesa);

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
                meses: mesesLabels,
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
        }

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
      console.error('Erro ao importar relatório:', error);
      return { success: false, error: error.message };
    }
  };

  const getDadosContabeis = (cnpjId) => dadosContabeis[cnpjId] || null;

  const limparDadosContabeis = (cnpjId) => {
    setDadosContabeis((prev) => {
      const newData = { ...prev };
      delete newData[cnpjId];
      return newData;
    });
  };

  return {
    dadosContabeis,
    importarRelatorioContabil,
    getDadosContabeis,
    limparDadosContabeis,
  };
};
