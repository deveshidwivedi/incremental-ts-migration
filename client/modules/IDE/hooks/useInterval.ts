// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
import { useState, useEffect, useRef } from 'react';

// Generic type for callback and delay to support both TS and JS usage
export default function useInterval(
  callback: () => void,
  delay: number | null
): () => void {
  const savedCallback = useRef<() => void>(undefined);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      if (savedCallback.current) savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      setIntervalId((id as unknown) as NodeJS.Timeout);
      return () => clearInterval((id as unknown) as NodeJS.Timeout);
    }
    return;
  }, [delay]);

  return () => {
    if (intervalId) clearInterval(intervalId);
  };
}
