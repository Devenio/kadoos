export function toAsciiDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const fa = "۰۱۲۳۴۵۶۷۸۹".indexOf(digit);
    if (fa >= 0) {
      return String(fa);
    }
    const ar = "٠١٢٣٤٥٦٧٨٩".indexOf(digit);
    return ar >= 0 ? String(ar) : digit;
  });
}

export function digitsOnly(value: string): string {
  let digits = toAsciiDigits(value).replace(/\D/g, "");
  if (digits.startsWith("0098")) {
    digits = digits.slice(4);
  } else if (digits.startsWith("98")) {
    digits = digits.slice(2);
  }
  if (digits.startsWith("9") && digits.length === 10) {
    digits = `0${digits}`;
  }
  return digits;
}

export function isMobilePhone(value: string): boolean {
  return /^09\d{9}$/.test(digitsOnly(value));
}
