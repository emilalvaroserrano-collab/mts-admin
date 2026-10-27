import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { normalizeAwb } from "@/lib/portal/awb";

type BarcodeHit = { rawValue?: string };
type BarcodeDetectorLike = { detect: (source: CanvasImageSource) => Promise<BarcodeHit[]> };

function detector() {
  const Ctor = (window as unknown as { BarcodeDetector?: new (options?: { formats?: string[] }) => BarcodeDetectorLike })
    .BarcodeDetector;
  if (!Ctor) return null;
  return new Ctor({
    formats: ["code_128", "code_39", "qr_code", "ean_13", "ean_8", "upc_a", "itf", "codabar", "pdf417", "data_matrix"],
  });
}

export function AwbScanner({ onScan }: { onScan: (awb: string) => void }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    if (!open) return;
    let stopped = false;
    let stream: MediaStream | null = null;
    let timer = 0;
    const finish = (value: string) => {
      const awb = normalizeAwb(value);
      if (awb.length < 8) return;
      stopped = true;
      onScanRef.current(awb);
      setOpen(false);
    };
    void (async () => {
      const reader = detector();
      if (!reader || !navigator.mediaDevices?.getUserMedia) {
        setMessage("This browser has no barcode scanner. Type the UPS 1Z number, or use Chrome.");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" } },
        });
      } catch {
        setMessage("Allow the camera to scan the UPS label.");
        return;
      }
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      const tick = async () => {
        if (stopped || !video.videoWidth) {
          timer = window.setTimeout(tick, 200);
          return;
        }
        try {
          const hits = await reader.detect(video);
          const value = hits.find((hit) => hit.rawValue)?.rawValue;
          if (value) {
            finish(value);
            return;
          }
        } catch {
          /* the next frame may still decode */
        }
        timer = window.setTimeout(tick, 200);
      };
      void tick();
    })();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [open]);

  return (
    <div className="grid gap-2">
      <Button type="button" variant="secondary" onClick={() => { setMessage(""); setOpen(true); }}>
        Scan UPS AWB
      </Button>
      {open ? (
        <div className="overflow-hidden rounded-lg border border-line bg-ink">
          <video ref={videoRef} className="aspect-[4/3] w-full object-cover" muted playsInline />
          <div className="flex items-center justify-between gap-2 bg-surface px-3 py-2">
            <p className="text-xs text-muted">{message || "Point the camera at the 1Z barcode."}</p>
            <button type="button" className="text-xs font-medium text-ink" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      ) : message ? (
        <p className="text-xs text-muted">{message}</p>
      ) : null}
    </div>
  );
}
