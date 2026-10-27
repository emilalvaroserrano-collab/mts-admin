import { code128Bars } from "@/lib/portal/barcode";

/** Quiet zone is 10 modules, which is what a courier scanner expects. */
export function OrderBarcode({ value, module = 2, height = 72 }: { value: string; module?: number; height?: number }) {
  const bars = code128Bars(value);
  const quiet = 10;
  const width = (bars.length + quiet * 2) * module;
  const rects: { x: number; w: number }[] = [];
  let index = 0;
  while (index < bars.length) {
    if (!bars[index]) {
      index += 1;
      continue;
    }
    let run = 1;
    while (bars[index + run]) run += 1;
    rects.push({ x: (quiet + index) * module, w: run * module });
    index += run;
  }
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      role="img"
      aria-label={`Air waybill barcode ${value}`}
      shapeRendering="crispEdges"
    >
      <rect width={width} height={height} fill="#ffffff" />
      {rects.map((bar) => (
        <rect key={`${bar.x}-${bar.w}`} x={bar.x} y="0" width={bar.w} height={height} fill="#111111" />
      ))}
    </svg>
  );
}
