const CURRENCY_EXPONENTS: Record<string, number> = {
  BHD: 3,
  CLP: 0,
  DJF: 0,
  JPY: 0,
  KMF: 0,
  KRW: 0,
  KWD: 3,
  OMR: 3,
  PYG: 0,
  RWF: 0,
  TND: 3,
  UGX: 0,
  VND: 0,
  VUV: 0,
  XAF: 0,
  XOF: 0,
  XPF: 0,
};

const DECIMAL_AMOUNT = /^([+-]?)(\d+)(?:\.(\d+))?$/;

export function currencyExponent(currency: string): number {
  return CURRENCY_EXPONENTS[currency.toUpperCase()] ?? 2;
}

/**
 * Converts a human-entered decimal amount to integer minor units.
 * Prefer strings (for example, `"1250.00"`) at API boundaries to preserve
 * the value exactly; the returned value is always a safe integer.
 */
export function toMinorUnits(amount: string | number, currency = "USD"): number {
  const normalized = typeof amount === "number" ? amount.toString() : amount.trim();

  if (typeof amount === "number" && !Number.isFinite(amount)) {
    throw new TypeError("Amount must be a finite number.");
  }

  const match = DECIMAL_AMOUNT.exec(normalized);
  if (!match) {
    throw new TypeError("Amount must be a plain decimal value.");
  }

  const [, sign, whole, suppliedFraction = ""] = match;
  const exponent = currencyExponent(currency);

  if (suppliedFraction.length > exponent) {
    throw new RangeError(
      `${currency.toUpperCase()} supports at most ${exponent} decimal places.`,
    );
  }

  const minorAsText = `${whole}${suppliedFraction.padEnd(exponent, "0")}`.replace(
    /^0+(?=\d)/,
    "",
  );
  const minor = Number(minorAsText);

  if (!Number.isSafeInteger(minor)) {
    throw new RangeError("Amount exceeds the supported safe integer range.");
  }

  return sign === "-" && minor !== 0 ? -minor : minor;
}

/** Returns a decimal string without converting money to a floating-point value. */
export function fromMinorUnits(minor: number, currency = "USD"): string {
  assertIntegerMinor(minor);

  const exponent = currencyExponent(currency);
  const sign = minor < 0 ? "-" : "";
  const absolute = Math.abs(minor).toString();

  if (exponent === 0) {
    return `${sign}${absolute}`;
  }

  const padded = absolute.padStart(exponent + 1, "0");
  return `${sign}${padded.slice(0, -exponent)}.${padded.slice(-exponent)}`;
}

/**
 * Formats integer minor units for display. It intentionally derives the
 * fractional representation from the integer value rather than dividing it.
 */
export function formatMoney(
  minor: number,
  currency = "USD",
  locale = "en-US",
): string {
  assertIntegerMinor(minor);

  const normalizedCurrency = currency.toUpperCase();
  const exponent = currencyExponent(normalizedCurrency);
  const divisor = 10 ** exponent;
  const negative = minor < 0;
  const absolute = Math.abs(minor);
  const whole = Math.floor(absolute / divisor);
  const fraction = exponent === 0 ? "" : String(absolute % divisor).padStart(exponent, "0");
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: normalizedCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const decimalSeparator =
    exponent === 0
      ? ""
      : (new Intl.NumberFormat(locale, { minimumFractionDigits: 1 })
          .formatToParts(1)
          .find((part) => part.type === "decimal")?.value ?? ".");
  const parts = formatter.formatToParts(negative ? -whole : whole);
  const finalIntegerIndex = parts.reduce(
    (lastIndex, part, index) => (part.type === "integer" ? index : lastIndex),
    -1,
  );

  return parts
    .map((part, index) =>
      index === finalIntegerIndex && exponent > 0
        ? `${part.value}${decimalSeparator}${fraction}`
        : part.value,
    )
    .join("");
}

export function assertIntegerMinor(value: unknown): asserts value is number {
  if (typeof value !== "number" || !Number.isSafeInteger(value)) {
    throw new TypeError("Money values must be stored as safe integer minor units.");
  }
}
