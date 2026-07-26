import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

type ScrollPosition = {
  x: number;
  y: number;
};

export function ScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const positionsRef = useRef(new Map<string, ScrollPosition>());

  useEffect(() => {
    const originalScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = originalScrollRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    const positions = positionsRef.current;
    const requestedSection = (location.state as { scrollTo?: string } | null)?.scrollTo;
    const savedPosition = positions.get(location.key);

    if (requestedSection !== "produtos") {
      const targetPosition = navigationType === "POP" && savedPosition
        ? savedPosition
        : { x: 0, y: 0 };

      const previousScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(targetPosition.x, targetPosition.y);
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    }

    return () => {
      positions.set(location.key, {
        x: window.scrollX,
        y: window.scrollY,
      });
    };
  }, [location.key, location.state, navigationType]);

  return null;
}
