import { describe, it, expect } from 'vitest';
import { createShortCode, isValidUrl, isValidCode, formatNumber, isSafeDestination } from '@/lib/utils';

describe('createShortCode', () => {
  it('generates a 7-character code', () => {
    const code = createShortCode();
    expect(code).toHaveLength(7);
  });

  it('generates unique codes', () => {
    const codes = new Set(Array.from({ length: 100 }, () => createShortCode()));
    expect(codes.size).toBe(100);
  });

  it('contains only alphanumeric characters', () => {
    const code = createShortCode();
    expect(code).toMatch(/^[a-zA-Z0-9]+$/);
  });
});

describe('isValidUrl', () => {
  it('accepts valid http URLs', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('https://example.com/path?query=1')).toBe(true);
  });

  it('rejects invalid URLs', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('ftp://files.com')).toBe(false);
  });
});

describe('isValidCode', () => {
  it('accepts valid codes', () => {
    expect(isValidCode('abc')).toBe(true);
    expect(isValidCode('my-link')).toBe(true);
    expect(isValidCode('ABC_123')).toBe(true);
  });

  it('rejects codes shorter than 3 chars', () => {
    expect(isValidCode('ab')).toBe(false);
  });

  it('rejects codes longer than 20 chars', () => {
    expect(isValidCode('a'.repeat(21))).toBe(false);
  });

  it('rejects codes with special characters', () => {
    expect(isValidCode('hello world')).toBe(false);
    expect(isValidCode('a@b')).toBe(false);
  });
});

describe('isSafeDestination', () => {
  it('accepts ordinary public http/https URLs', () => {
    expect(isSafeDestination('http://example.com')).toBe(true);
    expect(isSafeDestination('https://example.com/path?query=1')).toBe(true);
  });

  it('rejects non-http(s) protocols', () => {
    expect(isSafeDestination('ftp://files.com')).toBe(false);
    expect(isSafeDestination('javascript:alert(1)')).toBe(false);
    expect(isSafeDestination('file:///etc/passwd')).toBe(false);
  });

  it('rejects malformed URLs', () => {
    expect(isSafeDestination('not-a-url')).toBe(false);
    expect(isSafeDestination('')).toBe(false);
  });

  it('rejects URLs carrying credentials', () => {
    expect(isSafeDestination('http://user:pass@example.com')).toBe(false);
  });

  it('rejects localhost and its subdomains', () => {
    expect(isSafeDestination('http://localhost')).toBe(false);
    expect(isSafeDestination('http://localhost:3000')).toBe(false);
    expect(isSafeDestination('http://foo.localhost')).toBe(false);
  });

  it('rejects .internal and .local hostnames', () => {
    expect(isSafeDestination('http://service.internal')).toBe(false);
    expect(isSafeDestination('http://printer.local')).toBe(false);
  });

  it('rejects loopback and cloud metadata IPv4 literals, including alternate encodings', () => {
    expect(isSafeDestination('http://127.0.0.1')).toBe(false);
    expect(isSafeDestination('http://127.1')).toBe(false); // shorthand loopback
    expect(isSafeDestination('http://2130706433')).toBe(false); // decimal-integer 127.0.0.1
    expect(isSafeDestination('http://0x7f000001')).toBe(false); // hex 127.0.0.1
    expect(isSafeDestination('http://017700000001')).toBe(false); // octal 127.0.0.1
    expect(isSafeDestination('http://169.254.169.254/latest/meta-data')).toBe(false); // cloud metadata
  });

  it('rejects private IPv4 ranges', () => {
    expect(isSafeDestination('http://10.0.0.5')).toBe(false);
    expect(isSafeDestination('http://172.16.0.1')).toBe(false);
    expect(isSafeDestination('http://172.31.255.255')).toBe(false);
    expect(isSafeDestination('http://192.168.1.1')).toBe(false);
    expect(isSafeDestination('http://100.64.0.1')).toBe(false); // CGNAT
    expect(isSafeDestination('http://0.0.0.0')).toBe(false);
  });

  it('accepts public IPv4 addresses that look similar to private ones', () => {
    expect(isSafeDestination('http://172.32.0.1')).toBe(true); // just outside 172.16/12
    expect(isSafeDestination('http://11.0.0.1')).toBe(true);
    expect(isSafeDestination('http://8.8.8.8')).toBe(true);
  });

  it('rejects IPv6 loopback, unique-local, and link-local literals', () => {
    expect(isSafeDestination('http://[::1]')).toBe(false);
    expect(isSafeDestination('http://[fc00::1]')).toBe(false);
    expect(isSafeDestination('http://[fd00::1]')).toBe(false);
    expect(isSafeDestination('http://[fe80::1]')).toBe(false);
  });

  it('rejects IPv4-mapped IPv6 loopback', () => {
    expect(isSafeDestination('http://[::ffff:127.0.0.1]')).toBe(false);
  });

  it('accepts public IPv6 literals', () => {
    expect(isSafeDestination('http://[2001:4860:4860::8888]')).toBe(true); // public DNS
  });
});

describe('formatNumber', () => {
  it('formats small numbers', () => {
    expect(formatNumber(42)).toBe('42');
    expect(formatNumber(999)).toBe('999');
  });

  it('formats thousands', () => {
    expect(formatNumber(1500)).toBe('1.5K');
  });

  it('formats millions', () => {
    expect(formatNumber(2000000)).toBe('2.0M');
  });
});
