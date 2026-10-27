/** Strip spaces and symbols from a scanned air waybill. */
export function normalizeAwb(raw: string) {
  return raw.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 34);
}

/** UPS 1Z numbers are 18 characters. The last digit is a mod-10 check. */
export function isUpsAwb(awb: string) {
  return /^1Z[0-9A-Z]{16}$/.test(awb);
}

function upsValue(char: string) {
  const code = char.charCodeAt(0);
  if (code >= 48 && code <= 57) return code - 48;
  return (code - 63) % 10;
}

export function upsCheckDigitOk(awb: string) {
  if (!isUpsAwb(awb)) return false;
  const body = awb.slice(2, 17);
  let sum = 0;
  for (let index = 0; index < body.length; index += 1) {
    const value = upsValue(body[index] ?? "0");
    sum += index % 2 === 0 ? value : value * 2;
  }
  const check = (10 - (sum % 10)) % 10;
  return String(check) === awb[17];
}

export function upsTrackUrl(awb: string) {
  return `https://www.ups.com/track?tracknum=${encodeURIComponent(awb)}`;
}
