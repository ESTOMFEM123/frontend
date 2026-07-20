import { useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

interface Props {
  onDetected: (value: string) => void;
  onError?: (err: string) => void;
}

export function BarcodeScanner({ onDetected, onError }: Props) {
  const containerId = "barcode-scanner-region";
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const handlerRef = useRef(onDetected);
  handlerRef.current = onDetected;

  useEffect(() => {
    const scanner = new Html5Qrcode(containerId, {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.QR_CODE,
      ],
      verbose: false,
    });
    scannerRef.current = scanner;

    let stopped = false;
    let lastValue = "";
    let lastAt = 0;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 280, height: 140 } },
        (decoded) => {
          const now = Date.now();
          if (decoded === lastValue && now - lastAt < 2500) return;
          lastValue = decoded;
          lastAt = now;
          handlerRef.current(decoded);
        },
        () => {},
      )
      .catch((err) => onError?.(String(err)));

    return () => {
      stopped = true;
      if (scanner.isScanning) {
        scanner.stop().then(() => scanner.clear()).catch(() => {});
      }
      void stopped;
    };
  }, [onError]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-black">
      <div id={containerId} className="w-full" />
    </div>
  );
}
