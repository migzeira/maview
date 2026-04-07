import logoSrc from "@/assets/maview-logo.png";

const MaviewLogo = ({ size = 32 }: { size?: number }) => (
  <img
    src={logoSrc}
    alt="Maview"
    width={size}
    height={size}
    className="object-contain"
    style={{ width: size, height: size }}
  />
);

export default MaviewLogo;
