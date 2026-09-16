import { describe, expect, it } from 'vitest';
import { normalizePhone } from './phone.js';

describe('normalizePhone', () => {
  it('accepts a local 09 number', () => {
    expect(normalizePhone('09121234567')).toBe('09121234567');
  });

  it('accepts spaces, plus-98, and a missing zero', () => {
    expect(normalizePhone('+98 912 123 4567')).toBe('09121234567');
    expect(normalizePhone('00989121234567')).toBe('09121234567');
    expect(normalizePhone('9121234567')).toBe('09121234567');
  });

  it('accepts Persian digits', () => {
    expect(normalizePhone('۰۹۱۲۱۲۳۴۵۶۷')).toBe('09121234567');
  });

  it('rejects a landline', () => {
    expect(() => normalizePhone('02122001122')).toThrow(/0912/);
  });
});
