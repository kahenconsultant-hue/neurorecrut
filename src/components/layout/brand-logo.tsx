import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  label?: string;
  compact?: boolean;
  priority?: boolean;
};

export function BrandLogo({ href = "/", label, compact = false, priority = false }: BrandLogoProps) {
  const image = (
    <span className="inline-flex items-center gap-3">
      <Image
        src="/neurorecrut-logo.png"
        alt="NeuroRecrut"
        width={230}
        height={81}
        className={compact ? "h-auto w-32 sm:w-36" : "h-auto w-44"}
        priority={priority}
      />
      {label ? <span className="hidden text-sm font-semibold text-graphite min-[380px]:inline">{label}</span> : null}
    </span>
  );

  if (!href) return image;

  return (
    <Link href={href} aria-label={label ? `NeuroRecrut ${label}` : "NeuroRecrut"}>
      {image}
    </Link>
  );
}
