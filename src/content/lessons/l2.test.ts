import { describe, expect, it } from 'vitest';
import { goalMet } from '../../engine/grade';
import { Cell, isGraded } from '../../engine/types';
import { evaluate } from '../../lib/expression';
import { displacementAt, duration, reachable } from '../../physics/motion';
import { lesson2 } from './l2';

const goals = lesson2.steps.filter((s) => s.kind === 'goal');
const numerics = lesson2.steps.filter((s) => s.kind === 'numeric');

describe('lesson 2 content', () => {
  it('has unique step ids and ends with the complete screen', () => {
    const ids = lesson2.steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(lesson2.steps[lesson2.steps.length - 1].kind).toBe('complete');
  });

  it('the free-play step lets the learner move dots and has a note to show', () => {
    const p = lesson2.steps.find((s) => s.kind === 'play');
    if (p?.kind !== 'play') throw new Error('no play step');
    expect(p.lab.editable?.length).toBeGreaterThan(0);
    expect(p.note.length).toBeGreaterThan(10);
  });

  it('every graded step has two hints and an explanation', () => {
    for (const s of lesson2.steps.filter(isGraded)) {
      expect(s.hints).toHaveLength(2);
      expect(s.explanation.length).toBeGreaterThan(10);
    }
  });

  it('the hook answer is the area under the graph', () => {
    const p = lesson2.steps.find((s) => s.kind === 'predict');
    if (p?.kind !== 'predict') throw new Error('no predict step');
    expect(p.answer).toBe(displacementAt(p.lab.graph, duration(p.lab.graph)));
    expect(p.answer).toBe(72);
  });

  it('every goal is met by its own solution and can be reached by the learner', () => {
    for (const s of goals) {
      if (s.kind !== 'goal') continue;
      const g = s.lab.graph;
      expect(goalMet(s.goal, { t: g.t, v: s.solution })).toBe(true);
      // The solution only changes dots the learner may move.
      s.solution.forEach((v, i) => {
        if (!s.lab.editable?.includes(i)) expect(v).toBe(g.v[i]);
      });
      // And the goal is not already met at the start.
      expect(goalMet(s.goal, g)).toBe(false);
      const [lo, hi] = s.lab.vRange ?? [-12, 16];
      expect(reachable(g, s.lab.editable ?? [], lo, hi, (x) => goalMet(s.goal, x))).toBe(true);
    }
  });

  it('every numeric step offers its answer once, with the unit in the unit list', () => {
    for (const s of numerics) {
      if (s.kind !== 'numeric') continue;
      expect(s.options.filter((o) => o.value === s.answer)).toHaveLength(1);
      // The right answer is not always the first one on offer.
      expect(s.options[0].value).not.toBe(s.answer);
      expect(new Set(s.options.map((o) => o.value)).size).toBe(s.options.length);
      expect(s.units).toContain(s.unit);
      for (const o of s.options) if (o.value !== s.answer) expect(o.why).toBeTruthy();
    }
  });

  it('the build solution gives the answer using only the tiles on offer', () => {
    const b = lesson2.steps.find((s) => s.kind === 'build');
    if (b?.kind !== 'build') throw new Error('no build step');
    let k = 0;
    const tokens = b.template.flatMap((c: Cell) => (c.kind === 'break' ? [] : c.kind === 'slot' || c.kind === 'opSlot' ? [b.solution[k++]] : [c.sym]));
    expect(k).toBe(b.solution.length);
    expect(evaluate(tokens)).toBe(b.answer);
    for (const n of b.solution) expect(b.tiles).toContain(Number(n));
  });

  it('the picture to match comes from the right graph and the wrong ones differ', () => {
    const p = lesson2.steps.find((s) => s.kind === 'pick');
    if (p?.kind !== 'pick') throw new Error('no pick step');
    expect(p.options[p.correct]).toEqual(p.shown);
    p.options.forEach((_, i) => {
      if (i !== p.correct) expect(p.why[i].length).toBeGreaterThan(10);
    });
    const sig = (g: typeof p.shown) => [2, 4, 6, 8].map((t) => displacementAt(g, t)).join(',');
    expect(new Set(p.options.map(sig)).size).toBe(p.options.length);
  });
});
