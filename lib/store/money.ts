export function formatNPR(paisa: number | null | undefined): string {
  if (paisa === null || paisa === undefined) {
    return 'Price on request';
  }
  const rupees = paisa / 100;
  return `NPR ${rupees.toLocaleString('en-NP', {
    minimumFractionDigits: rupees % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function paisaFromNPR(npr: number | string): number {
  const num = typeof npr === 'string' ? Number.parseFloat(npr) : npr;
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.round(num * 100);
}

export function nprFromPaisa(paisa: number | null | undefined): number {
  if (paisa === null || paisa === undefined) return 0;
  return Math.round(paisa) / 100;
}
