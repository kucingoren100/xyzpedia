import Link from "next/link";

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
  theme = "light",
  className = "",
  asLink = false,
  href = "/",
  withGlitch = true,
}: BrandLogoProps) {
  const isDark = theme === "dark";

  // Sizing: XYZ and PEDIA share the EXACT SAME font-size across all breakpoints
  const sizeClasses = {
    sm: {
      wrap: "gap-1.5",
      text: "text-base sm:text-lg",
      pill: "px-2.5 py-0.5",
    },
    md: {
      wrap: "gap-1.5 sm:gap-2.5",
      text: "text-lg sm:text-2xl lg:text-[26px]",
      pill: "px-2.5 py-0.5 sm:px-4 sm:py-1.5",
    },
    lg: {
      wrap: "gap-3",
      text: "text-2xl sm:text-3xl lg:text-4xl",
      pill: "px-5 py-1.5 sm:px-6 sm:py-2",
    },
    xl: {
      wrap: "gap-3.5",
      text: "text-3xl sm:text-4xl lg:text-5xl",
      pill: "px-6 py-2 sm:px-7 sm:py-2.5",
    },
  }[size];

  // Chromatic aberration (RGB split / 3D edge effect) as seen in the reference logo
  const glitchStyle = withGlitch
    ? {
        textShadow: "1.2px 0px 0px rgba(255, 69, 0, 0.85), -1.2px 0px 0px rgba(0, 102, 255, 0.85)",
      }
    : undefined;

  const content = (
    <span
      className={`inline-flex items-center select-none font-[var(--font-hanken)] font-black tracking-tight ${sizeClasses.wrap} ${className}`}
    >
      {/* "XYZ" Pill - tilted counter-clockwise (-2.8deg), solid capsule, identical font size */}
      <span
        className={`inline-flex items-center justify-center rounded-full leading-none -rotate-[2.8deg] transition-transform duration-200 group-hover:-rotate-[5deg] group-hover:scale-105 shrink-0 ${
          sizeClasses.pill
        } ${
          isDark
            ? "bg-white text-black"
            : "bg-black text-white dark:bg-white dark:text-black"
        }`}
      >
        <span
          style={glitchStyle}
          className={`${sizeClasses.text} font-black uppercase tracking-tight leading-none pt-[1px]`}
        >
          XYZ
        </span>
      </span>

      {/* "PEDIA" Text - upright, matching the exact font size and weight */}
      <span
        style={glitchStyle}
        className={`${sizeClasses.text} font-black uppercase tracking-tight leading-none shrink-0 ${
          isDark ? "text-white" : "text-black dark:text-white"
        }`}
      >
        PEDIA
      </span>
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
