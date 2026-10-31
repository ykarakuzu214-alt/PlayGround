/* =========================================================
   AUDIO — procedural chiptune samba + match SFX (WebAudio)
   ========================================================= */

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const TRACKS = {
  title: {
    bpm: 98, swing: 0.04,
    bass: [36, null, null, 43, null, 36, null, 41, 36, null, 43, null, 41, null, 43, null,
           33, null, null, 40, null, 33, null, 38, 33, null, 40, null, 38, null, 40, null],
    lead: [72, null, 76, null, 79, null, 76, null, 74, null, 72, null, 69, null, 72, null,
           69, null, 72, null, 76, null, 79, null, 81, null, 79, null, 76, null, 72, null],
    chord: [[60, 64, 67, 71], null, null, null, null, null, null, null, [57, 60, 64, 67], null, null, null, null, null, null, null,
            [50, 53, 57, 60], null, null, null, null, null, null, null, [55, 59, 62, 65], null, null, null, null, null, null, null],
    kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
    shaker: [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1],
    agogo: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0]
  },
  story: {
    bpm: 82, swing: 0,
    bass: [36, null, null, null, null, null, null, null, 33, null, null, null, null, null, null, null,
           29, null, null, null, null, null, null, null, 31, null, null, null, null, null, null, null],
    lead: [72, null, null, null, 76, null, null, null, 74, null, null, null, 69, null, null, null,
           67, null, null, null, 71, null, null, null, 74, null, null, null, 72, null, null, null],
    chord: [[60, 64, 67, 71], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
           [57, 60, 64, 67], null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    shaker: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0]
  },
  training: {
    bpm: 118, swing: 0.02,
    bass: [41, null, 41, null, 48, null, 41, null, 43, null, 43, null, 50, null, 43, null,
           45, null, 45, null, 52, null, 45, null, 41, null, 41, null, 48, null, 41, null],
    lead: [77, null, 81, null, 84, null, 81, null, 79, null, 77, null, 74, null, 77, null,
           79, null, 81, null, 84, null, 86, null, 84, null, 81, null, 77, null, 74, null],
    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    shaker: [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1]
  },
  match1: {
    bpm: 132, swing: 0.02,
    bass: [36, 36, null, 36, 43, null, 36, null, 36, 36, null, 36, 41, null, 43, null,
           33, 33, null, 33, 40, null, 33, null, 33, 33, null, 33, 38, null, 40, null],
    lead: [72, null, 74, 76, null, 79, null, 76, 74, null, 72, null, 69, 72, null, 74,
           69, null, 72, 74, null, 76, null, 74, 72, null, 69, null, 67, 69, null, null],
    chord: [[60, 64, 67], null, null, null, null, null, null, null, [57, 60, 64], null, null, null, null, null, null, null,
           [53, 57, 60], null, null, null, null, null, null, null, [55, 59, 62], null, null, null, null, null, null, null],
    kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
    snare: [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
    hat: [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0],
    shaker: [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1],
    agogo: [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0]
  },
  match2: {
    bpm: 142, swing: 0.02,
    bass: [36, null, 36, 43, null, 36, 43, null, 36, null, 36, 41, null, 43, 41, null,
           33, null, 33, 40, null, 33, 40, null, 33, null, 33, 38, null, 40, 38, null],
    lead: [72, 74, null, 76, 79, null, 76, 79, 81, null, 79, 76, 74, null, 72, null,
           69, 72, null, 74, 76, null, 79, 81, 84, null, 81, 79, 76, null, 72, null],
    chord: [[60, 64, 67], null, null, null, null, null, null, null, [57, 60, 64], null, null, null, null, null, null, null,
           [53, 57, 60], null, null, null, null, null, null, null, [55, 59, 62], null, null, null, null, null, null, null],
    kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0],
    snare: [0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0],
    hat: [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0],
    shaker: [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1],
    agogo: [0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0]
  },
  matchFinal: {
    bpm: 152, swing: 0.02,
    bass: [33, null, 33, 40, null, 33, 40, 45, 33, null, 33, 40, null, 45, 40, null,
           31, null, 31, 38, null, 31, 38, 43, 31, null, 31, 38, null, 43, 38, null],
    lead: [69, 72, 74, null, 76, 79, null, 81, 79, null, 76, 74, 72, null, 69, 72,
           67, 69, 72, null, 74, 76, null, 79, 76, null, 74, 72, 69, null, 67, null],
    chord: [[57, 60, 64], null, null, null, null, null, null, null, [53, 57, 60], null, null, null, null, null, null, null,
           [55, 59, 62], null, null, null, null, null, null, null, [57, 60, 64], null, null, null, null, null, null, null],
    kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0],
    snare: [0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0],
    hat: [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1],
    shaker: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    agogo: [0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0]
  },
  ending: {
    bpm: 92, swing: 0.03,
    bass: [36, null, null, 43, null, null, 41, null, 36, null, null, 43, null, 41, null, 43,
           33, null, null, 40, null, null, 38, null, 33, null, null, 40, null, 38, null, 40],
    lead: [72, null, 76, null, 79, null, 76, 74, 72, null, 69, null, 72, 74, 76, null,
           69, null, 72, null, 76, null, 79, 81, 79, null, 76, null, 72, null, 69, null],
    chord: [[60, 64, 67, 71], null, null, null, null, null, null, null, [57, 60, 64, 67], null, null, null, null, null, null, null,
           [50, 53, 57, 60], null, null, null, null, null, null, null, [55, 59, 62, 65], null, null, null, null, null, null, null],
    kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    shaker: [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1]
  }
};

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.crowdGain = null;
    this.crowdSource = null;
    this.track = null;
    this.trackStep = 0;
    this.nextNoteTime = 0;
    this.timer = null;
    this.muted = localStorage.getItem('cs10-muted') === '1';
    this.intensity = 1;
  }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.62;
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 18;
    comp.ratio.value = 3.5;
    comp.attack.value = 0.006;
    comp.release.value = 0.22;
    this.master.connect(comp);
    comp.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.42;
    this.musicGain.connect(this.master);
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.9;
    this.sfxGain.connect(this.master);
    this.crowdGain = this.ctx.createGain();
    this.crowdGain.gain.value = 0;
    this.crowdGain.connect(this.master);
    this.buildCrowd();
    this.timer = setInterval(() => this.schedule(), 26);
  }

  unlock() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }

  setMuted(m) {
    this.muted = !!m;
    localStorage.setItem('cs10-muted', this.muted ? '1' : '0');
    if (this.master && this.ctx) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(this.muted ? 0 : 0.62, this.ctx.currentTime + 0.08);
    }
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  playMusic(name) {
    if (!this.ctx || !TRACKS[name]) return;
    if (this.track === name) return;
    this.track = name;
    this.trackStep = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.06;
  }

  stopMusic() {
    this.track = null;
  }

  buildCrowd() {
    if (!this.ctx) return;
    const len = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = last * 0.985 + white * 0.015;
      data[i] = last * 4.5;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const band = this.ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 700;
    band.Q.value = 0.45;
    src.connect(band);
    band.connect(this.crowdGain);
    src.start();
    this.crowdSource = src;
    this.crowdBand = band;
  }

  setCrowd(level) {
    if (!this.ctx || !this.crowdGain) return;
    this.crowdGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.crowdGain.gain.linearRampToValueAtTime(clamp(level, 0, 0.2), this.ctx.currentTime + 0.6);
    if (this.crowdBand) this.crowdBand.frequency.setTargetAtTime(620 + level * 1600, this.ctx.currentTime, 0.8);
  }

  schedule() {
    if (!this.ctx || !this.track) return;
    const t = TRACKS[this.track];
    if (!t || !t.bpm) return;
    const stepDur = 60 / t.bpm / 4;
    while (this.nextNoteTime < this.ctx.currentTime + 0.12) {
      this.scheduleStep(t, this.trackStep, this.nextNoteTime, stepDur);
      this.trackStep = (this.trackStep + 1) % 32;
      this.nextNoteTime += stepDur;
    }
  }

  scheduleStep(t, step, when, stepDur) {
    const swing = t.swing ? (step % 2 === 1 ? t.swing * stepDur : 0) : 0;
    const at = when + swing;
    const idx = step % 32;
    if (t.bass && t.bass[idx] != null) {
      this.tone(mtof(t.bass[idx]), stepDur * 1.55, 'triangle', 0.16, at, 0, this.musicGain);
      this.tone(mtof(t.bass[idx]) / 2, stepDur * 1.1, 'sine', 0.06, at, 0, this.musicGain);
    }
    if (t.lead && t.lead[idx] != null) {
      this.tone(mtof(t.lead[idx]), stepDur * 0.9, 'square', 0.035, at, 0, this.musicGain);
      this.tone(mtof(t.lead[idx]) * 2, stepDur * 0.55, 'triangle', 0.018, at, 0, this.musicGain);
    }
    if (t.chord && t.chord[idx]) {
      for (const n of t.chord[idx]) {
        this.tone(mtof(n), stepDur * 7, 'triangle', 0.014, at, 3, this.musicGain);
        this.tone(mtof(n) * 2, stepDur * 5, 'sine', 0.007, at, 0, this.musicGain);
      }
    }
    if (t.kick && t.kick[idx]) this.kick(at, 0.16, this.musicGain);
    if (t.snare && t.snare[idx]) this.snare(at, 0.055, this.musicGain);
    if (t.hat && t.hat[idx]) this.hat(at, 0.022, this.musicGain);
    if (t.shaker && t.shaker[idx]) this.shaker(at, 0.018, this.musicGain);
    if (t.agogo && t.agogo[idx]) this.agogo(at, step % 4 === 2 ? 780 : 1040, 0.035);
  }

  tone(freq, dur, type, gain, when, detune = 0, dest = this.sfxGain) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, when);
    if (detune) o.detune.setValueAtTime(detune, when);
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(gain, when + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g);
    g.connect(dest);
    o.start(when);
    o.stop(when + dur + 0.02);
  }

  glide(freqA, freqB, dur, type, gain, when = this.ctx.currentTime) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freqA, when);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, freqB), when + dur);
    g.gain.setValueAtTime(gain, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g);
    g.connect(this.sfxGain);
    o.start(when);
    o.stop(when + dur + 0.02);
  }

  noise(dur, gain, type = 'bandpass', freq = 900, q = 1, when = this.ctx.currentTime, dest = this.sfxGain) {
    if (!this.ctx) return;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    src.connect(f); f.connect(g); g.connect(dest);
    src.start(when);
  }

  kick(when = this.ctx.currentTime, gain = 0.2, dest = this.sfxGain) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(130, when);
    o.frequency.exponentialRampToValueAtTime(42, when + 0.13);
    g.gain.setValueAtTime(gain, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.18);
    o.connect(g); g.connect(dest);
    o.start(when); o.stop(when + 0.2);
    this.noise(0.03, gain * 0.4, 'highpass', 1200, 0.7, when, dest);
  }

  snare(when, gain, dest) {
    this.noise(0.09, gain, 'bandpass', 1800, 0.8, when, dest);
    this.tone(180, 0.05, 'triangle', gain * 0.25, when, 0, dest);
  }

  hat(when, gain, dest) {
    this.noise(0.035, gain, 'highpass', 6500, 1.2, when, dest);
  }

  shaker(when, gain, dest) {
    this.noise(0.055, gain, 'highpass', 4800, 0.8, when, dest);
  }

  agogo(when, freq, gain) {
    this.tone(freq, 0.08, 'square', gain * 0.35, when, 0, this.musicGain);
    this.tone(freq * 1.5, 0.06, 'triangle', gain * 0.22, when, 0, this.musicGain);
  }

  /* ---------- SFX ---------- */
  sfx(name) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime + 0.005;
    switch (name) {
      case 'ui':
        this.tone(620, 0.045, 'square', 0.05, now);
        this.tone(880, 0.03, 'square', 0.028, now + 0.03);
        break;
      case 'select':
        this.tone(440, 0.05, 'square', 0.05, now);
        this.tone(660, 0.05, 'square', 0.05, now + 0.055);
        this.tone(990, 0.08, 'square', 0.04, now + 0.11);
        break;
      case 'whistle':
        this.tone(2100, 0.12, 'square', 0.045, now);
        this.tone(2100, 0.12, 'square', 0.045, now + 0.16);
        this.tone(2100, 0.24, 'square', 0.045, now + 0.32);
        break;
      case 'kick':
        this.kick(now, 0.28);
        this.glide(160, 70, 0.1, 'sine', 0.12, now);
        break;
      case 'pass':
        this.tone(720, 0.045, 'triangle', 0.06, now);
        this.noise(0.04, 0.03, 'highpass', 1800, 0.8, now);
        break;
      case 'tackle':
        this.noise(0.1, 0.12, 'lowpass', 700, 0.6, now);
        this.kick(now, 0.2);
        break;
      case 'duel':
        this.glide(220, 880, 0.16, 'sawtooth', 0.04, now);
        this.noise(0.12, 0.05, 'bandpass', 1700, 0.6, now);
        break;
      case 'win-duel':
        [660, 880, 1320].forEach((f, i) => this.tone(f, 0.08, 'square', 0.05, now + i * 0.055));
        break;
      case 'lose-duel':
        [330, 247, 165].forEach((f, i) => this.tone(f, 0.1, 'square', 0.045, now + i * 0.06));
        break;
      case 'shot':
        this.noise(0.08, 0.09, 'highpass', 900, 0.7, now);
        this.glide(240, 520, 0.08, 'triangle', 0.08, now);
        break;
      case 'save':
        this.noise(0.14, 0.12, 'lowpass', 900, 0.5, now);
        this.tone(220, 0.12, 'triangle', 0.06, now);
        break;
      case 'goal':
        this.goalRoar();
        break;
      case 'special':
        [440, 554, 659, 880, 1109, 1319].forEach((f, i) => this.tone(f, 0.13, 'square', 0.045, now + i * 0.045));
        this.noise(0.5, 0.08, 'bandpass', 2400, 0.5, now + 0.1);
        break;
      case 'impact':
        this.kick(now, 0.34);
        this.noise(0.2, 0.15, 'lowpass', 1500, 0.5, now);
        [523, 659, 784].forEach((f, i) => this.tone(f, 0.18, 'square', 0.04, now + 0.04 + i * 0.02));
        break;
      case 'unlock':
        [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, 0.12, 'triangle', 0.06, now + i * 0.07));
        break;
      case 'win':
        [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.24, 'square', 0.06, now + i * 0.11));
        this.noise(0.6, 0.08, 'bandpass', 1800, 0.6, now + 0.2);
        break;
      case 'lose':
        [392, 349, 311, 262, 196].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.06, now + i * 0.13));
        break;
      case 'crowd':
        this.setCrowd(0.12);
        this.setCrowd(0.06);
        break;
      case 'heartbeat':
        this.kick(now, 0.18); this.kick(now + 0.22, 0.12);
        break;
      default:
        break;
    }
  }

  goalRoar() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.setCrowd(0.2);
    setTimeout(() => this.setCrowd(0.075), 1600);
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.5, 'square', 0.045, now + i * 0.07));
    this.noise(0.9, 0.18, 'bandpass', 1400, 0.5, now);
    this.kick(now, 0.28);
  }
}
