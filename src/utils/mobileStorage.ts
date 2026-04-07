// src/lib/mobileStorage.ts

import { Preferences } from '@capacitor/preferences';

export async function setRefreshToken(token: string) {
  await Preferences.set({ key: 'refresh_token', value: token });
}

export async function getRefreshToken() {
  const { value } = await Preferences.get({ key: 'refresh_token' });
  console.log("[REFRESH TOKEN]: ", value);
  
  return value;
}

export async function clearRefreshToken() {
  await Preferences.remove({ key: 'refresh_token' });
}