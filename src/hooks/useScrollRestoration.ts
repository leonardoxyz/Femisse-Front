import React from "react";
import { useLocation } from "react-router-dom";

function buildStorageKey(pathname: string, search: string) {
  return `scrollPosition:${pathname}${search}`;
}

export function useScrollRestoration() {
  const location = useLocation();

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const key = buildStorageKey(location.pathname, location.search);

    const restore = () => {
      const stored = sessionStorage.getItem(key);
      if (stored) {
        try {
          const { x = 0, y = 0 } = JSON.parse(stored) ?? {};
          window.scrollTo({ left: x, top: y, behavior: "auto" });
        } catch {
          window.scrollTo({ left: 0, top: 0, behavior: "auto" });
        }
      }
    };

    const rafId = window.requestAnimationFrame(restore);

    return () => {
      window.cancelAnimationFrame(rafId);
      try {
        const value = JSON.stringify({ x: window.scrollX, y: window.scrollY });
        sessionStorage.setItem(key, value);
      } catch {
        /* ignore storage errors */
      }
    };
  }, [location.pathname, location.search]);
}

export function storeCurrentScrollPosition() {
  if (typeof window === 'undefined') return;
  try {
    const key = buildStorageKey(window.location.pathname, window.location.search);
    const value = JSON.stringify({ x: window.scrollX, y: window.scrollY });
    sessionStorage.setItem(key, value);
  } catch {
    /* ignore storage errors */
  }
}
