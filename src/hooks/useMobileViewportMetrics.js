import { useEffect } from 'react';

function updateViewportMetrics() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const root = document.documentElement;
  const visualViewport = window.visualViewport;
  const viewportHeight = visualViewport?.height || window.innerHeight || root.clientHeight || 0;
  const viewportWidth = visualViewport?.width || window.innerWidth || root.clientWidth || 0;
  const layoutHeight = window.innerHeight || viewportHeight;
  const keyboardOpen = Boolean(visualViewport && layoutHeight - viewportHeight > 140);
  const landscape = viewportWidth > viewportHeight;
  const compactLandscape = landscape && viewportHeight < 520;

  root.style.setProperty('--app-vh', `${viewportHeight * 0.01}px`);
  root.style.setProperty('--app-visual-height', `${viewportHeight}px`);
  root.style.setProperty('--app-visual-width', `${viewportWidth}px`);
  root.classList.toggle('mobile-keyboard-open', keyboardOpen);
  root.classList.toggle('mobile-landscape', landscape);
  root.classList.toggle('mobile-compact-landscape', compactLandscape);
}

export function useMobileViewportMetrics() {
  useEffect(() => {
    updateViewportMetrics();

    const visualViewport = window.visualViewport;
    const handleChange = () => window.requestAnimationFrame(updateViewportMetrics);

    window.addEventListener('resize', handleChange, { passive: true });
    window.addEventListener('orientationchange', handleChange, { passive: true });
    visualViewport?.addEventListener('resize', handleChange, { passive: true });
    visualViewport?.addEventListener('scroll', handleChange, { passive: true });

    return () => {
      window.removeEventListener('resize', handleChange);
      window.removeEventListener('orientationchange', handleChange);
      visualViewport?.removeEventListener('resize', handleChange);
      visualViewport?.removeEventListener('scroll', handleChange);
      document.documentElement.classList.remove('mobile-keyboard-open', 'mobile-landscape', 'mobile-compact-landscape');
      document.documentElement.style.removeProperty('--app-vh');
      document.documentElement.style.removeProperty('--app-visual-height');
      document.documentElement.style.removeProperty('--app-visual-width');
    };
  }, []);
}
