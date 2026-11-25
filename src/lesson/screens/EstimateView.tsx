// Estimate: drag the ruler to a guess (the figure does not follow it), then Check. One try.
// After Check the figure turns into its "after" state (the truth plays), the true value drops onto the ruler in green
// with the tolerance band around it. Within the band: "Correct!"; otherwise the truth is shown
// (honest outcome from estimateOutcome: a near miss in the story counts as assisted).
import { useState } from 'react';
import type { EstimateScreen } from '@/content/types';
import { Sheet } from '@/figures/Sheet';
import { fixed, sig } from '@/physics/format';
import { estimateOutcome, type Outcome, type Phase } from '@/session/logic';
import { feedback } from '@/ui/feedback';
import { useRightSound } from '../puzzle';
import { MainButton, VerdictSheet, type Verdict } from '@/ui/parts';
import { Slider } from '@/ui/Slider';
import { Frame } from '../Frame';
import { Instruction, Prompt } from '../text';

type Props = { screen: EstimateScreen; figN: number; phase: Phase; onOutcome: (o: Outcome) => void; onWrong: (id: string) => void; onNext: () => void };

const NB = ' ';

/** "471 J", "35°": the unit stays with the number. */
function withUnit(text: string, unit: string): string {
  return unit === '°' ? `${text}°` : `${text}${NB}${unit.replaceAll(' ', NB)}`;
}

export function EstimateView({ screen, figN, phase, onOutcome, onWrong, onNext }: Props) {
  const playRight = useRightSound(screen.id);
  const sc = screen.scale;
  const mid = Math.round((sc.min + sc.max) / 2 / sc.step) * sc.step;
  const [guess, setGuess] = useState(Number(mid.toFixed(6)));
  const [moved, setMoved] = useState(false);
  const [result, setResult] = useState<Outcome | null>(null);
  const checked = result !== null;

  const said = withUnit(fixed(guess, sc.dp), sc.unit);
  const truth = withUnit(sig(screen.answer, 3), sc.unit);

  const check = () => {
    const o = estimateOutcome(guess, screen.answer, screen.tolerance, phase);
    if (o === 'independent') playRight();
    else {
      feedback.wrong();
      onWrong(String(guess));
    }
    onOutcome(o);
    setResult(o);
  };

  let verdict: Verdict | null = null;
  if (result === 'independent') verdict = { tone: 'ok', title: 'Correct!', text: `Close: you said ${said}, it is ${truth}.`, why: screen.why };
  else if (result) verdict = { tone: 'bad', title: result === 'assisted' ? 'Nearly' : 'Not quite', text: `You said ${said}, it is ${truth}.`, why: screen.why };

  return (
    <Frame
      fig={<Sheet fig={checked ? screen.after : screen.fig} n={figN} />}
      footer={<MainButton label="Check" onPress={check} disabled={!moved || checked} />}
      sheet={verdict ? <VerdictSheet verdict={verdict} button={{ label: 'Continue', onPress: onNext }} /> : null}
    >
      <Prompt>{screen.prompt}</Prompt>
      <Instruction>Drag the slider to your estimate, then Check.</Instruction>
      <Slider
        value={guess}
        min={sc.min}
        max={sc.max}
        step={sc.step}
        tick={sc.tick}
        label={sc.label}
        format={(v) => `${sc.symbol} = ${withUnit(fixed(v, sc.dp), sc.unit)}`}
        formatEnd={(v) => withUnit(fixed(v, 0), sc.unit)}
        disabled={checked}
        truth={checked ? { value: screen.answer, band: screen.tolerance, label: `${sc.symbol} = ${truth}` } : undefined}
        onChange={(v) => {
          feedback.step((v - sc.min) / (sc.max - sc.min));
          setGuess(v);
          setMoved(true);
        }}
      />
    </Frame>
  );
}
