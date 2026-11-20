// The shape of lesson content. Content files have no React imports, so Node tests can load them.
//
// A lesson is a short story around one puzzle (docs/LESSON_FRAMEWORK.md, "Decisions of 11 Nov, night"):
// intro → screens with questions along the way → back to the puzzle → Skill check.
// Every screen has ONE focus: either text (at most two short paragraphs) or a figure with one sentence.
// Text limits are checked by src/content/rules.test.ts.

import type { Quantity, RelationId, Trip } from '../physics/kinematics.ts';

// ── Figures (drawn by src/figures from these numbers; up is positive) ─────────────────────

/** A person standing on bathroom scales inside a lift car. */
export type LiftFig = {
  kind: 'lift';
  m: number; // mass of the person, kg
  a: number; // acceleration of the lift, m s⁻² (up positive)
  /**
   * The lift is moving: the shaft slides past the car, driven by s = ut + ½at² from src/physics.
   * u is the velocity when the loop starts (up positive); the label sits by an outline arrow ("steady 2 m s⁻¹").
   * Without it the lift is at rest (or, on an explore screen, starts from rest with the slider's a).
   */
  motion?: { u: number; text: string };
  /** Which forces on the person are drawn. */
  forces: ('W' | 'N')[];
  /** Draw N as a dashed stub with "?" instead of its real length (the question asks about it). */
  unknownN?: true;
  /** Draw the acceleration of the lift (a double chevron). */
  showAcc?: true;
  /**
   * The scales display, in kg like real bathroom scales (N ÷ g). Hidden ("- - -") by default;
   * 'afterCheck' keeps it hidden until the question is answered, then shows it.
   */
  reading?: 'shown' | 'afterCheck';
  /** Write the size of each force next to its arrow, in N. */
  values?: true;
  /** Draw three candidate N arrows (shorter / equal to W / longer) to tap. Their ids are CANDIDATE_IDS. */
  candidates?: true;
  /** Write g in the sheet header next to m (the screen where W = mg is worked out). */
  showG?: true;
  /** Mark on the person where N acts: a dot in the middle of the soles and a short N arrow up from it. */
  nOnPerson?: true;
};

/** The person lifted off the scales ("exploded" view) with the forces on each body, for Newton's third law. */
export type PairsFig = {
  kind: 'pairs';
  m: number;
  /** Start with the bodies stacked together, move them apart, then grow the arrows (the first time the figure is met). */
  explode?: true;
};

/** A velocity–time graph of a lift trip, split into lettered parts of constant acceleration. */
export type VtFig = { kind: 'vt'; phases: { id: string; dt: number; a: number }[] };

/** A cutaway of the scales under a foot: the spring inside squashes and the display counts up. */
export type ScalesFig = { kind: 'scales'; m: number };

/** Two small lifts side by side: at rest, and accelerating at `a`. Used to show the puzzle solved. */
export type LiftPairFig = { kind: 'liftPair'; m: number; a: number };

/**
 * Throws from a balcony: the hand is `h` above the ground; ball A goes straight up at +u, ball B straight down at −u.
 * Up is positive. Positions and velocities come from s = ut + ½at² with a = −g (src/physics/kinematics).
 */
export type ThrowFig = {
  kind: 'throw';
  h: number; // height of the hand above the ground, m
  u: number; // speed of each throw, m s⁻¹
  balls: ('A' | 'B')[];
  /** Where ball A is while the figure stands still: just thrown, at the top, or falling back past the hand. */
  at?: 'hand' | 'top' | 'back';
  /** Write each velocity next to its arrow (and the speed each ball lands with). */
  values?: true;
  /** Make the "up is positive" axis stand out. */
  signs?: true;
  /** Draw the acceleration (a double chevron) and write it in the header. */
  showAcc?: true;
  /** Hide ball A's velocity: "v = ?" (the question asks about it). */
  unknownV?: true;
  /** Three acceleration candidates beside ball A at the top, to tap. Their ids are ACC_IDS. */
  candidates?: true;
  /** Faint copies of ball A every 0.1 s along its path so far, like a strobe photo. */
  trail?: true;
  /** Play the flights from where they stand down to the ground, again and again. 'afterCheck': still until answered. */
  play?: true | 'afterCheck';
};

/** The velocity–time graph of a ball thrown straight up at u, until time tEnd: one straight line through v = 0. */
export type ThrowVtFig = { kind: 'throwVt'; u: number; tEnd: number };

/** Core Practical 1: height fallen against time squared for a ball dropped from rest; a straight line of this gradient. */
export type FallGraphFig = { kind: 'fallGraph'; gradient: number };

/**
 * Cars braking on a straight road, seen from the side. Each car has its own lane; its front is at the 0 m line when
 * the clock starts (the brakes come on, or with `react` the driver sees the hazard). Forward is positive.
 * Positions and velocities come from brakingPosition and brakingVelocity (src/physics/kinematics).
 */
export type RoadFig = {
  kind: 'road';
  a: number; // acceleration while braking, m s⁻² (negative)
  cars: { id: 'A' | 'B'; u: number }[]; // u: speed before braking, m s⁻¹
  span: number; // metres of road on the ruler
  /** The driver's reaction time, s: the car keeps its speed this long before the brakes come on. */
  react?: number;
  /** Write each speed above its arrow, and how far each car went once it has stopped. */
  values?: true;
  /** Draw the acceleration (a double chevron pointing backward) while a car is braking, and write it in the header. */
  showAcc?: true;
  /** Car A has already stopped: it stands where its braking ended, with its distance written. Only car B moves. */
  parkedA?: true;
  /** A marker on the road `at` metres along, where the question asks for car B's speed: "v = ?", or the speed once `shown`. */
  ask?: { at: number; shown?: true };
  /** A fallen tree across the road, this many metres ahead. The car cannot go past it. */
  tree?: number;
  /** Marks where the car's front was at each whole second so far, with the distance covered in each second (explore). */
  trail?: true;
  /** Play the braking from the 0 m line, again and again. 'afterCheck': still until answered. */
  play?: true | 'afterCheck';
};

/** The v–t lines of cars braking at `a`: one triangle each, the largest cut into copies of the smallest. Distance = area. */
export type BrakeVtFig = { kind: 'brakeVt'; a: number; cars: { id: 'A' | 'B'; u: number }[] };

/**
 * The four suvat equations on a sheet, the way you would set a problem out: your list of s, u, v, a, t on the left,
 * the equations on the right. Tap targets: the equations (EQUATION_IDS).
 */
export type EquationsFig = {
  kind: 'equations';
  /** The problem's list: each known quantity with its value (as text, with its unit) and the one that is wanted. */
  list?: { known: Partial<Record<Quantity, string>>; want: Quantity };
  /** Mark on each equation the quantity it leaves out. 'afterCheck': only once the question is answered. */
  leftOut?: 'shown' | 'afterCheck';
  /** The equation the question is about: its row is outlined. */
  focus?: RelationId;
};

/**
 * A graph of motion against time: displacement, velocity or acceleration of one or two trips, drawn from the model
 * (src/physics/kinematics: tripPosition, tripVelocity, tripAcceleration). Everything written on it is computed.
 */
export type GraphFig = {
  kind: 'graph';
  y: 's' | 'v' | 'a';
  /** The given values, written in the sheet header. */
  header: string;
  /** `id`: the letter written beside the line ('' for a single unnamed line). `until`: where the line ends (defaults to tMax). */
  lines: { id: string; trip: Trip; until?: number }[];
  tMax: number;
  tTick: number;
  yMin?: number; // defaults to 0
  yMax: number;
  yTick: number;
  /**
   * Areas between a line and the time axis (hatched where the line is below the axis), each with its size in metres:
   * shown, or only once the question is answered. `at`: where the number is written, as [t, y] (defaults to the middle).
   */
  areas?: { line: string; from: number; to: number; value: 'shown' | 'afterCheck'; at?: [number, number] }[];
  /** Regions between the first two lines, each labelled with its area (how much one body gains on the other). */
  between?: { from: number; to: number }[];
  /** A rise-over-run triangle on a line between two times, with both sides labelled. */
  gradient?: { line: string; from: number; to: number };
  /** The tangent to a line at one time. */
  tangent?: { line: string; at: number };
  /** A ring around the point of a line at one time (where two lines cross, for example). */
  ring?: { line: string; at: number };
  /** Explore: the slider is a time cursor; the area under each line up to the cursor is shaded and written out. */
  cursor?: true;
  /** Lettered parts of the time axis, as tap targets. */
  parts?: { id: string; from: number; to: number }[];
};

/**
 * Two cars on the road of the braking figure, each with its own steady acceleration, side by side at the 0 m line
 * when the clock starts. Positions and velocities come from position and velocity (src/physics/kinematics).
 */
export type ChaseFig = {
  kind: 'chase';
  cars: { id: 'A' | 'B'; u: number; a: number }[];
  span: number; // metres of road on the ruler
  /** The clip runs from 0 to this time, s; its last frame shows the gap between the cars (or that they are level). */
  until: number;
  /** Write each speed above its car while the figure stands still. */
  values?: true;
  /** Play the clip, again and again. Without it the cars stand at the 0 m line. */
  play?: true;
};

/**
 * A straight east–west track seen from the side, with a lamp post at 0 m. Each runner has a lane and a run made of
 * parts of steady velocity (a `Trip`, east positive); positions come from tripPosition (src/physics/kinematics).
 * Runner A's two legs can be drawn as arrows above its lane, and each runner's displacement as an arrow below it.
 */
export type TrackFig = {
  kind: 'track';
  runners: { id: 'A' | 'B'; trip: Trip }[];
  /** How long the runs last, s: the race ends here. */
  tEnd: number;
  /** Which way is positive: the + on the ruler, the signs in the header and on the labels. */
  plus: 'east' | 'west';
  /** Where the runners stand while the figure is still: at the lamp post, at the finish, or `mid` seconds into the run. */
  at?: 'start' | 'end' | number;
  /** Draw runner A's legs (each part of its run) as arrows above its lane, with their lengths. */
  legs?: true;
  /** Each runner's displacement as an arrow below its lane: shown, only once the question is answered, or "s = ?". */
  disp?: 'shown' | 'afterCheck' | 'unknown';
  /** Write the numbers on the ruler (otherwise only 0 at the lamp post). */
  numbers?: true;
  /** Write each runner's velocity, with its sign, above its arrow. */
  values?: true;
  /** Play the race from the lamp post to the finish, sped up (the sheet says how much), again and again. */
  play?: true;
};

/**
 * Vectors added tip to tail on squared paper, north (or "across") up the page. Each leg is east and north in the figure's unit.
 * The resultant runs from the first tail to the last tip; the angle is measured from the first leg.
 */
export type VectorsFig = {
  kind: 'vectors';
  header: string;
  unit: string; // written after every size: "km", "m s⁻¹"
  /** Side of one square of the paper, in the figure's unit. */
  grid: number;
  /** Draw a north arrow (the legs are directions on a map). */
  compass?: true;
  legs: { east: number; north: number; label: string }[];
  /** The resultant: dashed with "?", solid with its size, or dashed until the question is answered. */
  resultant: 'unknown' | 'shown' | 'afterCheck';
  /** The angle between the first leg and the resultant: "θ = ?", its value, or "?" until answered. */
  angle?: 'unknown' | 'shown' | 'afterCheck';
};

/**
 * How a component is labelled on a figure: its name only ("forward"), "?" (the question asks for it), "?" until the
 * question is answered and then its size, or its size. Without a label the component is drawn bare (a tap question).
 */
export type PartLabel = 'name' | 'unknown' | 'afterCheck' | 'shown';

/**
 * Sledges on flat snow, seen from the side. Ana pulls hers with a rope at `angle` degrees above the snow; Ben pushes his
 * straight forward. Forces are drawn in the force colour from the point where they act; their components come from
 * `components` in src/physics/vectors, so every size written on the sheet is the model's.
 */
export type SledgeFig = {
  kind: 'sledge';
  /** Ana's sledge alone, or both (Ben's on the left, Ana's on the right). */
  who: 'A' | 'AB';
  pull: number; // Ana's rope force, N
  angle: number; // the rope's angle above the snow, degrees (on the explore screen: the slider)
  push: number; // Ben's push, N
  /**
   * Ana's pull split into components: both from the hitch with a dashed rectangle ('box'), tip to tail closing on the
   * pull ('chain'), or only the forward one ('forward', to compare with Ben's push).
   */
  split?: 'box' | 'chain' | 'forward';
  forward?: PartLabel;
  up?: PartLabel;
  /** Write the size of the pull (and of Ben's push) next to its arrow. */
  values?: true;
  /** Tap targets on the pull and its two components (SLEDGE_IDS). */
  targets?: true;
};

/**
 * A sledge resting on a snowy hill of `angle` degrees. Its weight acts straight down from the centre of gravity and is
 * split along the slope and into it (`onSlope` in src/physics/vectors); the angle between W and the line into the
 * slope is marked, equal to the hill's angle.
 */
export type HillFig = {
  kind: 'hill';
  weight: number; // N
  angle: number; // degrees
  along?: PartLabel;
  into?: PartLabel;
};

/**
 * One vector on squared paper, with its angle from the horizontal or from the vertical, split into a horizontal and a
 * vertical component (both from its tail, with a dashed rectangle). A force is a solid arrow, a velocity an outline one.
 */
export type ResolveFig = {
  kind: 'resolve';
  header: string;
  size: number;
  unit: string; // "N", "m s⁻¹"
  angle: number; // degrees, measured from `from`
  from: 'horizontal' | 'vertical';
  /** A velocity (outline arrow) rather than a force. */
  velocity?: true;
  /** The name written beside the vector: "string", "ball". */
  name: string;
  /** The component the question asks for, and how it is labelled. The other one is drawn bare. */
  ask: 'x' | 'y';
  answer: 'unknown' | 'afterCheck' | 'shown';
};

/**
 * A lab bench `h` metres high, seen from the side. Ball A is dropped from its left end (no sideways speed); the other
 * balls roll off its right end at their own u. Positions come from projectilePosition (src/physics/projectile).
 * Played, the falls run at a quarter of real speed (the sheet says so) with a strobe copy of each ball every 0.1 s.
 */
export type BenchFig = {
  kind: 'bench';
  h: number; // m
  balls: { id: 'A' | 'B' | 'C'; u: number }[];
  /** Where the balls are while the figure stands still: on the bench (default) or landed on the floor. */
  at?: 'start' | 'end';
  /** Dashed lines joining the strobe copies taken at the same moment (they are always level). */
  levels?: true;
  /** Draw each rolling ball's velocity as two outline arrows: sideways and downward (explore). */
  arrows?: true;
  /** The landing distance of the fastest ball, as a dimension line on the floor: shown, or only once answered. */
  range?: 'shown' | 'afterCheck';
  /** Play the falls (slowed down), again and again. 'afterCheck': still until answered. */
  play?: true | 'afterCheck';
};

/**
 * Balls kicked from one spot on level ground at speed u, each at its own angle (Mia at the lower one, Leo at the
 * higher one). Positions come from projectilePosition (src/physics/projectile); every number written is the model's.
 */
export type KickFig = {
  kind: 'kick';
  u: number; // m s⁻¹
  kicks: { id: 'Mia' | 'Leo'; angle: number }[];
  /** The launch velocity of each kick as an outline arrow with its angle; 'parts' adds its components with their sizes. */
  launch?: 'arrow' | 'parts';
  /** The path as a dashed curve: the whole flight, only up to the top, or the whole flight once answered. */
  path?: 'shown' | 'toTop' | 'afterCheck';
  /** Where the balls are while the figure stands still: at the start (default) or at the top of their paths. */
  at?: 'start' | 'top';
  /** The velocity at the top: "v = ?", "?" until answered and then an arrow with its size, or shown. */
  topV?: 'unknown' | 'afterCheck' | 'shown';
  /** How far away each ball lands, as a dimension line on the ground: "?", "?" until answered, or its size. */
  range?: 'unknown' | 'afterCheck' | 'shown';
  /** How high the first ball rises, as a dimension line at the top: "?", "?" until answered, or its size. */
  height?: 'unknown' | 'afterCheck' | 'shown';
  /** Play the flights in real time with a clock, again and again. 'afterCheck': still until answered. */
  play?: true | 'afterCheck';
};

/** A force on the crate's free-body diagram: weight, normal reaction, friction, and Rose's rope or pole. */
export type CrateForce = 'W' | 'N' | 'F' | 'T';

/**
 * Rose moves a crate across a level floor. The scene is on the left; on the right the crate is shrunk to a dot (it slides
 * without turning) with one arrow per force, all to the same scale. N comes from normalWithPull (src/physics/dynamics):
 * nothing accelerates up or down. Friction is drawn as what balances the forward push (steady speed), or, once Rose
 * lets go, as μN with μ from the steady pull.
 */
export type CrateFig = {
  kind: 'crate';
  m: number; // kg
  /** A rope pulling at `angle` above the floor, a pole pushing at `angle` below it, or nothing: Rose has let go. */
  by: 'rope' | 'pole' | 'none';
  force: number; // N, the pull or push (before letting go, for 'none')
  angle: number; // degrees (on the explore screen: the slider)
  /** The forces on the free-body diagram. Empty: the scene alone, in the middle of the sheet. */
  forces: CrateForce[];
  /** List each force's size beside the diagram (otherwise the letters only). */
  values?: true;
  /** Forces kept hidden: a dashed "?" stub each, for good or until the question is answered (then the real arrow grows). */
  ask?: { force: 'N' | 'F'; answer: 'unknown' | 'afterCheck' }[];
  /** The free-body diagram appears only once the question is answered (it would give the answer away). */
  fbdAfterCheck?: true;
  /** Split the rope's force into its forward and upward parts, tip to tail, with their sizes. */
  split?: true;
  /** Draw P, the crate's push on the floor, on the scene where it acts (on the floor, under the crate). */
  floorPush?: true;
  /** Play the motion: the floor slides past at a steady speed, or (let go) the crate slides on and stops. */
  play?: true;
  /**
   * A fixed sliding friction, N. Then nothing has to balance: the crate accelerates at (forward pull − friction) / m
   * (src/physics/dynamics), the list adds ΣF, and played it starts at 2.0 m s⁻¹ and speeds up (or slows to a stop) by the model.
   */
  friction?: number;
  /** The acceleration on the free-body diagram (double chevron): its size, "a = ?", or "?" until the question is answered. */
  accel?: 'shown' | 'unknown' | 'afterCheck';
  /** On the explore screen the slider sets the pull (N) instead of the rope's angle. */
  slider?: 'force';
};

/**
 * The lab: a trolley on a smooth level bench, pulled by a string over a pulley at the end of the bench to a hanging mass.
 * Let go from rest, both move with a = mg / (M + m) (connectedAcceleration in src/physics/dynamics) until the mass lands
 * after `drop` metres; then the string goes slack and the trolley rolls on at a steady speed (pulleyRun).
 */
export type PulleyFig = {
  kind: 'pulley';
  trolley: number; // kg
  hanging: number; // kg (on the explore screen: the slider)
  drop: number; // m, how far the mass falls before it lands
  /** Draw the forces along the string (T on the trolley, T and W on the hanging mass). */
  forces?: true;
  /** The tension: written ("T = 1.57 N"), "T = ?", or "?" until the question is answered. Without it only the letters. */
  tension?: 'shown' | 'unknown' | 'afterCheck';
  /** The acceleration beside the trolley (double chevron): its size, "a = ?", or "?" until the question is answered. */
  accel?: 'shown' | 'unknown' | 'afterCheck';
  /** Where the bodies stand while the figure is still: at the start (default) or just after the mass has landed. */
  at?: 'start' | 'landed';
  /**
   * Play from rest (at half speed, the sheet says so), with a strobe mark under the trolley every 0.1 s, again and again.
   * The clip stops when the mass lands; with `at: 'landed'` it plays on and the trolley rolls on with the string slack.
   */
  play?: true | 'afterCheck';
};

/**
 * A uniform ladder leaning on a smooth wall, standing on a rough floor at `angle` degrees: an extended body, so each
 * force is drawn where it acts. W from the middle, S (the wall's push) at the top, N and F (friction) at the foot.
 * S comes from ladderWallPush (src/physics/dynamics); F balances S, N balances W.
 */
export type LadderFig = {
  kind: 'ladder';
  m: number; // kg
  angle: number; // degrees, to the floor
  forces: ('W' | 'S' | 'N' | 'F')[];
  /** Write each force's size next to its letter. */
  values?: true;
  /** Three dashed candidates for the wall's push at the top, to tap (LADDER_IDS). */
  candidates?: true;
  /** Friction at the foot is asked for: "?" with no arrow, or "?" until answered, then the arrow and its size. */
  askF?: 'unknown' | 'afterCheck';
};

/**
 * One body shrunk to a dot, with its forces as arrows to scale (`scale`: viewBox units per newton).
 * `angle`: degrees from the positive x direction, anticlockwise (90 = up). `text` is written at the tip.
 */
export type ParticleFig = {
  kind: 'particle';
  header: string;
  scale: number;
  forces: { size: number; angle: number; text: string }[];
};

/**
 * Falling through air: drag D = kv² grows with speed until it balances the weight (src/physics/drag). The body stays in
 * place on the sheet and the air streams up past it at a speed ∝ v; W and D are drawn to one scale from the centre of
 * gravity. Down is positive.
 */
export type FallFig = {
  kind: 'fall';
  /** Paper cake cases (one lane per stack: [1] or [1, 4]) or a skydiver. */
  body: { cases: number[] } | { skydiver: { m: number; chute?: { vt: number; open: number; inflate: number } } };
  /** Terminal velocity of one case, or of the skydiver before the parachute opens, m s⁻¹. */
  vt: number;
  /** The clip's length (and the graph's time axis), s. */
  tEnd: number;
  /** Where the figure stands while still, s after letting go (default 0); 'end' = tEnd. */
  at?: number | 'end';
  /** The v–t graph on the right, from 0 to the current time. */
  graph?: true;
  /** Draw W and D (with one lane of cake cases, or the skydiver). */
  forces?: true;
  /** D as a dashed "D ?" stub, for good or until the question is answered. */
  askD?: 'unknown' | 'afterCheck';
  /** The steady speed of each lane of cake cases: written, the last lane "?" for good or until the question is answered. */
  speeds?: 'shown' | 'unknown' | 'afterCheck';
  /** Play from rest, again and again (cases in real time, a skydive sped up: the sheet says so). */
  play?: true;
};

/**
 * Trolleys of mass m roll at u into a wall (towards the wall is positive). Trolley A has a spring buffer and bounces back
 * at `back`; trolley B has a putty pad and stops dead. Positions and velocities come from wallRun (src/physics/momentum);
 * each trolley's momentum is a solid ink arrow that shrinks through zero and flips during a bounce.
 */
export type WallFig = {
  kind: 'wall';
  m: number; // kg, each trolley
  u: number; // m s⁻¹, towards the wall
  back: number; // m s⁻¹, A's speed after the bounce (on the explore screen: the slider)
  trolleys: ('A' | 'B')[];
  /** Where the trolleys stand while the figure is still: rolling in (default) or after the hit. */
  at?: 'before' | 'after';
  /** The momentum written at each arrow: its value, "p = ?", or "?" until the question is answered. */
  p?: 'shown' | 'unknown' | 'afterCheck';
  /**
   * A momentum line under the track, one row per trolley: p before (○), p after (●) and the Δp arrow between them.
   * 'afterCheck': the rows stay empty ("Δp = ?") until the question is answered.
   */
  ledger?: 'shown' | 'afterCheck';
  /** Play the hit in real time, again and again. */
  play?: true;
};

/**
 * Bodies with their velocities (right positive): one lane each, or all on one track heading at each other (`shared`).
 * Once revealed, each body's momentum is a solid ink arrow, all to one scale (momentum in src/physics/momentum).
 */
export type BodiesFig = {
  kind: 'bodies';
  header: string;
  bodies: { id: string; look: 'cricket' | 'bowling' | 'trolley'; m: number; v: number }[];
  shared?: true;
  /** The momentum arrows with their values: shown, or only once the question is answered. */
  p?: 'shown' | 'afterCheck';
  /** The total momentum under the track: shown, or "Σp = ?" until the question is answered. */
  total?: 'shown' | 'afterCheck';
};

/**
 * Two trolleys on one track (right positive): the left one (A, facing right) carries putty (they stick), a spring buffer
 * (it bounces) or a spring plunger (both at rest, pushed apart). Positions and velocities come from collisionRun
 * (src/physics/momentum): steady speeds, a short contact, steady speeds again. Velocities are hollow arrows; under the
 * track an optional momentum line, BEFORE and AFTER rows, each with A's momentum, then B's from its tip, and the total Σp.
 */
export type CollideFig = {
  kind: 'collide';
  header: string;
  /** Left body, then right body: name, mass, velocity before (u) and after (v). */
  bodies: [CollideBody, CollideBody];
  join: 'stick' | 'bounce' | 'apart';
  /** 'approach': only up to just before they touch (pushed apart: still at rest); true: the whole clip; 'afterCheck': approach until answered. */
  play?: 'approach' | true | 'afterCheck';
  /** Where the trolleys stand while the figure is still: before the hit (default) or after it. */
  at?: 'after';
  /** The momentum line: shown, or with "?" in each row until the question is answered. */
  ledger?: 'shown' | 'afterCheck';
  /** Explore: the slider sets the right body's mass within this range (it starts at rest, they stick). */
  massRange?: [number, number];
};
export type CollideBody = { id: string; m: number; u: number; v: number };

/**
 * A stuck nut and a spanner lying along +x, in one panel per pull (MIA / LEO). Each pull has the same size F, acts a
 * distance r from the nut and points at `angle` degrees to the handle, upwards and back towards the nut (90 = at right
 * angles), so every pull turns the nut anticlockwise. Moments come from src/physics/moments.
 * On an explore screen the slider sets the angle of the first pull.
 */
export type SpannerFig = {
  kind: 'spanner';
  F: number; // N, every pull
  length: number; // m, the spanner from the nut's centre to its end
  pulls: SpannerPull[];
  /** The line of action, dashed, and the perpendicular from the nut with x written on it: shown, or once answered. */
  perp?: 'shown' | 'afterCheck';
  /** The turning arc around the nut with the moment: its value, "M = ?", or "M = ?" until answered. */
  moment?: 'shown' | 'unknown' | 'afterCheck';
};
export type SpannerPull = { who: 'MIA' | 'LEO'; r: number; angle: number };

/**
 * A pole fixed to a wall, rising at `angle` degrees above the horizontal, with a sign of weight W hanging from its end.
 * The weight's line of action is vertical, so the distance that counts is the horizontal one, L cos θ.
 */
export type PoleFig = {
  kind: 'pole';
  L: number; // m
  angle: number; // degrees above the horizontal
  W: number; // N
  /** Three dashed distances to tap (POLE_IDS): along the pole, the height of its end, the horizontal. */
  candidates?: true;
  /** The horizontal distance with its size and the turning arc with the moment: shown, "M = ?", or once answered. */
  moment?: 'shown' | 'unknown' | 'afterCheck';
};

/** A bar on a pivot at its middle, loads hanging from it at signed distances (right of the pivot +). */
export type BarFig = {
  kind: 'bar';
  half: number; // m, half the bar's length
  loads: { at: number; W: number }[];
  /** The turning arc of each load with its moment, and the resultant: shown, or once answered. */
  moments?: 'shown' | 'afterCheck';
};

/**
 * A plank resting on one pivot (it can tip) or on two trestles. Positions are metres from its left end.
 * People and boxes stand on it; each pushes down on the plank where it stands, with its weight. Moments come from
 * src/physics/moments. On an explore screen the slider sets how far right of the pivot the load with `slide` stands.
 */
export type BeamFig = {
  kind: 'beam';
  header: string; // the given values in the sheet header
  L: number; // m
  supports: number[]; // one: a pivot under the plank; two: a trestle under each of these points
  /** A uniform plank's weight, N, drawn at its middle with the centre-of-gravity mark. Left out: a light plank. */
  weight?: number;
  loads: BeamLoad[];
  /** The turning arcs about the pivot with the total moment each way. */
  moments?: true;
  /** The supports' upward pushes: the ones in `known` carry their size, the one `asked` a "?" until answered. */
  pushes?: { known: number[]; asked?: number };
  /**
   * The asked distance, weight or push: 'shown' gives its size, 'afterCheck' a "?" until answered (the totals of the
   * moments wait too), left out a "?" for good.
   */
  answer?: 'shown' | 'afterCheck';
  /** Three dashed centre-of-gravity marks to tap (BEAM_IDS): at the pivot, at the middle, at the middle of the long part. */
  candidates?: true;
};
export type BeamLoad = {
  id: string;
  look: 'person' | 'box';
  W: number; // N
  at: number; // m from the left end
  name?: string; // written over the person ("ANA")
  /** The question asks for this: its distance from the pivot, or its weight. */
  asked?: 'at' | 'W';
  /** Explore: the slider sets this load's distance to the right of the pivot. */
  slide?: true;
};

/**
 * A broom lying flat, balanced on a fingertip at its centre of gravity. If it is sawn there, the brush piece's weight
 * acts `brush` metres from the cut and the handle piece's `handle` metres the other way (piecesAtBalance).
 */
export type BroomFig = {
  kind: 'broom';
  total: number; // N, the whole broom
  brush: number; // m
  handle: number; // m
  /** The saw line through the balance point. */
  cut?: true;
  /** Each piece's weight at its centre of gravity, with its distance from the cut: sizes, "?", or "?" until answered. */
  pieces?: 'shown' | 'unknown' | 'afterCheck';
};

/**
 * Loads moved along a level floor by a hand: carried by the handle (the hand holds it up), pulled on its wheels by a
 * handle at `angle` above the floor, or pushed from behind. One panel, or two side by side. Each hand's force is drawn
 * from where the hand acts, all to one scale per figure; the motion is an outline arrow under the floor with Δs.
 * The work each hand's force does comes from workDone (src/physics/work). On an explore screen the slider sets the
 * angle of the first lane's force.
 */
export type PlatformFig = {
  kind: 'platform';
  header: string; // the given values in the sheet header
  lanes: PlatformLane[]; // one panel, or two side by side
  dist: number; // m, how far each load moves
  /** Draw each hand's force with its size. */
  forces?: true;
  /** Split an angled force into its parts along and across the motion, with their sizes and the angle. */
  split?: true;
  /** The work each hand's force does, at the top of its panel: its size, "?", or "?" until the question is answered. */
  work?: 'shown' | 'unknown' | 'afterCheck';
  /** The floor slides past at a steady speed. */
  play?: true;
};
export type PlatformLane = {
  name: string; // over the hand: "NADIA"
  how: 'carry' | 'pull' | 'push';
  load: 'suitcase' | 'box';
  F: number; // N, the hand's force
  angle: number; // degrees between the force and the motion (carry: 90, push: 0)
  /** Friction on the load, N, drawn backwards along the floor. */
  friction?: number;
};

/**
 * Movers raise a washing machine `h` metres into a van: pushed at a steady speed up a smooth ramp of length L, or lifted
 * straight up (dashed, by the van). The push along the ramp is rampPush (mg h ÷ L); the work is the same either way
 * (src/physics/work). On the explore screen the slider sets L.
 */
export type RampFig = {
  kind: 'ramp';
  m: number; // kg
  h: number; // m
  L: number; // m
  /** The push along the ramp: its size, "F = ?", or "?" until the question is answered. */
  push: 'shown' | 'unknown' | 'afterCheck';
  /** The two sums at the top: up the ramp and straight up. */
  work?: true;
};

/**
 * An electric car on a level road, seen from the side; the road slides past at its speed. Played, it speeds up from
 * rest to `v` by the model and holds. With `square`, the road moves up and the kinetic energy is drawn under it as a
 * square of side v, one cell per 2 m s⁻¹ (src/physics/energy: Ek = ½mv²). With `stages` [u, v], the square of side u
 * and the band around it up to v carry their own energies. On the explore screen the slider sets the speed.
 */
export type KineticFig = {
  kind: 'kinetic';
  m: number; // kg
  v: number; // m s⁻¹, the car's speed
  play?: true;
  /** Draw the energy square: always, or once the question is answered. */
  square?: 'shown' | 'afterCheck';
  /** Two speeds: the square of the first and the band around it up to the second. */
  stages?: [number, number];
  /** The kinetic energy by the car (without the square): its size, or "Ek = ?" until the question is answered. */
  energy?: 'shown' | 'afterCheck';
};

/**
 * A tower crane holds a car `h` metres over the road, by a height ruler. Two bars to one scale: the car's gain in
 * gravitational potential energy (mgh, src/physics/energy) and, with `match`, its kinetic energy at that speed.
 * On the explore screen the slider sets the height.
 */
export type HeightFig = {
  kind: 'height';
  m: number; // kg
  h: number; // m
  /** A speed, m s⁻¹: its kinetic energy is the second bar. */
  match?: number;
};

/**
 * Stones thrown from the top of a sea cliff `h` metres high, all at speed u, each at its own angle (negative = down).
 * Paths by projectilePosition (src/physics/projectile). Played, they fly together and splash. With `landing`, each
 * stone's velocity at the sea and a table of their speeds ("?" until answered; the arrows only once shown). With
 * `follow`, the explore: that stone at the slider's time with its velocity, and a column of its Ep and Ek above the sea.
 */
export type CliffFig = {
  kind: 'cliff';
  h: number; // m
  u: number; // m s⁻¹ (0: dropped from rest)
  m: number; // kg, for the energies
  stones: { id: string; angle: number }[];
  play?: true;
  follow?: string;
  landing?: 'shown' | 'afterCheck';
};

/**
 * A child of mass m slides from rest down a playground slide of height h and length L against a steady friction force
 * F (src/physics/energy: ½mv² = mgh − FL). Two bars: the GPE given up, and the kinetic energy at the foot with, once
 * shown, the work done against friction (heating). On the explore screen the slider sets L at the same h and F.
 */
export type SlideFig = {
  kind: 'slide';
  m: number; // kg
  h: number; // m
  L: number; // m
  F: number; // N
  play?: true;
  /** The energy friction took, in the bottom bar: shown, or left out until the question is answered. */
  heat?: 'shown' | 'afterCheck';
  /** The friction force up the chute: its size, or "F = ?" until the question is answered. */
  friction?: 'shown' | 'afterCheck';
};

/**
 * A cyclist on a level road, seen from the side, riding at a steady speed v. She stays put while the road, its posts
 * and the air stream past at her speed. Air resistance D = kv² (src/physics/drag) acts back from her centre of gravity;
 * at a steady speed the road pushes her forward at the back wheel with F = D. On the explore screen the slider sets v.
 */
export type RideFig = {
  kind: 'ride';
  k: number; // the drag constant, N s² m⁻²
  v: number; // m s⁻¹
  /** A second lane below at this speed (the recap): both riders with their forces and power. */
  compare?: number;
  /** The roadside posts stand v × 1 s apart, with the distance between two written: she passes one each second. */
  perSecond?: true;
  /** Her power, P = Dv: written in, or "P = ?" until the question is answered. */
  power?: 'shown' | 'afterCheck';
};

/**
 * An electric winch on top of a scaffold lifts a pallet of bricks of mass m through h metres in t seconds at a steady
 * speed. Beside it, the power flow of the motor: the input from the mains, the useful power (mgh ÷ t, src/physics/power)
 * and the rest, which heats the motor. On the explore screen the slider sets the load; the useful power stays the
 * same, so the speed follows v = P ÷ mg, with the cable's pull T and v drawn on the pallet.
 */
export type WinchFig = {
  kind: 'winch';
  m: number; // kg
  h: number; // m
  t: number; // s
  input: number; // W, from the mains
  /** The pallet rises again and again. */
  play?: true;
  /** The useful power and the heating part of the flow: written in, or "?" until the question is answered. */
  useful?: 'shown' | 'afterCheck';
  /** The motor's efficiency: written in, or "?" until the question is answered. */
  efficiency?: 'shown' | 'afterCheck';
};

/**
 * A glass tank of water seen from the side, with a toy boat floating in it and a steel block (src/physics/fluids). The
 * boat's draft follows the water it displaces (its own mass plus the block's while the block is on board, ÷ ρ(water));
 * the level follows the water plus everything displaced, ÷ the tank's base. Up is positive.
 */
export type TankFig = {
  kind: 'tank';
  block: { m: number; rho: number }; // kg, kg m⁻³
  boat: number; // the boat's mass, kg
  area: number; // the tank's base, m²
  water: number; // the volume of water in it, m³
  /** Where the block is: on board, or on the bottom (its density from the explore slider, if any). */
  at: 'boat' | 'bottom';
  /** The block goes over the side and sinks; the boat rises and the level falls by the model. 'afterCheck': only once the question is answered. */
  drop?: 'afterCheck' | true;
  /** The water the boat displaces, boat + block, written beside: the block's share "?" until the question is answered. */
  pushed?: 'afterCheck' | 'shown';
  /** On the bottom: the level while the block was on board, dashed, and the fall written. */
  levels?: true;
  /** The recap: two tanks side by side, the block on board and on the bottom. */
  compare?: true;
};

/**
 * A block of mass m and density ρ (an upright block with a square base, `h` tall) hangs from a newtonmeter on a stand,
 * lowered into a displacement can filled to its spout; the water it pushes out runs into a measuring cylinder.
 * The reading is W − U, the upthrust U is the weight of the water displaced (src/physics/fluids). On the explore screen
 * the slider sets how deep the block's bottom is below the surface (cm), and the reading, the overflow and U follow.
 */
export type DunkFig = {
  kind: 'dunk';
  m: number; // kg
  rho: number; // kg m⁻³
  h: number; // the block's height, m
  /** How deep the block's bottom is below the surface, m (without a slider). */
  depth: number;
  /** The newtonmeter's reading: written, "?" until the question is answered, or hidden. */
  reading?: 'shown' | 'afterCheck';
  /** The volume in the measuring cylinder: written, or "?" until the question is answered. */
  overflow?: 'shown' | 'afterCheck';
  /** The reading in air written beside (the block's weight). */
  inAir?: true;
  /** W, U and T drawn on the block. */
  forces?: true;
};

/**
 * Steel balls dropped into a tall tube of glycerol, with two rubber bands 10.0 cm apart and a cm ruler
 * (src/physics/viscosity). Each ball falls by stokesFall from the surface, at its terminal velocity within milliseconds.
 * The balls are drawn five times too large (the sheet says so). On the right a panel: the speeds, the small ball
 * magnified with W, U and the viscous drag F to one scale, the two balls side by side with their weights, a stopwatch
 * for the timing between the bands, or (on the explore screen, the slider = temperature) a thermometer with η and v.
 */
export type TubeFig = {
  kind: 'tube';
  /** The balls' radii, m: one ball, or a small and a big one. */
  balls: number[];
  rho: number; // the balls' density, kg m⁻³
  T: number; // the glycerol's temperature, °C (the slider's value on the explore screen)
  /** Let go at the surface and fall in real time, again and again; 'afterCheck': only once the question is answered. */
  play?: 'afterCheck' | true;
  /** While still: seconds after the drop (default 0, at the surface). */
  at?: number;
  panel: 'speeds' | 'forces' | 'weights' | 'timing' | 'warm';
  /** The asked value "?" (the last ball's speed, the drag F, the big ball's weight): for good or until the question is answered. */
  ask?: 'unknown' | 'afterCheck';
};

/**
 * One small steel ball seen from itself, in two liquids side by side: glycerol (laminar flow, the streamlines of Stokes
 * flow from src/physics/viscosity, dashes streaming along them) and water (it drops fast; behind it the flow breaks into
 * eddies). The two panels are tap targets (FLOW_IDS).
 */
export type FlowFig = { kind: 'flow'; r: number; rho: number; T: number };

export type Fig = LiftFig | PairsFig | VtFig | ScalesFig | LiftPairFig | ThrowFig | ThrowVtFig | FallGraphFig | RoadFig | BrakeVtFig | EquationsFig | GraphFig | ChaseFig | TrackFig | VectorsFig | SledgeFig | HillFig | ResolveFig | BenchFig | KickFig | CrateFig | LadderFig | ParticleFig | PulleyFig | FallFig | WallFig | BodiesFig | CollideFig | SpannerFig | PoleFig | BarFig | BeamFig | BroomFig | PlatformFig | RampFig | KineticFig | HeightFig | CliffFig | SlideFig | RideFig | WinchFig | TankFig | DunkFig | TubeFig | FlowFig;

/** Tap targets drawn by a lift figure with `candidates`. */
export const CANDIDATE_IDS = ['shorter', 'equal', 'longer'] as const;
/** Tap targets drawn by the pairs figure. */
export const PAIR_IDS = ['W', 'P', 'E'] as const;
/** Tap targets drawn by a throw figure with `candidates`: the acceleration at the top. */
export const ACC_IDS = ['up', 'zero', 'down'] as const;
/** Tap targets drawn by the equations figure: the four suvat equations (ids of RELATIONS in src/physics/kinematics). */
/** Tap targets drawn by a sledge figure with `targets`: Ana's pull and its two components. */
export const SLEDGE_IDS = ['pull', 'forward', 'up'] as const;
/** Tap targets drawn by a ladder figure with `candidates`: which way the wall pushes. */
export const LADDER_IDS = ['normal', 'perp', 'up'] as const;
/** Tap targets drawn by a pole figure with `candidates`: the distance to multiply the sign's weight by. */
export const POLE_IDS = ['along', 'height', 'across'] as const;
/** Tap targets drawn by a beam figure with `candidates`: where the plank's weight acts. */
export const BEAM_IDS = ['pivot', 'middle', 'long'] as const;
/** Tap targets drawn by the flow figure: its two panels. */
export const FLOW_IDS = ['glycerol', 'water'] as const;
export const EQUATION_IDS = ['vuat', 'sut', 'v2as', 'suvt'] as const satisfies readonly RelationId[];

// ── Screens ──────────────────────────────────────────────────────────────────────────────

export type Option = {
  id: string;
  label: string;
  correct?: true;
  /** One line shown after a wrong first try (story questions only). */
  hint?: string;
};

type Base = { id: string };

/** First screen: a title, one or two sentences and a figure. */
export type IntroScreen = Base & { kind: 'intro'; title: string; body: string; fig: Fig };

/** Text only (≤ 2 short paragraphs, optional definition card), or a figure with one sentence. */
export type TextScreen = Base & {
  kind: 'text';
  body: string[]; // **word** marks the key words of the screen (bold)
  card?: { term: string; text: string };
  fig?: Fig;
};

/** A prediction: no right answer yet, no outcome. A later choice screen returns to it (`revisitOf`). */
export type PredictScreen = Base & {
  kind: 'predict';
  prompt: string;
  fig?: Fig;
  options: Option[];
  after: string; // the button label once an option is picked ("Let's find out")
};

/** A question with one right option. */
export type ChoiceScreen = Base & {
  kind: 'choice';
  prompt: string;
  fig?: Fig;
  options: Option[];
  why: string; // behind the "Why?" button, after the verdict
  /** Id of the predict screen this question returns to; the learner's earlier pick is shown. */
  revisitOf?: string;
};

/**
 * Play with the figure through a slider, then a light question (not counted in the tally).
 * The slider drives the lift's acceleration, the time since the throw, since the brakes came on or since the runners set off,
 * the time cursor of a graph, the angle of the sledge's rope, the clock of the bench falls, the angle of a kick, the angle of the crate's rope or its pull, the lab's hanging mass, the time since the skydiver jumped, the speed a trolley bounces back from a wall, the mass of a trolley that is hit, the angle of a pull on a spanner, where a person stands on a plank, the angle of a suitcase's handle, the length of a ramp, the time since stones were thrown from a cliff, the length of a slide, a cyclist's speed, the load on a winch, the density of a block sunk in a tank, how deep a block hangs in water, or the temperature of glycerol a ball sinks through.
 */
export type ExploreScreen = Base & {
  kind: 'explore';
  instruction: string; // names the gesture: "Drag …"
  fig: LiftFig | ThrowFig | RoadFig | GraphFig | TrackFig | SledgeFig | BenchFig | KickFig | CrateFig | PulleyFig | FallFig | WallFig | CollideFig | SpannerFig | BeamFig | PlatformFig | RampFig | KineticFig | HeightFig | CliffFig | SlideFig | RideFig | WinchFig | TankFig | DunkFig | TubeFig;
  /**
   * `tick`: gap between the marks on the ruler (defaults to `step`). `symbol` and `dp` write the bubble ("t = 0.82 s"),
   * `signed` adds + to positive values. `start`: where the thumb begins (defaults to the lift's a, or `min`).
   */
  slider: { min: number; max: number; step: number; tick?: number; label: string; unit: string; symbol: string; dp: number; signed?: true; start?: number };
  question: { prompt: string; options: Option[]; right: string };
};

/** Answer by tapping something drawn on the figure. Option ids match the figure's tap targets. */
export type TapFigScreen = Base & {
  kind: 'tapFig';
  prompt: string;
  instruction: string; // names the gesture: "Tap …"
  fig: Fig;
  options: Option[];
  why: string;
};

export type Screen = IntroScreen | TextScreen | PredictScreen | ChoiceScreen | ExploreScreen | TapFigScreen;
export type Question = ChoiceScreen | TapFigScreen;

export type Lesson = {
  id: string;
  title: string;
  spec: number[]; // WPH11 specification points covered
  minutes: number;
  story: Screen[];
  /** Exam-level questions at the end: one try each, "Why?" only after the answer. */
  skillCheck: Question[];
  youCanNow: string[];
  /** The last screen: the puzzle, solved, as one figure with one sentence. */
  recap: { fig: Fig; text: string };
  /** The lesson's card in the Notebook: the formula to keep (≤ 24 characters) and the idea in words (≤ 110). */
  card: { formula: string; idea: string };
};

// ── Course map ───────────────────────────────────────────────────────────────────────────

/** `about`: one sentence on the map card saying what the lesson is about (shown for lessons not built yet too). */
export type LessonRef = { id: string; title: string; spec: number[]; ready: boolean; about: string };
export type Level = { id: string; title: string; lessons: LessonRef[] };
export type Course = { title: string; subtitle: string; levels: Level[] };

export const isQuestion = (s: Screen): s is Question => s.kind === 'choice' || s.kind === 'tapFig';
