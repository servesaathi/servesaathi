import { describe, expect, it } from '@jest/globals';
import { sessionKeyFromToken } from '../sessionKey';

const base64Url = (value: string) =>
  Buffer.from(value).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const jwt = (payload: object) => `${base64Url('{"alg":"HS256"}')}.${base64Url(JSON.stringify(payload))}.signature`;

describe('sessionKeyFromToken', () => {
  it('is null when signed out', () => {
    expect(sessionKeyFromToken(null)).toBeNull();
    expect(sessionKeyFromToken('')).toBeNull();
  });

  it('keys by the JWT sub claim', () => {
    expect(sessionKeyFromToken(jwt({ sub: 42, iat: 1 }))).toBe('user:42');
  });

  it('stays the same across a token refresh for the same user', () => {
    expect(sessionKeyFromToken(jwt({ sub: 42, iat: 1 }))).toBe(sessionKeyFromToken(jwt({ sub: 42, iat: 2 })));
  });

  it('differs between accounts', () => {
    expect(sessionKeyFromToken(jwt({ sub: 1 }))).not.toBe(sessionKeyFromToken(jwt({ sub: 2 })));
  });

  it('falls back to id / userId claims', () => {
    expect(sessionKeyFromToken(jwt({ id: 7 }))).toBe('user:7');
    expect(sessionKeyFromToken(jwt({ userId: 'abc' }))).toBe('user:abc');
  });

  it('hashes tokens it cannot decode, without exposing them', () => {
    const key = sessionKeyFromToken('opaque-token-value');
    expect(key).toMatch(/^token:[0-9a-z]+$/);
    expect(key).not.toContain('opaque');
    expect(sessionKeyFromToken('opaque-token-value')).toBe(key);
    expect(sessionKeyFromToken('another-token')).not.toBe(key);
  });
});
