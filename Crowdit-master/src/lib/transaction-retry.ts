export async function retryTransaction<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1_000,
): Promise<T> {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      attempt += 1;

      if (attempt >= maxRetries) {
        throw error;
      }

      const delay = delayMs * attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
}
