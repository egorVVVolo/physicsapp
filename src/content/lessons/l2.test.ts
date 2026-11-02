import { describe, expect, it } from 'vitest';
import { goalMet, gradeAnswer, rightMessage } from '../../engine/grade';
import { nextStepIndex } from '../../engine/progress';
import { Cell, isGraded } from '../../engine/types';
import { evaluate } from '../../lib/expression';
import { accelerationAt, displacementAt, duration, reachable } from '../../physics/motion';
import { exam, lesson2, trapGraph } from './l2';

const steps = lesson2.steps;
const kind = <K extends string>(k: K) => steps.filter((s) => s.kind === k);

describe('lesson 2 content', () => {
  it('has unique step ids and ends with the complete screen', () => {
    const ids = steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(steps[steps.length - 1].kind).toBe('complete');
  });

  it('every graded step has two hints and an explanation', () => {
    for (const s of steps.filter(isGraded)) {
      expect(s.hints).toHaveLength(2);
      expect(s.explanation.length).toBeGreaterThan(10);
    }
  });

  it('every choice has one right option, not first, and each wrong one names its mistake', () => {
    for (const s of kind('choice')) {
      if (s.kind !== 'choice') continue;
      expect(s.correct).not.toBe(0);
      s.options.forEach((o, i) => {
        if (i !== s.correct) expect(o.why?.length ?? 0).toBeGreaterThan(10);
      });
      expect(new Set(s.options.map((o) => o.label)).size).toBe(s.options.length);
    }
  });

  it('the turn-round trap is true: the velocity never changes sign', () => {
    const t = steps.find((s) => s.id === 'l2-trap-peak');
    if (t?.kind !== 'choice') throw new Error('no trap');
    expect(Math.min(...t.lab.graph.v)).toBeGreaterThanOrEqual(0);
    expect(t.options[t.correct].label).toBe('It never does');
  });

  it('every numeric step offers its answer once, not first, with every wrong value explained', () => {
    for (const s of kind('numeric')) {
      if (s.kind !== 'numeric') continue;
      expect(s.options.filter((o) => o.value === s.answer)).toHaveLength(1);
      expect(s.options[0].value).not.toBe(s.answer);
      expect(new Set(s.options.map((o) => o.value)).size).toBe(s.options.length);
      expect(s.units).toContain(s.unit);
      for (const o of s.options) if (o.value !== s.answer) expect(o.why).toBeTruthy();
    }
  });

  it('the trapezium and the exam numbers come from the model', () => {
    expect(displacementAt(trapGraph, 3)).toBe(21);
    expect(displacementAt(exam, duration(exam))).toBe(370);
    expect(accelerationAt(exam, 22)).toBe(-4);
  });

  it('the exam build solution gives the answer with the tiles on offer', () => {
    const b = steps.find((s) => s.id === 'l2-exam-a');
    if (b?.kind !== 'build') throw new Error('no build');
    let k = 0;
    const tokens = b.template.flatMap((c: Cell) => (c.kind === 'break' ? [] : c.kind === 'slot' || c.kind === 'opSlot' ? [b.solution[k++]] : [c.sym]));
    expect(k).toBe(b.solution.length);
    expect(evaluate(tokens)).toBe(b.answer);
    for (const n of b.solution) expect(b.tiles).toContain(Number(n));
  });

  it('exam steps show their mark scheme when right', () => {
    for (const id of ['l2-exam-a', 'l2-exam-b']) {
      const s = steps.find((x) => x.id === id);
      if (!s || !isGraded(s) || !s.marks) throw new Error('no marks');
      expect(s.marks.scheme.length).toBeGreaterThan(1);
      expect(rightMessage(s)).toContain(s.marks.scheme[0]);
    }
  });

  it('the draw-the-journey goal is met by its solution, not at the start, and is reachable', () => {
    const s = steps.find((x) => x.id === 'l2-sketch');
    if (s?.kind !== 'goal') throw new Error('no sketch');
    const g = s.lab.graph;
    expect(goalMet(s.goal, { t: g.t, v: s.solution })).toBe(true);
    expect(goalMet(s.goal, g)).toBe(false);
    const [lo, hi] = s.lab.vRange ?? [-12, 16];
    expect(reachable(g, s.lab.editable ?? [], lo, hi, (x) => goalMet(s.goal, x))).toBe(true);
    expect(gradeAnswer(s, { kind: 'goal', speeds: [0, 5, 8, 0] }).message).toContain('4');
  });

  it('the picture to match comes from the right graph', () => {
    const p = steps.find((s) => s.kind === 'pick');
    if (p?.kind !== 'pick') throw new Error('no pick step');
    expect(p.options[p.correct]).toEqual(p.shown);
  });
});

describe('quick check and refresher', () => {
  const done = { outcome: 'independent' as const, hintsUsed: 0, revealed: false, misses: 0 };
  const gates = steps.filter((s) => s.gate);
  const first = steps.findIndex((s) => s.refresher);

  it('there are gates, then refresher steps right after them', () => {
    expect(gates.length).toBeGreaterThan(0);
    expect(first).toBeGreaterThan(steps.indexOf(gates[gates.length - 1]));
  });

  it('passing every gate first time skips the refresher', () => {
    const records = Object.fromEntries(gates.map((g) => [g.id, done]));
    const lastGate = steps.indexOf(gates[gates.length - 1]);
    const n = nextStepIndex(steps, records, lastGate);
    expect(steps[n].refresher).toBeFalsy();
    expect(n).toBeGreaterThan(first);
  });

  it('a miss or a hint on a gate keeps the refresher', () => {
    const lastGate = steps.indexOf(gates[gates.length - 1]);
    const missed = Object.fromEntries(gates.map((g, i) => [g.id, i === 0 ? { ...done, misses: 1 } : done]));
    expect(nextStepIndex(steps, missed, lastGate)).toBe(first);
    const hinted = Object.fromEntries(gates.map((g, i) => [g.id, i === 0 ? { ...done, outcome: 'assisted' as const, hintsUsed: 1 } : done]));
    expect(nextStepIndex(steps, hinted, lastGate)).toBe(first);
  });
});
