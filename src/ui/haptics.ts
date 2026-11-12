// Short vibrations on the phone: a light tick when you pick an answer, a "success" or "error" buzz
// when an answer is checked. Nothing happens on the web, and a phone without haptics simply stays still.
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const on = Platform.OS === 'ios' || Platform.OS === 'android';
const quiet = (p: Promise<void>) => p.catch(() => {});

export const haptic = {
  /** An answer card or a part of a figure was picked. */
  pick: () => on && quiet(Haptics.selectionAsync()),
  /** The checked answer is right. */
  right: () => on && quiet(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  /** The checked answer is wrong. */
  wrong: () => on && quiet(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
