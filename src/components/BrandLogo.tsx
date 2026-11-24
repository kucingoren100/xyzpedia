import Link from "next/link";
import Image from "next/image";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  theme?: "light" | "dark";
  className?: string;
  asLink?: boolean;
  href?: string;
  withGlitch?: boolean;
  iconOnly?: boolean;
}

export default function BrandLogo({
  size = "md",
  theme,
  className = "",
  asLink = false,
  href = "/",
  iconOnly = false,
}: BrandLogoProps) {
  const heightClasses = {
    sm: "h-8 sm:h-9",
    md: "h-11 sm:h-12 md:h-14",
    lg: "h-14 sm:h-16 md:h-20",
    xl: "h-18 sm:h-22 md:h-24",
  }[size];

  const iconClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-14 h-14",
  }[size];

  const content = (
    <span className={`inline-flex items-center shrink-0 select-none ${className}`}>
      {iconOnly ? (
        <img
          src="/brand/logo/xyzpedia-ikon-kuning.svg"
          alt="XYZPEDIA"
          className={`${iconClasses} object-contain transition-transform duration-200 group-hover:scale-105`}
        />
      ) : theme === "dark" ? (
        <img
          src="/brand/logo/xyzpedia-logo-horizontal-gelap.svg"
          alt="XYZPEDIA"
          className={`${heightClasses} w-auto object-contain transition-transform duration-200 group-hover:scale-105`}
        />
      ) : theme === "light" ? (
        <img
          src="/brand/logo/xyzpedia-logo-horizontal.svg"
          alt="XYZPEDIA"
          className={`${heightClasses} w-auto object-contain transition-transform duration-200 group-hover:scale-105`}
        />
      ) : (
        <>
          {/* Light mode */}
          <img
            src="/brand/logo/xyzpedia-logo-horizontal.svg"
            alt="XYZPEDIA"
            className={`${heightClasses} w-auto object-contain block dark:hidden transition-transform duration-200 group-hover:scale-105`}
          />
          {/* Dark mode */}
          <img
            src="/brand/logo/xyzpedia-logo-horizontal-gelap.svg"
            alt="XYZPEDIA"
            className={`${heightClasses} w-auto object-contain hidden dark:block transition-transform duration-200 group-hover:scale-105`}
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
