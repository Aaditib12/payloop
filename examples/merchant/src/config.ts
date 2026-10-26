function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}. Copy .env.example to .env and fill it in.`);
  return value;
}

function network(value: string): 'testnet' | 'mainnet' {
  if (value !== 'testnet' && value !== 'mainnet') throw new Error('PAYLOOP_NETWORK must be testnet or mainnet.');
  return value;
}

export const config = {
  port: Number(process.env.PORT || 8788),
  apiUrl: (process.env.PAYLOOP_API_URL || 'https://backend-ide-production-003a.up.railway.app/api').replace(/\/$/, ''),
  network: network(process.env.PAYLOOP_NETWORK?.trim() || 'testnet'),
  merchant: required('MERCHANT_ADDRESS'),
  planAmountUsdc: required('PLAN_AMOUNT_USDC'),
  planIntervalSeconds: Number(required('PLAN_INTERVAL_SECONDS')),
  subscribeUrl: process.env.SUBSCRIBE_URL || `https://payloop.websoroban.in/?network=${process.env.PAYLOOP_NETWORK?.trim() || 'testnet'}`,
};
