import React, { useState } from 'react';
import { PhoneFrame } from '../components/stepParts';
import { DoneStep, IntroBrake, IntroSpeed, QuestionStep } from '../components/steps';
import { questions } from '../content/brakingDemo';
import { colors } from '../theme/tokens';

// Temporary demo lesson for the visual-direction stage: 2 intro screens, 3 questions, done.
const TOTAL = 5;

export default function Demo() {
  const [i, setI] = useState(0);
  const next = () => setI((n) => n + 1);

  return (
    <PhoneFrame background={colors.background}>
      {i === 0 && <IntroBrake key={i} index={i} total={TOTAL} onNext={next} />}
      {i === 1 && <IntroSpeed key={i} index={i} total={TOTAL} onNext={next} />}
      {i >= 2 && i < 2 + questions.length && <QuestionStep key={i} q={questions[i - 2]} index={i} total={TOTAL} onNext={next} />}
      {i >= 2 + questions.length && <DoneStep onRestart={() => setI(0)} />}
    </PhoneFrame>
  );
}
