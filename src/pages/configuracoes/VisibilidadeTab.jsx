import {
  Building2,
  Check,
  ChevronRight,
  Eye,
  RotateCcw,
  Save,
  Search,
  X,
} from 'lucide-react';

const VisibilidadeTab = ({
  DASHBOARD_SECTIONS,
  VISIBILIDADE_PRESETS,
  applyVisibilidadePreset,
  cnpjTemSobrescrita,
  expandedSecoesVisibilidade,
  cnpjs,
  grupos,
  grupoNomeSelecionado,
  loadCurrentVisibilidadeConfig,
  normalizeText,
  resetarVisibilidadePadrao,
  saveVisibilidadeConfig,
  selectedCnpjInfo,
  selectedCnpjVisibilidade,
  selectedGrupoInfo,
  selectedGrupoVisibilidade,
  selectedPresetVisibilidade,
  setSelectedCnpjVisibilidade,
  setSelectedGrupoVisibilidade,
  setSelectedPresetVisibilidade,
  setTodosItensVisibilidade,
  setVisibilidadeBusca,
  setVisibilidadeConfig,
  setVisibilidadeEscopo,
  showSuccess,
  toggleExpansaoSecaoVisibilidade,
  toggleItemVisibilidade,
  toggleSecaoVisibilidade,
  usarHerancaDoGrupo,
  visibilidadeBusca,
  visibilidadeConfig,
  visibilidadeEscopo,
  visibilidadeMeta,
}) => {
  const visibilidadeTargetSelecionado =
    visibilidadeEscopo === 'grupo' ? selectedGrupoVisibilidade : selectedCnpjVisibilidade;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Configuracao de Visibilidade
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Defina visibilidade por grupo e, se necessario, sobrescreva por CNPJ
          </p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Escopo
            </label>
            <select
              value={visibilidadeEscopo}
              onChange={(e) => setVisibilidadeEscopo(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-[#0e4f6d]"
            >
              <option value="cnpj">CNPJ (sobrescrita)</option>
              <option value="grupo">Grupo (base)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {visibilidadeEscopo === 'grupo' ? 'Grupo' : 'CNPJ'}
            </label>
            {visibilidadeEscopo === 'grupo' ? (
              <select
                value={selectedGrupoVisibilidade}
                onChange={(e) => setSelectedGrupoVisibilidade(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-[#0e4f6d]"
              >
                <option value="">Selecione um grupo...</option>
                {grupos.map((grupo) => (
                  <option key={grupo.id} value={grupo.id}>
                    {grupo.nome}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={selectedCnpjVisibilidade}
                onChange={(e) => setSelectedCnpjVisibilidade(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-[#0e4f6d]"
              >
                <option value="">Selecione um CNPJ...</option>
                {cnpjs.map((cnpj) => (
                  <option key={cnpj.id} value={cnpj.id}>
                    {cnpj.nomeFantasia || cnpj.razaoSocial} - {cnpj.cnpj}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Buscar item
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={visibilidadeBusca}
                onChange={(e) => setVisibilidadeBusca(e.target.value)}
                placeholder="Ex: IRPJ, estoque, FGTS..."
                className="w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-[#0e4f6d]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Preset por regime
            </label>
            {visibilidadeEscopo === 'cnpj' && selectedCnpjInfo?.regimeTributario && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Sugerido para o regime: {selectedCnpjInfo.regimeTributario}
              </p>
            )}
            <div className="flex gap-2">
              <select
                value={selectedPresetVisibilidade}
                onChange={(e) => setSelectedPresetVisibilidade(e.target.value)}
                className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-[#0e4f6d]"
              >
                {Object.entries(VISIBILIDADE_PRESETS).map(([presetId, preset]) => (
                  <option key={presetId} value={presetId}>
                    {preset.nome}
                  </option>
                ))}
              </select>
              <button
                onClick={() => applyVisibilidadePreset(selectedPresetVisibilidade)}
                className="px-4 py-2 bg-[#0e4f6d] text-white rounded-lg hover:bg-[#0d4560] transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      </div>

      {visibilidadeTargetSelecionado && (
        <>
          <div className="mb-6 p-4 bg-[#0e4f6d]/10 dark:bg-[#0e4f6d]/20 rounded-xl border border-[#0e4f6d]/30">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-[#0e4f6d] dark:text-teal-400" />
                <div>
                  <p className="font-medium text-[#0e4f6d] dark:text-teal-400">
                    {visibilidadeEscopo === 'grupo'
                      ? selectedGrupoInfo?.nome || 'Grupo'
                      : selectedCnpjInfo?.nomeFantasia || selectedCnpjInfo?.razaoSocial}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {visibilidadeEscopo === 'grupo'
                      ? 'Configuracao base para todos os CNPJs do grupo'
                      : `Regime: ${selectedCnpjInfo?.regimeTributario || 'Nao informado'} • Grupo: ${grupoNomeSelecionado}`}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Origem efetiva: {visibilidadeMeta.origem} •{' '}
                    {visibilidadeMeta.modoPersonalizadoAtivo
                      ? 'modo personalizado ativo'
                      : 'sem personalizacao'}
                  </p>
                </div>
              </div>
              <div>
                {cnpjTemSobrescrita && (
                  <button
                    onClick={usarHerancaDoGrupo}
                    className="px-3 py-2 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                  >
                    Usar heranca do grupo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setTodosItensVisibilidade(true)}
              className="px-3 py-2 text-sm bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/40 transition-colors"
            >
              Marcar todos
            </button>
            <button
              onClick={() => setTodosItensVisibilidade(false)}
              className="px-3 py-2 text-sm bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Desmarcar todos
            </button>
            <button
              onClick={resetarVisibilidadePadrao}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/40 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Resetar padrao
            </button>
          </div>

          <div className="space-y-4">
            {Object.entries(DASHBOARD_SECTIONS)
              .filter(([, secao]) => {
                if (!visibilidadeBusca.trim()) return true;

                const termo = normalizeText(visibilidadeBusca);
                return (
                  normalizeText(secao.nome).includes(termo) ||
                  normalizeText(secao.descricao).includes(termo) ||
                  secao.itens.some(
                    (item) =>
                      normalizeText(item.nome).includes(termo) ||
                      normalizeText(item.descricao).includes(termo)
                  )
                );
              })
              .map(([secaoId, secao]) => {
                const termo = normalizeText(visibilidadeBusca);
                const itensFiltrados = secao.itens.filter((item) => {
                  if (!termo) return true;
                  return (
                    normalizeText(item.nome).includes(termo) ||
                    normalizeText(item.descricao).includes(termo)
                  );
                });

                const totalItens = secao.itens.length;
                const itensVisiveis = secao.itens.filter(
                  (item) => visibilidadeConfig[secaoId]?.itens?.[item.id] !== false
                ).length;
                const secaoExpandida = expandedSecoesVisibilidade[secaoId] !== false;

                return (
                  <div
                    key={secaoId}
                    className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
                  >
                    <div
                      className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                        visibilidadeConfig[secaoId]?.visivel
                          ? 'bg-emerald-50 dark:bg-emerald-900/20'
                          : 'bg-slate-50 dark:bg-slate-900/50'
                      }`}
                      onClick={() => toggleExpansaoSecaoVisibilidade(secaoId)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            visibilidadeConfig[secaoId]?.visivel
                              ? 'bg-emerald-200 dark:bg-emerald-800'
                              : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        >
                          {visibilidadeConfig[secaoId]?.visivel ? (
                            <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                          ) : (
                            <X className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                        <div>
                          <p
                            className={`font-semibold ${
                              visibilidadeConfig[secaoId]?.visivel
                                ? 'text-emerald-800 dark:text-emerald-300'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {secao.nome}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500">
                            {secao.descricao}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {itensVisiveis}/{totalItens} itens visiveis
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSecaoVisibilidade(secaoId);
                          }}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                            visibilidadeConfig[secaoId]?.visivel
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                          }`}
                        >
                          {visibilidadeConfig[secaoId]?.visivel ? 'Ocultar secao' : 'Mostrar secao'}
                        </button>
                        <ChevronRight
                          className={`w-5 h-5 text-slate-400 transition-transform ${
                            secaoExpandida ? 'rotate-90' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {secaoExpandida && (
                      <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                        {itensFiltrados.length === 0 && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 px-2">
                            Nenhum item encontrado nesta secao.
                          </p>
                        )}

                        {itensFiltrados.map((item) => (
                          <label
                            key={item.id}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                              visibilidadeConfig[secaoId]?.itens?.[item.id] !== false
                                ? 'bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20'
                                : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={visibilidadeConfig[secaoId]?.itens?.[item.id] !== false}
                              onChange={() => toggleItemVisibilidade(secaoId, item.id)}
                              className="w-5 h-5 rounded border-slate-300 text-[#0e4f6d] focus:ring-[#0e4f6d] dark:bg-slate-700 dark:border-slate-600"
                            />
                            <div className="flex-1">
                              <p
                                className={`font-medium ${
                                  visibilidadeConfig[secaoId]?.itens?.[item.id] !== false
                                    ? 'text-slate-800 dark:text-white'
                                    : 'text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                {item.nome}
                              </p>
                              <p className="text-xs text-slate-500">{item.descricao}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {Object.entries(DASHBOARD_SECTIONS).filter(([, secao]) => {
            if (!visibilidadeBusca.trim()) return false;
            const termo = normalizeText(visibilidadeBusca);
            return (
              normalizeText(secao.nome).includes(termo) ||
              normalizeText(secao.descricao).includes(termo) ||
              secao.itens.some(
                (item) =>
                  normalizeText(item.nome).includes(termo) ||
                  normalizeText(item.descricao).includes(termo)
              )
            );
          }).length === 0 && (
            <div className="text-center py-10 text-slate-400">
              Nenhum item encontrado para a busca atual.
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => {
                setVisibilidadeConfig(loadCurrentVisibilidadeConfig());
                showSuccess('Alteracoes descartadas');
              }}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Descartar
            </button>
            <button
              onClick={saveVisibilidadeConfig}
              className="flex items-center gap-2 px-6 py-2 bg-[#0e4f6d] text-white rounded-lg hover:bg-[#0d4560] transition-colors"
            >
              <Save className="w-4 h-4" />
              Salvar configuracao
            </button>
          </div>
        </>
      )}

      {!visibilidadeTargetSelecionado && (
        <div className="text-center py-12 text-slate-400">
          <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>
            Selecione {visibilidadeEscopo === 'grupo' ? 'um grupo' : 'um CNPJ'} para configurar a
            visibilidade
          </p>
        </div>
      )}
    </div>
  );
};

export default VisibilidadeTab;
