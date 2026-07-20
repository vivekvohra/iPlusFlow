// utils/layout.ts
// Layout calculation utilities for the floating widget.

export type PositionSlot = 'top' | 'middle' | 'bottom';

/**
 * Returns the Y pixel coordinate for a given vertical snap slot.
 *
 * - "top"    → 120px from the top of the screen
 * - "middle" → vertical center of the viewport
 * - "bottom" → 80px from the bottom of the screen
 *
 * @param slot - The named vertical position slot.
 * @returns The Y coordinate in pixels.
 */
export function getSlotY(slot: PositionSlot): number {
  if (slot === 'top') return 120;
  if (slot === 'middle') return window.innerHeight / 2;
  return window.innerHeight - 80;
}
