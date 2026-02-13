import { useEffect, useState } from 'react';
import {
  parseDemonstrativoFGTS,
  parseFolhaINSS,
  parseProgramacaoFerias,
  parseRelacaoEmpregados,
  parseSalarioBase,
} from '../../utils/dominioParser';

const initialDadosPessoal = {};

export const usePessoalDomain = () => {
  const [dadosPessoal, setDadosPessoal] = useState(() => {
    const saved = localStorage.getItem('agili_dados_pessoal');
    return saved ? JSON.parse(saved) : initialDadosPessoal;
  });

  useEffect(() => {
    localStorage.setItem('agili_dados_pessoal', JSON.stringify(dadosPessoal));
  }, [dadosPessoal]);

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
      console.error('Erro ao importar relatório pessoal:', error);
      return { success: false, error: error.message };
    }
  };

  const getDadosPessoal = (cnpjId) => dadosPessoal[cnpjId] || null;

  const limparDadosPessoal = (cnpjId) => {
    setDadosPessoal((prev) => {
      const newData = { ...prev };
      delete newData[cnpjId];
      return newData;
    });
  };

  return {
    dadosPessoal,
    importarRelatorioPessoal,
    getDadosPessoal,
    limparDadosPessoal,
  };
};
