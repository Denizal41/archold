import { formatUnits } from "viem";

const SECONDS_PER_DAY = 86_400;
const SECONDS_PER_HOUR = 3_600;

export const shortenAddress = (address: string): string => `${address.slice(0, 6)}…${address.slice(-4)}`;

export const formatBalance = (value: bigint, decimals: number): string =>
  Number(formatUnits(value, decimals)).toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

export const formatDeadline = (deadline: bigint): string =>
  new Date(Number(deadline) * 1_000).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const formatTimeRemaining = (deadline: bigint, now: number): string => {
  const seconds = Number(deadline) - now;
  if (seconds <= 0) return "Expired";
  const days = Math.floor(seconds / SECONDS_PER_DAY);
  const hours = Math.floor((seconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR);
  return days > 0 ? `${days}d ${hours}h left` : `${Math.max(hours, 1)}h left`;
};
