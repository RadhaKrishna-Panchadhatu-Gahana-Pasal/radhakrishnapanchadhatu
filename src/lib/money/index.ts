/**
 * Money utilities — always work in integer paisa to avoid floating-point errors.
 * 1 NPR = 100 paisa
 */

export function addPaisa(a: number, b: number): number {
  return a + b;
}

export function subtractPaisa(a: number, b: number): number {
  return a - b;
}

export function multiplyPaisa(paisa: number, qty: number): number {
  return Math.round(paisa * qty);
}

/** Apply a percentage discount. Rate is in basis points: 1000 = 10% */
export function applyPercentageDiscount(
  paisa: number,
  basisPoints: number
): number {
  return Math.round(paisa * (1 - basisPoints / 10000));
}

/** Apply a fixed paisa discount, clamped to 0 */
export function applyFixedDiscount(paisa: number, discountPaisa: number): number {
  return Math.max(0, paisa - discountPaisa);
}

/** Format paisa as NPR display string */
export function formatNPR(paisa: number): string {
  const rupees = paisa / 100;
  return `NPR ${rupees.toLocaleString("en-NP")}`;
}

/** Paisa to decimal NPR (for display only — not for arithmetic) */
export function paisaToNpr(paisa: number): number {
  return paisa / 100;
}

/** NPR to paisa integer */
export function nprToPaisa(npr: number): number {
  return Math.round(npr * 100);
}
