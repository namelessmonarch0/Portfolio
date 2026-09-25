let scratch: HTMLCanvasElement | undefined;

/** Greedy word wrap. A word wider than `maxWidth` gets its own line rather than being split. */
export function wrapText(
  text: string,
  maxWidth: number,
  measure: (text: string) => number,
): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && measure(candidate) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Draws `source` over the whole canvas as square blocks `block` device pixels wide. */
export function drawPixelated(
  canvas: HTMLCanvasElement,
  source: CanvasImageSource,
  block: number,
) {
  const ctx = canvas.getContext("2d");
  scratch ??= document.createElement("canvas");
  const small = scratch.getContext("2d");
  if (!ctx || !small) return;
  const { width, height } = canvas;
  const w = Math.max(1, Math.ceil(width / block));
  const h = Math.max(1, Math.ceil(height / block));
  scratch.width = w;
  scratch.height = h;
  small.drawImage(source, 0, 0, w, h);
  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(scratch, 0, 0, w, h, 0, 0, w * block, h * block);
}

/** An image of `element` as it looks revealed: its <img>, its <svg> rasterized, or its text redrawn. */
export async function snapshot(
  element: Element,
  width: number,
  height: number,
): Promise<CanvasImageSource> {
  const img =
    element instanceof HTMLImageElement
      ? element
      : element.querySelector("img");
  if (img) {
    await img.decode();
    return img;
  }
  const svg =
    element instanceof SVGSVGElement ? element : element.querySelector("svg");
  if (svg) return rasterizeSvg(svg, width, height);
  return drawText(element, width, height);
}

async function rasterizeSvg(svg: SVGSVGElement, width: number, height: number) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  // currentColor has no parent to inherit from once serialized.
  clone.setAttribute("color", getComputedStyle(svg).color);
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    new XMLSerializer().serializeToString(clone),
  )}`;
  await image.decode();
  return image;
}

async function drawText(element: Element, width: number, height: number) {
  await document.fonts.ready;
  const style = getComputedStyle(element);
  const dpr = window.devicePixelRatio || 1;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.scale(dpr, dpr);
  ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  // Match the element's tracking, or the canvas text runs wider than the real text it swaps to.
  if (style.letterSpacing !== "normal") ctx.letterSpacing = style.letterSpacing;
  ctx.fillStyle = style.color;
  ctx.textBaseline = "top";
  const fontSize = parseFloat(style.fontSize);
  const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.2;
  const lines = wrapText(
    element.textContent ?? "",
    width,
    (text) => ctx.measureText(text).width,
  );
  lines.forEach((line, index) => {
    ctx.fillText(line, 0, index * lineHeight + (lineHeight - fontSize) / 2);
  });
  return canvas;
}
