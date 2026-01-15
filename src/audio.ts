import dot1Url from 'url:../assets/sounds/pacdot1.wav';
import dot2Url from 'url:../assets/sounds/pacdot2.wav';
import sirenUrl from 'url:../assets/sounds/pacghost1.wav';
import powerPelletUrl from 'url:../assets/sounds/pacghostblue.wav';
import energizerUrl from 'url:../assets/sounds/paccoin.wav';
import eatGhostUrl from 'url:../assets/sounds/pacghosteat.wav';
import deathUrl from 'url:../assets/sounds/pacclass2die.wav';
import retreatUrl from 'url:../assets/sounds/pacghostretreat.wav';
import startUrl from 'url:../assets/sounds/pacstart.wav';


const sounds: { [key: string]: HTMLAudioElement } = {};
let initialized = false;
let isMuted = false;

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
    sounds[key].muted = isMuted;
  }
  // Setup loops for background sounds
  if (sounds.siren) sounds.siren.loop = true;
  if (sounds.powerPellet) sounds.powerPellet.loop = true;
  if (sounds.retreat) sounds.retreat.loop = true;
  initialized = true;
}

const loopableSounds = ['siren', 'powerPellet', 'retreat'];

export function setMuted(muted: boolean) {
  isMuted = muted;
  for (const [name, sound] of Object.entries(sounds)) {
    if (loopableSounds.includes(name)) {
      sound.muted = muted;
    }
  }
}

export function getMuted() {
  return isMuted;
}

export function playSound(name: keyof typeof soundFiles, forceMute: boolean = false): HTMLAudioElement | null {
  const sound = sounds[name];
  if (!sound) return null;
  
  if (sound.loop) {
    if (isMuted) return null;
    if (sound.paused) sound.play().catch(() => {});
    return sound;
  } else {
    // For non-looping sounds, clone or reset to allow Rapid firing
    const clone = sound.cloneNode() as HTMLAudioElement;
    clone.muted = forceMute;
    clone.play().catch(() => {});
    return clone;
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

