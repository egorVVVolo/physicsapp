// Every number in "Viscous drag" is recomputed from the model, and every wrong option is a named mistake.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { viscousDrag as L, ANSWERS as X, BALLS, CASTOR, GLASS, LAB, TEMP, WARM } from './viscous-drag.ts';
import { lessons } from './lessons.ts';
import { course } from './course.ts';
import type { OptionQuestion } from './types.ts';

const all = [...L.story, ...L.skillCheck];
const q = (id: string) => all.find((s) => s.id === id) as OptionQuestion;
const label = (id: string, opt: string) => q(id).options.find((o) => o.id === opt)!.label;
const right = (id: string) => q(id).options.find((o) => o.correct)!.id;
const NB = ' ';
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);
const g = 9.81;
const cms = (s: string) => `${s}${NB}cm${NB}s⁻¹`;
const pas = (s: string) => `${s}${NB}Pa${NB}s`;
const vol = (r: number) => (4 / 3) * Math.PI * r ** 3;

test('glycerol at 20 °C, the small ball: W, U and the drag at its steady speed', () => {
  near(X.balance.W, 7800 * vol(1e-3) * g, 1e-15);
  near(X.balance.U, 1260 * vol(1e-3) * g, 1e-15);
  near(X.balance.F, X.balance.W - X.balance.U, 1e-15);
  assert.equal(right('balance'), 'right');
  assert.ok(q('balance').why.includes(`2.69${NB}×${NB}10⁻⁴${NB}N`));
  assert.equal(TEMP, 20);
});

test('the hook: the small ball sinks at 1.01 cm s⁻¹', () => {
  near(X.puzzle.same, (2 * 1e-6 * (7800 - 1260) * g) / (9 * 1.41), 1e-12);
  const hook = L.story.find((s) => s.id === 'hook')!;
  assert.ok(hook.kind === 'predict' && hook.prompt.includes(cms('1.01')) && hook.options.some((o) => o.id === 'four'));
});

test('the flow: glycerol is laminar, water is not', () => {
  assert.equal(right('flowTap'), 'glycerol');
  assert.ok(q('flowTap').why.includes(`62${NB}cm${NB}s⁻¹`));
});

test('the lab: 9.89 s over 10.0 cm gives η = 1.41 Pa s', () => {
  near(LAB.gap / X.puzzle.same, LAB.time, 0.005); // the time the model gives, to 3 s.f.
  assert.equal(label('lab', 'right'), pas('1.41'));
  assert.equal(label('lab', 'diameter'), pas('0.705'));
  assert.equal(label('lab', 'noUpthrust'), pas('1.68'));
  assert.equal(label('lab', 'cm'), pas('0.0141'));
});

test('twice as wide: 8 times as heavy', () => {
  near(X.heavier.ratio, 8, 1e-12);
  assert.equal(right('heavier'), 'right');
  assert.equal(label('heavier', 'right'), '8 times as heavy');
});

test('the puzzle: the big ball sinks at 4.04 cm s⁻¹, four times as fast', () => {
  near(X.puzzle.right / X.puzzle.same, 4, 1e-12);
  assert.equal(right('hook-again'), 'right');
  assert.equal(label('hook-again', 'right'), cms('4.04'));
  assert.ok(label('hook-again', 'same').startsWith(cms('1.01')));
  assert.ok(label('hook-again', 'twice').startsWith(cms('2.02')));
  assert.ok(label('hook-again', 'eight').startsWith(cms('8.09')));
  assert.equal(BALLS.big, 2 * BALLS.small);
});

test('explore: warmer glycerol is runnier, the ball sinks faster', () => {
  const s = L.story.find((x) => x.id === 'warm')!;
  assert.ok(s.kind === 'explore' && s.slider.min === WARM.min && s.slider.max === WARM.max && s.slider.start === TEMP);
  near(X.warm.eta, 0.612, 1e-12);
  assert.ok(X.warm.v > X.puzzle.same);
  assert.ok(s.question.right.includes(cms('2.33')) && s.question.right.includes(pas('0.612')));
});

test('Skill check: glass 0.192 cm s⁻¹, the bubble U = W + F, turbulent, castor oil 0.987 Pa s', () => {
  near(X.glass.right, (2 * 1e-6 * (GLASS.rho - 1260) * g) / (9 * 1.41), 1e-12);
  assert.equal(label('glass', 'right'), cms('0.192'));
  assert.equal(label('glass', 'noUpthrust'), cms('0.324'));
  assert.equal(label('glass', 'same'), cms('1.01'));
  assert.equal(label('glass', 'upside'), cms('5.33'));
  assert.ok(X.bubble.v < 0); // it rises, so the drag points down
  assert.equal(right('bubble'), 'right');
  assert.equal(label('bubble', 'right'), 'U = W + F');
  assert.equal(right('turbulent'), 'right');
  near(X.castor.right, (2 * CASTOR.r ** 2 * (7800 - CASTOR.rho) * g) / (9 * CASTOR.v), 1e-12);
  assert.equal(label('castor', 'right'), pas('0.987'));
  assert.equal(label('castor', 'noUpthrust'), pas('1.13'));
  assert.equal(label('castor', 'diameter'), pas('3.95'));
  assert.equal(label('castor', 'cm'), pas('0.00987'));
});

test('the recap: 5 s after the drop, 4.04 cm s⁻¹', () => {
  assert.ok(L.recap.text.includes(cms('4.04')));
});

test('the lesson is on the map and playable', () => {
  assert.equal(lessons[L.id]?.id, L.id);
  const ref = course.levels.flatMap((l) => l.lessons).find((r) => r.id === L.id);
  assert.ok(ref?.ready);
  assert.deepEqual(ref?.spec, L.spec);
});
