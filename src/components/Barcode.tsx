import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeProps {
  value: string;
  height?: number;
  width?: number;
  displayValue?: boolean;
}

export function Barcode({ value, height = 90, width = 2.2, displayValue = true }: BarcodeProps) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || !value) return;
    try {
      JsBarcode(ref.current, value, {
        format: "CODE128",
        height,
        width,
        displayValue,
        margin: 10,
        background: "#ffffff",
        lineColor: "#0a1a3a",
        font: "monospace",
        fontSize: 14,
      });
    } catch (e) {
      console.error("Barcode render failed", e);
    }
  }, [value, height, width, displayValue]);

  return <svg ref={ref} className="w-full max-w-md" />;
}
