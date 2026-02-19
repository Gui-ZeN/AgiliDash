import { describe, expect, it } from 'vitest';
import { buildFaturamentoTrimestreSeries, getMonthIndexFromMovimentacao } from './fiscalSeries';

describe('fiscalSeries', () => {
  it('resolve índice do mês por competência, mês textual e mesIndex', () => {
    expect(getMonthIndexFromMovimentacao({ mesIndex: 4 })).toBe(4);
    expect(getMonthIndexFromMovimentacao({ competencia: '03/2025' })).toBe(3);
    expect(getMonthIndexFromMovimentacao({ mes: 'Março' })).toBe(3);
    expect(getMonthIndexFromMovimentacao({ mes: 'Fev' })).toBe(2);
  });

  it('filtra 1º trimestre incluindo março', () => {
    const dados = {
      movimentacao: [
        { competencia: '01/2025', entradas: 10, servicos: 1, saidas: 5 },
        { competencia: '02/2025', entradas: 20, servicos: 2, saidas: 6 },
        { competencia: '03/2025', entradas: 30, servicos: 3, saidas: 7 },
        { competencia: '04/2025', entradas: 40, servicos: 4, saidas: 8 },
      ],
    };

    const result = buildFaturamentoTrimestreSeries(dados, 1, 2025);
    expect(result.meses).toEqual(['Jan', 'Fev', 'Mar']);
    expect(result.entradas).toEqual([10, 20, 30]);
    expect(result.servicos).toEqual([1, 2, 3]);
    expect(result.saidas).toEqual([5, 6, 7]);
  });
});
