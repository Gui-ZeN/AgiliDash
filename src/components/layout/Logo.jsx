import { useTheme } from '../../context/ThemeContext';

/**
 * Agili Complex logo
 * SVG with growth bars
 */
const Logo = ({ width = 200, height = 75, className = '' }) => {
  const { isDarkMode } = useTheme();

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 290 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {isDarkMode && (
        <rect
          x="1"
          y="1"
          width="288"
          height="98"
          rx="6"
          fill="none"
          stroke="rgba(255, 255, 255, 0.75)"
          strokeWidth="1"
        />
      )}

      {/* Text "Ágili" */}
      <text
        x="0"
        y="62"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="68"
        fill="#0e4f6d"
      >
        Ágili
      </text>

      {/* Growth bars */}
      <rect x="165" y="48" width="12" height="14" rx="2" fill="#58a3a4" />
      <rect x="182" y="40" width="12" height="22" rx="2" fill="#42878e" />
      <rect x="199" y="34" width="12" height="28" rx="2" fill="#2c6d7a" />
      <rect x="216" y="28" width="12" height="34" rx="2" fill="#1e5466" />
      <rect x="233" y="22" width="12" height="40" rx="2" fill="#0e4f6d" />

      {/* Baseline under bars */}
      <rect x="165" y="68" width="95" height="4" rx="2" fill="#0e4f6d" />

      {/* Text "Complex" */}
      <text
        x="212.5"
        y="93"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="24"
        fill="#0e4f6d"
        textAnchor="middle"
      >
        Complex
      </text>
    </svg>
  );
};

export default Logo;
