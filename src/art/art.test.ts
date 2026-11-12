import { test } from 'node:test';
import assert from 'node:assert/strict';
import { appIcon, appIconMono, mark, stamp } from './brand.ts';
import { illustration, illustrationNames } from './illustrations.ts';
import { hasLessonIcon, lessonIcon, lessonTile } from './lessonIcons.ts';
import { levelObject, object, objectNames, puck } from './objects.ts';
import { uiIcon, uiIconBodies, type UiIconName } from './uiIcons.ts';
import { course } from '../content/course.ts';
import { courseBlue, levelPalette, reward, soonGrey } from '../theme/tokens.ts';

/** Every tag that opens also closes, and nothing was left undefined by a missing colour or number. */
function wellFormed(xml: string, what: string) {
  assert.ok(xml.startsWith('<svg ') && xml.endsWith('</svg>'), `${what}: is one svg document`);
  assert.ok(!/undefined|NaN|\[object/.test(xml), `${what}: has no undefined, NaN or object in it`);
  const stack: string[] = [];
  for (const m of xml.matchAll(/<(\/?)([a-zA-Z]+)([^>]*?)(\/?)>/g)) {
    if (m[4]) continue;
    if (m[1]) assert.equal(stack.pop(), m[2], `${what}: </${m[2]}> closes the tag that is open`);
    else stack.push(m[2]);
  }
  assert.deepEqual(stack, [], `${what}: every tag is closed`);
}

test('every lesson of the course has its own icon', () => {
  for (const lv of course.levels)
    for (const x of lv.lessons) {
      assert.ok(hasLessonIcon(x.id), `${x.id} has an icon in src/art/lessonIcons.ts`);
      wellFormed(lessonIcon(x.id, lv.id), `icon ${x.id}`);
      wellFormed(lessonTile(x.id, lv.id, levelPalette[lv.id]), `tile ${x.id}`);
    }
});

test('every level has a colour and an object', () => {
  for (const lv of course.levels) {
    assert.ok(levelPalette[lv.id], `${lv.id} has a colour in levelPalette`);
    assert.ok(levelObject[lv.id], `${lv.id} has an object`);
    wellFormed(object(levelObject[lv.id], levelPalette[lv.id], reward), `object of ${lv.id}`);
    for (const s of ['done', 'current', 'open'] as const) wellFormed(puck(levelPalette[lv.id], s), `puck ${lv.id} ${s}`);
  }
});

test('all art is well-formed SVG', () => {
  for (const n of objectNames) wellFormed(object(n, courseBlue, reward), `object ${n}`);
  for (const n of illustrationNames) wellFormed(illustration(n, courseBlue, reward), `illustration ${n}`);
  for (const n of Object.keys(uiIconBodies) as UiIconName[]) wellFormed(uiIcon(n), `ui icon ${n}`);
  for (const s of ['independent', 'assisted', 'revealed', 'level'] as const) wellFormed(stamp(s, courseBlue, reward, soonGrey), `stamp ${s}`);
  for (const v of ['ink', 'blue', 'white'] as const) wellFormed(appIcon(courseBlue, v), `app icon ${v}`);
  wellFormed(appIconMono(), 'one-colour icon');
  wellFormed(mark(courseBlue), 'mark');
});

test('flat style: no gradients, filters or blur anywhere', () => {
  const all = [...objectNames.map((n) => object(n, courseBlue, reward)), ...illustrationNames.map((n) => illustration(n, courseBlue, reward))].join('');
  assert.ok(!/Gradient|<filter|blur/i.test(all));
});
