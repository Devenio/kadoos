const IBAN = /^IR[0-9]{24}$/;

export function normalizeIban(value: string): string {
  return value.replace(/\s+/g, '').toUpperCase();
}

export function isValidIban(
  value: string | null | undefined,
): value is string {
  if (!value) {
    return false;
  }
  return IBAN.test(normalizeIban(value));
}
