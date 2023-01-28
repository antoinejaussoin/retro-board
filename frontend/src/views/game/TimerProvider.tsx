import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTimer } from './useTimer';

type TimerProviderProps = {
  children: React.ReactNode;
};

const TimerContext = createContext({
  hasRunOut: false,
});

export function useHasRunOut() {
  return useContext(TimerContext).hasRunOut;
}

export default function TimerProvider({ children }: TimerProviderProps) {
  const [hasRunOut, setHasRunOut] = useState(false);
  const timer = useTimer();

  useEffect(() => {
    const handle = setInterval(() => {
      if (!timer) {
        setHasRunOut(false);
        return;
      }

      const remaining = Math.floor(
        (timer.getTime() - new Date().getTime()) / 1000
      );
      setHasRunOut(remaining <= 0);
    }, 100);
    return () => {
      clearInterval(handle);
    };
  }, [timer]);

  return (
    <TimerContext.Provider value={{ hasRunOut }}>
      {children}
    </TimerContext.Provider>
  );
}
