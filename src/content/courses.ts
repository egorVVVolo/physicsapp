// The list of courses on the first screen of Learn. Only the course with `ready: true` can be opened; the others are
// shown as "Coming soon" (Edexcel International A Level units, in the order of the specification).
import { course } from './course.ts';

export type CourseArt = 'mechanics' | 'waves' | 'fields';

export type CourseEntry = {
  id: string;
  title: string;
  /** "Unit 1 · WPH11" */
  unit: string;
  ready: boolean;
  art: CourseArt;
};

/** The id of the one course that is built. */
export const MECHANICS_ID = 'mechanics-materials';

export const courses: CourseEntry[] = [
  { id: MECHANICS_ID, title: course.title, unit: 'Unit 1 · WPH11', ready: true, art: 'mechanics' },
  { id: 'waves-electricity', title: 'Waves and Electricity', unit: 'Unit 2 · WPH12', ready: false, art: 'waves' },
  { id: 'further-mechanics', title: 'Further Mechanics, Fields and Particles', unit: 'Unit 4 · WPH14', ready: false, art: 'fields' },
];
