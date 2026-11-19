// A number and its unit are joined by a no-break space on every screen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { keepUnits, keepUnitsIn } from './units.ts';
import { lessons } from './lessons.ts';

const NB = ' ';

test('a number and its unit are joined, compound units too', () => {
  assert.equal(keepUnits('0.60 m left'), `0.60${NB}m left`);
  assert.equal(keepUnits('8.0 N m clockwise'), `8.0${NB}N${NB}m clockwise`);
  assert.equal(keepUnits('at 1.5 m s⁻¹ and 9.81 m s⁻²'), `at 1.5${NB}m${NB}s⁻¹ and 9.81${NB}m${NB}s⁻²`);
  assert.equal(keepUnits('6.00 kg m s⁻¹'), `6.00${NB}kg${NB}m${NB}s⁻¹`);
  assert.equal(keepUnits('a 600 N painter'), `a 600${NB}N painter`);
});

test('words that only start like a unit are left alone', () => {
  assert.equal(keepUnits('3 more steps in 2 seconds'), '3 more steps in 2 seconds');
  assert.equal(keepUnits('Mia and Leo'), 'Mia and Leo');
});

test('lesson data is copied with every string fixed, ids untouched', () => {
  const data = { id: 'x', body: ['A 4.0 m plank'], options: [{ id: 'right', label: '250 N' }], n: 3 };
  assert.deepEqual(keepUnitsIn(data), { id: 'x', body: [`A 4.0${NB}m plank`], options: [{ id: 'right', label: `250${NB}N` }], n: 3 });
});

test('no screen of any lesson leaves a number apart from its unit', () => {
  const text = JSON.stringify(Object.values(lessons));
  assert.equal(text.match(/\d (kg|N|m|s|cm)\b(?![A-Za-z])/g), null);
});
