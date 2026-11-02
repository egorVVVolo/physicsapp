import { describe, expect, it } from 'vitest';
import { cameraX, followX, isVisible, overviewX, pixelsPerMetre } from './camera';
import { easeArray } from './ease';

const box = { left: 36, width: 300 };

describe('camera', () => {
  it('follow mode keeps the car at 40% of the track whatever its position', () => {
    for (const s of [0, 12, 72, -30]) expect(followX(s, s, box)).toBeCloseTo(36 + 120);
  });

  it('follow mode moves the road under the car: 10 m ahead is a third of the window further right', () => {
    expect(followX(10, 0, box) - followX(0, 0, box)).toBeCloseTo(100);
  });

  it('overview shows the whole range edge to edge', () => {
    expect(overviewX(0, 0, 120, box)).toBe(36);
    expect(overviewX(120, 0, 120, box)).toBe(336);
  });

  it('the blend starts at the overview and ends in follow mode', () => {
    expect(cameraX(50, 20, 0, 0, 120, box)).toBeCloseTo(overviewX(50, 0, 120, box));
    expect(cameraX(50, 20, 1, 0, 120, box)).toBeCloseTo(followX(50, 20, box));
    const mid = cameraX(50, 20, 0.5, 0, 120, box);
    expect(mid).toBeGreaterThan(Math.min(overviewX(50, 0, 120, box), followX(50, 20, box)));
    expect(mid).toBeLessThan(Math.max(overviewX(50, 0, 120, box), followX(50, 20, box)));
  });

  it('wheels turn faster when following than in the overview', () => {
    expect(pixelsPerMetre(1, 0, 120, box)).toBeGreaterThan(pixelsPerMetre(0, 0, 120, box));
  });

  it('knows when something is off the screen', () => {
    expect(isVisible(150, 390)).toBe(true);
    expect(isVisible(-40, 390)).toBe(false);
    expect(isVisible(420, 390)).toBe(false);
  });
});

describe('easeArray', () => {
  it('goes from the old values to the new ones without overshooting', () => {
    const from = [0, 10, -4];
    const to = [8, 10, 6];
    expect(easeArray(from, to, 0)).toEqual(from);
    expect(easeArray(from, to, 1)).toEqual(to);
    let prev = from[0];
    for (let x = 0.1; x <= 1; x += 0.1) {
      const v = easeArray(from, to, x)[0];
      expect(v).toBeGreaterThanOrEqual(prev);
      expect(v).toBeLessThanOrEqual(8 + 1e-9);
      prev = v;
    }
  });
});
