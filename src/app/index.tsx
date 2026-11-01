import React, { Fragment, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { PhoneFrame } from '../components/stepParts';
import { BuildStep, DoneStep, ExampleBrake, ExampleSpeed, Story, WarmGraph, WarmTap } from '../components/steps';
import { buildQuestions } from '../content/brakingDemo';

// Temporary demo lesson for the visual-direction stage:
// intro, two examples, two warm-ups, two build questions, done.
const TOTAL = 7;

export default function Demo() {
  // ?step=N jumps to a screen, handy while designing.
  const { step } = useLocalSearchParams<{ step?: string }>();
  const [i, setI] = useState(Number(step) || 0);
  const next = () => setI((n) => n + 1);
  const p = { index: i, total: TOTAL, onNext: next };

  return (
    <PhoneFrame>
      <Fragment key={i}>
      {i === 0 && <Story {...p} />}
      {i === 1 && <ExampleBrake {...p} />}
      {i === 2 && <ExampleSpeed {...p} />}
      {i === 3 && <WarmGraph {...p} />}
      {i === 4 && <WarmTap {...p} />}
      {i === 5 && <BuildStep {...p} q={buildQuestions[0]} />}
      {i === 6 && <BuildStep {...p} q={buildQuestions[1]} />}
      {i >= 7 && <DoneStep index={TOTAL - 1} total={TOTAL} onRestart={() => setI(0)} />}
      </Fragment>
    </PhoneFrame>
  );
}
