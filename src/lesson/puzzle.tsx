// The "puzzle solved" moment (E2): when the question that solves the lesson's puzzle is answered right, the sheet's
// frame flashes in the level's colour, a PUZZLE SOLVED chip sits on its edge and the reveal sound plays instead of the
// plain "right". Once per lesson. The lesson player owns the state; graded views and sheets read it from here.
import { createContext, useContext } from 'react';
import { feedback } from '@/ui/feedback';

export type PuzzleMoment = {
  /** The question that solves the puzzle. */
  screenId: string;
  /** True on the screen where the moment is playing. */
  solved: boolean;
  /** The level's colour, for the frame and the chip. */
  color: string;
  /** Starts the moment; false when it has already played in this lesson. */
  fire: () => boolean;
};

export const PuzzleContext = createContext<PuzzleMoment | null>(null);

/** What a graded view calls when its answer is right: the puzzle's moment the first time, the plain sound otherwise. */
export function useRightSound(screenId: string): () => void {
  const puzzle = useContext(PuzzleContext);
  return () => {
    if (puzzle && puzzle.screenId === screenId && puzzle.fire()) feedback.solved();
    else feedback.right();
  };
}
