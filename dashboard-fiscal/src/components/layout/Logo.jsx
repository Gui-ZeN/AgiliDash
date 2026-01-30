/**
 * Logo Ágili Complex
 * SVG do logo com barras de crescimento
 */
const Logo = ({ width = 200, height = 75 }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 320 110"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Texto "Ágili" */}
      <text
        x="0"
        y="70"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="75"
        fill="#0e4f6d"
      >
        Ágili
      </text>

      {/* Barras de crescimento (gradiente de cores) */}
      <rect x="175" y="55" width="14" height="15" rx="2" fill="#58a3a4" />
      <rect x="194" y="45" width="14" height="25" rx="2" fill="#42878e" />
      <rect x="213" y="40" width="14" height="30" rx="2" fill="#2c6d7a" />
      <rect x="232" y="35" width="14" height="35" rx="2" fill="#1e5466" />
      <rect x="251" y="30" width="14" height="40" rx="2" fill="#0e4f6d" />

      {/* Linha base das barras */}
      <rect x="175" y="78" width="105" height="5" rx="2" fill="#0e4f6d" />

      {/* Texto "Complex" */}
      <text
        x="180"
        y="102"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="28"
        fill="#0e4f6d"
      >
        Complex
      </text>
    </svg>
  );
};

export default Logo;
