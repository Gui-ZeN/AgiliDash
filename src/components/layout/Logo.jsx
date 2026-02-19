import { useTheme } from '../../context/ThemeContext';

/**
 * Agili Complex logo
 * SVG with growth bars
 */
const Logo = ({ width = 200, height = 75, className = '' }) => {
  const { isDarkMode } = useTheme();
  const outlineColor = 'rgba(255, 255, 255, 0.78)';

  const textOutline = isDarkMode
    ? {
        stroke: outlineColor,
        strokeWidth: 1.2,
        paintOrder: 'stroke fill',
        strokeLinejoin: 'round',
      }
    : {};

  const smallTextOutline = isDarkMode
    ? {
        stroke: outlineColor,
        strokeWidth: 0.8,
        paintOrder: 'stroke fill',
        strokeLinejoin: 'round',
      }
    : {};

  const shapeOutline = isDarkMode
    ? {
        stroke: outlineColor,
        strokeWidth: 0.7,
        strokeLinejoin: 'round',
      }
    : {};

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 290 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Text "Ágili" */}
      <text
        x="0"
        y="62"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="68"
        fill="#0e4f6d"
        {...textOutline}
      >
        Ágili
      </text>

      {/* Growth bars */}
      <rect x="165" y="48" width="12" height="14" rx="2" fill="#58a3a4" {...shapeOutline} />
      <rect x="182" y="40" width="12" height="22" rx="2" fill="#42878e" {...shapeOutline} />
      <rect x="199" y="34" width="12" height="28" rx="2" fill="#2c6d7a" {...shapeOutline} />
      <rect x="216" y="28" width="12" height="34" rx="2" fill="#1e5466" {...shapeOutline} />
      <rect x="233" y="22" width="12" height="40" rx="2" fill="#0e4f6d" {...shapeOutline} />

      {/* Baseline under bars */}
      <rect x="165" y="68" width="95" height="4" rx="2" fill="#0e4f6d" {...shapeOutline} />

      {/* Text "Complex" */}
      <text
        x="212.5"
        y="93"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="24"
        fill="#0e4f6d"
        textAnchor="middle"
        {...smallTextOutline}
      >
        Complex
      </text>
    </svg>
  );
};

export default Logo;
