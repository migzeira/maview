const MaviewLogo = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoFront" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#4C1D95" />
      </linearGradient>
      <linearGradient id="logoBack" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
        <stop offset="0%" stopColor="#5B21B6" />
        <stop offset="100%" stopColor="#1A0A35" />
      </linearGradient>
    </defs>
    <polygon points="18,92 38,8 63,46 88,8 108,92" fill="url(#logoBack)" opacity="0.68" />
    <polygon points="4,92 26,12 50,52 74,12 96,92" fill="url(#logoFront)" />
  </svg>
);

export default MaviewLogo;
