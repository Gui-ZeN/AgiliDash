import { useMemo } from 'react';

/**
 * Componente Sparkline - Mini gráfico de linha para tendências
 */
const Sparkline = ({
  data = [],
  width = 80,
  height = 24,
  color = '#0e4f6d',
  fillColor = null,
  strokeWidth = 2,
  showDots = false,
  showEndDot = true,
  className = ''
}) => {
  const points = useMemo(() => {
    if (!data.length) return '';

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const xStep = width / (data.length - 1 || 1);
    const padding = 2;
    const effectiveHeight = height - padding * 2;

    return data.map((value, i) => {
      const x = i * xStep;
      const y = padding + effectiveHeight - ((value - min) / range) * effectiveHeight;
      return `${x},${y}`;
    }).join(' ');
  }, [data, width, height]);

  const lastPoint = useMemo(() => {
    if (!data.length) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const xStep = width / (data.length - 1 || 1);
    const padding = 2;
    const effectiveHeight = height - padding * 2;

    const lastValue = data[data.length - 1];
    return {
      x: (data.length - 1) * xStep,
      y: padding + effectiveHeight - ((lastValue - min) / range) * effectiveHeight
    };
  }, [data, width, height]);

  const trend = useMemo(() => {
    if (data.length < 2) return 'neutral';
    const first = data[0];
    const last = data[data.length - 1];
    if (last > first) return 'up';
    if (last < first) return 'down';
    return 'neutral';
  }, [data]);

  const trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : color;

  if (!data.length) return null;

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
    >
      {fillColor && (
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill={fillColor}
          opacity={0.1}
        />
      )}
      <polyline
        points={points}
        fill="none"
        stroke={trendColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showDots && data.map((value, i) => {
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;
        const xStep = width / (data.length - 1 || 1);
        const padding = 2;
        const effectiveHeight = height - padding * 2;
        const x = i * xStep;
        const y = padding + effectiveHeight - ((value - min) / range) * effectiveHeight;

        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={2}
            fill={trendColor}
          />
        );
      })}
      {showEndDot && lastPoint && (
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={3}
          fill={trendColor}
          stroke="white"
          strokeWidth={1.5}
        />
      )}
    </svg>
  );
};

export default Sparkline;
