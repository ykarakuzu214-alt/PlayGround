/* =========================================================
   MATCH UI — HUD, duels, specials, pause, penalties
   ========================================================= */

import { drawPortrait } from './pixel.js';

const $ = (id) => document.getElementById(id);

export class MatchUI {
  constructor(callbacks = {}) {
    this.cb = callbacks;
    this.timers = new Set();
    this.toasts = [];
    this.bannerTimer = null;
    this.goalTimer = null;
    this.commentTimer = null;
    this.bound = [];
    this.el = {
      hud: $('match-hud'),
      score: $('sb-score'),
      home: $('sb-home'),
      away: $('sb-away'),
      clock: $('sb-clock'),
      half: $('sb-half'),
      commentary: $('commentary'),
      tensionWrap: $('tension-wrap'),
      tensionFill: $('tension-fill'),
      tensionValue: $('tension-value'),
      goalBanner: $('goal-banner'),
      goalSub: $('goal-sub'),
      pauseBtn: $('match-pause'),
      soundBtn: $('match-sound'),
      duel: $('duel'),
      duelTitle: $('duel-title'),
      duelContext: $('duel-context'),
      duelNameA: $('duel-name-a'),
      duelRoleA: $('duel-role-a'),
      duelNameB: $('duel-name-b'),
      duelRoleB: $('duel-role-b'),
      duelBarA: $('duel-bar-a'),
      duelBarB: $('duel-bar-b'),
      duelPortraitA: $('duel-portrait-a'),
      duelPortraitB: $('duel-portrait-b'),
      duelCommands: $('duel-commands'),
      duelMeterWrap: $('duel-meter-wrap'),
      duelMeter: $('duel-meter'),
      duelNeedle: $('duel-needle'),
      duelMeterHint: $('duel-meter-hint'),
      duelOutcome: $('duel-outcome'),
      special: $('special-menu'),
      specialEnergy: $('special-energy'),
      specialCards: $('special-cards'),
      specialClose: $('special-close'),
      pause: $('pause'),
      pauseTitle: $('pause-title'),
      pauseStats: $('pause-stats'),
      pauseResume: $('pause-resume'),
      pauseRestart: $('pause-restart'),
      pauseQuit: $('pause-quit'),
      penalty: $('penalty'),
      penaltyScore: $('penalty-score'),
      penaltyRound: $('penalty-round'),
      penaltyPrompt: $('penalty-prompt'),
      penaltyHint: $('penalty-hint'),
      penaltyBall: $('penalty-ball'),
      penaltyKeeper: $('penalty-keeper'),
      penaltyChoices: $('penalty-choices'),
      toastLayer: $('toast-layer'),
      banner: $('banner'),
      bannerKicker: $('banner-kicker'),
      bannerTitle: $('banner-title'),
      bannerSub: $('banner-sub')
    };
    this._bind();
  }

  _bind() {
    const on = (el, ev, fn) => {
      if (!el) return;
      el.addEventListener(ev, fn);
      this.bound.push([el, ev, fn]);
    };
    on(this.el.duelCommands, 'click', (e) => {
      const btn = e.target.closest('[data-cmd]');
      if (!btn || btn.disabled) return;
      this.cb.onDuelCommand?.(btn.dataset.cmd);
    });
    on(this.el.duelMeter, 'click', () => this.cb.onDuelLock?.());
    on(this.el.specialClose, 'click', () => this.cb.onSpecialClose?.());
    on(this.el.pauseBtn, 'click', () => this.cb.onPause?.());
    on(this.el.soundBtn, 'click', () => this.cb.onSound?.());
    on(this.el.pauseResume, 'click', () => this.cb.onResume?.());
    on(this.el.pauseRestart, 'click', () => this.cb.onRestart?.());
    on(this.el.pauseQuit, 'click', () => this.cb.onQuit?.());
    on(this.el.penaltyChoices, 'click', (e) => {
      const btn = e.target.closest('[data-penalty]');
      if (!btn || btn.disabled) return;
      this.cb.onPenalty?.(btn.dataset.penalty);
    });
  }

  delay(fn, ms) {
    const id = setTimeout(() => { this.timers.delete(id); fn(); }, ms);
    this.timers.add(id);
    return id;
  }

  setScreen(config) {
    const h = config.home, a = config.away;
    this.el.home.innerHTML = `<span class="sb-dot"></span><span class="sb-name">${h.short}</span>`;
    this.el.home.querySelector('.sb-dot').style.background = h.color;
    this.el.away.innerHTML = `<span class="sb-name">${a.short}</span><span class="sb-dot"></span>`;
    this.el.away.querySelector('.sb-dot').style.background = a.color;
    this.el.clock.textContent = "1'";
    this.el.half.textContent = '1ST HALF';
    this.el.tensionFill.style.width = '0%';
    this.el.tensionValue.textContent = '0';
    this.el.commentary.classList.remove('show');
    this.el.goalBanner.classList.remove('show');
    this.el.hud.hidden = false;
  }

  update(match) {
    this.el.score.innerHTML = `${match.score[0]} <i>:</i> ${match.score[1]}`;
    this.el.clock.textContent = match.clockLabel;
    this.el.half.textContent = match.halfLabel;
    const pct = Math.round(match.tension);
    this.el.tensionFill.style.width = `${pct}%`;
    this.el.tensionValue.textContent = pct;
    this.el.tensionWrap.classList.toggle('full', pct >= 100);
    if (typeof match.commentaryT === 'number') {
      this.el.commentary.classList.toggle('show', match.commentaryT > 0);
    }
  }

  say(speaker, text, duration = 3.4) {
    this.el.commentary.innerHTML = `<b>${speaker}</b> ${text}`;
    this.el.commentary.classList.add('show');
    if (this.commentTimer) clearTimeout(this.commentTimer);
    this.commentTimer = setTimeout(() => {
      this.el.commentary.classList.remove('show');
    }, duration * 1000);
    this.timers.add(this.commentTimer);
  }

  toast(text, kind = '') {
    const div = document.createElement('div');
    div.className = `toast ${kind}`;
    const [head, ...rest] = text.split('|');
    div.innerHTML = rest.length ? `<b>${head}</b><span>${rest.join('|')}</span>` : `<span>${head}</span>`;
    this.el.toastLayer.appendChild(div);
    this.toasts.push(div);
    while (this.toasts.length > 3) {
      const old = this.toasts.shift();
      old.remove();
    }
    this.delay(() => {
      div.classList.add('out');
      this.delay(() => div.remove(), 320);
      this.toasts = this.toasts.filter((x) => x !== div);
    }, 3000);
  }

  banner(kicker, title, sub, duration = 2600) {
    this.el.bannerKicker.textContent = kicker;
    this.el.bannerTitle.textContent = title;
    this.el.bannerSub.textContent = sub || '';
    this.el.banner.hidden = false;
    this.el.banner.classList.remove('out');
    void this.el.banner.offsetWidth;
    if (this.bannerTimer) clearTimeout(this.bannerTimer);
    this.bannerTimer = setTimeout(() => {
      this.el.banner.classList.add('out');
      this.delay(() => { this.el.banner.hidden = true; }, 320);
    }, duration);
    this.timers.add(this.bannerTimer);
  }

  goal(scorer, team) {
    this.el.goalSub.textContent = scorer || 'GOAL!';
    this.el.goalBanner.classList.remove('show');
    void this.el.goalBanner.offsetWidth;
    this.el.goalBanner.classList.add('show');
    this.el.goalBanner.style.filter = team === 1 ? 'hue-rotate(160deg)' : '';
    if (this.goalTimer) clearTimeout(this.goalTimer);
    this.goalTimer = setTimeout(() => this.el.goalBanner.classList.remove('show'), 2800);
    this.timers.add(this.goalTimer);
  }

  openDuel(match) {
    const d = match.duel;
    const atk = d.attacker;
    const def = d.defender;
    const attack = d.type === 'attack';
    this.el.duelTitle.textContent = attack ? 'MAKE SOMETHING HAPPEN' : 'WIN THE BALL BACK';
    this.el.duelContext.textContent = attack ? 'KEEP POSSESSION' : 'DEFENSIVE DUEL';
    this.el.duelNameA.textContent = atk.isUser ? 'CARLOS' : atk.name;
    this.el.duelRoleA.textContent = `${atk.role} · TECH ${atk.stats.technique}`;
    this.el.duelNameB.textContent = def.isUser ? 'CARLOS' : def.name;
    this.el.duelRoleB.textContent = `${def.role} · TECH ${def.stats.technique}`;
    this.el.duelBarA.style.width = `${clampPct(atk.stats.technique)}%`;
    this.el.duelBarB.style.width = `${clampPct(def.stats.technique)}%`;
    drawPortrait(this.el.duelPortraitA, atk.isUser ? 'carlos' : portraitFor(atk), attack ? 'intense' : 'stern');
    drawPortrait(this.el.duelPortraitB, def.isUser ? 'carlos' : portraitFor(def), 'intense');
    this.el.duelCommands.innerHTML = attack ? `
      <button type="button" class="duel-cmd" data-cmd="dribble"><span class="cmd-key">1</span><b>DRIBBLE</b><small>Technique</small></button>
      <button type="button" class="duel-cmd" data-cmd="pass"><span class="cmd-key">2</span><b>PASS</b><small>Find a friend</small></button>
      <button type="button" class="duel-cmd" data-cmd="shoot"><span class="cmd-key">3</span><b>SHOOT</b><small>Go for goal</small></button>
      <button type="button" class="duel-cmd special" data-cmd="special"><span class="cmd-key">4</span><b>SAMBA</b><small>${match.tension >= 20 ? '20 energy' : 'Need 20'}</small></button>
    ` : `
      <button type="button" class="duel-cmd" data-cmd="tackle"><span class="cmd-key">1</span><b>TACKLE</b><small>Power</small></button>
      <button type="button" class="duel-cmd" data-cmd="contain"><span class="cmd-key">2</span><b>CONTAIN</b><small>Stay close</small></button>
      <button type="button" class="duel-cmd" data-cmd="slide"><span class="cmd-key">3</span><b>SLIDE</b><small>Risk it</small></button>
      <button type="button" class="duel-cmd" data-cmd="special"><span class="cmd-key">4</span><b>SAMBA</b><small>${match.tension >= 20 ? '20 energy' : 'Need 20'}</small></button>
    `;
    if (attack) {
      const special = this.el.duelCommands.querySelector('[data-cmd="special"]');
      if (match.tension < 20) special.disabled = true;
      const shoot = this.el.duelCommands.querySelector('[data-cmd="shoot"]');
      if (!match.canShoot(atk)) shoot.disabled = true;
    } else {
      const special = this.el.duelCommands.querySelector('[data-cmd="special"]');
      if (match.tension < 20) special.disabled = true;
    }
    this.el.duelMeterWrap.hidden = true;
    this.el.duelOutcome.hidden = true;
    this.el.duel.hidden = false;
  }

  duelChoosePhase() {
    this.el.duelMeterWrap.hidden = false;
    this.el.duelOutcome.hidden = true;
    this.el.duelMeterHint.textContent = 'PRESS SPACE / TAP TO LOCK';
  }

  updateDuelMeter(value) {
    this.el.duelNeedle.style.left = `${value * 100}%`;
  }

  duelOutcome(text, bad = false) {
    this.el.duelOutcome.textContent = text;
    this.el.duelOutcome.hidden = false;
    this.el.duelOutcome.classList.toggle('bad', bad);
    this.el.duelMeterWrap.hidden = true;
  }

  closeDuel() {
    this.el.duel.hidden = true;
  }

  openSpecial(options, tension) {
    this.el.specialEnergy.textContent = Math.floor(tension);
    this.el.specialCards.innerHTML = options.map((o, i) => `
      <button type="button" class="special-card" data-special="${o.key}" ${o.enabled ? '' : 'disabled'}>
        <span class="sp-key">${i + 1}</span>
        <span class="sp-cost ${o.enabled ? '' : 'short'}">${o.cost} SAMBA</span>
        <span class="sp-icon">${o.icon}</span>
        <h3>${o.name}</h3>
        <p>${o.desc}${o.reason ? `<br><em>${o.reason}</em>` : ''}</p>
      </button>
    `).join('');
    this.el.specialCards.querySelectorAll('[data-special]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!btn.disabled) this.cb.onSpecial?.(btn.dataset.special);
      });
    });
    this.el.special.hidden = false;
  }

  closeSpecial() {
    this.el.special.hidden = true;
  }

  openPause(match) {
    this.el.pauseTitle.textContent = match.config.venue;
    const poss = match.possessionPct();
    this.el.pauseStats.innerHTML = `
      <div class="pause-stat">SCORE<b>${match.score[0]} – ${match.score[1]}</b></div>
      <div class="pause-stat">POSSESSION<b>${poss[0]}% – ${poss[1]}%</b></div>
      <div class="pause-stat">SHOTS<b>${match.stats.shots[0]} – ${match.stats.shots[1]}</b></div>
      <div class="pause-stat">SAMBA<b>${Math.floor(match.tension)} / 100</b></div>
    `;
    this.el.pause.hidden = false;
  }

  closePause() {
    this.el.pause.hidden = true;
  }

  openPenalty() {
    this.el.penalty.hidden = false;
    this.resetPenaltyStage();
  }

  resetPenaltyStage() {
    this.el.penaltyBall.className = 'penalty-ball';
    this.el.penaltyKeeper.className = 'penalty-keeper';
    this.el.penaltyChoices.querySelectorAll('button').forEach((b) => { b.disabled = false; });
  }

  setPenalty(state) {
    this.el.penaltyScore.innerHTML = `${state.home} <span>–</span> ${state.away}`;
    this.el.penaltyRound.textContent = `ROUND ${state.round} · ${state.turn === 'home' ? 'BRASIL' : 'JAPÃO'}`;
    this.el.penaltyPrompt.textContent = state.phase === 'dive' ? 'PICK YOUR DIVE' : 'PICK YOUR CORNER';
    this.el.penaltyHint.textContent = state.message || 'THE STORY NEEDS A WINNER';
    this.el.penaltyChoices.querySelectorAll('button').forEach((b) => { b.disabled = state.animating; });
    this.resetPenaltyStage();
  }

  animatePenalty(dir, keeperDir, saved, isDive) {
    this.resetPenaltyStage();
    this.el.penaltyChoices.querySelectorAll('button').forEach((b) => { b.disabled = true; });
    // force reflow for CSS transition
    void this.el.penaltyBall.offsetWidth;
    const ballDir = dir === 'left' ? 'kick-left' : dir === 'right' ? 'kick-right' : 'kick-center';
    this.el.penaltyBall.classList.add(ballDir);
    if (saved) this.el.penaltyBall.classList.add('saved');
    this.el.penaltyKeeper.classList.add(`dive-${keeperDir}`);
    return saved;
  }

  penaltyResult(text) {
    this.el.penaltyPrompt.textContent = text;
    this.el.penaltyHint.textContent = 'GET READY...';
  }

  closePenalty() {
    this.el.penalty.hidden = true;
  }

  destroy() {
    for (const [el, ev, fn] of this.bound) el.removeEventListener(ev, fn);
    this.bound = [];
    for (const id of this.timers) clearTimeout(id);
    this.timers.clear();
    for (const t of this.toasts) t.remove();
    this.toasts = [];
    this.el.hud.hidden = true;
    this.el.duel.hidden = true;
    this.el.special.hidden = true;
    this.el.pause.hidden = true;
    this.el.penalty.hidden = true;
    this.el.banner.hidden = true;
    this.el.goalBanner.classList.remove('show');
    this.el.commentary.classList.remove('show');
    this.el.toastLayer.innerHTML = '';
  }
}

function clampPct(v) { return Math.max(5, Math.min(100, v)); }
function portraitFor(p) {
  if (p.portrait) return p.portrait;
  const n = (p.name || '').toUpperCase();
  if (n.includes('RATINHO')) return 'ratinho';
  if (n.includes('ROJAS')) return 'rojas';
  if (n.includes('TSUBASA')) return 'tsubasa';
  if (n.includes('NANDO')) return 'nando';
  if (n.includes('HYUGA')) return 'hyuga';
  if (n.includes('MISUGI')) return 'misugi';
  if (n.includes('VIDAL')) return 'vidal';
  return p.team === 0 ? 'nando' : 'ratinho';
}
