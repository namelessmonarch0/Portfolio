import { bitmapPath, type Bitmap } from "@/lib/pixel-font";

/** Renders a 1-bit bitmap as one crisp SVG path in the current text color. */
export function PixelBitmap({
  rows,
  label,
  className,
}: {
  rows: Bitmap;
  label?: string;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${rows[0]?.length ?? 0} ${rows.length}`}
      fill="currentColor"
      shapeRendering="crispEdges"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={bitmapPath(rows)} />
    </svg>
  );
}
