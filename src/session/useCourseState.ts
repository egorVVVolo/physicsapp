// Everything the tabs show about the learner, loaded from the device each time a tab comes into view:
// finished lessons, where each lesson was left, the latest run of each, the streak and the profile.
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { lessons } from '@/content/lessons';
import type { Run } from './logic';
import { readyRefs, type Saved } from './progress';
import { sameData } from './same';
import { emptyProfile, loadFinishedLessons, loadProfile, loadProgress, loadReview, loadRuns, loadStreak, type Profile } from './storage';
import type { Queue } from '@/practice/review';
import { emptyStreak, type Streak } from './streak';

export type CourseState = {
  loaded: boolean;
  /** Lessons finished at least once. */
  finished: Set<string>;
  /** Lessons with saved progress that are not finished now (started, or being replayed). */
  started: Set<string>;
  saved: Record<string, Saved>;
  lastRuns: Record<string, Run | undefined>;
  streak: Streak;
  profile: Profile;
  /** The spaced-review queue. */
  review: Queue;
};

const empty: CourseState = { loaded: false, finished: new Set(), started: new Set(), saved: {}, lastRuns: {}, streak: emptyStreak, profile: emptyProfile, review: {} };

/** What the last tab loaded: a tab opened for the first time draws it at once instead of popping in a moment later. */
let last: CourseState = empty;

export function useCourseState(): CourseState {
  const [state, setState] = useState<CourseState>(last);
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const [ever, streak, profile, review] = await Promise.all([loadFinishedLessons(), loadStreak(), loadProfile(), loadReview()]);
        const saved: Record<string, Saved> = {};
        const lastRuns: Record<string, Run | undefined> = {};
        await Promise.all(
          readyRefs.map(async ({ r }) => {
            const [p, runs] = await Promise.all([loadProgress(lessons[r.id]), loadRuns(r.id)]);
            if (p) saved[r.id] = { index: p.state.index, finished: p.state.finished };
            lastRuns[r.id] = runs[runs.length - 1];
          }),
        );
        const finished = new Set([...ever, ...Object.entries(saved).filter(([, s]) => s.finished).map(([id]) => id)]);
        const started = new Set(Object.entries(saved).filter(([, s]) => !s.finished && s.index > 0).map(([id]) => id));
        const next: CourseState = { loaded: true, finished, started, saved, lastRuns, streak, profile, review };
        if (!alive) return;
        last = next;
        // nothing new: keep the old object, so coming back to a tab does not redraw it
        setState((now) => (sameData(now, next) ? now : next));
      })();
      return () => {
        alive = false;
      };
    }, []),
  );
  return state;
}
