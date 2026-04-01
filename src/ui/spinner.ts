import ora from 'ora';
import { theme } from './theme.js';

/**
 * Wraps an async operation with an ora spinner.
 */
export async function withSpinner<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  const spinner = ora({
    text: theme.info(label),
    spinner: 'dots',
  }).start();

  try {
    const result = await fn();
    spinner.succeed(theme.success(label));
    return result;
  } catch (error) {
    spinner.fail(theme.error(label));
    throw error;
  }
}
