/**
 * Sistema de Logs de Atividade
 * Registra ações dos usuários para auditoria
 */

const STORAGE_KEY = 'agili-activity-log';
const MAX_LOGS = 500;

/**
 * Tipos de atividade
 */
export const ActivityTypes = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  EXPORT: 'export',
  CONFIG_CHANGE: 'config_change',
  PERMISSION_CHANGE: 'permission_change',
};

/**
 * Categorias de atividade
 */
export const ActivityCategories = {
  AUTH: 'auth',
  NAVIGATION: 'navigation',
  DATA: 'data',
  CONFIG: 'config',
  EXPORT: 'export',
};

/**
 * Obtém logs do localStorage
 */
export const getLogs = () => {
  try {
    const logs = localStorage.getItem(STORAGE_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch {
    return [];
  }
};

/**
 * Salva logs no localStorage
 */
const saveLogs = (logs) => {
  try {
    // Mantém apenas os últimos MAX_LOGS
    const trimmedLogs = logs.slice(-MAX_LOGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedLogs));
  } catch (error) {
    console.error('Erro ao salvar logs:', error);
  }
};

/**
 * Registra uma nova atividade
 */
export const logActivity = ({
  type,
  category,
  description,
  userId = null,
  userName = null,
  metadata = {},
}) => {
  const logs = getLogs();

  const newLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    category,
    description,
    userId,
    userName,
    metadata,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.pathname,
  };

  logs.push(newLog);
  saveLogs(logs);

  return newLog;
};

/**
 * Filtra logs por critérios
 */
export const filterLogs = ({
  type = null,
  category = null,
  userId = null,
  startDate = null,
  endDate = null,
  limit = 50,
}) => {
  let logs = getLogs();

  if (type) {
    logs = logs.filter((log) => log.type === type);
  }

  if (category) {
    logs = logs.filter((log) => log.category === category);
  }

  if (userId) {
    logs = logs.filter((log) => log.userId === userId);
  }

  if (startDate) {
    const start = new Date(startDate);
    logs = logs.filter((log) => new Date(log.timestamp) >= start);
  }

  if (endDate) {
    const end = new Date(endDate);
    logs = logs.filter((log) => new Date(log.timestamp) <= end);
  }

  // Ordena do mais recente para o mais antigo
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return logs.slice(0, limit);
};

/**
 * Limpa todos os logs
 */
export const clearLogs = () => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Obtém estatísticas dos logs
 */
export const getLogStats = () => {
  const logs = getLogs();

  const stats = {
    total: logs.length,
    byType: {},
    byCategory: {},
    last24h: 0,
    lastWeek: 0,
  };

  const now = new Date();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  logs.forEach((log) => {
    // Por tipo
    stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;

    // Por categoria
    stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;

    // Temporal
    const logDate = new Date(log.timestamp);
    if (logDate >= oneDayAgo) stats.last24h++;
    if (logDate >= oneWeekAgo) stats.lastWeek++;
  });

  return stats;
};

/**
 * Helper para formatar timestamp
 */
export const formatLogTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  // Menos de 1 minuto
  if (diff < 60000) {
    return 'Agora mesmo';
  }

  // Menos de 1 hora
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `Ha ${mins} min`;
  }

  // Menos de 24 horas
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `Ha ${hours}h`;
  }

  // Menos de 7 dias
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `Ha ${days} dias`;
  }

  // Mais de 7 dias - mostra data completa
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Ícones para tipos de atividade
 */
export const getActivityIcon = (type) => {
  const icons = {
    [ActivityTypes.LOGIN]: 'LogIn',
    [ActivityTypes.LOGOUT]: 'LogOut',
    [ActivityTypes.VIEW]: 'Eye',
    [ActivityTypes.CREATE]: 'Plus',
    [ActivityTypes.UPDATE]: 'Edit',
    [ActivityTypes.DELETE]: 'Trash2',
    [ActivityTypes.EXPORT]: 'Download',
    [ActivityTypes.CONFIG_CHANGE]: 'Settings',
    [ActivityTypes.PERMISSION_CHANGE]: 'Shield',
  };
  return icons[type] || 'Activity';
};

/**
 * Cores para tipos de atividade
 */
export const getActivityColor = (type) => {
  const colors = {
    [ActivityTypes.LOGIN]: 'text-emerald-500',
    [ActivityTypes.LOGOUT]: 'text-slate-500',
    [ActivityTypes.VIEW]: 'text-blue-500',
    [ActivityTypes.CREATE]: 'text-green-500',
    [ActivityTypes.UPDATE]: 'text-amber-500',
    [ActivityTypes.DELETE]: 'text-red-500',
    [ActivityTypes.EXPORT]: 'text-purple-500',
    [ActivityTypes.CONFIG_CHANGE]: 'text-cyan-500',
    [ActivityTypes.PERMISSION_CHANGE]: 'text-orange-500',
  };
  return colors[type] || 'text-slate-500';
};

export default {
  logActivity,
  getLogs,
  filterLogs,
  clearLogs,
  getLogStats,
  formatLogTime,
  getActivityIcon,
  getActivityColor,
  ActivityTypes,
  ActivityCategories,
};
