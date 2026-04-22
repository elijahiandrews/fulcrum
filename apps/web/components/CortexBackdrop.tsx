import { SystemGeometry } from "./SystemGeometry";

/**
 * Morphing wireframe layer for light “classified terminal” — ink + teal on white.
 * Original SVG; not film assets.
 */
export function CortexBackdrop() {
  return (
    <div className="cortex-backdrop" aria-hidden>
      <div className="cortex-grid-floor" />
      <div className="cortex-scanlines" />
      <SystemGeometry variant="backdrop" idPrefix="cortex-bd" />
    </div>
  );
}
