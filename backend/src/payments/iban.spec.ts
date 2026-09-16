import { describe, expect, it } from 'vitest';
import { isValidIban, normalizeIban } from './iban.js';

describe('iban', () => {
  it('accepts an IR sheba with 24 digits', () => {
    expect(isValidIban('ir130570028780010957775103')).toBe(true);
    expect(normalizeIban('IR13 0570 0287 8001 0957 7751 03')).toBe(
      'IR130570028780010957775103',
    );
  });

  it('rejects missing or short values', () => {
    expect(isValidIban(null)).toBe(false);
    expect(isValidIban('IR123')).toBe(false);
    expect(isValidIban('DE130570028780010957775103')).toBe(false);
  });
});
