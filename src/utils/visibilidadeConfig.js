export const VISIBILIDADE_STORAGE_VERSION = 3;
export const VISIBILIDADE_PREVIEW_KEY = 'agili_preview_cliente';

export const getVisibilidadeStorageKey = (scopeType, scopeId) =>
  `agili_visibilidade_${scopeType}_${scopeId}`;

export const getLegacyVisibilidadeCnpjKey = (cnpjId) => `agili_visibilidade_${cnpjId}`;

export const parseVisibilidadePayload = (rawValue) => {
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue);
    if (parsed && typeof parsed === 'object' && parsed.config) {
      return parsed.config;
    }
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

export const createVisibilidadePayload = (scopeType, config) => ({
  version: VISIBILIDADE_STORAGE_VERSION,
  scope: scopeType,
  updatedAt: new Date().toISOString(),
  config,
});

export const mergeVisibilidadeConfigs = (...configs) => {
  const merged = {};

  configs.forEach((config) => {
    if (!config || typeof config !== 'object') return;

    Object.entries(config).forEach(([secaoId, secaoValue]) => {
      if (!merged[secaoId]) {
        merged[secaoId] = { visivel: true, itens: {} };
      }

      if (typeof secaoValue?.visivel === 'boolean') {
        merged[secaoId].visivel = secaoValue.visivel;
      }

      if (secaoValue?.itens && typeof secaoValue.itens === 'object') {
        Object.entries(secaoValue.itens).forEach(([itemId, itemVisivel]) => {
          if (typeof itemVisivel === 'boolean') {
            merged[secaoId].itens[itemId] = itemVisivel;
          }
        });
      }
    });
  });

  return merged;
};

export const hasCustomVisibilityRule = (config) => {
  if (!config || typeof config !== 'object') return false;

  return Object.values(config).some((secao) => {
    if (secao?.visivel === false) return true;
    return Object.values(secao?.itens || {}).some((itemVisivel) => itemVisivel === false);
  });
};

export const createVisibilidadeConfigFromSections = (sections, visibleByDefault = true) => {
  const config = {};
  Object.keys(sections || {}).forEach((secaoId) => {
    config[secaoId] = { visivel: visibleByDefault, itens: {} };
    (sections[secaoId]?.itens || []).forEach((item) => {
      config[secaoId].itens[item.id] = visibleByDefault;
    });
  });
  return config;
};

export const normalizeVisibilidadeConfigWithSections = (sections, ...configs) => {
  const base = createVisibilidadeConfigFromSections(sections, true);
  const merged = mergeVisibilidadeConfigs(base, ...configs);

  Object.entries(base).forEach(([secaoId, secaoBase]) => {
    if (!merged[secaoId]) {
      merged[secaoId] = { visivel: true, itens: { ...secaoBase.itens } };
      return;
    }

    if (typeof merged[secaoId].visivel !== 'boolean') {
      merged[secaoId].visivel = true;
    }

    if (!merged[secaoId].itens || typeof merged[secaoId].itens !== 'object') {
      merged[secaoId].itens = {};
    }

    Object.keys(secaoBase.itens).forEach((itemId) => {
      if (typeof merged[secaoId].itens[itemId] !== 'boolean') {
        merged[secaoId].itens[itemId] = true;
      }
    });
  });

  return merged;
};

export const buildVisibilidadeOverrideDiff = (baseConfig, targetConfig) => {
  const base = baseConfig || {};
  const target = targetConfig || {};
  const diff = {};

  const secaoIds = new Set([...Object.keys(base), ...Object.keys(target)]);

  secaoIds.forEach((secaoId) => {
    const secaoBase = base[secaoId] || { visivel: true, itens: {} };
    const secaoTarget = target[secaoId] || { visivel: true, itens: {} };
    const secaoDiff = {};
    const itensDiff = {};

    if ((secaoTarget?.visivel !== false) !== (secaoBase?.visivel !== false)) {
      secaoDiff.visivel = secaoTarget?.visivel !== false;
    }

    const itemIds = new Set([
      ...Object.keys(secaoBase?.itens || {}),
      ...Object.keys(secaoTarget?.itens || {}),
    ]);

    itemIds.forEach((itemId) => {
      const baseItemVisivel = secaoBase?.itens?.[itemId] !== false;
      const targetItemVisivel = secaoTarget?.itens?.[itemId] !== false;
      if (baseItemVisivel !== targetItemVisivel) {
        itensDiff[itemId] = targetItemVisivel;
      }
    });

    if (Object.keys(itensDiff).length > 0) {
      secaoDiff.itens = itensDiff;
    }

    if (Object.keys(secaoDiff).length > 0) {
      diff[secaoId] = secaoDiff;
    }
  });

  return Object.keys(diff).length > 0 ? diff : null;
};

export const toggleSecaoVisibilidadePreservandoItens = (config, secaoId) => {
  const atualVisivel = config?.[secaoId]?.visivel !== false;
  return {
    ...config,
    [secaoId]: {
      ...(config?.[secaoId] || { itens: {} }),
      visivel: !atualVisivel,
      itens: { ...(config?.[secaoId]?.itens || {}) },
    },
  };
};

export const shouldUseGroupVisibilityInConsolidado = (isConsolidado, modoVisualizacao) =>
  Boolean(isConsolidado && (modoVisualizacao === 'grupo' || modoVisualizacao === 'empresa'));
