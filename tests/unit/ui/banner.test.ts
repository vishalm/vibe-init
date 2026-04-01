import { describe, it, expect, vi } from 'vitest';
import { showBanner } from '../../../src/ui/banner.js';

describe('showBanner', () => {
  it('should print banner with version', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    showBanner('1.2.3');

    expect(consoleSpy).toHaveBeenCalled();
    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('GOD MODE ACTIVATED');
    expect(output).toContain('1.2.3');

    consoleSpy.mockRestore();
  });
});
