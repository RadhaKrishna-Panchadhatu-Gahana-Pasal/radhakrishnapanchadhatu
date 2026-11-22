import crypto from 'crypto';
import { describe, expect, test } from 'bun:test';
import {
  buildFonepayPaymentUrl,
  fonepaySignaturesMatch,
  formatFonepayAmount,
  formatFonepayDate,
  readFonepayReturnParams,
  signFonepayFields,
  verifyFonepayReturnSignature,
  type FonepayConfig,
} from '../lib/payments/fonepay';

const SECRET = 'test-shared-secret';

function expected(fields: Array<string | number>): string {
  return crypto
    .createHmac('sha512', SECRET)
    .update(fields.join(','), 'utf8')
    .digest('hex')
    .toUpperCase();
}

const config: FonepayConfig = {
  merchantCode: 'MERCHANT-1',
  secret: SECRET,
  baseUrl: 'https://dev-clientapi.fonepay.com',
  returnUrl: 'https://shop.example.com/api/payments/fonepay/callback',
  sandbox: true,
};

describe('Fonepay request signing', () => {
  test('signs PID,MD,PRN,AMT,CRN,DT,R1,R2,RU in order with HMAC-SHA512', () => {
    const fields = ['MERCHANT-1', 'P', 'REF-1', '4200.00', 'NPR', '11/22/2026', 'Order 1', 'N/A', config.returnUrl];
    const signature = signFonepayFields(SECRET, fields);
    expect(signature).toBe(expected(fields));
    expect(signature).toHaveLength(128);
    expect(signature).toBe(signature.toUpperCase());
  });

  test('field order matters', () => {
    const a = signFonepayFields(SECRET, ['a', 'b', 'c']);
    const b = signFonepayFields(SECRET, ['b', 'a', 'c']);
    expect(a).not.toBe(b);
  });

  test('a different secret produces a different signature', () => {
    const fields = ['a', 'b', 'c'];
    expect(signFonepayFields('secret-1', fields)).not.toBe(signFonepayFields('secret-2', fields));
  });

  test('builds an absolute sandbox URL with the signature attached', () => {
    const url = buildFonepayPaymentUrl(config, {
      reference: 'FONEPAY-AB12',
      amountPaisa: 420000,
      remark: 'Order RKP-2026-1002',
    });
    expect(url.startsWith('https://dev-clientapi.fonepay.com/api/merchantRequest?')).toBe(true);
    const params = new URL(url).searchParams;
    expect(params.get('PID')).toBe('MERCHANT-1');
    expect(params.get('AMT')).toBe('4200.00');
    expect(params.get('PRN')).toBe('FONEPAY-AB12');
    expect(params.get('CRN')).toBe('NPR');
    expect(params.get('DV')).toHaveLength(128);
  });

  test('formats amounts in paisa to two decimals and dates in Nepal time', () => {
    expect(formatFonepayAmount(420000)).toBe('4200.00');
    expect(formatFonepayAmount(1)).toBe('0.01');
    expect(formatFonepayAmount(-50)).toBe('0.00');
    // 2026-11-22T18:30Z is 00:15 on 2026-11-23 in Kathmandu (UTC+5:45)
    expect(formatFonepayDate(new Date('2026-11-22T18:30:00.000Z'))).toBe('11/23/2026');
  });
});

describe('Fonepay return verification', () => {
  test('signatures match only when identical, case-insensitively', () => {
    const signature = signFonepayFields(SECRET, ['a', 'b']);
    expect(fonepaySignaturesMatch(signature, signature.toLowerCase())).toBe(true);
    expect(fonepaySignaturesMatch(signature, signFonepayFields(SECRET, ['a', 'c']))).toBe(false);
    expect(fonepaySignaturesMatch('', signature)).toBe(false);
  });

  test('accepts a correctly signed return and rejects a tampered one', () => {
    const fields = ['REF-1', 'MERCHANT-1', '', 'successful', 'UID-9', 'BANK', '', '4200.00', ''];
    const params = new URLSearchParams({
      PRN: 'REF-1',
      PID: 'MERCHANT-1',
      PS: '',
      RC: 'successful',
      UID: 'UID-9',
      BC: 'BANK',
      INI: '',
      P_AMT: '4200.00',
      R_AMT: '',
      DV: signFonepayFields(SECRET, fields),
    });
    expect(verifyFonepayReturnSignature(config, params)).toBe(true);

    params.set('P_AMT', '1.00');
    expect(verifyFonepayReturnSignature(config, params)).toBe(false);
  });

  test('a return without DV is allowed (contract without return signature)', () => {
    expect(verifyFonepayReturnSignature(config, new URLSearchParams({ PRN: 'x' }))).toBe(true);
  });
});

describe('Fonepay return parameter parsing', () => {
  test('reads PRN/BID/UID and status from mixed-case keys', () => {
    const parsed = readFonepayReturnParams(
      new URLSearchParams({ prn: 'REF-1', bid: 'BANK1', uid: 'UID-2', ps: 'success' })
    );
    expect(parsed).toEqual({
      reference: 'REF-1',
      bankCode: 'BANK1',
      transactionId: 'UID-2',
      status: 'success',
      dvPresent: false,
    });
  });

  test('missing values become empty strings rather than undefined', () => {
    const parsed = readFonepayReturnParams(new URLSearchParams());
    expect(parsed.reference).toBe('');
    expect(parsed.bankCode).toBe('');
    expect(parsed.transactionId).toBe('');
  });
});
