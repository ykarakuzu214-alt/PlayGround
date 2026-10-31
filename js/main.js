/* =========================================================
   MAIN — title, story, training, match flow, saves & loop
   ========================================================= */

import { Renderer } from './renderer.js';
import { Input } from './input.js';
import { AudioEngine } from './audio.js';
import { CHAPTERS, SAVE_KEY } from './story.js';
import { drawPortrait, clamp } from './pixel.js';
import { Match } from './match.js';

const $ = (id) => document.getElementById(id);
const STAT_KEYS = ['pace', 'technique', 'power', 'flair'];
const ZERO_STATS = () => ({ pace: 0, technique: 0, power: 0, flair: 0 });

class Game {
  constructor() {
    this.canvas = $('game');
    this.renderer = new Renderer(this.canvas);
    this.input = new Input();
    this.audio = new AudioEngine();
    this.fadeEl = $('fade');
    this.time = 0;
    this.last = 0;

    this.mode = 'title';
    this.screen = 'title';
    this.storyBg = 'beach_sunset';
    this.chapterIndex = 0;
    this.chapter = CHAPTERS[0];
    this.storyPhase = 'pre';
    this.storyQueue = [];
    this.storyIndex = 0;
    this.currentBeat = null;
    this.choiceOpen = false;
    this.revealText = '';
    this.revealCount = 0;
    this.revealT = 0;
    this.match = null;
    this.training = null;
    this.trainingResult = null;
    this.bonus = ZERO_STATS();
    this.lastResult = null;
    this.music = null;

    this.save = this.loadSave();
    this.el = {
      titleMenu: $('title-menu'),
      btnContinue: $('btn-continue'),
      btnChapters: $('btn-chapters'),
      btnSound: $('btn-sound'),
      storyChip: $('story-chapter-chip'),
      speakerCard: $('speaker-card'),
      speakerName: $('speaker-name'),
      speakerRole: $('speaker-role'),
      portrait: $('portrait'),
      dialoguePanel: $('dialogue-panel'),
      dialogueText: $('dialogue-text'),
      dialogueChoices: $('dialogue-choices'),
      dialogueHint: $('dialogue-hint'),
      advanceCue: $('advance-cue'),
      toastLayer: $('toast-layer'),
      rotateNote: $('rotate-note')
    };

    document.body.dataset.touch = this.input.isTouch ? 'true' : 'false';
    document.body.dataset.screen = 'title';
    this.bindEvents();
    this.updateSoundUI();
    this.updateTitleMenu();

    this.input.onFirstGesture = () => {
      this.audio.unlock();
      if (this.music) this.audio.playMusic(this.music);
    };
    this.setMusic('title');

    if (this.input.isTouch && window.innerHeight > window.innerWidth) {
      setTimeout(() => { if (this.screen === 'title') this.el.rotateNote.hidden = false; }, 1400);
    }

    this.last = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  /* ------------------------------------------------------------------ */
  /* SAVE                                                                */
  /* ------------------------------------------------------------------ */

  loadSave() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch { s = null; }
    if (!s || typeof s !== 'object') return { unlocked: 1, completed: [], nextChapter: 0 };
    return {
      unlocked: clamp(Number(s.unlocked) || 1, 1, CHAPTERS.length),
      completed: Array.isArray(s.completed) ? s.completed.filter((x) => typeof x === 'string') : [],
      nextChapter: clamp(Number(s.nextChapter) || 0, 0, CHAPTERS.length - 1)
    };
  }

  persist() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.save)); } catch { /* storage is optional */ }
  }

  resetSave() {
    this.save = { unlocked: 1, completed: [], nextChapter: 0 };
    this.persist();
    this.updateTitleMenu();
  }

  updateTitleMenu() {
    const hasProgress = this.save.completed.length > 0 || this.save.nextChapter > 0;
    this.el.btnContinue.hidden = !hasProgress;
    this.el.btnChapters.hidden = this.save.unlocked < 2 && this.save.completed.length === 0;
  }

  /* ------------------------------------------------------------------ */
  /* SCREENS & AUDIO                                                     */
  /* ------------------------------------------------------------------ */

  showScreen(name, mode) {
    for (const s of document.querySelectorAll('.screen')) {
      s.hidden = s.id !== `screen-${name}`;
    }
    this.screen = name;
    this.mode = mode || (
      name === 'title' ? 'title'
        : name === 'story' ? 'story'
          : name === 'training' ? 'training'
            : name === 'match' ? 'match' : 'sheet'
    );
    document.body.dataset.screen = name;
    if (name !== 'title') this.el.rotateNote.hidden = true;
  }

  setMusic(name) {
    this.music = name;
    if (this.audio.ctx) this.audio.playMusic(name);
  }

  toggleSound() {
    this.audio.unlock();
    this.audio.toggleMute();
    this.updateSoundUI();
    if (this.audio.ctx && !this.audio.muted && this.music) this.audio.playMusic(this.music);
    this.audio.sfx('ui');
  }

  updateSoundUI() {
    const muted = this.audio.muted;
    if (this.el.btnSound) this.el.btnSound.innerHTML = muted ? 'SOUND: OFF' : 'SOUND: ON';
    for (const id of ['story-sound', 'match-sound']) {
      const el = $(id);
      if (el) el.style.opacity = muted ? '0.38' : '1';
    }
  }

  toast(text, kind = '') {
    const div = document.createElement('div');
    div.className = `toast ${kind}`;
    const [head, ...rest] = text.split('|');
    div.innerHTML = rest.length ? `<b>${head}</b><span>${rest.join('|')}</span>` : `<span>${head}</span>`;
    this.el.toastLayer.appendChild(div);
    setTimeout(() => {
      div.classList.add('out');
      setTimeout(() => div.remove(), 320);
    }, 3200);
  }

  transition(fn) {
    this.fadeEl.classList.add('show');
    setTimeout(() => {
      fn();
      setTimeout(() => this.fadeEl.classList.remove('show'), 80);
    }, 240);
  }

  /* ------------------------------------------------------------------ */
  /* EVENTS                                                              */
  /* ------------------------------------------------------------------ */

  bindEvents() {
    document.querySelectorAll('[data-menu]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.audio.sfx('ui');
        const what = btn.dataset.menu;
        if (what === 'new') this.newGame();
        else if (what === 'continue') this.continueGame();
        else if (what === 'chapters') this.openChapters();
        else if (what === 'howto') this.openSheet('howto');
        else if (what === 'sound') this.toggleSound();
      });
    });

    document.querySelectorAll('[data-close]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.audio.sfx('ui');
        this.showScreen('title', 'title');
        this.setMusic('title');
      });
    });

    $('story-sound')?.addEventListener('click', () => this.toggleSound());
    $('story-skip')?.addEventListener('click', () => this.skipStory());
    $('story-log')?.addEventListener('click', () => this.showStoryLog());

    this.el.dialoguePanel.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      this.advanceStory();
    });

    this.el.dialogueChoices.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-choice]');
      if (!btn) return;
      this.chooseOption(Number(btn.dataset.choice));
    });

    $('chapter-list').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-chapter]');
      if (!btn || btn.disabled) return;
      this.audio.sfx('select');
      this.startChapter(Number(btn.dataset.chapter));
    });

    $('prematch-kick').addEventListener('click', () => {
      this.audio.sfx('select');
      this.startMatch();
    });
    $('prematch-back').addEventListener('click', () => this.quitToTitle());
    $('prematch-title-btn').addEventListener('click', () => this.quitToTitle());

    $('result-continue').addEventListener('click', () => this.continueAfterResult());
    $('result-retry').addEventListener('click', () => {
      this.audio.sfx('select');
      this.startMatch();
    });
    $('result-title').addEventListener('click', () => this.quitToTitle());

    $('progress-next').addEventListener('click', () => this.progressNext());
    $('credits-done').addEventListener('click', () => {
      this.audio.sfx('select');
      this.startTitle();
    });

    $('training-hit').addEventListener('click', () => this.hitTraining());
    $('training-meter')?.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.hitTraining();
    });
    $('training-skip').addEventListener('click', () => this.skipTraining());

    $('rotate-close').addEventListener('click', () => { this.el.rotateNote.hidden = true; });

    window.addEventListener('resize', () => {
      if (this.input.isTouch && window.innerHeight > window.innerWidth && this.screen === 'title') {
        this.el.rotateNote.hidden = false;
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* TITLE / CHAPTER SELECT                                              */
  /* ------------------------------------------------------------------ */

  startTitle() {
    this.destroyMatch();
    this.training = null;
    this.lastResult = null;
    this.chapterIndex = 0;
    this.chapter = CHAPTERS[0];
    this.bonus = ZERO_STATS();
    this.trainingResult = null;
    this.updateTitleMenu();
    this.showScreen('title', 'title');
    this.storyBg = 'beach_sunset';
    this.setMusic('title');
    this.audio.setCrowd(0);
  }

  newGame() {
    this.resetSave();
    this.transition(() => this.startChapter(0));
  }

  continueGame() {
    const idx = clamp(this.save.nextChapter ?? 0, 0, CHAPTERS.length - 1);
    this.transition(() => this.startChapter(idx));
  }

  openChapters() {
    const list = $('chapter-list');
    list.innerHTML = CHAPTERS.map((ch, i) => {
      const unlocked = i < this.save.unlocked;
      const done = this.save.completed.includes(ch.id);
      return `
        <button type="button" class="chapter-item" data-chapter="${i}" ${unlocked ? '' : 'disabled'}>
          <span class="chapter-num">${ch.num}</span>
          <span class="chapter-info">
            <b>${ch.title}</b>
            <small>${ch.location} &middot; ${ch.year}</small>
          </span>
          <span class="chapter-status ${unlocked ? '' : 'locked'}">${done ? 'COMPLETE' : unlocked ? 'PLAY' : 'LOCKED'}</span>
        </button>`;
    }).join('');
    this.showScreen('chapters', 'title');
    this.setMusic('title');
  }

  openSheet(name) {
    this.showScreen(name, 'title');
    this.setMusic('title');
  }

  /* ------------------------------------------------------------------ */
  /* STORY                                                               */
  /* ------------------------------------------------------------------ */

  startChapter(index) {
    this.destroyMatch();
    this.chapterIndex = clamp(index, 0, CHAPTERS.length - 1);
    this.chapter = CHAPTERS[this.chapterIndex];
    this.bonus = ZERO_STATS();
    this.trainingResult = null;
    this.training = null;
    this.storyPhase = 'pre';
    this.storyQueue = this.chapter.pre;
    this.storyIndex = 0;
    this.el.storyChip.textContent = `CHAPTER ${this.chapter.num} \u00b7 ${this.chapter.title}`;
    this.mode = 'story';
    this.showScreen('story', 'story');
    this.storyBg = this.storyQueue[0]?.bg || 'beach_sunset';
    this.showStoryBeat(0);
    this.setMusic('story');
    this.save.nextChapter = this.chapterIndex;
    this.persist();
  }

  showStoryBeat(index) {
    this.storyIndex = index;
    if (index >= this.storyQueue.length) {
      this.storyFinished();
      return;
    }
    const beat = this.storyQueue[index];
    if (beat.type === 'match') {
      this.beginTraining();
      return;
    }

    this.currentBeat = beat;
    this.storyBg = beat.bg || this.storyBg;
    this.mode = 'story';
    this.choiceOpen = beat.type === 'choice';

    const text = beat.type === 'choice' ? beat.prompt : beat.text;
    this.revealText = text || '';
    this.revealCount = 0;
    this.revealT = 0;
    this.el.dialogueText.textContent = '';
    this.el.dialogueChoices.hidden = true;
    this.el.dialogueChoices.innerHTML = '';
    this.el.advanceCue.classList.remove('off');

    if (beat.speaker && beat.portrait) {
      this.el.speakerCard.style.visibility = 'visible';
      this.el.speakerName.textContent = beat.speaker;
      this.el.speakerRole.textContent = beat.role || '';
      drawPortrait(this.el.portrait, beat.portrait, beat.expr || 'neutral');
    } else {
      this.el.speakerCard.style.visibility = 'hidden';
    }

    this.el.dialogueHint.textContent = beat.type === 'choice'
      ? 'CHOOSE WITH 1 \u00b7 2 \u00b7 3 OR CLICK'
      : this.input.isTouch ? 'TAP TO CONTINUE' : 'CLICK / SPACE TO CONTINUE';

    if (beat.type === 'choice') {
      this.el.dialogueChoices.hidden = false;
      this.el.dialogueChoices.innerHTML = beat.options.map((opt, i) => `
        <button type="button" class="choice-btn" data-choice="${i}">
          <span class="choice-key">${i + 1}</span>
          <span>${opt.label}</span>
        </button>`).join('');
      this.el.advanceCue.classList.add('off');
    }
  }

  advanceStory() {
    if (this.screen !== 'story' || this.choiceOpen) return;
    if (this.revealCount < this.revealText.length) {
      this.revealCount = this.revealText.length;
      this.el.dialogueText.textContent = this.revealText;
      return;
    }
    this.audio.sfx('ui');
    this.showStoryBeat(this.storyIndex + 1);
  }

  chooseOption(index) {
    const beat = this.currentBeat;
    if (!beat || beat.type !== 'choice' || beat.resolved) return;
    const opt = beat.options[index];
    if (!opt) return;
    beat.resolved = true;
    this.choiceOpen = false;
    this.applyBonus(opt.effect);
    this.el.dialogueChoices.hidden = true;
    this.el.dialogueChoices.innerHTML = '';
    this.audio.sfx('select');
    const reply = { bg: beat.bg, text: opt.reply, speaker: '', role: '' };
    this.storyQueue.splice(this.storyIndex + 1, 0, reply);
    this.toast('CHOICE|' + opt.label, 'green');
    this.showStoryBeat(this.storyIndex + 1);
  }

  applyBonus(effect) {
    if (!effect) return;
    for (const [k, v] of Object.entries(effect)) {
      if (k in this.bonus) this.bonus[k] += v;
    }
  }

  storyFinished() {
    if (this.storyPhase === 'post') {
      this.showProgress();
    } else {
      this.beginTraining();
    }
  }

  skipStory() {
    if (this.screen !== 'story') return;
    if (this.storyPhase === 'post') {
      this.showProgress();
    } else {
      this.beginTraining();
    }
  }

  showStoryLog() {
    if (this.screen !== 'story') return;
    const past = this.storyQueue
      .slice(0, this.storyIndex + 1)
      .filter((b) => b.text || b.prompt)
      .slice(-4);
    if (!past.length) return;
    for (const b of past) {
      const who = b.speaker ? `${b.speaker}|` : '';
      const text = (b.text || b.prompt || '').slice(0, 110);
      this.toast(`${who}${text}`);
    }
  }

  updateStory(dt) {
    if (this.revealCount < this.revealText.length) {
      this.revealT += dt;
      const next = Math.min(this.revealText.length, Math.max(this.revealCount, Math.floor(this.revealT * 55)));
      if (next !== this.revealCount) {
        this.revealCount = next;
        this.el.dialogueText.textContent = this.revealText.slice(0, this.revealCount);
      }
    }

    if (this.choiceOpen) {
      if (this.input.take('opt1')) this.chooseOption(0);
      else if (this.input.take('opt2')) this.chooseOption(1);
      else if (this.input.take('opt3')) this.chooseOption(2);
      return;
    }

    if (this.input.take('confirm') || this.input.take('shoot')) {
      this.advanceStory();
    }
  }

  /* ------------------------------------------------------------------ */
  /* TRAINING                                                            */
  /* ------------------------------------------------------------------ */

  beginTraining() {
    const cfg = this.chapter.training;
    const attempts = cfg.attempts || 8;
    this.mode = 'training';
    this.showScreen('training', 'training');
    this.storyBg = cfg.scene;
    this.training = {
      ...cfg,
      attempts,
      hits: 0,
      attemptsDone: 0,
      combo: 0,
      bestCombo: 0,
      needle: 0,
      dir: 1,
      targetCenter: 0.5,
      zone: cfg.zone || 0.24,
      hitFlash: 0,
      hitText: '',
      ballHeight: 0,
      done: false
    };
    $('training-chip').textContent = `TRAINING \u00b7 ${cfg.title}`;
    $('training-eyebrow').textContent = cfg.eyebrow;
    $('training-title').textContent = cfg.title;
    $('training-text').textContent = cfg.text;
    $('training-made').textContent = '0';
    $('training-made').nextElementSibling.textContent = `/ ${attempts}`;
    $('training-combo').textContent = 'COMBO x0';
    $('training-toast').textContent = '';
    this.setTrainingTarget();
    this.audio.setCrowd(0);
    this.setMusic('training');
    this.audio.sfx('select');
  }

  setTrainingTarget() {
    const t = this.training;
    if (!t) return;
    const half = t.zone / 2;
    t.targetCenter = half + Math.random() * (1 - t.zone);
    const el = $('training-target');
    el.style.left = `${(t.targetCenter - half) * 100}%`;
    el.style.width = `${t.zone * 100}%`;
  }

  updateTraining(dt) {
    const t = this.training;
    if (!t || t.done) return;
    t.needle += t.dir * dt * (t.speed || 1.1) * 0.9;
    if (t.needle > 1) { t.needle = 1; t.dir = -1; }
    if (t.needle < 0) { t.needle = 0; t.dir = 1; }
    t.ballHeight = (Math.sin(this.time * 5.2) + 1) / 2;
    t.hitFlash = Math.max(0, t.hitFlash - dt * 2.2);
    $('training-needle').style.left = `${t.needle * 100}%`;
    if (this.input.take('shoot') || this.input.take('confirm')) this.hitTraining();
  }

  hitTraining() {
    const t = this.training;
    if (!t || t.done) return;
    const hit = Math.abs(t.needle - t.targetCenter) <= t.zone / 2;
    t.attemptsDone += 1;
    t.ballHeight = 1;
    t.hitFlash = 1;
    if (hit) {
      t.hits += 1;
      t.combo += 1;
      t.bestCombo = Math.max(t.bestCombo, t.combo);
      t.hitText = t.combo >= 4 ? 'PERFECT!' : t.combo >= 2 ? 'SWEET!' : 'NICE!';
    } else {
      t.combo = 0;
      t.hitText = 'MISS';
    }
    $('training-made').textContent = t.hits;
    $('training-combo').textContent = `COMBO x${t.combo}`;
    const toast = $('training-toast');
    toast.textContent = t.hitText;
    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');
    this.audio.sfx(hit ? 'pass' : 'lose-duel');

    if (t.attemptsDone >= t.attempts) {
      t.done = true;
      setTimeout(() => this.finishTraining(), 850);
      return;
    }
    this.setTrainingTarget();
  }

  finishTraining() {
    if (this.screen !== 'training') return;
    const t = this.training;
    const pairs = Math.floor((t?.hits || 0) / 2);
    const amount = pairs * 2;
    this.trainingResult = t
      ? { hits: t.hits, stat: t.stat, bonus: amount, attempts: t.attempts, bestCombo: t.bestCombo }
      : null;
    this.audio.sfx('win');
    this.showPrematch();
  }

  skipTraining() {
    const t = this.training;
    if (t) t.done = true;
    this.trainingResult = {
      hits: 0, stat: this.chapter.training.stat, bonus: 0,
      attempts: this.chapter.training.attempts, bestCombo: 0
    };
    this.showPrematch();
  }

  /* ------------------------------------------------------------------ */
  /* PRE-MATCH                                                           */
  /* ------------------------------------------------------------------ */

  playerStats() {
    const s = { ...this.chapter.baseStats };
    for (const k of STAT_KEYS) s[k] = clamp(s[k] + (this.bonus[k] || 0), 1, 99);
    if (this.trainingResult?.bonus && this.trainingResult.stat in s) {
      s[this.trainingResult.stat] = clamp(s[this.trainingResult.stat] + this.trainingResult.bonus, 1, 99);
    }
    return s;
  }

  showPrematch() {
    this.destroyMatch();
    const cfg = this.chapter.match;
    this.storyBg = this.chapter.training.scene;
    this.mode = 'sheet';
    this.showScreen('prematch', 'sheet');
    this.setMusic('story');

    $('prematch-competition').textContent = cfg.competition;
    $('prematch-title').innerHTML = `${cfg.home.name} <span>VS</span> ${cfg.away.name}`;
    $('prematch-venue').textContent = cfg.venue;
    $('prematch-brief').textContent = cfg.brief;
    $('prematch-danger').textContent = cfg.danger;

    const panel = (team, side) => `
      <span class="team-badge">${team.abbr}</span>
      <span class="team-name">${team.name}</span>
      <span class="team-sub">${side} \u00b7 ${team.lineup.length} PLAYERS</span>
      <span class="team-stars">${'\u2605'.repeat(team.stars || 0)}</span>
      <span class="team-line">${team.lineup.map((p) => p.name).join(' \u00b7 ')}</span>`;
    const homeEl = $('prematch-home');
    const awayEl = $('prematch-away');
    homeEl.style.setProperty('--team', cfg.home.color);
    awayEl.style.setProperty('--team', cfg.away.color);
    homeEl.innerHTML = panel(cfg.home, 'HOME');
    awayEl.innerHTML = panel(cfg.away, 'AWAY');

    const s = this.playerStats();
    $('prematch-stats').innerHTML = STAT_KEYS.map((k) => `
      <div class="stat-row">
        <label>${k.toUpperCase()}</label>
        <div class="stat-track"><i style="width:${s[k]}%"></i></div>
        <b>${s[k]}</b>
      </div>`).join('');

    const tr = this.trainingResult;
    $('prematch-bonus').textContent = tr && tr.bonus > 0
      ? `${tr.stat.toUpperCase()} +${tr.bonus} FROM ${tr.hits}/${tr.attempts} CLEAN TOUCHES`
      : 'NO TRAINING BONUS \u00b7 ALL RHYTHM, NO WARM-UP';

    $('prematch-kick').innerHTML = 'KICK OFF \u25b6';
  }

  /* ------------------------------------------------------------------ */
  /* MATCH                                                               */
  /* ------------------------------------------------------------------ */

  startMatch() {
    this.destroyMatch();
    const cfg = this.chapter.match;
    this.mode = 'match';
    this.storyBg = this.chapter.training.scene;
    this.showScreen('match', 'match');
    this.audio.setCrowd(0.07);
    this.setMusic(cfg.arena === 'final' ? 'matchFinal' : cfg.arena === 'club' ? 'match2' : 'match1');
    this.match = new Match({
      config: cfg,
      chapter: this.chapter,
      stats: this.playerStats(),
      audio: this.audio,
      input: this.input,
      callbacks: {
        onFinish: (result) => this.onMatchFinish(result),
        onRestart: () => this.startMatch(),
        onQuit: () => this.quitToTitle(),
        onSound: () => this.toggleSound()
      }
    });
  }

  destroyMatch() {
    if (this.match) {
      this.match.destroy();
      this.match = null;
    }
  }

  quitToTitle() {
    this.destroyMatch();
    this.startTitle();
  }

  onMatchFinish(result) {
    this.lastResult = result;
    this.storyBg = this.chapter.post[0]?.bg || this.chapter.training.scene || 'beach_sunset';
    this.destroyMatch();
    this.mode = 'sheet';
    this.showScreen('result', 'sheet');
    this.setMusic(result.win ? 'ending' : 'story');

    const sheet = document.querySelector('.result-sheet');
    sheet.classList.toggle('lost', !result.win);
    $('result-eyebrow').textContent = `FULL TIME \u00b7 ${result.config.competition}`;
    $('result-title').textContent = result.win ? 'VICTORY' : 'DEFEAT';
    $('result-score').innerHTML = `${result.score[0]} <span>\u2013</span> ${result.score[1]}`;
    $('result-venue').textContent = result.penalties
      ? `${result.config.venue} \u00b7 PENALTIES ${result.penalties.home}\u2013${result.penalties.away}`
      : result.config.venue;
    $('result-stats').innerHTML = `
      <div class="result-stat"><small>POSSESSION</small><b>${result.possession[0]}% \u2013 ${result.possession[1]}%</b></div>
      <div class="result-stat"><small>SHOTS</small><b>${result.stats.shots[0]} \u2013 ${result.stats.shots[1]}</b></div>
      <div class="result-stat"><small>DUELS WON</small><b>${result.stats.duelsWon}</b></div>`;
    $('result-quote').textContent = result.win ? result.config.winQuote : result.config.loseQuote;
    $('result-continue').hidden = !result.win;
    $('result-retry').hidden = result.win;
    $('result-title').hidden = result.win;

    this.audio.setCrowd(0);
  }

  continueAfterResult() {
    if (!this.lastResult?.win) return;
    this.storyPhase = 'post';
    this.storyQueue = this.chapter.post;
    this.storyIndex = 0;
    this.storyBg = this.storyQueue[0]?.bg || this.storyBg;
    this.mode = 'story';
    this.showScreen('story', 'story');
    this.el.storyChip.textContent = `CHAPTER ${this.chapter.num} \u00b7 ${this.chapter.title}`;
    this.showStoryBeat(0);
    this.setMusic('story');
  }

  /* ------------------------------------------------------------------ */
  /* PROGRESS / CREDITS                                                  */
  /* ------------------------------------------------------------------ */

  showProgress() {
    this.destroyMatch();
    const ch = this.chapter;
    const isFinal = this.chapterIndex >= CHAPTERS.length - 1;
    this.mode = 'sheet';
    this.storyBg = ch.post[ch.post.length - 1]?.bg || 'beach_dawn';
    this.showScreen('progress', 'sheet');
    this.setMusic(isFinal ? 'ending' : 'story');

    $('progress-eyebrow').textContent = isFinal ? 'STORY COMPLETE' : 'CHAPTER COMPLETE';
    $('progress-title').textContent = ch.title;
    $('progress-medal').textContent = isFinal ? '10' : String(ch.num);
    $('progress-copy').textContent = ch.complete.copy;

    const s = this.playerStats();
    $('progress-stats').innerHTML = `
      <div class="progress-stat"><small>TECHNIQUE</small><b>${s.technique}</b></div>
      <div class="progress-stat"><small>FLAIR</small><b>${s.flair}</b></div>
      <div class="progress-stat"><small>MATCH</small><b>${this.lastResult ? `${this.lastResult.score[0]}\u2013${this.lastResult.score[1]}` : 'WIN'}</b></div>`;
    $('progress-next').innerHTML = isFinal ? 'CREDITS \u25b6' : 'NEXT CHAPTER \u25b6';

    if (!this.save.completed.includes(ch.id)) this.save.completed.push(ch.id);
    this.save.unlocked = Math.max(this.save.unlocked, Math.min(CHAPTERS.length, ch.num + 1));
    this.save.nextChapter = clamp(this.chapterIndex + 1, 0, CHAPTERS.length - 1);
    this.persist();
    this.updateTitleMenu();
    this.audio.sfx('win');
  }

  progressNext() {
    if (this.chapterIndex >= CHAPTERS.length - 1) {
      this.showCredits();
      return;
    }
    this.transition(() => this.startChapter(this.chapterIndex + 1));
  }

  showCredits() {
    this.destroyMatch();
    this.mode = 'sheet';
    this.storyBg = 'beach_dawn';
    this.showScreen('credits', 'sheet');
    $('credits-scroll').scrollTop = 0;
    this.setMusic('ending');
  }

  /* ------------------------------------------------------------------ */
  /* LOOP                                                                */
  /* ------------------------------------------------------------------ */

  update(dt) {
    if (this.screen === 'story') this.updateStory(dt);
    else if (this.screen === 'training') this.updateTraining(dt);
    else if (this.screen === 'match' && this.match) this.match.update(dt);
  }

  loop(now) {
    const dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    this.time += dt;
    this.update(dt);
    this.renderer.render({
      mode: this.mode,
      storyBg: this.storyBg,
      match: this.match,
      training: this.training
    }, this.time);
    this.input.endFrame();
    requestAnimationFrame((t) => this.loop(t));
  }
}

const game = new Game();
if (new URLSearchParams(location.search).has('debug')) window.__game = game;

