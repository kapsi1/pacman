// @ts-ignore
import dot1Url from 'url:../assets/sounds/pacdot1.wav';
// @ts-ignore
import dot2Url from 'url:../assets/sounds/pacdot2.wav';
// @ts-ignore
import sirenUrl from 'url:../assets/sounds/pacghost1.wav';
// @ts-ignore
import powerPelletUrl from 'url:../assets/sounds/pacghostblue.wav';
// @ts-ignore
import energizerUrl from 'url:../assets/sounds/paccoin.wav';
// @ts-ignore
import eatGhostUrl from 'url:../assets/sounds/pacghosteat.wav';
// @ts-ignore
import deathUrl from 'url:../assets/sounds/pacclass2die.wav';
// @ts-ignore
import retreatUrl from 'url:../assets/sounds/pacghostretreat.wav';
// @ts-ignore
import startUrl from 'url:../assets/sounds/pacstart.wav';

const sounds: { [key: string]: HTMLAudioElement } = {};
let initialized = false;

const soundFiles = {
  dot1: dot1Url,
  dot2: dot2Url,
  siren: sirenUrl,
  powerPellet: powerPelletUrl,
  energizer: energizerUrl,
  eatGhost: eatGhostUrl,
  death: deathUrl,
  retreat: retreatUrl,
  start: startUrl,
};

export function initSounds() {
  if (initialized) return;
  for (const [key, path] of Object.entries(soundFiles)) {
    sounds[key] = new Audio(path as string);
  }
  // Setup loops for background sounds
  if (sounds.siren) sounds.siren.loop = true;
  if (sounds.powerPellet) sounds.powerPellet.loop = true;
  if (sounds.retreat) sounds.retreat.loop = true;
  initialized = true;
}

export function playSound(name: keyof typeof soundFiles) {
  const sound = sounds[name];
  if (!sound) return;
  
  if (sound.loop) {
    if (sound.paused) sound.play().catch(() => {});
  } else {
    // For non-looping sounds, clone or reset to allow Rapid firing
    const clone = sound.cloneNode() as HTMLAudioElement;
    clone.play().catch(() => {});
  }
}

export function stopSound(name: keyof typeof soundFiles) {
  const sound = sounds[name];
  if (sound) {
    sound.pause();
    sound.currentTime = 0;
  }
}

export function stopAllBackgroundSounds() {
  stopSound('siren');
  stopSound('powerPellet');
  stopSound('retreat');
}
