import { Preferences } from "@capacitor/preferences";

const SWIPE_HINT_KEY = "has_seen_swipe_hint";

export async function hasSeenSwipeHint(): Promise<boolean> {
  const { value } = await Preferences.get({ key: SWIPE_HINT_KEY });
  return value === "true";
}

export async function markSwipeHintSeen() {
  await Preferences.set({
    key: SWIPE_HINT_KEY,
    value: "true",
  });
}