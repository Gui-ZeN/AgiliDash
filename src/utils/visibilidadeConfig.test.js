import { describe, expect, it } from 'vitest';
import {
  buildVisibilidadeOverrideDiff,
  createVisibilidadeConfigFromSections,
  normalizeVisibilidadeConfigWithSections,
  shouldUseGroupVisibilityInConsolidado,
  toggleSecaoVisibilidadePreservandoItens,
} from './visibilidadeConfig';

const sections = {
  gerais: {
    itens: [{ id: 'cards_resumo' }, { id: 'responsavel' }],
  },
  fiscal: {
    itens: [{ id: 'irpj_periodo' }, { id: 'csll_periodo' }],
  },
};

describe('visibilidadeConfig', () => {
  it('aplica heranca grupo -> cnpj corretamente', () => {
    const grupoConfig = {
      fiscal: {
        visivel: true,
        itens: { irpj_periodo: false },
      },
    };
    const cnpjConfig = {
      fiscal: {
        itens: { irpj_periodo: true },
      },
    };

    const effective = normalizeVisibilidadeConfigWithSections(sections, grupoConfig, cnpjConfig);

    expect(effective.fiscal.visivel).toBe(true);
    expect(effective.fiscal.itens.irpj_periodo).toBe(true);
    expect(effective.fiscal.itens.csll_periodo).toBe(true);
  });

  it('gera diff apenas para overrides reais do CNPJ', () => {
    const base = createVisibilidadeConfigFromSections(sections, true);
    const target = {
      ...base,
      fiscal: {
        ...base.fiscal,
        itens: {
          ...base.fiscal.itens,
          csll_periodo: false,
        },
      },
    };

    const diff = buildVisibilidadeOverrideDiff(base, target);

    expect(diff).toEqual({
      fiscal: {
        itens: {
          csll_periodo: false,
        },
      },
    });
  });

  it('retorna null quando target e base sao iguais no diff de override', () => {
    const base = createVisibilidadeConfigFromSections(sections, true);
    const diff = buildVisibilidadeOverrideDiff(base, base);
    expect(diff).toBeNull();
  });

  it('preserva estado individual dos itens ao ocultar/mostrar secao', () => {
    const initial = {
      fiscal: {
        visivel: true,
        itens: {
          irpj_periodo: true,
          csll_periodo: false,
        },
      },
    };

    const afterHide = toggleSecaoVisibilidadePreservandoItens(initial, 'fiscal');
    const afterShow = toggleSecaoVisibilidadePreservandoItens(afterHide, 'fiscal');

    expect(afterHide.fiscal.visivel).toBe(false);
    expect(afterShow.fiscal.visivel).toBe(true);
    expect(afterShow.fiscal.itens).toEqual({
      irpj_periodo: true,
      csll_periodo: false,
    });
  });

  it('define escopo de visibilidade consolidada no nivel de grupo quando aplicavel', () => {
    expect(shouldUseGroupVisibilityInConsolidado(true, 'grupo')).toBe(true);
    expect(shouldUseGroupVisibilityInConsolidado(true, 'empresa')).toBe(true);
    expect(shouldUseGroupVisibilityInConsolidado(true, 'todos')).toBe(false);
    expect(shouldUseGroupVisibilityInConsolidado(false, 'grupo')).toBe(false);
  });
});
