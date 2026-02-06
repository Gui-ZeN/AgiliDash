import { Link } from 'react-router-dom';
import { FileQuestion, Upload, Database, Users, BarChart3, FileSpreadsheet } from 'lucide-react';

/**
 * Ícones disponíveis para empty states
 */
const ICONS = {
  file: FileQuestion,
  upload: Upload,
  database: Database,
  users: Users,
  chart: BarChart3,
  spreadsheet: FileSpreadsheet
};

/**
 * Componente EmptyState reutilizável
 * Exibe um estado vazio com ícone, título, descrição e CTA opcional
 */
const EmptyState = ({
  icon = 'file',
  title = 'Nenhum dado encontrado',
  description = 'Não há dados para exibir no momento.',
  actionLabel,
  actionLink,
  onAction,
  className = ''
}) => {
  const Icon = ICONS[icon] || ICONS.file;

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      {/* Ícone decorativo */}
      <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-slate-400 dark:text-slate-500" />
      </div>

      {/* Título */}
      <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
        {title}
      </h3>

      {/* Descrição */}
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5">
        {description}
      </p>

      {/* CTA Button */}
      {(actionLabel && (actionLink || onAction)) && (
        actionLink ? (
          <Link
            to={actionLink}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
          >
            <Upload className="w-4 h-4" />
            {actionLabel}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
          >
            <Upload className="w-4 h-4" />
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
};

/**
 * Empty state específico para gráficos sem dados importados
 */
export const ChartEmptyState = ({ chartName, sector = 'contabil' }) => (
  <EmptyState
    icon="chart"
    title={`Importe dados para ${chartName}`}
    description={`Este gráfico requer dados importados do setor ${sector}. Vá até as Configurações para importar.`}
    actionLabel="Ir para Configurações"
    actionLink="/configuracoes"
  />
);

/**
 * Empty state para tabelas sem dados
 */
export const TableEmptyState = ({ tableName }) => (
  <EmptyState
    icon="spreadsheet"
    title="Nenhum registro encontrado"
    description={`A tabela ${tableName} não possui dados para exibir.`}
  />
);

/**
 * Empty state para lista de usuários/grupos
 */
export const ListEmptyState = ({ itemType = 'itens', onAdd }) => (
  <EmptyState
    icon="users"
    title={`Nenhum ${itemType} cadastrado`}
    description={`Clique no botão abaixo para adicionar o primeiro ${itemType}.`}
    actionLabel={`Adicionar ${itemType}`}
    onAction={onAdd}
  />
);

/**
 * Empty state para importação de dados
 */
export const ImportEmptyState = ({ dataType }) => (
  <EmptyState
    icon="upload"
    title="Dados não importados"
    description={`Importe o arquivo ${dataType} para visualizar os dados nesta seção.`}
    actionLabel="Importar Dados"
    actionLink="/configuracoes"
  />
);

export default EmptyState;
