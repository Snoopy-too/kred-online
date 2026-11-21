import { useState, useEffect } from 'react';

export function useBoardScale() {
  const [autoScale, setAutoScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const width = window.outerWidth || window.innerWidth;
      const calculatedScale = Math.min(1.4, width / 1200);
      setAutoScale(calculatedScale);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { zoomLevel: 0.75, autoScale };
}
