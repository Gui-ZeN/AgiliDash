import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Activity, Search, Filter, Calendar, Download, Trash2,
  LogIn, LogOut, Eye, Plus, Edit, Shield, Settings, RefreshCw
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
  getLogs, filterLogs, clearLogs, getLogStats, formatLogTime,
  ActivityTypes, ActivityCategories
} from '../utils/activityLog';

/**
 * Página de Logs de Atividade
 * Exibe histórico de ações dos usuários
 */
const Logs = () => {
  const { isDarkMode } = useTheme();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [filterCategory, setFilterCategory] = useState('todos');
  const [clearConfirm, setClearConfirm] = useState(false);

  // Carrega logs
  const loadLogs = () => {
    const allLogs = filterLogs({ limit: 200 });
    setLogs(allLogs);
    setStats(getLogStats());
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchSearch = log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.userName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === 'todos' || log.type === filterType;
      const matchCategory = filterCategory === 'todos' || log.category === filterCategory;
      return matchSearch && matchType && matchCategory;
    });
  }, [logs, searchTerm, filterType, filterCategory]);

  const handleClearLogs = () => {
    clearLogs();
    setLogs([]);
    setStats(getLogStats());
    setClearConfirm(false);
  };

  const getIcon = (type) => {
    const icons = {
      [ActivityTypes.LOGIN]: LogIn,
      [ActivityTypes.LOGOUT]: LogOut,
      [ActivityTypes.VIEW]: Eye,
      [ActivityTypes.CREATE]: Plus,
      [ActivityTypes.UPDATE]: Edit,
      [ActivityTypes.DELETE]: Trash2,
      [ActivityTypes.EXPORT]: Download,
      [ActivityTypes.CONFIG_CHANGE]: Settings,
      [ActivityTypes.PERMISSION_CHANGE]: Shield
    };
    return icons[type] || Activity;
  };

  const getTypeColor = (type) => {
    const colors = {
      [ActivityTypes.LOGIN]: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      [ActivityTypes.LOGOUT]: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400',
      [ActivityTypes.VIEW]: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      [ActivityTypes.CREATE]: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      [ActivityTypes.UPDATE]: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      [ActivityTypes.DELETE]: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      [ActivityTypes.EXPORT]: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      [ActivityTypes.CONFIG_CHANGE]: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
      [ActivityTypes.PERMISSION_CHANGE]: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
    };
    return colors[type] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
  };

  const typeLabels = {
    [ActivityTypes.LOGIN]: 'Login',
    [ActivityTypes.LOGOUT]: 'Logout',
    [ActivityTypes.VIEW]: 'Visualizacao',
    [ActivityTypes.CREATE]: 'Criacao',
    [ActivityTypes.UPDATE]: 'Atualizacao',
    [ActivityTypes.DELETE]: 'Exclusao',
    [ActivityTypes.EXPORT]: 'Exportacao',
    [ActivityTypes.CONFIG_CHANGE]: 'Configuracao',
    [ActivityTypes.PERMISSION_CHANGE]: 'Permissao'
  };

  const categoryLabels = {
    [ActivityCategories.AUTH]: 'Autenticacao',
    [ActivityCategories.NAVIGATION]: 'Navegacao',
    [ActivityCategories.DATA]: 'Dados',
    [ActivityCategories.CONFIG]: 'Configuracao',
    [ActivityCategories.EXPORT]: 'Exportacao'
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-900' : 'bg-slate-100'}`}>
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="w-full px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/configuracoes"
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0e4f6d] flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-white">Logs de Atividade</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">{logs.length} registros</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadLogs}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Atualizar"
            >
              <RefreshCw className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
            <button
              onClick={() => setClearConfirm(true)}
              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Limpar Logs</span>
            </button>
          </div>
        </div>
      </header>

      <main className="w-full px-4 lg:px-6 py-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
              <p className="text-2xl font-bold text-[#0e4f6d] dark:text-cyan-400">{stats.total}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total de Logs</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
              <p className="text-2xl font-bold text-emerald-500">{stats.last24h}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Ultimas 24h</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
              <p className="text-2xl font-bold text-blue-500">{stats.lastWeek}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Ultima Semana</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
              <p className="text-2xl font-bold text-amber-500">{Object.keys(stats.byType).length}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tipos de Acao</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-6 border border-slate-100 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar nos logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#0e4f6d] focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
            >
              <option value="todos">Todos os Tipos</option>
              {Object.entries(typeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
            >
              <option value="todos">Todas as Categorias</option>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Logs List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          {filteredLogs.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredLogs.map((log) => {
                const Icon = getIcon(log.type);
                return (
                  <div key={log.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getTypeColor(log.type)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(log.type)}`}>
                            {typeLabels[log.type] || log.type}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {categoryLabels[log.category] || log.category}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-800 dark:text-white">
                          {log.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatLogTime(log.timestamp)}
                          </span>
                          {log.userName && (
                            <span>por {log.userName}</span>
                          )}
                          <span className="truncate max-w-[200px]">{log.url}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Activity className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">
                {logs.length === 0 ? 'Nenhum log registrado ainda' : 'Nenhum log encontrado com os filtros aplicados'}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modal Clear Confirm */}
      {clearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4 flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Limpar Logs</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Tem certeza que deseja limpar todos os logs? Esta acao nao pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setClearConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleClearLogs}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Limpar Tudo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logs;
