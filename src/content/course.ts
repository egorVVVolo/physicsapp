// The course map: Unit 1 split into small lessons, each tied to points of the WPH11 specification
// (Pearson Edexcel IAL Physics, Issue 3). Every one of the 32 points belongs to at least one lesson
// (checked by course.test.ts). Only lessons with `ready: true` can be started.
import type { Course } from './types.ts';

export const course: Course = {
  title: 'Mechanics and Materials',
  subtitle: 'Edexcel IAL · Unit 1 · WPH11',
  levels: [
    {
      id: 'motion',
      title: 'Motion',
      lessons: [
        { id: 'vectors-signs', title: 'Which way is positive?', spec: [4, 6], about: 'Choose a positive direction and keep every sign honest.', ready: true },
        { id: 'motion-graphs', title: 'Reading motion graphs', spec: [2, 3], about: 'Read velocity from a slope and displacement from an area.', ready: true },
        { id: 'suvat', title: 'Picking the equation', spec: [1], about: 'Match what you know and what you want to one equation.', ready: true },
        { id: 'up-stop-down', title: 'Up, stop, down', spec: [1, 11], about: 'A ball thrown up: what happens to v and a at the top.', ready: true },
        { id: 'resolving', title: 'Splitting a vector', spec: [5, 6], about: 'Turn one slanted vector into two that are easy to use.', ready: true },
        { id: 'projectiles', title: 'Two motions at once', spec: [7], about: 'Sideways and downwards motion run on the same clock.', ready: true },
      ],
    },
    {
      id: 'forces',
      title: 'Forces',
      lessons: [
        { id: 'free-body', title: 'Drawing the forces', spec: [8], about: 'Show every force on one body, and nothing else.', ready: true },
        { id: 'f-ma', title: 'Force and acceleration', spec: [9, 10], ready: true, about: 'How resultant force, mass and acceleration are tied together.' },
        { id: 'normal-reaction', title: 'The push from the floor', spec: [8, 9, 10, 12], ready: true, about: 'Why a scale reads more or less than your weight in a lift.' },
        { id: 'terminal-velocity', title: 'Falling through air', spec: [9], ready: true, about: 'Drag grows with speed until it balances the weight.' },
      ],
    },
    {
      id: 'momentum-moments',
      title: 'Momentum and moments',
      lessons: [
        { id: 'momentum', title: 'Momentum', spec: [13], ready: true, about: 'Mass times velocity, and why its direction matters.' },
        { id: 'collisions', title: 'Collisions', spec: [14], ready: true, about: 'Total momentum before equals total momentum after.' },
        { id: 'moments', title: 'Turning forces', spec: [15], ready: true, about: 'Force times perpendicular distance from the pivot.' },
        { id: 'balance', title: 'Keeping balance', spec: [16], ready: true, about: 'When clockwise and anticlockwise moments cancel.' },
      ],
    },
    {
      id: 'energy',
      title: 'Energy',
      lessons: [
        { id: 'work', title: 'Work done', spec: [17], ready: true, about: 'Force times distance moved in the direction of the force.' },
        { id: 'ke-gpe', title: 'Kinetic and potential energy', spec: [18, 19], ready: true, about: 'Energy of motion and energy of height, and how to compute them.' },
        { id: 'conservation', title: 'Where the energy goes', spec: [20], ready: true, about: 'Follow energy as it changes form, losses included.' },
        { id: 'power', title: 'Power and efficiency', spec: [21, 22], ready: true, about: 'How fast work is done, and how much of it is useful.' },
      ],
    },
    {
      id: 'fluids',
      title: 'Fluids',
      lessons: [
        { id: 'density-upthrust', title: 'Density and upthrust', spec: [23, 24], ready: true, about: 'Why things float: the weight of the fluid pushed aside.' },
        { id: 'viscosity', title: 'Viscous drag', spec: [25, 26], ready: true, about: "Stokes' law and the drag on a small sphere in a fluid." },
      ],
    },
    {
      id: 'materials',
      title: 'Materials',
      lessons: [
        { id: 'hooke', title: "Hooke's law", spec: [27], ready: true, about: 'Extension grows in step with force, up to a limit.' },
        { id: 'young', title: 'Stress, strain, Young modulus', spec: [28, 31], ready: false, about: 'Compare materials, not just one wire or spring.' },
        { id: 'material-graphs', title: 'Reading material graphs', spec: [29, 30], ready: false, about: 'Elastic, plastic and breaking points on a stress–strain graph.' },
        { id: 'strain-energy', title: 'Elastic strain energy', spec: [32], ready: false, about: 'The energy stored in a stretched material: area under the graph.' },
      ],
    },
  ],
};

/** The level a lesson belongs to ('motion', 'forces', …). */
export function levelIdOf(lessonId: string): string {
  return course.levels.find((lv) => lv.lessons.some((x) => x.id === lessonId))?.id ?? course.levels[0].id;
}
