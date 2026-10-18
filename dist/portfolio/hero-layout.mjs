export const wrap = (value, total) => ((value % total) + total) % total;

// Five native-ratio photographs travel through a shallow perspective arc.
// The sixth is invisible before crossing the circular seam. Perspective is
// local to each card so its projected edges never change the track spacing.
export function createLayout(ratios, width, height, position, mobile = width < 760) {
  const total = ratios.length;
  return ratios.map((ratio, index) => {
    const distance = total === 1 ? 0 : wrap(index - position + total / 2, total) - total / 2;
    const depth = Math.abs(distance);
    const seam = Math.min(2.85, total / 2 - .15);
    const baseHeight = Math.min(height - 68, width * (mobile ? .72 : ratio > 1 ? .46 : .34) / ratio);
    // A rounded depth curve has no sudden change of direction at the center.
    const recession = Math.sqrt(distance * distance + .16) - .4;
    const scale = 1 - .13 * Math.min(recession, 2.5);
    return {
      x: distance * width * (mobile ? .57 : .22),
      y: -14 + Math.min(recession, 2.5) * (mobile ? 15 : 22),
      z: -Math.min(recession, 2.5) * (mobile ? 58 : 78),
      rotateY: -Math.tanh(distance * 1.1) * (mobile ? 19 : 27),
      perspective: Math.max(900, width * 1.05),
      width: baseHeight * ratio * scale,
      height: baseHeight * scale,
      opacity: Math.max(0, Math.min(1, (seam - depth) / Math.min(.4, seam / 2))),
      zIndex: Math.round(1000 - depth * 100),
    };
  });
}
