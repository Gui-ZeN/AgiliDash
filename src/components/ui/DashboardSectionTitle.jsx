const toneStyles = {
  blue: {
    iconBg: 'bg-[#0e4f6d]',
    badge: 'text-[#0e4f6d] dark:text-teal-300',
    glow: 'from-sky-100/70 dark:from-sky-500/10',
  },
  emerald: {
    iconBg: 'bg-emerald-700',
    badge: 'text-emerald-700 dark:text-emerald-300',
    glow: 'from-emerald-100/70 dark:from-emerald-500/10',
  },
  slate: {
    iconBg: 'bg-slate-700',
    badge: 'text-slate-700 dark:text-slate-300',
    glow: 'from-slate-200/70 dark:from-slate-400/10',
  },
  teal: {
    iconBg: 'bg-teal-600',
    badge: 'text-teal-600 dark:text-teal-300',
    glow: 'from-teal-100/70 dark:from-teal-500/10',
  },
  amber: {
    iconBg: 'bg-amber-500',
    badge: 'text-amber-600 dark:text-amber-300',
    glow: 'from-amber-100/70 dark:from-amber-500/10',
  },
};

const DashboardSectionTitle = ({
  icon: Icon,
  badge,
  title,
  subtitle,
  tone = 'slate',
  actions = null,
  className = '',
}) => {
  const style = toneStyles[tone] || toneStyles.slate;

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white/85 dark:bg-slate-800/75 backdrop-blur-sm px-5 py-5 lg:px-7 lg:py-6 shadow-sm ${className}`}
    >
      <div
        className={`pointer-events-none absolute inset-y-0 right-0 w-44 bg-gradient-to-l ${style.glow} to-transparent`}
      />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-3">
            <div className={`rounded-xl p-2.5 shadow-sm ${style.iconBg}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <span className={`text-xs font-bold uppercase tracking-[0.18em] ${style.badge}`}>
              {badge}
            </span>
          </div>

          <h1 className="text-3xl font-semibold leading-tight text-slate-800 dark:text-white lg:text-4xl">
            {title}
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400 lg:text-base">
            {subtitle}
          </p>
        </div>

        {actions ? <div className="flex-shrink-0">{actions}</div> : null}
      </div>
    </section>
  );
};

export default DashboardSectionTitle;
