export const isNil = <T>(val: T | undefined | null): val is T => {
  return val === undefined || val === null;
};

export const unreachable = (message?: string): never => {
  const error =
    message === undefined
      ? new Error("Unreachable code reached.")
      : new Error(`Unreachable code reached: ${message}`);
  throw error;
};
