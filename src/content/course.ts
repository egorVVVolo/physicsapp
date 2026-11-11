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
        { id: 'vectors-signs', title: 'Which way is positive?', spec: [4] },
        { id: 'motion-graphs', title: 'Reading motion graphs', spec: [2, 3] },
        { id: 'suvat', title: 'Picking the equation', spec: [1] },
        { id: 'up-stop-down', title: 'Up, stop, down', spec: [1, 11] },
        { id: 'resolving', title: 'Splitting a vector', spec: [5, 6] },
        { id: 'projectiles', title: 'Two motions at once', spec: [7] },
      ].map((l) => ({ ...l, ready: false })),
    },
    {
      id: 'forces',
      title: 'Forces',
      lessons: [
        { id: 'free-body', title: 'Drawing the forces', spec: [8], ready: false },
        { id: 'f-ma', title: 'Force and acceleration', spec: [9, 10], ready: false },
        { id: 'normal-reaction', title: 'The push from the floor', spec: [8, 9, 10, 12], ready: true },
        { id: 'terminal-velocity', title: 'Falling through air', spec: [9], ready: false },
      ],
    },
    {
      id: 'momentum-moments',
      title: 'Momentum and moments',
      lessons: [
        { id: 'momentum', title: 'Momentum', spec: [13], ready: false },
        { id: 'collisions', title: 'Collisions', spec: [14], ready: false },
        { id: 'moments', title: 'Turning forces', spec: [15], ready: false },
        { id: 'balance', title: 'Keeping balance', spec: [16], ready: false },
      ],
    },
    {
      id: 'energy',
      title: 'Energy',
      lessons: [
        { id: 'work', title: 'Work done', spec: [17], ready: false },
        { id: 'ke-gpe', title: 'Kinetic and potential energy', spec: [18, 19], ready: false },
        { id: 'conservation', title: 'Where the energy goes', spec: [20], ready: false },
        { id: 'power', title: 'Power and efficiency', spec: [21, 22], ready: false },
      ],
    },
    {
      id: 'fluids',
      title: 'Fluids',
      lessons: [
        { id: 'density-upthrust', title: 'Density and upthrust', spec: [23, 24], ready: false },
        { id: 'viscosity', title: 'Viscous drag', spec: [25, 26], ready: false },
      ],
    },
    {
      id: 'materials',
      title: 'Materials',
      lessons: [
        { id: 'hooke', title: "Hooke's law", spec: [27], ready: false },
        { id: 'young', title: 'Stress, strain, Young modulus', spec: [28, 31], ready: false },
        { id: 'material-graphs', title: 'Reading material graphs', spec: [29, 30], ready: false },
        { id: 'strain-energy', title: 'Elastic strain energy', spec: [32], ready: false },
      ],
    },
  ],
};
