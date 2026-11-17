"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [navigating, setNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  // When pathname or searchParams change, navigation is complete
  useEffect(() => {
    if (navigating) {
      setProgress(100);
      const timer = setTimeout(() => {
        setNavigating(false);
        setProgress(0);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept click on <a> and <Link> tags to show progress bar instantly
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("https://wa.me") ||
        target.target === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      ) {
        return;
      }

      // Check if it's an internal route
      try {
        const url = new URL(href, window.location.href);
        if (url.origin === window.location.origin) {
          // If clicking link to a different path or query
          if (
            url.pathname !== window.location.pathname ||
            url.search !== window.location.search
          ) {
            setNavigating(true);
            setProgress(30);

            // Progressive advance while waiting for route chunk
            setTimeout(() => setProgress((p) => (p < 80 ? 70 : p)), 100);
            setTimeout(() => setProgress((p) => (p < 90 ? 88 : p)), 300);
          }
        }
      } catch {
        // Ignore invalid URL
      }
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
    };
  }, []);

  if (!navigating && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[2.5px] bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-[#ffd731] via-[#55db9c] to-[#38bdf8] shadow-[0_0_8px_#ffd731] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
