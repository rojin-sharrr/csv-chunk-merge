export const info = (message: string, meta?: unknown): void => {
  if (meta) {
    // eslint-disable-next-line no-console
    console.log(`[info] ${message}`, meta);
  } else {
    // eslint-disable-next-line no-console
    console.log(`[info] ${message}`);
  }
};

export const error = (message: string, meta?: unknown): void => {
  if (meta) {
    // eslint-disable-next-line no-console
    console.error(`[error] ${message}`, meta);
  } else {
    // eslint-disable-next-line no-console
    console.error(`[error] ${message}`);
  }
};

