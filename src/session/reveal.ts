// What a figure shows once its question is answered: the "?" gets its size, the flight plays. No React.
import type { Fig, PartLabel } from '../content/types.ts';

const shownAfter = (label: PartLabel | undefined): PartLabel | undefined => (label === 'afterCheck' ? 'shown' : label);

/** After the answer the figure shows what the question hid: the real N arrow, the number on the scales, the braking played. */
export function revealed(fig: Fig): Fig {
  if (fig.kind === 'throw') return { ...fig, unknownV: undefined, play: fig.play === 'afterCheck' ? true : fig.play };
  // the braking plays, and the marker on the road shows the speed it asked for
  if (fig.kind === 'road') return { ...fig, play: fig.play === 'afterCheck' ? true : fig.play, ask: fig.ask && { ...fig.ask, shown: true } };
  // every equation shows the quantity it leaves out
  if (fig.kind === 'equations') return { ...fig, leftOut: 'shown' };
  // the size of each area is written in
  if (fig.kind === 'graph') return { ...fig, areas: fig.areas?.map((area) => ({ ...area, value: 'shown' as const })) };
  if (fig.kind === 'track') return { ...fig, disp: fig.disp === 'afterCheck' ? 'shown' : fig.disp };
  if (fig.kind === 'vectors') return { ...fig, resultant: fig.resultant === 'afterCheck' ? 'shown' : fig.resultant, angle: fig.angle === 'afterCheck' ? 'shown' : fig.angle };
  // the size of the component the question asked for is written in
  if (fig.kind === 'sledge') return { ...fig, forward: shownAfter(fig.forward), up: shownAfter(fig.up) };
  if (fig.kind === 'hill') return { ...fig, along: shownAfter(fig.along), into: shownAfter(fig.into) };
  if (fig.kind === 'resolve') return { ...fig, answer: fig.answer === 'afterCheck' ? 'shown' : fig.answer };
  // the free-body diagram appears, or the force it asked for grows to its real size
  if (fig.kind === 'crate') return { ...fig, fbdAfterCheck: undefined, ask: fig.ask?.filter((a) => a.answer !== 'afterCheck'), accel: fig.accel === 'afterCheck' ? 'shown' : fig.accel };
  // the drag grows to its real size, the steady speed of each stack is written in
  if (fig.kind === 'fall') return { ...fig, askD: fig.askD === 'afterCheck' ? undefined : fig.askD, speeds: fig.speeds === 'afterCheck' ? 'shown' : fig.speeds };
  // the lab plays on from rest, and the tension or acceleration it asked for is written in
  if (fig.kind === 'pulley')
    return {
      ...fig,
      play: fig.play === 'afterCheck' ? true : fig.play,
      at: fig.play === 'afterCheck' ? undefined : fig.at,
      tension: fig.tension === 'afterCheck' ? 'shown' : fig.tension,
      accel: fig.accel === 'afterCheck' ? 'shown' : fig.accel,
    };
  if (fig.kind === 'ladder') return { ...fig, askF: fig.askF === 'afterCheck' ? undefined : fig.askF };
  // the momentum arrows grow to their size, the momentum line fills in, the total is written
  if (fig.kind === 'wall') return { ...fig, p: fig.p === 'afterCheck' ? 'shown' : fig.p, ledger: fig.ledger === 'afterCheck' ? 'shown' : fig.ledger };
  if (fig.kind === 'bodies') return { ...fig, p: fig.p === 'afterCheck' ? 'shown' : fig.p, total: fig.total === 'afterCheck' ? 'shown' : fig.total };
  // the collision plays through, and the momentum line fills in: the total before and after
  if (fig.kind === 'collide') return { ...fig, play: fig.play === 'afterCheck' ? true : fig.play, ledger: fig.ledger === 'afterCheck' ? 'shown' : fig.ledger };
  // the perpendicular distance appears, and the moment is written by its turning arc
  if (fig.kind === 'spanner') return { ...fig, perp: fig.perp === 'afterCheck' ? 'shown' : fig.perp, moment: fig.moment === 'afterCheck' ? 'shown' : fig.moment };
  if (fig.kind === 'pole') return { ...fig, moment: fig.moment === 'afterCheck' ? 'shown' : fig.moment };
  if (fig.kind === 'bar') return { ...fig, moments: fig.moments === 'afterCheck' ? 'shown' : fig.moments };
  // the asked distance, weight or push gets its size, and the totals of the moments appear
  if (fig.kind === 'beam') return { ...fig, answer: fig.answer === 'afterCheck' ? 'shown' : fig.answer };
  // each piece's weight grows to its size
  if (fig.kind === 'broom') return { ...fig, pieces: fig.pieces === 'afterCheck' ? 'shown' : fig.pieces };
  // the work each hand's force does is written in
  if (fig.kind === 'platform') return { ...fig, work: fig.work === 'afterCheck' ? 'shown' : fig.work };
  // the push along the ramp grows to its size, and the work up the ramp is written in
  if (fig.kind === 'ramp') return { ...fig, push: fig.push === 'afterCheck' ? 'shown' : fig.push };
  // the kinetic energy is written in, or the energy square is drawn under the car
  if (fig.kind === 'kinetic') return { ...fig, square: fig.square === 'afterCheck' ? 'shown' : fig.square, energy: fig.energy === 'afterCheck' ? 'shown' : fig.energy };
  // the stones' velocities at the sea appear and their speeds are written in
  if (fig.kind === 'cliff') return { ...fig, landing: fig.landing === 'afterCheck' ? 'shown' : fig.landing };
  // the energy friction took fills the bottom bar, or the friction force grows to its size
  if (fig.kind === 'slide') return { ...fig, heat: fig.heat === 'afterCheck' ? 'shown' : fig.heat, friction: fig.friction === 'afterCheck' ? 'shown' : fig.friction };
  // the cyclist's power is written in
  if (fig.kind === 'ride') return { ...fig, power: fig.power === 'afterCheck' ? 'shown' : fig.power };
  // the power flow splits into useful and heating, or the efficiency is written in
  if (fig.kind === 'winch') return { ...fig, useful: fig.useful === 'afterCheck' ? 'shown' : fig.useful, efficiency: fig.efficiency === 'afterCheck' ? 'shown' : fig.efficiency };
  // the block goes over the side and the level falls by the model, or the block's share of the water displaced is written
  if (fig.kind === 'tank') return { ...fig, drop: fig.drop === 'afterCheck' ? true : fig.drop, pushed: fig.pushed === 'afterCheck' ? 'shown' : fig.pushed };
  // the newtonmeter's reading, or the overflow's volume, is written in
  if (fig.kind === 'dunk') return { ...fig, reading: fig.reading === 'afterCheck' ? 'shown' : fig.reading, overflow: fig.overflow === 'afterCheck' ? 'shown' : fig.overflow };
  // the balls are let go and fall by the model, and the asked speed, drag or weight is written in
  // the weight is hung and bobs by the model, the pull grows to its size, the asked reading is written in
  // the wires stretch, and the asked reading is written in
  // the load is taken off, and the unloading line is drawn
  // the energy is written in (and the triangles shaded), the spring is released and the ball's speed drawn
  if (fig.kind === 'launcher') return { ...fig, ask: fig.ask === 'afterCheck' ? undefined : fig.ask, speed: fig.speed === 'afterCheck' ? true : fig.speed };
  if (fig.kind === 'material') return { ...fig, unload: fig.unload === 'afterCheck' ? true : fig.unload };
  if (fig.kind === 'wire') return { ...fig, ask: fig.ask?.hide === 'afterCheck' ? undefined : fig.ask, stretch: fig.stretch === 'afterCheck' ? undefined : fig.stretch };
  if (fig.kind === 'spring')
    return {
      ...fig,
      ask: fig.ask?.hide === 'afterCheck' ? undefined : fig.ask,
      springs: fig.springs.map((s) => ({ ...s, hung: s.hung === 'afterCheck' ? true : s.hung, pull: s.pull === 'afterCheck' ? 'shown' : s.pull })),
    };
  if (fig.kind === 'tube') return { ...fig, play: fig.play === 'afterCheck' ? true : fig.play, ask: fig.ask === 'afterCheck' ? undefined : fig.ask };
  // the falls play (slowed down, with strobe copies) and the landing distance is written in
  if (fig.kind === 'bench') return { ...fig, play: fig.play === 'afterCheck' ? true : fig.play, at: fig.play === 'afterCheck' ? undefined : fig.at, range: fig.range === 'afterCheck' ? 'shown' : fig.range };
  // the flights play, the paths appear and every "?" gets its size
  if (fig.kind === 'kick') {
    const after = <T,>(x: T | 'afterCheck', to: T): T => (x === 'afterCheck' ? to : x);
    return {
      ...fig,
      play: after(fig.play, true),
      path: fig.path && after(fig.path, 'shown'),
      range: fig.range && after(fig.range, 'shown'),
      height: fig.height && after(fig.height, 'shown'),
      topV: fig.topV && after(fig.topV, 'shown'),
    };
  }
  if (fig.kind !== 'lift') return fig;
  return { ...fig, unknownN: undefined, reading: fig.reading === 'afterCheck' ? 'shown' : fig.reading };
}
