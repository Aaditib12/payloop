import { Keypair, StrKey, hash } from '@stellar/stellar-sdk';

/**
 * Proof that a customer controls a Stellar wallet: they sign a short,
 * timestamped message with SEP-53 `signMessage` (supported by Freighter).
 */
const PREFIX = 'Stellar Signed Message:\n';
const MAX_AGE_SECONDS = 300;
const seen = new Map<string, number>();

export function challengeFor(wallet: string, now = Date.now()): string {
  return `Sign in to PayLoop merchant as ${wallet} at ${Math.floor(now / 1000)}`;
}

export function verifyWalletSignature(wallet: string, message: string, signatureBase64: string, now = Date.now()): string | null {
  if (!StrKey.isValidEd25519PublicKey(wallet)) return 'Use a Stellar G-address.';
  const match = message.match(/^Sign in to PayLoop merchant as (G[A-Z2-7]{55}) at (\d+)$/);
  if (!match || match[1] !== wallet) return 'The message does not match this wallet.';
  const age = now / 1000 - Number(match[2]);
  if (age < -30 || age > MAX_AGE_SECONDS) return 'The sign-in message expired. Request a new one.';
  const signature = Buffer.from(signatureBase64, 'base64');
  const digest = hash(Buffer.from(PREFIX + message, 'utf8'));
  if (signature.length !== 64 || !Keypair.fromPublicKey(wallet).verify(digest, signature)) return 'The signature is not valid for this wallet.';
  // Each signed message works once inside its validity window.
  const key = `${wallet}:${signatureBase64}`;
  if (seen.has(key)) return 'This signature was already used.';
  seen.set(key, now);
  for (const [entry, at] of seen) if (now - at > MAX_AGE_SECONDS * 1000) seen.delete(entry);
  return null;
}
