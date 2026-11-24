import Link from "next/link";
import Image from "next/image";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  theme?: "light" | "dark";
  className?: string;
  imgClassName?: string;
  asLink?: boolean;
  href?: string;
  withGlitch?: boolean;
  iconOnly?: boolean;
}

export default function BrandLogo({
  size = "md",
  theme,
  className = "",
  imgClassName,
  asLink = false,
  href = "/",
  iconOnly = false,
}: BrandLogoProps) {
  const heightClasses = {
    sm: "h-8 sm:h-9",
    md: "h-12 sm:h-13 md:h-14 lg:h-16",
    lg: "h-16 sm:h-18 md:h-20 lg:h-24",
    xl: "h-20 sm:h-24 md:h-28",
  }[size];

  const iconClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-14 h-14",
  }[size];

  const activeImageClass = imgClassName
    ? imgClassName
    : `${heightClasses} w-auto object-contain transition-transform duration-200 group-hover:scale-105`;

  const activeIconClass = imgClassName
    ? imgClassName
    : `${iconClasses} object-contain transition-transform duration-200 group-hover:scale-105`;

  const content = (
    <span className={`inline-flex items-center shrink-0 select-none ${className}`}>
      {iconOnly ? (
        <img
          src="/brand/logo/xyzpedia-ikon-kuning.svg"
          alt="XYZPEDIA"
          className={activeIconClass}
        />
      ) : theme === "dark" ? (
        <img
          src="/brand/logo/xyzpedia-logo-horizontal-gelap.svg"
          alt="XYZPEDIA"
          className={activeImageClass}
        />
      ) : theme === "light" ? (
        <img
          src="/brand/logo/xyzpedia-logo-horizontal.svg"
          alt="XYZPEDIA"
          className={activeImageClass}
        />
      ) : (
        <>
          {/* Light mode */}
          <img
            src="/brand/logo/xyzpedia-logo-horizontal.svg"
            alt="XYZPEDIA"
            className={`${activeImageClass} block dark:hidden`}
          />
          {/* Dark mode */}
          <img
            src="/brand/logo/xyzpedia-logo-horizontal-gelap.svg"
            alt="XYZPEDIA"
            className={`${activeImageClass} hidden dark:block`}
          />
        </>
      )}
    </span>
  );

  if (asLink) {
    return (
      <Link
        href={href}
        className="group inline-flex items-center shrink-0 hover:opacity-95 transition-opacity"
        aria-label="XYZPEDIA Homepage"
      >
        {content}
      </Link>
    );
  }

  return content;
}
