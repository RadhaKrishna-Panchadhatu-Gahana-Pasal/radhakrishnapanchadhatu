import { describe, expect, test } from 'bun:test';
import { csvToObjects, parseCsv, toCsv } from '../lib/store/csv';
import { checkRateLimit, getClientIp } from '../lib/security/rate-limit';

describe('CSV round trip', () => {
  test('quotes commas, quotes and newlines', () => {
    const csv = toCsv(['name', 'note'], [['Gold, ring', 'He said "hello"\nthen left']]);
    const rows = parseCsv(csv);
    expect(rows).toEqual([
      ['name', 'note'],
      ['Gold, ring', 'He said "hello"\nthen left'],
    ]);
  });

  test('tolerates a BOM, CRLF and trailing blank rows', () => {
    const rows = parseCsv('\uFEFFa,b\r\n1,2\r\n\r\n');
    expect(rows).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  test('maps headers to snake_case objects', () => {
    const records = csvToObjects('SKU,Product Name,Price-NPR\nRKP-1,Gold Ring,4200\n');
    expect(records).toEqual([{ sku: 'RKP-1', product_name: 'Gold Ring', price_npr: '4200' }]);
  });

  test('empty input is not an error', () => {
    expect(parseCsv('')).toEqual([]);
    expect(csvToObjects('')).toEqual([]);
  });
});

describe('rate limiting', () => {
  test('allows up to the limit then blocks with a retry hint', () => {
    const opts = { bucket: 'test-basic', limit: 3, windowMs: 60_000 };
    const now = 1_700_000_000_000;
    expect(checkRateLimit('ip-1', opts, now).allowed).toBe(true);
    expect(checkRateLimit('ip-1', opts, now + 1).allowed).toBe(true);
    const third = checkRateLimit('ip-1', opts, now + 2);
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);

    const blocked = checkRateLimit('ip-1', opts, now + 3);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  test('the window slides: old hits expire', () => {
    const opts = { bucket: 'test-window', limit: 1, windowMs: 1000 };
    expect(checkRateLimit('ip', opts, 1000).allowed).toBe(true);
    expect(checkRateLimit('ip', opts, 1500).allowed).toBe(false);
    expect(checkRateLimit('ip', opts, 2500).allowed).toBe(true);
  });

  test('buckets and identities are independent', () => {
    const a = { bucket: 'test-a', limit: 1, windowMs: 1000 };
    const b = { bucket: 'test-b', limit: 1, windowMs: 1000 };
    expect(checkRateLimit('one', a, 0).allowed).toBe(true);
    expect(checkRateLimit('two', a, 0).allowed).toBe(true);
    expect(checkRateLimit('one', b, 0).allowed).toBe(true);
    expect(checkRateLimit('one', a, 1).allowed).toBe(false);
  });

  test('reads the first forwarded IP', () => {
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' });
    expect(getClientIp(headers)).toBe('203.0.113.9');
    expect(getClientIp(new Headers())).toBe('unknown');
  });
});
