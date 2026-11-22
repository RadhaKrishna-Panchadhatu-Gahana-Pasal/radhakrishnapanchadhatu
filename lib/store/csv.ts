/**
 * Minimal RFC 4180 CSV helpers (quotes, embedded commas/newlines, CRLF).
 * Shared by the product export/import admin endpoints and the tests.
 */

export type CsvValue = string | number | null | undefined;

function escapeCell(value: CsvValue): string {
  const text = value === null || value === undefined ? '' : String(value);
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function toCsv(headers: string[], rows: CsvValue[][]): string {
  const lines = [headers.map(escapeCell).join(',')];
  for (const row of rows) lines.push(row.map(escapeCell).join(','));
  return `${lines.join('\r\n')}\r\n`;
}

/** Parses CSV text into rows of cells. Tolerates BOM, CRLF and blank trailing rows. */
export function parseCsv(text: string): string[][] {
  const clean = text.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let index = 0; index < clean.length; index += 1) {
    const char = clean[index];
    if (inQuotes) {
      if (char === '"') {
        if (clean[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (char !== '\r') {
      cell += char;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((entry) => entry.some((value) => value.trim() !== ''));
}

/** Turns a header row into lowercase snake_case keys and zips each row. */
export function csvToObjects(text: string): Record<string, string>[] {
  const [headerRow, ...dataRows] = parseCsv(text);
  if (!headerRow) return [];
  const headers = headerRow.map((header) =>
    header
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '_')
  );
  return dataRows.map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = (row[index] ?? '').trim();
    });
    return record;
  });
}
