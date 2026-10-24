export const wrap = (value, total) => ((value % total) + total) % total;

// Front-facing, vertically centered layers: 100%, 80%, 60% at rest.
// Fit the entire source image, including landscape photographs, inside each
// layer. The focused photo sets the supporting heights so it stays dominant.
export function createLayout(ratios, width, height, position, mobile = width < 760) {
  const total = ratios.length;
  if (!total) return [];
  const fits = ratios.map(ratio => {
    const maxWidth = width * (mobile ? .76 : ratio > 1 ? .54 : .34);
    const photoHeight = Math.min(height - 56, maxWidth / ratio);
    return { height: photoHeight, width: photoHeight * ratio };
  });
  const floor = Math.floor(position), fraction = position - floor;
  const mix = fraction * fraction * (3 - 2 * fraction);
  const before = fits[wrap(floor, total)], after = fits[wrap(floor + 1, total)];
  const focusHeight = before.height + (after.height - before.height) * mix;
  const focusWidth = before.width + (after.width - before.width) * mix;
  const spread = mobile ? 0 : Math.max(0, focusWidth - width * .34) * .38;
  const seam = Math.min(2.85, total / 2 - .15);
  return ratios.map((ratio, index) => {
    const distance = total === 1 ? 0 : wrap(index - position + total / 2, total) - total / 2;
    const depth = Math.abs(distance);
    const widthLimit = width * (mobile ? .76 : .34 + .20 * Math.max(0, 1 - depth));
    const baseHeight = Math.min(fits[index].height, focusHeight, widthLimit / ratio);
    const scale = 1 - .20 * Math.min(depth, 2.5);
    return {
      x: distance * (mobile ? width * .62 : Math.min(width * .22, focusHeight * .42)) + spread * Math.tanh(distance * 1.8) / Math.tanh(1.8),
      y: 0,
      width: baseHeight * ratio * scale,
      height: baseHeight * scale,
      opacity: Math.max(0, Math.min(1, (seam - depth) / Math.min(.4, seam / 2))),
      zIndex: Math.round(1000 - depth * 100),
    };
  });
}
