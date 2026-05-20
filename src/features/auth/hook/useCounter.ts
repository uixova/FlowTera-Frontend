import { useEffect, useState } from 'react';

const useCounter = (end: number, duration: number = 2000, start: boolean = false): number => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number | null = null;
    let frameId: number | null = null;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing fonksiyonu: 1 - (1 - progress)^3
      const eased = 1 - (1 - progress) ** 3;
      
      setCount(Math.floor(eased * end));
      
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(frameId ? frameId : step);
    
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [end, duration, start]);

  return count;
};

export default useCounter;