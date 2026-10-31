// ---------------------------------------------------------------------------
// CARLOS SANTANA: SUPER STRIKER — app shell, screens and match presentation
// ---------------------------------------------------------------------------

import { CHAPTERS, CHARACTERS, ENDING, MOVES, STAT_LABELS } from './story.js';
import * as engine from './engine.js';
import { PitchRenderer } from './render.js';
import { drawPortrait, drawTrophy } from './portrait.js';
import { audio } from './audio.js';

const $ = (id) => document.getElementById(id);
const SAVE_KEY = 'carlos_santana_super_striker_v1';
const wait = (ms) => new Promise((res) => setTimeout(res, ms));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const screens = {
  title: $('screen-title'),
  map: $('screen-map'),
  story: $('screen-story'),
  training: $('screen-training'),
  match: $('screen-match'),
  result: $('screen-result')
};

let save = null;
let currentChapter = null;
let currentChapterIndex = 0;
let matchState = null;
let renderer = null;
let currentScreen = 'title';
let abortMatch = false;
let restartMatch = false;
let paused = false;
let activeChoice = null;
let busy = false;

// ---------------------------------------------------------------------------
// Save data
// ---------------------------------------------------------------------------

function defaultSave() {
  return {
    version: 1,
    chapter: 0,
    stats: { shot: 10, dribble: 10, pass: 8, tackle: 5, speed: 9, stamina: 100 },
    moves: [],
    cleared: [],
    trained: [],
    trophies: 0,
    completed: false,
    matches: 0
  };
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.stats) return null;
    const base = defaultSave();
    return {
      ...base,
      ...parsed,
      stats: { ...base.stats, ...parsed.stats },
      moves: Array.isArray(parsed.moves) ? parsed.moves : [],
      cleared: Array.isArray(parsed.cleared) ? parsed.cleared : [],
      trained: Array.isArray(parsed.trained) ? parsed.trained : []
    };
  } catch {
    return null;
  }
}

function persist() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch {}
}

function statCap(stat) { return stat === 'stamina' ? 140 : 20; }

// ---------------------------------------------------------------------------
// Audio / screen helpers
// ---------------------------------------------------------------------------

function ensureAudio() {
  if (audio.started) return;
  audio.init();
  if (currentScreen === 'title') audio.startMusic('title');
}

function musicFor(name) {
  if (!audio.started) return;
  if (name === 'title' || name === 'map') audio.startMusic('title');
  else if (name === 'story' || name === 'training' || name === 'result') audio.startMusic('story');
}

function showScreen(name) {
  for (const [key, el] of Object.entries(screens)) {
    el.classList.toggle('hidden', key !== name);
  }
  currentScreen = name;
  if (name !== 'match') {
    audio.stopCrowd();
    musicFor(name);
  }
}

function updateSoundLabels() {
  const label = audio.muted ? 'SOUND: OFF' : 'SOUND: ON';
  const mapBtn = $('map-sound');
  if (mapBtn) mapBtn.textContent = audio.muted ? '\u266A\u0338' : '\u266A';
  const btn = $('btn-sound');
  if (btn) btn.textContent = label;
}

function toast(text, ms = 1900) {
  const el = $('toast');
  el.textContent = text;
  el.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.add('hidden'), ms);
}

function ask(title, text, yesLabel = 'YES', noLabel = 'CANCEL') {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `<div class="modal">
      <h2>${title}</h2>
      <p style="font-size:20px;color:#b9cceb;line-height:1.35">${text}</p>
      <button class="btn btn-primary" data-yes>${yesLabel}</button>
      <button class="btn btn-ghost" data-no>${noLabel}</button>
    </div>`;
    $('app').appendChild(overlay);
    const close = (value) => { overlay.remove(); resolve(value); };
    overlay.querySelector('[data-yes]').addEventListener('click', () => close(true));
    overlay.querySelector('[data-no]').addEventListener('click', () => close(false));
    overlay.addEventListener('pointerdown', (e) => { if (e.target === overlay) close(false); });
  });
}

// ---------------------------------------------------------------------------
// Title / map
// ---------------------------------------------------------------------------

function drawStaticPortraits() {
  drawPortrait($('title-portrait'), CHARACTERS.carlos);
  drawPortrait($('map-portrait'), CHARACTERS.carlos);
}

function showTitle() {
  showScreen('title');
  $('btn-continue').disabled = !save;
}

function startNewStory() {
  save = defaultSave();
  persist();
  showMap();
}

function showMap() {
  if (!save) { showTitle(); return; }
  showScreen('map');
  drawPortrait($('map-portrait'), CHARACTERS.carlos);

  const statList = $('stat-list');
  statList.innerHTML = Object.entries(save.stats).map(([key, value]) => {
    const cap = statCap(key);
    const pct = clamp((value / cap) * 100, 0, 100);
    return `<div class="stat-row"><span>${STAT_LABELS[key] || key}</span>
      <div class="stat-track"><div class="stat-fill" style="width:${pct}%"></div></div>
      <b>${value}</b></div>`;
  }).join('');

  const list = $('chapter-list');
  list.innerHTML = CHAPTERS.map((ch, i) => {
    const done = save.cleared.includes(ch.id);
    const current = i === save.chapter && !done;
    const locked = i > save.chapter;
    const state = done ? 'CLEARED' : current ? 'NEXT' : locked ? 'LOCKED' : 'REPLAY';
    return `<button class="chapter ${done ? 'done' : ''} ${current ? 'current' : ''} ${locked ? 'locked' : ''}" data-index="${i}" ${locked ? 'disabled' : ''}>
      <span class="chapter-num">${String(ch.number).padStart(2, '0')}</span>
      <span class="chapter-main">
        <span class="chapter-title">${ch.title}</span>
        <span class="chapter-sub">${ch.subtitle}</span>
      </span>
      <span class="chapter-state">${state}</span>
    </button>`;
  }).join('');

  list.querySelectorAll('.chapter').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = Number(btn.dataset.index);
      if (index > save.chapter) { toast('Clear the previous chapter first.'); return; }
      startChapter(index);
    });
  });

  const hint = $('map-hint');
  if (save.completed) hint.textContent = 'World champion. Replay any chapter — or chase a perfect run.';
  else if (save.chapter === 0) hint.textContent = 'Chapter 1 is ready. The hill is waiting.';
  else hint.textContent = `Next up: Chapter ${save.chapter + 1} — ${CHAPTERS[save.chapter]?.title || ''}`;

  $('save-note').textContent = `CHAPTER ${Math.min(save.chapter + 1, CHAPTERS.length)}/${CHAPTERS.length} · ${save.cleared.length} CLEARED${save.trophies ? ' · \u2605 CHAMPION' : ''}`;
  updateSoundLabels();
}

// ---------------------------------------------------------------------------
// Story player
// ---------------------------------------------------------------------------

function playStory(lines, chapter, opts = {}) {
  return new Promise((resolve) => {
    showScreen('story');
    const sky = document.querySelector('#screen-story .story-sky');
    if (sky) sky.style.background = chapter.sky || '';
    const card = $('chapter-card');
    let cardVisible = !!opts.card;
    if (opts.card) {
      $('chapter-card-eyebrow').textContent = `CHAPTER ${chapter.number}`;
      $('chapter-card-title').textContent = chapter.title;
      $('chapter-card-place').textContent = chapter.place;
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }

    const portraitFrame = $('portrait-frame');
    const portrait = $('story-portrait');
    const speakerEl = $('speaker');
    const textEl = $('dialogue-text');
    const cue = $('next-cue');
    const box = $('dialogue-box');

    let index = 0;
    let typing = false;
    let timer = null;
    let fullText = '';
    let charIndex = 0;
    let finished = false;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    const cleanup = () => {
      clearInterval(timer);
      $('screen-story').removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', onKey);
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      cleanup();
      resolve();
    };

    const completeTyping = () => {
      clearInterval(timer);
      typing = false;
      charIndex = fullText.length;
      textEl.textContent = fullText;
      cue.style.visibility = 'visible';
    };

    const renderLine = () => {
      const line = lines[index];
      if (!line) { finish(); return; }
      const char = CHARACTERS[line.who] || CHARACTERS.narrator;
      if (char.narrator) {
        portraitFrame.classList.add('narrator');
        speakerEl.textContent = 'NARRATION';
        drawPortrait(portrait, { narrator: true });
      } else {
        portraitFrame.classList.remove('narrator');
        speakerEl.textContent = char.short || char.name;
        drawPortrait(portrait, char);
      }
      fullText = line.text;
      charIndex = 0;
      textEl.textContent = '';
      cue.style.visibility = 'hidden';
      typing = true;
      if (reduceMotion) { completeTyping(); return; }
      timer = setInterval(() => {
        charIndex++;
        textEl.textContent = fullText.slice(0, charIndex);
        if (charIndex % 3 === 0) audio.sfx('blip');
        if (charIndex >= fullText.length) completeTyping();
      }, 17);
    };

    const advance = () => {
      if (finished) return;
      if (cardVisible) {
        cardVisible = false;
        card.classList.add('hidden');
        return;
      }
      if (typing) { completeTyping(); return; }
      index++;
      if (index >= lines.length) finish();
      else renderLine();
    };

    function onPointer(e) {
      if (e.target.closest('#story-skip')) return;
      advance();
    }
    function onKey(e) {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight') {
        e.preventDefault();
        advance();
      }
    }

    $('screen-story').addEventListener('pointerdown', onPointer);
    window.addEventListener('keydown', onKey);

    $('story-skip').onclick = (e) => {
      e.stopPropagation();
      audio.sfx('back');
      finish();
    };

    if (opts.card) {
      setTimeout(() => {
        if (finished) return;
        if (cardVisible) {
          cardVisible = false;
          card.classList.add('hidden');
        }
      }, 2100);
    }

    // prime the first line behind the chapter card
    renderLine();
    box.classList.remove('hidden');
  });
}

// ---------------------------------------------------------------------------
// Training
// ---------------------------------------------------------------------------

function showTraining(chapter) {
  return new Promise((resolve) => {
    showScreen('training');
    $('training-lead').textContent = chapter.trainingLead;
    const list = $('training-list');
    list.innerHTML = chapter.training.map((opt) => `
      <button class="training-card" data-id="${opt.id}">
        <h3>${opt.title}</h3>
        <p>${opt.text}</p>
        <span class="gain">${STAT_LABELS[opt.stat] || opt.stat} +${opt.amount}</span>
      </button>`).join('');

    list.querySelectorAll('.training-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const opt = chapter.training.find((o) => o.id === btn.dataset.id);
        if (!opt) return;
        const cap = statCap(opt.stat);
        const before = save.stats[opt.stat] || 0;
        save.stats[opt.stat] = Math.min(cap, before + opt.amount);
        if (!save.trained.includes(chapter.id)) save.trained.push(chapter.id);
        persist();
        audio.sfx('confirm');
        toast(`${STAT_LABELS[opt.stat] || opt.stat} increased!`);
        list.querySelectorAll('button').forEach((b) => { b.disabled = true; });
        setTimeout(resolve, 520);
      });
    });
  });
}

// ---------------------------------------------------------------------------
// Match setup
// ---------------------------------------------------------------------------

function setupHUD() {
  const [home, away] = matchState.teams;
  $('hud-name-home').textContent = home.short;
  $('hud-name-away').textContent = away.short;
  $('hud-swatch-home').style.background = home.colors.shirt;
  $('hud-swatch-home').style.borderColor = home.colors.trim;
  $('hud-swatch-away').style.background = away.colors.shirt;
  $('hud-swatch-away').style.borderColor = away.colors.trim;
  $('score-home').textContent = '0';
  $('score-away').textContent = '0';
  $('match-log').textContent = 'The whistle blows. Carlos\'s team attacks upward.';
  $('possession-label').textContent = 'YOUR ATTACK';
}

function updateHUD() {
  if (!matchState) return;
  const [home, away] = matchState.teams;
  $('score-home').textContent = matchState.score[0];
  $('score-away').textContent = matchState.score[1];
  $('clock').textContent = engine.clockLabel(matchState);
  $('half-label').textContent = matchState.extra
    ? (matchState.suddenDeath ? 'SUDDEN DEATH' : 'EXTRA TIME')
    : matchState.half === 1 ? '1ST HALF' : '2ND HALF';

  const stam = engine.staminaBar(matchState);
  const fill = $('stamina-fill');
  fill.style.width = `${stam}%`;
  fill.classList.toggle('low', stam < 35);

  const label = matchState.possession === matchState.playerTeam
    ? 'YOUR ATTACK'
    : `${away.short} ATTACK`;
  $('possession-label').textContent = label;
}

async function beginMatch(chapter) {
  currentChapter = chapter;
  abortMatch = false;
  paused = false;
  restartMatch = false;
  showScreen('match');
  $('commands').innerHTML = '';
  $('meter-layer').classList.add('hidden');
  $('cutin-layer').classList.add('hidden');
  $('pause-layer').classList.add('hidden');
  $('goal-flash').classList.add('hidden');
  $('match-banner').classList.add('hidden');

  const home = chapter.match.home(save);
  const away = chapter.match.away();
  matchState = engine.createMatch({
    home, away,
    playerTeam: 0,
    minutes: chapter.match.minutes,
    goldenGoal: chapter.match.goldenGoal,
    difficulty: chapter.match.difficulty
  });

  setupHUD();
  if (renderer) renderer.stop();
  renderer = new PitchRenderer($('pitch'));
  renderer.setMatch(matchState);
  renderer.start();

  audio.init();
  audio.stopMusic();
  audio.startMusic(chapter.id === 'ch4' ? 'final' : 'match');
  audio.startCrowd();
  audio.sfx('whistle');

  const finished = await runMatch();
  renderer?.stop();
  audio.stopCrowd();
  audio.stopMusic();

  if (restartMatch) {
    restartMatch = false;
    await beginMatch(chapter);
    return;
  }
  if (abortMatch || !finished || !matchState.finished) {
    showMap();
    return;
  }
  finishMatch(chapter, matchState);
}

// ---------------------------------------------------------------------------
// Match loop
// ---------------------------------------------------------------------------

async function runMatch() {
  const state = matchState;
  let guard = 0;

  while (!state.finished && !abortMatch && guard++ < 300) {
    if (paused) { await wait(100); continue; }

    if (state.phase === 'halftime') {
      updateHUD();
      await announce('HALF TIME', `${state.teams[0].short} ${state.score[0]} : ${state.score[1]} ${state.teams[1].short}`, 'START SECOND HALF');
      engine.resumeSecondHalf(state);
      updateHUD();
      continue;
    }
    if (state.phase === 'extra') {
      updateHUD();
      await announce('EXTRA TIME', 'GOLDEN GOAL — the next goal wins it all.', 'KEEP PLAYING');
      engine.resumeExtraTime(state);
      updateHUD();
      continue;
    }

    updateHUD();
    let plan = null;

    if (state.possession === state.playerTeam) {
      const action = await chooseAttack();
      if (!action) return null;
      plan = engine.beginAttack(state, action);
      if (!plan) continue;
    } else {
      const posture = await chooseDefense();
      if (!posture) return null;
      plan = engine.beginDefense(state, posture);
      if (!plan) continue;
    }

    if (abortMatch) return null;

    if (plan.cutin) {
      await showCutin(plan.cutin);
      if (abortMatch) return null;
    }

    let timing = 0.7;
    if (plan.contested) {
      timing = await runMeter(plan);
      if (abortMatch) return null;
    }

    const ev = engine.resolvePlan(state, plan, timing);
    await presentEvent(ev, plan);
  }

  return state;
}

// ---------------------------------------------------------------------------
// Command menus
// ---------------------------------------------------------------------------

function makeCmd(panel, label, sub, cls, onClick, disabled = false) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `cmd ${cls}`.trim();
  btn.innerHTML = `<b>${label}</b><span>${sub}</span>`;
  btn.disabled = disabled;
  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    audio.sfx('select');
    onClick();
  });
  panel.appendChild(btn);
  return btn;
}

function chooseAttack() {
  const state = matchState;
  return new Promise((resolve) => {
    const panel = $('commands');
    let settled = false;
    const done = (value) => {
      if (settled) return;
      settled = true;
      activeChoice = null;
      panel.innerHTML = '';
      resolve(value);
    };
    activeChoice = done;

    const main = () => {
      panel.className = 'command-panel';
      panel.style.gridTemplateColumns = '';
      panel.innerHTML = '';
      makeCmd(panel, 'DRIBBLE', 'BEAT YOUR MAN', '', () => done({ type: 'dribble' }));
      makeCmd(panel, 'PASS', 'FIND A MATE', '', () => passMenu());
      const shootOk = engine.canShoot(state);
      makeCmd(panel, 'SHOOT', shootOk ? 'TAKE THE SHOT' : 'GET CLOSER', 'primary', () => done({ type: 'shoot' }), !shootOk);
      const specials = engine.availableMoves(state);
      const specialOk = specials.some((m) => m.usable);
      makeCmd(panel, 'SPECIAL', specialOk ? 'SKILL MOVES' : 'NOT READY', 'special', () => specialMenu(), !specialOk);
      makeCmd(panel, 'HOLD', 'RECOVER STAMINA', 'full', () => done({ type: 'hold' }));
    };

    const passMenu = () => {
      panel.style.gridTemplateColumns = 'repeat(2, 1fr)';
      panel.innerHTML = '';
      const options = engine.passOptions(state);
      if (!options.length) {
        makeCmd(panel, 'NO OPTIONS', 'DRIBBLE INSTEAD', 'wide', () => main());
        return;
      }
      options.forEach((p) => {
        makeCmd(panel, p.name, `${p.role} · #${p.number}`, '', () => done({ type: 'pass', targetId: p.id }));
      });
      makeCmd(panel, 'BACK', 'RETURN', 'wide', () => main());
    };

    const specialMenu = () => {
      panel.style.gridTemplateColumns = 'repeat(2, 1fr)';
      panel.innerHTML = '';
      const moves = engine.availableMoves(state);
      moves.forEach((m) => {
        const label = m.usable ? `${m.move.name}` : `${m.move.name} — ${m.reason}`;
        makeCmd(panel, label, `${m.move.cost} STAM`, 'special', () => done({ type: 'special', moveId: m.id }), !m.usable);
      });
      makeCmd(panel, 'BACK', 'RETURN', 'wide', () => main());
    };

    main();
  });
}

function chooseDefense() {
  return new Promise((resolve) => {
    const panel = $('commands');
    let settled = false;
    const done = (value) => {
      if (settled) return;
      settled = true;
      activeChoice = null;
      panel.innerHTML = '';
      resolve(value);
    };
    activeChoice = done;
    panel.className = 'command-panel';
    panel.style.gridTemplateColumns = 'repeat(3, 1fr)';
    panel.innerHTML = '';
    makeCmd(panel, 'PRESS', 'FIGHT FOR IT', 'defend', () => done('press'));
    makeCmd(panel, 'BLOCK', 'GUARD THE SHOT', 'defend', () => done('block'));
    makeCmd(panel, 'FALL BACK', 'SAVE YOUR LEGS', 'defend', () => done('fallback'));
  });
}

// ---------------------------------------------------------------------------
// Duel meter
// ---------------------------------------------------------------------------

function runMeter(plan) {
  return new Promise((resolve) => {
    const layer = $('meter-layer');
    const marker = $('meter-marker');
    const zone = $('meter-zone');
    const resultEl = $('meter-result');
    const actor = engine.playerById(matchState, plan.actorId);
    const defender = plan.defenderId ? engine.playerById(matchState, plan.defenderId) : null;

    $('meter-kicker').textContent = plan.kind === 'shoot' ? 'SHOT DUEL'
      : plan.kind === 'pass' ? 'PASS BATTLE' : 'DRIBBLE DUEL';
    $('meter-atk-role').textContent = plan.attackLabel || 'ATTACK';
    $('meter-def-role').textContent = plan.defenseLabel || 'DEFEND';
    $('meter-atk-name').textContent = actor?.name || 'ATTACKER';
    $('meter-def-name').textContent = defender?.name || 'DEFENDER';
    $('meter-atk-stat').textContent = `${plan.attackLabel} ${plan.attackValue}`;
    $('meter-def-stat').textContent = `${plan.defenseLabel} ${plan.defenseValue}`;
    $('meter-atk-bar').style.width = `${clamp((plan.attackValue / 24) * 100, 8, 100)}%`;
    $('meter-def-bar').style.width = `${clamp((plan.defenseValue / 24) * 100, 8, 100)}%`;
    $('meter-hint').textContent = plan.side === 'attack'
      ? 'STOP THE MARKER IN THE GREEN ZONE'
      : 'TIME YOUR CHALLENGE';
    resultEl.textContent = '';
    zone.style.left = '38%';
    zone.style.width = '24%';
    layer.classList.remove('hidden');

    const speed = 0.0015 + (matchState.difficulty || 1) * 0.00028;
    const start = performance.now();
    let pos = 0.5;
    let stopped = false;
    let raf = 0;
    let lastTick = 0;

    const loop = (t) => {
      const elapsed = t - start;
      pos = 0.5 + 0.5 * Math.sin(elapsed * speed);
      marker.style.left = `${(pos * 100).toFixed(2)}%`;
      if (pos > 0.5 && lastTick === 0) lastTick = 1;
      if (pos < 0.5 && lastTick === 1) lastTick = 0;
      if (!stopped) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const cleanup = () => {
      cancelAnimationFrame(raf);
      layer.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', onKey);
    };

    const stop = () => {
      if (stopped) return;
      stopped = true;
      cleanup();
      const timing = clamp(1 - Math.abs(pos - 0.5) * 2, 0, 1);
      const label = timing > 0.9 ? 'PERFECT!' : timing > 0.68 ? 'GREAT!' : timing > 0.42 ? 'GOOD' : 'OFF BALANCE';
      resultEl.textContent = label;
      audio.sfx(timing > 0.68 ? 'confirm' : 'back');
      if (timing > 0.9) audio.cheer(0.15);
      setTimeout(() => {
        layer.classList.add('hidden');
        resolve(timing);
      }, 650);
    };

    function onPointer(e) { e.preventDefault(); stop(); }
    function onKey(e) {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        stop();
      }
    }

    layer.addEventListener('pointerdown', onPointer);
    window.addEventListener('keydown', onKey);
  });
}

// ---------------------------------------------------------------------------
// Cut-in / banners / announcements
// ---------------------------------------------------------------------------

async function showCutin(cutin) {
  const layer = $('cutin-layer');
  const actor = engine.playerById(matchState, cutin.playerId);
  const team = actor ? matchState.teams[actor.team] : matchState.teams[0];
  drawPortrait($('cutin-portrait'), actor?.look || CHARACTERS.carlos, {
    jersey: team.colors.shirt,
    trim: team.colors.trim,
    shorts: team.colors.shorts,
    number: actor?.number
  });
  $('cutin-name').textContent = cutin.name;
  $('cutin-move').textContent = cutin.move.name;
  $('cutin-tag').textContent = cutin.opponent ? 'OPPONENT SPECIAL' : 'SPECIAL MOVE';
  layer.classList.remove('hidden');
  const app = $('app');
  app.classList.add('shake');
  audio.sfx('special');
  await wait(1550);
  app.classList.remove('shake');
  layer.classList.add('hidden');
}

async function showBanner(text, ms = 900) {
  const el = $('match-banner');
  $('match-banner-text').textContent = text;
  el.classList.remove('hidden');
  await wait(ms);
  el.classList.add('hidden');
}

function announce(title, sub, buttonLabel) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `<div class="modal">
      <h2>${title}</h2>
      <p style="font-size:21px;color:#b9cceb;line-height:1.35">${sub}</p>
      <button class="btn btn-primary" type="button">${buttonLabel}</button>
    </div>`;
    $('screen-match').appendChild(overlay);
    const done = () => { overlay.remove(); resolve(); };
    overlay.querySelector('button').addEventListener('click', done);
    overlay.addEventListener('pointerdown', (e) => { if (e.target === overlay) done(); });
  });
}

async function presentEvent(ev) {
  if (!ev) return;
  $('match-log').textContent = ev.text;
  updateHUD();

  if (ev.kind === 'goal') {
    audio.sfx('goal');
    renderer?.shake(650);
    const flash = $('goal-flash');
    flash.classList.remove('hidden');
    await wait(1750);
    flash.classList.add('hidden');
  } else if (ev.kind === 'save') {
    audio.sfx('save');
    await showBanner('SAVED!', 750);
  } else if (ev.kind === 'wide') {
    audio.sfx('save');
    await showBanner('WIDE!', 750);
  } else if (ev.kind === 'tackle' || ev.kind === 'intercept') {
    audio.sfx('tackle');
    await wait(650);
  } else if (ev.kind === 'dribble') {
    audio.sfx('pass');
    await wait(520);
  } else if (ev.kind === 'pass') {
    audio.sfx('pass');
    await wait(460);
  } else {
    await wait(380);
  }
  updateHUD();
}

// ---------------------------------------------------------------------------
// Pause / quit / restart
// ---------------------------------------------------------------------------

$('btn-pause').addEventListener('click', () => {
  if (currentScreen !== 'match') return;
  paused = true;
  $('pause-layer').classList.remove('hidden');
  audio.sfx('select');
});

$('btn-resume').addEventListener('click', () => {
  paused = false;
  $('pause-layer').classList.add('hidden');
  audio.sfx('back');
});

$('btn-restart').addEventListener('click', () => {
  paused = false;
  abortMatch = true;
  restartMatch = true;
  $('pause-layer').classList.add('hidden');
  if (activeChoice) activeChoice(null);
});

$('btn-quit').addEventListener('click', () => {
  paused = false;
  abortMatch = true;
  $('pause-layer').classList.add('hidden');
  if (activeChoice) activeChoice(null);
});

$('btn-sound').addEventListener('click', () => {
  ensureAudio();
  audio.toggleMute();
  updateSoundLabels();
});

$('map-sound').addEventListener('click', () => {
  ensureAudio();
  audio.toggleMute();
  updateSoundLabels();
});

// ---------------------------------------------------------------------------
// Match result
// ---------------------------------------------------------------------------

function applyRewards(chapter) {
  const gained = [];
  if (save.cleared.includes(chapter.id)) return gained;

  const rewards = chapter.rewards || {};
  for (const moveId of rewards.moves || []) {
    if (!save.moves.includes(moveId)) {
      save.moves.push(moveId);
      gained.push(`NEW MOVE: ${MOVES[moveId]?.name || moveId}`);
    }
  }
  for (const [stat, amount] of Object.entries(rewards.stats || {})) {
    const cap = statCap(stat);
    const before = save.stats[stat] || 0;
    save.stats[stat] = Math.min(cap, before + amount);
    gained.push(`${STAT_LABELS[stat] || stat} +${amount}`);
  }
  save.cleared.push(chapter.id);
  save.chapter = Math.max(save.chapter, currentChapterIndex + 1);
  if (rewards.trophy) {
    save.trophies = 1;
    save.completed = true;
    gained.push('WORLD CHAMPION');
  }
  persist();
  return gained;
}

function showResultScreen(chapter, state, win, draw, rewards) {
  return new Promise((resolve) => {
    showScreen('result');
    const [home, away] = state.teams;
    $('result-eyebrow').textContent = state.extra ? 'AFTER EXTRA TIME' : 'FULL TIME';
    $('result-title').textContent = win ? 'VICTORY' : draw ? 'DRAW' : 'DEFEAT';
    $('result-score').style.display = '';
    $('result-teams').style.display = '';
    $('result-home').textContent = state.score[0];
    $('result-away').textContent = state.score[1];
    $('result-team-home').textContent = home.name;
    $('result-team-away').textContent = away.name;

    const summary = engine.matchSummary(state);
    const scorers = summary.scorers.length
      ? summary.scorers.map((s) => `${s.name} ${s.goals > 1 ? `\u00d7${s.goals}` : ''}`).join(' · ')
      : 'No goals.';
    const mvp = summary.mvp;
    const rewardLines = rewards.length
      ? rewards.map((r) => `<div class="reward"><b>${r}</b></div>`).join('')
      : `<div class="reward"><b>${save.cleared.includes(chapter.id) ? 'CHAPTER REPLAYED — NO NEW REWARDS' : 'NO REWARDS'}</b></div>`;

    $('result-body').innerHTML = `
      <div class="mvp">MVP · ${mvp.name}${mvp.goals ? ` (${mvp.goals} GOAL${mvp.goals > 1 ? 'S' : ''})` : ''}</div>
      <div class="reward"><span>SCORERS</span><b>${scorers}</b></div>
      ${rewardLines}
      <p class="quote">"${win ? chapter.quote : draw ? 'A draw is a lesson. Learn it and come back.' : 'The hill is still waiting. Get up.'}"</p>`;

    const mainBtn = $('btn-result-main');
    const retryBtn = $('btn-result-retry');
    const mapBtn = $('btn-result-map');

    mainBtn.classList.remove('hidden');
    retryBtn.classList.add('hidden');
    mapBtn.classList.remove('hidden');
    retryBtn.onclick = null;

    if (win) {
      mainBtn.textContent = chapter.id === 'ch4' ? 'LIFT THE TROPHY' : 'CONTINUE';
      mainBtn.onclick = () => resolve('continue');
      mapBtn.textContent = 'BACK TO MAP';
      mapBtn.onclick = () => resolve('map');
    } else {
      mainBtn.textContent = 'TRY AGAIN';
      mainBtn.onclick = () => resolve('retry');
      mapBtn.textContent = 'BACK TO MAP';
      mapBtn.onclick = () => resolve('map');
    }
  });
}

async function finishMatch(chapter, state) {
  const win = state.score[0] > state.score[1];
  const draw = state.score[0] === state.score[1];
  save.matches = (save.matches || 0) + 1;
  persist();

  const rewards = win ? applyRewards(chapter) : [];
  const choice = await showResultScreen(chapter, state, win, draw, rewards);

  if (choice === 'retry') {
    abortMatch = false;
    await beginMatch(chapter);
    return;
  }
  if (choice === 'map') {
    if (!win && chapter.lose?.length) await playStory(chapter.lose, chapter, { card: false });
    showMap();
    return;
  }

  // continue after a win
  await playStory(chapter.win, chapter, { card: false });
  if (chapter.id === 'ch4') {
    await playStory(ENDING.lines, chapter, { card: false });
    await showEnding();
    showMap();
  } else {
    showMap();
  }
}

function showEnding() {
  return new Promise((resolve) => {
    showScreen('result');
    audio.stopMusic();
    if (audio.started) audio.startMusic('title');
    $('result-eyebrow').textContent = 'THE END';
    $('result-title').textContent = 'WORLD CHAMPION';
    $('result-score').style.display = 'none';
    $('result-teams').style.display = 'none';
    $('result-body').innerHTML = `
      <canvas id="ending-trophy" class="ending-trophy" width="64" height="72" aria-label="World Cup trophy"></canvas>
      <div class="mvp">CARLOS SANTANA · #10 · BRAZIL</div>
      <div class="reward"><span>MATCHES PLAYED</span><b>${save.matches}</b></div>
      <div class="reward"><span>CHAPTERS CLEARED</span><b>${save.cleared.length} / ${CHAPTERS.length}</b></div>
      <div class="reward"><span>TROPHIES</span><b>${save.trophies}</b></div>
      <p class="quote">"The ball doesn't care where you were born."</p>`;
    const trophy = $('ending-trophy');
    if (trophy) drawTrophy(trophy);

    const mainBtn = $('btn-result-main');
    const retryBtn = $('btn-result-retry');
    const mapBtn = $('btn-result-map');
    mainBtn.textContent = 'BACK TO MAP';
    mainBtn.classList.remove('hidden');
    retryBtn.classList.add('hidden');
    mapBtn.classList.add('hidden');
    mainBtn.onclick = () => resolve();
  });
}

// ---------------------------------------------------------------------------
// Chapter flow
// ---------------------------------------------------------------------------

async function startChapter(index) {
  if (busy) return;
  busy = true;
  ensureAudio();
  currentChapterIndex = index;
  const chapter = CHAPTERS[index];
  const firstTime = !save.cleared.includes(chapter.id) && index === save.chapter;

  try {
    if (firstTime) {
      await playStory(chapter.intro, chapter, { card: true });
      if (!save.trained.includes(chapter.id)) await showTraining(chapter);
    }
    await playStory(chapter.preMatch, chapter, { card: false });
    await beginMatch(chapter);
  } finally {
    busy = false;
  }
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

function boot() {
  save = loadSave();
  drawStaticPortraits();
  updateSoundLabels();

  $('btn-new').addEventListener('click', async () => {
    ensureAudio();
    audio.sfx('confirm');
    const hasProgress = save && (save.cleared.length > 0 || save.chapter > 0);
    if (hasProgress) {
      const yes = await ask('START A NEW STORY?', 'Your current save will be erased. Carlos will start again in Vila Nova.', 'ERASE & START');
      if (!yes) return;
    }
    startNewStory();
  });

  $('btn-continue').addEventListener('click', () => {
    ensureAudio();
    audio.sfx('confirm');
    if (!save) { startNewStory(); return; }
    showMap();
  });

  $('btn-how').addEventListener('click', () => {
    ensureAudio();
    audio.sfx('select');
    $('how-layer').classList.remove('hidden');
  });
  $('btn-how-close').addEventListener('click', () => {
    $('how-layer').classList.add('hidden');
    audio.sfx('back');
  });
  $('how-layer').addEventListener('pointerdown', (e) => {
    if (e.target === $('how-layer')) $('how-layer').classList.add('hidden');
  });

  $('map-back').addEventListener('click', () => {
    audio.sfx('back');
    showTitle();
  });

  $('btn-reset').addEventListener('click', async () => {
    const yes = await ask('ERASE SAVE?', 'All chapters, moves and trophies will be lost.', 'ERASE EVERYTHING');
    if (!yes) return;
    save = defaultSave();
    persist();
    showMap();
    toast('Save erased.');
  });

  window.addEventListener('pointerdown', ensureAudio, { once: true });
  window.addEventListener('keydown', ensureAudio, { once: true });

  // Keyboard navigation for the match command menus.
  document.addEventListener('keydown', (e) => {
    if (currentScreen !== 'match' || paused) return;
    if (!$('meter-layer').classList.contains('hidden')) return;
    if (!$('cutin-layer').classList.contains('hidden')) return;
    if (!$('pause-layer').classList.contains('hidden')) return;
    if (document.querySelector('#screen-match .overlay:not(.hidden)')) return;

    const cmds = [...document.querySelectorAll('#commands .cmd:not([disabled])')];
    if (!cmds.length) return;
    const key = e.key;
    const next = key === 'ArrowDown' || key === 'ArrowRight' || key === 's' || key === 'S' || key === 'd' || key === 'D';
    const prev = key === 'ArrowUp' || key === 'ArrowLeft' || key === 'w' || key === 'W' || key === 'a' || key === 'A';
    if (!next && !prev) return;
    e.preventDefault();
    let idx = cmds.indexOf(document.activeElement);
    if (idx < 0) idx = next ? -1 : 0;
    const target = next
      ? (idx + 1) % cmds.length
      : (idx - 1 + cmds.length) % cmds.length;
    cmds[target].focus();
  });

  showTitle();

  window.__cs = {
    get screen() { return currentScreen; },
    get save() { return save; },
    get state() { return matchState; },
    choose(value) { if (activeChoice) activeChoice(value); },
    get commands() { return [...document.querySelectorAll('#commands .cmd')]; },
    get paused() { return paused; }
  };
}

boot();
