// ---------------------------------------------------------------------------
// Tiny chiptune + SFX engine (WebAudio, no assets).
// ---------------------------------------------------------------------------

const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

const PATTERNS = {
  title: {
    bpm: 104, gain: 0.16,
    lead: [
      72, null, 76, null, 79, null, 76, null,
      74, null, 77, null, 81, null, 77, null,
      72, null, 76, null, 79, 81, 79, 76,
      74, 72, 69, null, 67, null, 72, null
    ],
    bass: [48, null, null, null, 48, null, 43, null, 48, null, null, null, 43, null, 45, null],
    hat: 1
  },
  story: {
    bpm: 76, gain: 0.12,
    lead: [
      64, null, null, null, 67, null, 71, null,
      69, null, null, null, 64, null, 62, null,
      60, null, null, null, 64, null, 67, null,
      62, null, 59, null, 64, null, null, null
    ],
    bass: [40, null, null, null, 40, null, null, null, 45, null, null, null, 43, null, null, null],
    hat: 0
  },
  match: {
    bpm: 136, gain: 0.16,
    lead: [
      69, null, 72, 69, 76, null, 72, 69,
      67, null, 71, 67, 74, null, 71, 67,
      69, 72, 76, 79, 76, 72, 69, 72,
      67, 71, 74, 79, null, 76, 72, 67
    ],
    bass: [
      45, null, 45, null, 52, null, 45, null,
      43, null, 43, null, 50, null, 43, null,
      45, null, 45, null, 52, null, 57, null,
      43, null, 50, null, 43, null, 45, null
    ],
    hat: 1
  },
  final: {
    bpm: 148, gain: 0.17,
    lead: [
      62, null, 65, 69, 74, 69, 65, 62,
      60, null, 64, 67, 72, 67, 64, 60,
      58, null, 62, 65, 70, 65, 62, 58,
      60, 64, 67, 72, 76, 72, 67, 64
    ],
    bass: [
      38, null, 38, 38, 45, null, 38, null,
      36, null, 36, 36, 43, null, 36, null,
      34, null, 34, 34, 41, null, 34, null,
      36, null, 43, null, 36, null, 38, null
    ],
    hat: 1
  }
};

export class GameAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.crowdGain = null;
    this.crowdSource = null;
    this.timer = null;
    this.pattern = null;
    this.step = 0;
    this.nextTime = 0;
    this.muted = false;
    try { this.muted = localStorage.getItem('cs_ss_muted') === '1'; } catch {}
    this.started = false;
  }

  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.55;
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0;
      this.musicGain.connect(this.master);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.9;
      this.sfxGain.connect(this.master);
      this.crowdGain = this.ctx.createGain();
      this.crowdGain.gain.value = 0;
      this.crowdGain.connect(this.master);
      this.makeNoise();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.started = true;
    return true;
  }

  makeNoise() {
    const len = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
    this.noiseBuffer = buffer;
  }

  setMuted(m) {
    this.muted = m;
    try { localStorage.setItem('cs_ss_muted', m ? '1' : '0'); } catch {}
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(m ? 0 : 0.55, this.ctx.currentTime, 0.02);
    }
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  tone(freq, dur, type = 'square', vol = 0.2, when = null, slide = null) {
    if (!this.ctx) return;
    const t = when ?? this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    osc.connect(g).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  noise(dur, vol = 0.2, when = null, filterFreq = 1200, type = 'bandpass') {
    if (!this.ctx) return;
    const t = when ?? this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = filterFreq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    src.connect(f).connect(g).connect(this.sfxGain);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  sfx(name) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    switch (name) {
      case 'blip': this.tone(880, 0.045, 'square', 0.05); break;
      case 'select': this.tone(660, 0.05, 'square', 0.07); this.tone(990, 0.04, 'square', 0.05, t + 0.05); break;
      case 'confirm': this.tone(660, 0.07, 'square', 0.09); this.tone(880, 0.09, 'square', 0.09, t + 0.07); this.tone(1320, 0.12, 'square', 0.07, t + 0.15); break;
      case 'back': this.tone(440, 0.07, 'square', 0.06); this.tone(330, 0.08, 'square', 0.06, t + 0.06); break;
      case 'kick':
        this.noise(0.09, 0.28, t, 900, 'lowpass');
        this.tone(150, 0.09, 'sine', 0.28, t, 60);
        break;
      case 'pass': this.noise(0.05, 0.12, t, 1800); break;
      case 'tackle': this.noise(0.16, 0.3, t, 500, 'lowpass'); this.tone(90, 0.12, 'sawtooth', 0.12, t, 45); break;
      case 'save': this.noise(0.12, 0.24, t, 700); this.tone(220, 0.1, 'square', 0.08, t, 120); break;
      case 'whistle':
        this.tone(2200, 0.14, 'square', 0.1, t, 2400);
        this.tone(2200, 0.22, 'square', 0.1, t + 0.18, 2000);
        break;
      case 'goal':
        this.noise(0.7, 0.3, t, 600, 'lowpass');
        [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.18, 'square', 0.12, t + i * 0.08));
        this.tone(1319, 0.5, 'square', 0.09, t + 0.36);
        this.cheer(0.5);
        break;
      case 'special':
        [330, 440, 554, 659, 880, 1109].forEach((f, i) => this.tone(f, 0.09, 'square', 0.08, t + i * 0.05));
        this.noise(0.4, 0.15, t, 1600);
        break;
      case 'win':
        [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.24, 'square', 0.1, t + i * 0.13));
        break;
      case 'lose':
        [392, 349, 311, 262].forEach((f, i) => this.tone(f, 0.28, 'triangle', 0.1, t + i * 0.17));
        break;
      case 'tick': this.tone(1200, 0.03, 'square', 0.04); break;
      default: break;
    }
  }

  cheer(intensity = 0.4) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 900;
    f.Q.value = 0.6;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(intensity, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
    src.connect(f).connect(g).connect(this.sfxGain);
    src.start(t);
    src.stop(t + 1.5);
  }

  startMusic(name) {
    if (!this.ctx) return;
    const pat = PATTERNS[name];
    if (!pat) return;
    this.stopMusic();
    this.pattern = pat;
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.08;
    this.musicGain.gain.setTargetAtTime(pat.gain, this.ctx.currentTime, 0.2);
    this.timer = setInterval(() => this.schedule(), 60);
    this.schedule();
  }

  schedule() {
    if (!this.ctx || !this.pattern) return;
    const pat = this.pattern;
    const stepDur = 60 / pat.bpm / 4;
    while (this.nextTime < this.ctx.currentTime + 0.25) {
      const i = this.step % pat.lead.length;
      const lead = pat.lead[i];
      const bass = pat.bass[i % pat.bass.length];
      const t = this.nextTime;
      if (lead) this.musicTone(midi(lead), stepDur * 1.5, 'square', 0.16, t);
      if (bass) this.musicTone(midi(bass), stepDur * 2.4, 'triangle', 0.2, t);
      if (pat.hat && i % 2 === 0) this.musicNoise(0.035, 0.035, t, 6000, 'highpass');
      if (pat.hat && i % 8 === 4) this.musicNoise(0.08, 0.05, t, 3000);
      this.nextTime += stepDur;
      this.step++;
    }
  }

  musicTone(freq, dur, type, vol, t) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g).connect(this.musicGain);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  musicNoise(dur, vol, t, freq, type = 'bandpass') {
    if (!this.ctx) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f).connect(g).connect(this.musicGain);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  stopMusic() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.pattern = null;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    }
  }

  startCrowd() {
    if (!this.ctx) return;
    if (this.crowdSource) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 520;
    f.Q.value = 0.4;
    src.connect(f).connect(this.crowdGain);
    src.start();
    this.crowdSource = src;
    this.crowdGain.gain.setTargetAtTime(0.05, this.ctx.currentTime, 0.5);
  }

  stopCrowd() {
    if (this.crowdGain && this.ctx) this.crowdGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
    if (this.crowdSource) {
      try { this.crowdSource.stop(this.ctx.currentTime + 0.6); } catch {}
      this.crowdSource = null;
    }
  }
}

export const audio = new GameAudio();
