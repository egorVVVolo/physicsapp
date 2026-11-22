import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitFormula } from './formula.ts';

test('a formula before a colon, comma or full stop gets its own line', () => {
  assert.deepEqual(splitFormula('ΔW = FΔs: force × distance moved in the direction of the force. 1 J = 1 N m.'), {
    formula: 'ΔW = FΔs',
    rest: 'Force × distance moved in the direction of the force. 1 J = 1 N m.',
  });
  assert.deepEqual(splitFormula('p = mv, mass × velocity, in kg m s⁻¹.'), { formula: 'p = mv', rest: 'Mass × velocity, in kg m s⁻¹.' });
  assert.deepEqual(splitFormula('ΔEp = mgΔh. The 40 kg washing machine gained 471 J.'), { formula: 'ΔEp = mgΔh', rest: 'The 40 kg washing machine gained 471 J.' });
  assert.deepEqual(splitFormula('E = ½FΔx = ½kΔx². Twice the extension, 4 times the energy.').formula, 'E = ½FΔx = ½kΔx²');
});

test('a decimal point does not end the formula', () => {
  assert.deepEqual(splitFormula('g = 9.81 N kg⁻¹, on Earth.'), { formula: 'g = 9.81 N kg⁻¹', rest: 'On Earth.' });
});

test('no "=" before the first stop, or too long: no formula', () => {
  for (const text of [
    'Moving under gravity alone: a = g downward the whole time.',
    's–t: gradient = velocity. v–t: gradient = acceleration.',
    'Up is positive. If the lift accelerates downward, a is negative.',
    'For a force at right angles to the lever: moment = force × distance from the pivot.',
    'The one force that would have the same effect as all the forces on the body together.',
    'Total kinetic energy before = total kinetic energy after, in an elastic collision.',
  ]) {
    assert.deepEqual(splitFormula(text), { formula: null, rest: text }, text);
  }
});
