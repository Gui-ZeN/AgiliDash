/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useCadastrosDomain } from './domains/useCadastrosDomain';
import { useContabilDomain } from './domains/useContabilDomain';
import { useFiscalDomain } from './domains/useFiscalDomain';
import { usePessoalDomain } from './domains/usePessoalDomain';
import {
  VISIBILIDADE_PREVIEW_KEY,
  createVisibilidadePayload,
  getLegacyVisibilidadeCnpjKey,
  getVisibilidadeStorageKey,
  hasCustomVisibilityRule,
  mergeVisibilidadeConfigs,
  parseVisibilidadePayload,
} from '../utils/visibilidadeConfig';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { isAdmin } = useAuth();

  const cadastros = useCadastrosDomain();
  const contabil = useContabilDomain();
  const fiscal = useFiscalDomain();
  const pessoal = usePessoalDomain();

  const { cnpjs } = cadastros;

  const [previewClienteAtivo, setPreviewClienteAtivo] = useState(() => {
    const saved = localStorage.getItem(VISIBILIDADE_PREVIEW_KEY);
    if (saved === null) return true;
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem(VISIBILIDADE_PREVIEW_KEY, String(previewClienteAtivo));
  }, [previewClienteAtivo]);

  useEffect(() => {
    cnpjs.forEach((cnpj) => {
      const scopeKey = getVisibilidadeStorageKey('cnpj', cnpj.id);
      if (localStorage.getItem(scopeKey)) return;

      const legacyKey = getLegacyVisibilidadeCnpjKey(cnpj.id);
      const legacyConfig = parseVisibilidadePayload(localStorage.getItem(legacyKey));
      if (!legacyConfig) return;

      localStorage.setItem(
        scopeKey,
        JSON.stringify(createVisibilidadePayload('cnpj', legacyConfig))
      );
      localStorage.removeItem(legacyKey);
    });
  }, [cnpjs]);

  const getVisibilidadeScopeConfig = (scopeType, scopeId) => {
    if (!scopeType || !scopeId) return null;

    const storageKey = getVisibilidadeStorageKey(scopeType, scopeId);
    return parseVisibilidadePayload(localStorage.getItem(storageKey));
  };

  const saveVisibilidadeScopeConfig = (scopeType, scopeId, config) => {
    if (!scopeType || !scopeId || !config) return false;

    const storageKey = getVisibilidadeStorageKey(scopeType, scopeId);
    localStorage.setItem(storageKey, JSON.stringify(createVisibilidadePayload(scopeType, config)));

    if (scopeType === 'cnpj') {
      localStorage.removeItem(getLegacyVisibilidadeCnpjKey(scopeId));
    }

    return true;
  };

  const removeVisibilidadeScopeConfig = (scopeType, scopeId) => {
    if (!scopeType || !scopeId) return false;

    localStorage.removeItem(getVisibilidadeStorageKey(scopeType, scopeId));
    if (scopeType === 'cnpj') {
      localStorage.removeItem(getLegacyVisibilidadeCnpjKey(scopeId));
    }
    return true;
  };

  const getGrupoIdByCnpj = (cnpjId) => cnpjs.find((cnpj) => cnpj.id === cnpjId)?.grupoId || null;

  const getVisibilidadeConfig = (cnpjId) => {
    if (!cnpjId) return null;

    const grupoId = getGrupoIdByCnpj(cnpjId);
    const configGrupo = grupoId ? getVisibilidadeScopeConfig('grupo', grupoId) : null;
    const configCnpj = getVisibilidadeScopeConfig('cnpj', cnpjId);

    return mergeVisibilidadeConfigs(configGrupo, configCnpj);
  };

  const getVisibilidadeMeta = (cnpjId) => {
    if (!cnpjId) {
      return {
        origem: 'padrao',
        temConfigGrupo: false,
        temConfigCnpj: false,
        modoPersonalizadoAtivo: false,
      };
    }

    const grupoId = getGrupoIdByCnpj(cnpjId);
    const configGrupo = grupoId ? getVisibilidadeScopeConfig('grupo', grupoId) : null;
    const configCnpj = getVisibilidadeScopeConfig('cnpj', cnpjId);
    const configEfetiva = mergeVisibilidadeConfigs(configGrupo, configCnpj);

    return {
      origem: configCnpj ? 'cnpj' : configGrupo ? 'grupo' : 'padrao',
      temConfigGrupo: !!configGrupo,
      temConfigCnpj: !!configCnpj,
      modoPersonalizadoAtivo: hasCustomVisibilityRule(configEfetiva),
    };
  };

  const visibilidadeAplicada = !isAdmin || previewClienteAtivo;

  const value = {
    ...cadastros,
    ...contabil,
    ...fiscal,
    ...pessoal,

    previewClienteAtivo,
    setPreviewClienteAtivo,
    getVisibilidadeScopeConfig,
    saveVisibilidadeScopeConfig,
    removeVisibilidadeScopeConfig,
    getVisibilidadeMeta,
    getVisibilidadeConfig,
    isVisibilidadeAplicada: visibilidadeAplicada,

    isSecaoVisivel: (cnpjId, secaoId) => {
      if (!visibilidadeAplicada) return true;
      const config = getVisibilidadeConfig(cnpjId);
      if (!config) return true;
      return config[secaoId]?.visivel !== false;
    },

    isItemVisivel: (cnpjId, secaoId, itemId) => {
      if (!visibilidadeAplicada) return true;
      const config = getVisibilidadeConfig(cnpjId);
      if (!config) return true;
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
