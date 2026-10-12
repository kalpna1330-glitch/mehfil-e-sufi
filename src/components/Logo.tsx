interface Props {
  size?: number;
}

export default function Logo({ size = 72 }: Props) {
  return (
    <img
      src="/logo.png"
      alt="Mehfil-e-Sufi Musical Emblem"
      width={size}
      height={size}
      className="brand-logo"
    />
  );
}
