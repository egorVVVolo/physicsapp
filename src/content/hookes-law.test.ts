// Every number in "Hooke's law" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hookesLaw as L, ANSWERS as X, COILS, LAUNCHER, PAIR, SPRING } from './hookes-law.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { Question } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as Question;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const NB = ' ';
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);
const nm = (s: string) => `${s}${NB}N${NB}m⁻¹`;
const cm = (s: string) => `${s}${NB}cm`;

test('the spring: 3.0 N stretches it 6.0 cm, k = 50 N m⁻¹', () => {
  near(X.k.right, SPRING.W / (SPRING.stretched - SPRING.L0));
  near(X.k.right, 50);
  assert.equal(right('stiffness'), 'right');
  assert.equal(label('stiffness', 'right'), nm('50.0'));
  assert.equal(label('stiffness', 'length'), nm('18.8'));
  assert.equal(label('stiffness', 'cm'), nm('0.500'));
  assert.equal(label('stiffness', 'upside'), nm('0.0200'));
});

test('the hook asks for the half’s extension; 3.0 cm is among the options', () => {
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.options.some((o) => o.label === '3.0 cm'));
});

test('explore: the gradient is the stiffness', () => {
  const s = L.story.find((x) => x.id === 'graph')!;
  assert.ok(s.kind === 'explore' && s.question.options.find((o) => o.correct)!.id === 'right');
  assert.ok(s.question.right.includes(nm('50.0')));
});

test('every part carries the whole load: the pull is 3.0 N, the bottom half stretches 3.0 cm', () => {
  assert.equal(right('pull'), 'right');
  assert.equal(label('pull', 'right'), `3.0${NB}N`);
  near(X.half.right, 0.03);
  assert.equal(label('half', 'right'), cm('3.0'));
  assert.equal(label('half', 'whole'), cm('6.0'));
  assert.equal(label('half', 'length'), cm('8.0'));
  assert.equal(label('half', 'quarter'), cm('1.5'));
});

test('the puzzle: one half stretches 3.0 cm and is twice as stiff, 100 N m⁻¹', () => {
  near(X.puzzle.x, 0.03);
  near(X.puzzle.k, 100);
  assert.equal(right('hook-again'), 'right');
  assert.equal(label('hook-again', 'right'), nm('100'));
  assert.ok(label('hook-again', 'same').startsWith(nm('50.0')));
  assert.equal(label('hook-again', 'halved'), nm('25.0'));
  assert.equal(label('hook-again', 'four'), nm('200'));
});

test('the lines: B is twice as steep as C', () => {
  const s = q('lines');
  assert.ok(s.kind === 'tapFig' && s.fig.kind === 'spring');
  const lines = s.fig.lines!;
  const c = lines.find((l) => l.id === 'C')!.k;
  near(lines.find((l) => l.id === 'B')!.k, 2 * c);
  near(c, X.k.right);
  assert.equal(right('lines'), 'B');
});

test('Skill check: side by side 1.5 cm, two readings 40.0 N m⁻¹, the launcher 12.0 N, fewer coils stiffer', () => {
  near(X.parallel.right, 0.015);
  assert.equal(label('parallel', 'right'), cm('1.5'));
  assert.equal(label('parallel', 'oneHalf'), cm('3.0'));
  near(X.pair.right, (PAIR.F2 - PAIR.F1) / (PAIR.L2 - PAIR.L1));
  assert.equal(label('pair', 'right'), nm('40.0'));
  assert.equal(label('pair', 'oneLoad'), nm('66.7'));
  assert.equal(label('pair', 'length'), nm('22.2'));
  assert.equal(label('pair', 'cm'), nm('0.400'));
  near(X.launcher.right, LAUNCHER.k * (LAUNCHER.L0 - LAUNCHER.L));
  assert.equal(label('launcher', 'right'), `12.0${NB}N`);
  assert.equal(label('launcher', 'newLength'), `20.0${NB}N`);
  assert.equal(label('launcher', 'oldLength'), `32.0${NB}N`);
  assert.equal(label('launcher', 'cm'), `1200${NB}N`);
  near(X.coils.ratio, COILS.P / COILS.Q);
  assert.equal(right('coils'), 'right');
});

test('the recap: 3.0 cm and 100 N m⁻¹', () => {
  assert.ok(L.recap.text.includes(cm('3.0')) && L.recap.text.includes(nm('100')));
});

test('the lesson is on the map and playable', () => {
  assert.equal(lessons[L.id]?.id, L.id);
  const ref = course.levels.flatMap((l) => l.lessons).find((r) => r.id === L.id);
  assert.ok(ref?.ready);
  assert.deepEqual(ref?.spec, L.spec);
});
