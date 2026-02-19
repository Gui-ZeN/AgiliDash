/**
 * Componentes de Skeleton Loading
 * Placeholders animados enquanto dados carregam
 */

// Skeleton base com animação de pulso
export const Skeleton = ({ className = '', ...props }) => (
  <div
    className={`animate-pulse bg-slate-100 dark:bg-slate-700/50 rounded ${className}`}
    {...props}
  />
);

// Skeleton para cards de KPI
export const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200/80 dark:border-slate-700/80">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-9 w-9 rounded-md" />
    </div>
    <Skeleton className="h-7 w-32 mb-2" />
    <Skeleton className="h-3 w-20" />
  </div>
);

// Skeleton para gráficos
export const SkeletonChart = ({ height = 'h-64' }) => (
  <div
    className={`bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200/80 dark:border-slate-700/80 ${height}`}
  >
    <Skeleton className="h-5 w-40 mb-6" />
    <div className="flex items-end gap-2 h-[calc(100%-60px)]">
      {[40, 65, 45, 80, 55, 70, 50, 75, 60, 85, 45, 70].map((h, i) => (
        <Skeleton key={i} className="flex-1 rounded-t" style={{ height: `${h}%` }} />
      ))}
    </div>
  </div>
);

// Skeleton para tabelas
export const SkeletonTable = ({ rows = 5 }) => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
    <div className="p-4 border-b border-slate-100 dark:border-slate-700/80">
      <Skeleton className="h-5 w-32" />
    </div>
    <div className="divide-y divide-slate-100 dark:divide-slate-700/80">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

// Skeleton para lista
export const SkeletonList = ({ items = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

// Skeleton para breadcrumbs
export const SkeletonBreadcrumb = () => (
  <div className="flex items-center gap-2">
    <Skeleton className="h-4 w-16" />
    <Skeleton className="h-4 w-4 rounded-full" />
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-4 w-4 rounded-full" />
    <Skeleton className="h-4 w-20" />
  </div>
);

// Skeleton para header stats
export const SkeletonHeaderStats = () => (
  <div className="flex gap-6">
    {[1, 2, 3].map((i) => (
      <div key={i} className="text-center">
        <Skeleton className="h-6 w-16 mx-auto mb-1" />
        <Skeleton className="h-3 w-12 mx-auto" />
      </div>
    ))}
  </div>
);

export default Skeleton;
