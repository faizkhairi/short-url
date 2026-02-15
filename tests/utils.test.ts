import { describe, it, expect } from 'vitest';
import { createShortCode, isValidUrl, isValidCode, formatNumber } from '@/lib/utils';

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
