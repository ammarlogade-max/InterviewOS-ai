import { useEffect, useState } from "react";

export const useCountdown = (seconds: number, active: boolean, onTimeout: () => void) => {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (!active) return;
    setLeft(seconds);
    const id = setInterval(() => {
      setLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [seconds, active, onTimeout]);

  return left;
};
