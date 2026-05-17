import { useEffect, useRef, useState } from "react";

export function useSessionTimer(isLive: boolean, resetKey: string) {
  const [timer, setTimer] = useState(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setTimer(0);
  }, [resetKey]);

  useEffect(() => {
    if (!isLive) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    if (timerIntervalRef.current) {
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimer((current) => current + 1);
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isLive]);

  function resetTimer() {
    setTimer(0);
  }

  return {
    timer,
    resetTimer,
  };
}
