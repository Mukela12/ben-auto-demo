const FALLBACK_RATE = 27.85; // Updated fallback rate for safety
const API_URL = "https://open.er-api.com/v6/latest/USD";

/**
 * Fetches the current USD to ZMW exchange rate.
 * Uses Next.js ISR caching (revalidates every 24 hours).
 * Falls back to a hardcoded rate if the API is unreachable.
 */
export async function getUsdToZmwRate(): Promise<number> {
  try {
    const res = await fetch(API_URL, { next: { revalidate: 86400 } });
    if (!res.ok) return FALLBACK_RATE;
    const data = await res.json();
    return data.rates?.ZMW ?? FALLBACK_RATE;
  } catch {
    return FALLBACK_RATE;
  }
}

/**
 * Converts a USD amount (in cents) to ZMW display string.
 * @param usdCents - Amount in US cents
 * @param rate - Exchange rate (USD to ZMW)
 * @returns Formatted ZMW string like "ZMW 482,350"
 */
export function formatZmw(usdCents: number, rate: number): string {
  const usd = usdCents / 100;
  const zmw = usd * rate;
  return `ZMW ${zmw.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Formats USD from cents to a display string.
 * @param cents - Amount in cents
 * @returns Formatted string like "$289"
 */
export function formatUsd(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1000) {
    return `$${dollars.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  return `$${dollars.toFixed(0)}`;
}
