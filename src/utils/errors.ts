export const getErrorCode = (error: unknown): number | undefined => {
  if (typeof error !== "object" || error === null || !("code" in error)) return undefined;
  return typeof error.code === "number" ? error.code : undefined;
};

export const getFriendlyError = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "shortMessage" in error) {
    return String(error.shortMessage);
  }
  return error instanceof Error ? error.message : "The transaction could not be completed.";
};
