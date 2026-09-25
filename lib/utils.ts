import { customAlphabet } from 'nanoid';

const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const generateCode = customAlphabet(alphabet, 7);

export function createShortCode(): string {
  return generateCode();
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

const IPV4_PATTERN = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

function isPrivateIPv4(ip: string): boolean {
  const octets = ip.split('.').map(Number);
  if (octets.length !== 4 || octets.some((o) => Number.isNaN(o) || o < 0 || o > 255)) {
    // Not a well-formed IPv4 literal; treat as unsafe rather than risk a false negative.
    return true;
  }
  const [a, b] = octets;
  if (a === 127) return true; // 127.0.0.0/8 loopback
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 169 && b === 254) return true; // 169.254.0.0/16 (incl. cloud metadata 169.254.169.254)
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 (CGNAT)
  return false;
}

// Parses an IPv6 literal (without brackets, may contain an "::" run and a
// trailing IPv4-mapped dotted form) into a 128-bit integer for range checks.
function parseIPv6(addr: string): bigint | null {
  let normalized = addr;

  const ipv4Tail = normalized.match(/^(.*:)?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (ipv4Tail) {
    const [, prefix = '', ipv4] = ipv4Tail;
    const octets = ipv4.split('.').map(Number);
    if (octets.some((o) => Number.isNaN(o) || o < 0 || o > 255)) return null;
    const hex = octets.map((o) => o.toString(16).padStart(2, '0')).join('');
    normalized = `${prefix}${hex.slice(0, 4)}:${hex.slice(4, 8)}`;
  }

  const parts = normalized.split('::');
  if (parts.length > 2) return null;

  const head = parts[0] ? parts[0].split(':') : [];
  const tail = parts.length === 2 && parts[1] ? parts[1].split(':') : [];

  let groups: string[];
  if (parts.length === 2) {
    const missing = 8 - head.length - tail.length;
    if (missing < 0) return null;
    groups = [...head, ...Array(missing).fill('0'), ...tail];
  } else {
    groups = head;
  }
  if (groups.length !== 8) return null;

  // BigInt(...) calls rather than `0n`-style literals: this project's
  // tsconfig targets ES2017, which does not support BigInt literal syntax.
  let value = BigInt(0);
  const sixteen = BigInt(16);
  for (const group of groups) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(group)) return null;
    value = (value << sixteen) | BigInt(parseInt(group, 16));
  }
  return value;
}

function isPrivateIPv6(value: bigint): boolean {
  if (value === BigInt(0)) return true; // :: (unspecified)
  if (value === BigInt(1)) return true; // ::1 (loopback)
  if (value >> BigInt(32) === BigInt(0xffff)) {
    // ::ffff:0:0/96 - IPv4-mapped address, recheck the embedded IPv4.
    const ipv4Bits = value & BigInt(0xffffffff);
    const octets = [24, 16, 8, 0].map((shift) =>
      Number((ipv4Bits >> BigInt(shift)) & BigInt(0xff))
    );
    return isPrivateIPv4(octets.join('.'));
  }
  if (value >> BigInt(121) === BigInt(0x7e)) return true; // fc00::/7 (unique local)
  if (value >> BigInt(118) === BigInt(0x3fa)) return true; // fe80::/10 (link-local)
  return false;
}

/**
 * Full SSRF-aware check for a destination URL: must be http(s), must not
 * embed credentials, and must not resolve (as a literal, pre-DNS) to
 * localhost/internal hostnames or a private/loopback/link-local/CGNAT IP
 * range. Used both when a short link is created and again right before
 * every redirect, so a destination that predates this check (or was
 * written some other way) is still caught instead of trusted forever.
 */
export function isSafeDestination(url: string): boolean {
  if (!isValidUrl(url)) return false;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (parsed.username || parsed.password) return false;

  const hostname = parsed.hostname.toLowerCase();

  if (hostname === 'localhost' || hostname.endsWith('.localhost')) return false;
  if (hostname === 'local' || hostname.endsWith('.local')) return false;
  if (hostname === 'internal' || hostname.endsWith('.internal')) return false;

  if (hostname.startsWith('[') && hostname.endsWith(']')) {
    const value = parseIPv6(hostname.slice(1, -1));
    if (value === null) return false;
    return !isPrivateIPv6(value);
  }

  if (IPV4_PATTERN.test(hostname)) {
    return !isPrivateIPv4(hostname);
  }

  return true;
}

export function isValidCode(code: string): boolean {
  return /^[a-zA-Z0-9_-]{3,20}$/.test(code);
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}
