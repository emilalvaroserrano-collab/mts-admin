/**
 * Code 128, set B. Courier guns (UPS, FedEx, generic USB scanners) read this.
 * The payload is the order number, for example MT-1042.
 *
 * Patterns are the ISO/IEC 15417 bar widths. Index 104 is Start B, 106 is Stop.
 */
const WIDTHS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112",
] as const;

const START_B = 104;

function modules(pattern: string) {
  const bars: boolean[] = [];
  for (let i = 0; i < pattern.length; i += 1) {
    const width = pattern.charCodeAt(i) - 48;
    const black = i % 2 === 0;
    for (let n = 0; n < width; n += 1) bars.push(black);
  }
  return bars;
}

/** Black modules of a Code 128B symbol, without the quiet zone. */
export function code128Bars(value: string): boolean[] {
  if (WIDTHS.length !== 107) throw new Error("Code 128 table is incomplete.");
  if (!value || value.length > 32) throw new Error("Order number is missing.");
  const codes: number[] = [];
  for (const char of value) {
    const code = char.charCodeAt(0) - 32;
    if (code < 0 || code > 94) throw new Error("Order number has a character Code 128 cannot encode.");
    codes.push(code);
  }
  let checksum = START_B;
  codes.forEach((code, index) => {
    checksum += code * (index + 1);
  });
  const symbols = [START_B, ...codes, checksum % 103, 106];
  return symbols.flatMap((symbol) => modules(WIDTHS[symbol] ?? ""));
}
