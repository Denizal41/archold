import { useEffect, useState } from "react";

const CLOCK_INTERVAL_MS = 60_000;
const getTimestamp = (): number => Math.floor(Date.now() / 1_000);

export const useCurrentTimestamp = (): number => {
  const [timestamp, setTimestamp] = useState(getTimestamp);

  useEffect(() => {
    const updateTimestamp = (): void => setTimestamp(getTimestamp());
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") updateTimestamp();
    }, CLOCK_INTERVAL_MS);
    document.addEventListener("visibilitychange", updateTimestamp);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", updateTimestamp);
    };
  }, []);

  return timestamp;
};
