import Link from "next/link";
import Image from "next/image";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  theme?: "light" | "dark";
  className?: string;
  asLink?: boolean;
  href?: string;
  withGlitch?: boolean;
}

export default function BrandLogo({
  size = "md",
  theme,
  className = "",
  asLink = false,
  href = "/",
}: BrandLogoProps) {
  const heightClasses = {
    sm: "h-7",
    md: "h-8 sm:h-9",
    lg: "h-10 sm:h-11",
    xl: "h-12 sm:h-14",
  }[size];

  const content = (
    <span className={`inline-flex items-center shrink-0 select-none ${className}`}>
      {theme === "dark" ? (
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
