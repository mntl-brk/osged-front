import { useEffect, useState } from 'react';

interface UseRequireLandscapeOptions {
  minWidth?: number; 
}

export const useRequireLandscape = (
  options: UseRequireLandscapeOptions = {}
) => {
  const { minWidth = 1024 } = options;

  const [needLandscape, setNeedLandscape] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      const isMobileOrTablet = window.innerWidth < minWidth;

      setNeedLandscape(isPortrait && isMobileOrTablet);
    };

    checkOrientation();

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, [minWidth]);

  return needLandscape;
};