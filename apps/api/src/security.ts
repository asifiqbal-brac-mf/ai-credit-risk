import { createHmac, timingSafeEqual } from 'node:crypto';

function decode(value: string): unknown { return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')); }
export function verifyProductionBearer(value: string): string {
  const parts = value.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT');
  const encodedHeader = parts[0] ?? '';
  const encodedPayload = parts[1] ?? '';
  const signature = parts[2] ?? '';
  const header = decode(encodedHeader) as { alg?: string; typ?: string };
  const payload = decode(encodedPayload) as { sub?: string; exp?: number; iss?: string; aud?: string };
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret || header.alg !== 'HS256' || header.typ !== 'JWT' || !payload.sub) throw new Error('Invalid JWT configuration');
  const expected = createHmac('sha256', secret).update(`${encodedHeader}.${encodedPayload}`).digest('base64url');
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new Error('Invalid JWT signature');
  if (payload.exp !== undefined && payload.exp <= Math.floor(Date.now() / 1000)) throw new Error('Expired JWT');
  if (process.env.AUTH_JWT_ISSUER && payload.iss !== process.env.AUTH_JWT_ISSUER) throw new Error('Invalid JWT issuer');
  if (process.env.AUTH_JWT_AUDIENCE && payload.aud !== process.env.AUTH_JWT_AUDIENCE) throw new Error('Invalid JWT audience');
  return payload.sub;
}
