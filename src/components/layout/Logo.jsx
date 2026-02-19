/**
 * Logo Ágili Complex
 * SVG do logo com barras de crescimento
 */
const Logo = ({ width = 200, height = 75, className = '' }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 290 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Texto "Ágili" */}
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

      {/* Barras de crescimento (gradiente de cores) */}
      <rect x="165" y="48" width="12" height="14" rx="2" fill="#58a3a4" />
      <rect x="182" y="40" width="12" height="22" rx="2" fill="#42878e" />
      <rect x="199" y="34" width="12" height="28" rx="2" fill="#2c6d7a" />
      <rect x="216" y="28" width="12" height="34" rx="2" fill="#1e5466" />
      <rect x="233" y="22" width="12" height="40" rx="2" fill="#0e4f6d" />

      {/* Linha base das barras */}
      <rect x="165" y="68" width="95" height="4" rx="2" fill="#0e4f6d" />

      {/* Texto "Complex" */}
      <text
        x="212.5"
        y="90"
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
