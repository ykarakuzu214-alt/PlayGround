/* =========================================================
   MATCH — 6v6 football simulation, duels, specials, shootout
   ========================================================= */

import { FIELD, GOAL, CENTER } from './arena.js';
import { clamp, rand } from './pixel.js';
import { MatchUI } from './match-ui.js';

const HOME = 0;
const AWAY = 1;

export const SPECIALS = {
  samba: {
    name: 'SAMBA STEP', cost: 20, icon: '\u2736',
    desc: 'A burst of rhythm. Dance past the nearest defender and keep the ball alive.'
  },
  combi: {
    name: 'GOLDEN COMBI', cost: 35, icon: '\u221e',
    desc: 'A one-two into space. A teammate gives it back while the defence is still turning.'
  },
  rotation: {
    name: 'SANTANA ROTATION', cost: 55, icon: '10',
    desc: 'The spinning wonder shot. If it leaves his foot, the net is in trouble.'
  }
};

const SLOTS = {
  GK: [[64, 196]],
  DF: [[152, 142], [152, 250]],
  MF: [[258, 152], [258, 240]],
  FW: [[362, 196]]
};

const d2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const dPoint = (a, x, y) => Math.hypot(a.x - x, a.y - y);
const inField = (p) => {
  p.x = clamp(p.x, FIELD.l + 7, FIELD.r - 7);
  p.y = clamp(p.y, FIELD.t + 7, FIELD.b - 7);
};

export class Match {
  constructor(opts) {
    this.opts = opts;
    this.config = opts.config;
    this.chapter = opts.chapter;
    this.audio = opts.audio;
    this.input = opts.input;
    this.cb = opts.callbacks || {};
    this.userStats = opts.stats || this.chapter.baseStats;
    this.difficulty = this.config.difficulty ?? 0.65;

    this.home = { ...this.config.home, players: [] };
    this.away = { ...this.config.away, players: [] };
    this.score = [0, 0];
    this.stats = {
      shots: [0, 0], possession: [0, 0], duelsWon: 0,
      specialsUsed: 0, saves: [0, 0], goals: [0, 0]
    };
    this.tension = 12;
    this.half = 1;
    this.halfElapsed = 0;
    this.halfSeconds = this.config.halfSeconds ?? 55;
    this.state = 'kickoff';
    this.stateT = 0;
    this.kickoffTeam = HOME;
    this.time = 0;
    this.paused = false;
    this.menuOpen = false;
    this.finished = false;
    this.delivered = false;
    this.overT = 0;
    this.cine = null;
    this.charge = null;
    this.duel = null;
    this.duelCooldown = 0;
    this.effects = [];
    this.shake = 0;
    this.flash = 0;
    this.scripted = new Set();
    this.unlocked = new Set(this.config.specials || ['samba']);
    this.combiReturn = null;
    this.breakType = null;
    this.pen = null;
    this.result = null;
    this.crowdT = 0;

    this.buildPlayers();
    this.ball = {
      x: CENTER.x, y: CENTER.y, vx: 0, vy: 0, owner: null, team: HOME,
      roll: 0, trail: [], flight: null, shot: null, lastTouch: null
    };
    this.user = this.home.players.find((p) => p.isUser);

    this.ui = new MatchUI({
      onDuelCommand: (cmd) => this.chooseDuelCommand(cmd),
      onDuelLock: () => this.lockDuel(),
      onSpecial: (key) => this.useSpecial(key),
      onSpecialClose: () => this.closeSpecial(),
      onPause: () => this.togglePause(),
      onSound: () => this.cb.onSound?.(),
      onResume: () => this.resume(),
      onRestart: () => this.cb.onRestart?.(),
      onQuit: () => this.cb.onQuit?.(),
      onPenalty: (dir) => this.choosePenalty(dir)
    });

    this.ui.setScreen(this.config);
    this.ui.update(this);
    this.ui.say('KICK OFF', `${this.home.short} versus ${this.away.short}. The story starts now.`, 4);
    this.resetPositions();
    this.audio?.setCrowd?.(0.055);
    this.audio?.sfx?.('crowd');
  }

  /* ------------------------------------------------------------------ */
  /* TEAM BUILD                                                          */
  /* ------------------------------------------------------------------ */

  buildPlayers() {
    this.home.players = this.config.home.lineup.map((spec, i) => this.makePlayer(spec, HOME, i));
    this.away.players = this.config.away.lineup.map((spec, i) => this.makePlayer(spec, AWAY, i));
  }

  makePlayer(spec, team, i) {
    const cfg = team === HOME ? this.home : this.away;
    const stats = spec.isUser
      ? { ...this.userStats }
      : {
          pace: spec.pace ?? 58,
          technique: spec.technique ?? 58,
          power: spec.power ?? 58,
          flair: spec.flair ?? 60
        };
    const role = spec.role || 'MF';
    const slot = SLOTS[role] || SLOTS.MF;
    const slotIndex = (this[team === HOME ? '_hSlots' : '_aSlots'] ||= { GK: 0, DF: 0, MF: 0, FW: 0 });
    let [x, y] = slot[slotIndex[role] % slot.length] || [320, 196];
    slotIndex[role] += 1;
    if (team === AWAY) x = 640 - x;
    return {
      id: `${team}-${i}-${spec.name}`,
      name: spec.name,
      num: spec.num,
      role,
      team,
      isUser: !!spec.isUser,
      kit: { color: cfg.color, accent: cfg.accent },
      stats,
      x, y, vx: 0, vy: 0,
      baseX: x, baseY: y,
      facing: team === HOME ? 1 : -1,
      anim: rand(0, 5),
      speed: 0,
      stun: 0,
      hold: 0,
      tackleCd: 0,
      decisionT: rand(0.3, 1.1),
      portrait: spec.portrait
    };
  }

  resetPositions() {
    for (const p of [...this.home.players, ...this.away.players]) {
      p.x = p.baseX;
      p.y = p.baseY;
      p.vx = p.vy = 0;
      p.stun = 0;
      p.hold = 0;
      p.tackleCd = 0;
      p.decisionT = rand(0.35, 1.2);
    }
    const kicker = this.kickoffTeam;
    if (kicker === HOME) this.user.x = CENTER.x - 22;
    else {
      const fw = this.away.players.find((p) => p.role === 'FW') || this.away.players.at(-1);
      fw.x = CENTER.x + 22;
    }
    this.ball.owner = null;
    this.ball.flight = null;
    this.ball.shot = null;
    this.ball.vx = this.ball.vy = 0;
    this.ball.x = CENTER.x;
    this.ball.y = CENTER.y;
    this.ball.trail = [];
    this.charge = null;
  }

  /* ------------------------------------------------------------------ */
  /* FRAME UPDATE                                                        */
  /* ------------------------------------------------------------------ */

  update(dt) {
    dt = Math.min(dt, 0.05);
    this.time += dt;
    this.stateT += dt;

    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 15);
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 2.4);
    this.updateEffects(dt);

    if (this.paused) {
      this.ui.update(this);
      return;
    }

    if (this.cine) {
      this.updateCine(dt);
      this.ui.update(this);
      return;
    }

    if (this.menuOpen) {
      this.handleMenuKeys();
      this.ui.update(this);
      return;
    }

    if (this.duelCooldown > 0) this.duelCooldown -= dt;

    switch (this.state) {
      case 'kickoff': this.updateKickoff(dt); break;
      case 'play': this.updatePlay(dt); break;
      case 'duel': this.updateDuel(dt); break;
      case 'goal': this.updateGoal(dt); break;
      case 'break': this.updateBreak(dt); break;
      case 'penalties': this.updatePenalties(dt); break;
      case 'over': this.updateOver(dt); break;
      default: break;
    }

    this.ui.update(this);
  }

  updateKickoff(dt) {
    if (this.stateT < 1.15) return;
    const team = this.kickoffTeam;
    const player = team === HOME
      ? this.user
      : (this.away.players.find((p) => p.role === 'FW') || this.away.players.at(-1));
    this.setOwner(player);
    this.state = 'play';
    this.stateT = 0;
    this.duelCooldown = 1.15;
    this.audio?.sfx?.('whistle');
    this.ui.say('KICK OFF', team === HOME ? 'Brasil get the ball moving.' : `${this.away.short} restart the match.`, 2.2);
  }

  updatePlay(dt) {
    const input = this.input;

    if (input.take('pause')) { this.togglePause(); return; }
    if (input.take('special')) { this.openSpecial(); return; }
    if (this.charge && this.ball.owner !== this.user) this.charge = null;

    if (this.charge?.active) {
      this.charge.t += dt;
      const aim = input.vector();
      this.charge.aimY = clamp(this.charge.aimY + aim.y * dt * 1.7, -1, 1);
      const cyc = (this.charge.t * 1.75) % 2;
      this.charge.quality = Math.max(0.12, cyc < 1 ? cyc : 2 - cyc);
      if (!input.isDown('shoot') && this.charge.t > 0.05) {
        this.releaseShot();
        return;
      }
    } else if (this.ball.owner === this.user && input.isDown('shoot')) {
      this.charge = { active: true, t: 0, quality: 0, aimY: 0 };
    }

    this.moveUser(input.vector(), dt);

    if (input.take('pass')) {
      if (this.ball.owner === this.user) this.userPass();
      else this.userTackle();
    }

    if (this.ball.owner) this.followOwner();
    if (this.tryDuels(dt)) return;

    this.updateAI(dt);
    if (this.ball.owner) this.followOwner();
    else this.updateBall(dt);

    if (this.combiReturn) {
      this.combiReturn.t -= dt;
      if (this.combiReturn.t <= 0) {
        const mate = this.combiReturn.mate;
        this.combiReturn = null;
        if (this.ball.owner === mate) this.startPass(mate, this.user);
      }
    }

    this.stats.possession[this.ball.team] += dt;
    this.halfElapsed += dt;
    this.checkScripts();
    this.checkHalfEnd();
  }

  updateGoal(dt) {
    if (this.stateT < 2.55) return;
    if (this.half === 3) {
      this.finishMatch(this.score[HOME] > this.score[AWAY]);
      return;
    }
    this.kickoff(1 - this.lastGoalTeam);
  }

  updateBreak(dt) {
    if (this.stateT < 1.7) return;
    if (this.breakType === 'half') {
      this.half = 2;
      this.halfElapsed = 0;
      this.halfSeconds = this.config.halfSeconds ?? 55;
      this.kickoff(AWAY);
      this.ui.banner('SECOND HALF', 'THE BAND PLAYS ON', this.config.venue, 2200);
    } else if (this.breakType === 'golden') {
      this.half = 3;
      this.halfElapsed = 0;
      this.halfSeconds = this.config.goldenSeconds ?? 28;
      this.kickoff(this.score[0] === this.score[1] ? AWAY : HOME);
      this.ui.banner('GOLDEN GOAL', 'NEXT GOAL WINS', 'THE STORY NEEDS A HERO', 2600);
      this.audio?.sfx?.('heartbeat');
    } else if (this.breakType === 'penalties') {
      this.startPenalties();
    } else {
      this.finishMatch(this.score[HOME] > this.score[AWAY]);
    }
  }

  updateOver(dt) {
    if (this.delivered) return;
    this.overT -= dt;
    if (this.overT <= 0) {
      this.delivered = true;
      this.cb.onFinish?.(this.result);
    }
  }

  /* ------------------------------------------------------------------ */
  /* CLOCK / FLOW                                                        */
  /* ------------------------------------------------------------------ */

  get minute() {
    if (this.half === 1) return 45 * clamp(this.halfElapsed / this.halfSeconds, 0, 1);
    if (this.half === 2) return 45 + 45 * clamp(this.halfElapsed / this.halfSeconds, 0, 1);
    return 90 + 5 * clamp(this.halfElapsed / this.halfSeconds, 0, 1);
  }

  get clockLabel() {
    const m = Math.floor(this.minute);
    if (this.half === 3) return `90+${Math.max(1, m - 89)}'`;
    return `${Math.max(1, m)}'`;
  }

  get halfLabel() {
    if (this.half === 1) return '1ST HALF';
    if (this.half === 2) return '2ND HALF';
    return 'GOLDEN GOAL';
  }

  checkHalfEnd() {
    if (this.halfElapsed < this.halfSeconds) return;
    this.charge = null;
    if (this.half === 1) {
      this.breakType = 'half';
      this.state = 'break';
      this.stateT = 0;
      this.ui.banner('HALF TIME', 'CATCH YOUR BREATH', `${this.score[0]} \u2013 ${this.score[1]}`, 2000);
      this.audio?.sfx?.('whistle');
    } else if (this.half === 2) {
      if (this.score[0] === this.score[1]) {
        this.breakType = 'golden';
        this.state = 'break';
        this.stateT = 0;
        this.ui.banner('FULL TIME', 'LEVEL SCORES', 'GOLDEN GOAL NEXT', 2200);
        this.audio?.sfx?.('whistle');
      } else {
        this.breakType = 'fulltime';
        this.state = 'break';
        this.stateT = 0;
        this.ui.banner('FULL TIME', this.score[0] > this.score[1] ? 'BRASIL WIN' : 'THEY WIN', `${this.score[0]} \u2013 ${this.score[1]}`, 2200);
        this.audio?.sfx?.('whistle');
      }
    } else {
      if (this.score[0] === this.score[1]) {
        this.breakType = 'penalties';
        this.state = 'break';
        this.stateT = 0;
        this.ui.banner('STILL LEVEL', 'PENALTY SHOOTOUT', 'THE STORY NEEDS A WINNER', 2200);
        this.audio?.sfx?.('whistle');
      } else {
        this.finishMatch(this.score[0] > this.score[1]);
      }
    }
  }

  kickoff(team) {
    this.kickoffTeam = team;
    this.resetPositions();
    this.state = 'kickoff';
    this.stateT = 0;
    this.penaltyWinner = null;
  }

  finishMatch(win) {
    if (this.finished) return;
    this.finished = true;
    this.state = 'over';
    this.overT = 0.85;
    this.charge = null;
    this.duel = null;
    this.ui.closeDuel();
    this.ui.closeSpecial();
    this.ui.closePenalty();
    this.audio?.setCrowd?.(0.03);
    this.audio?.sfx?.(win ? 'win' : 'lose');
    this.result = {
      win,
      score: [...this.score],
      penalties: this.pen ? { home: this.pen.home, away: this.pen.away } : null,
      stats: this.stats,
      possession: this.possessionPct(),
      config: this.config,
      tension: Math.round(this.tension),
      specials: [...this.unlocked]
    };
  }

  possessionPct() {
    const a = this.stats.possession[0];
    const b = this.stats.possession[1];
    const total = a + b || 1;
    return [Math.round(a / total * 100), Math.round(b / total * 100)];
  }

  /* ------------------------------------------------------------------ */
  /* USER CONTROL                                                        */
  /* ------------------------------------------------------------------ */

  speedOf(p) {
    let s = 44 + p.stats.pace * 0.58;
    if (p.team === AWAY) s *= 0.88 + this.difficulty * 0.18;
    return s;
  }

  moveUser(vec, dt) {
    const p = this.user;
    if (p.stun > 0) {
      p.stun -= dt;
      p.vx = p.vy = 0;
      return;
    }
    const len = Math.hypot(vec.x, vec.y);
    let speed = this.speedOf(p) * (this.charge?.active ? 0.26 : 1);
    if (len > 0.12) {
      p.vx = vec.x / len * speed;
      p.vy = vec.y / len * speed;
    } else {
      p.vx *= 0.55;
      p.vy *= 0.55;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.speed = Math.hypot(p.vx, p.vy);
    if (Math.abs(vec.x) > 0.15) p.facing = vec.x > 0 ? 1 : -1;
    p.anim += dt * (p.speed > 4 ? 1 : 0.25);
    inField(p);
  }

  followOwner() {
    const o = this.ball.owner;
    if (!o) return;
    this.ball.x = clamp(o.x + o.facing * 7.5, FIELD.l + 4, FIELD.r - 4);
    this.ball.y = o.y + 1;
    this.ball.team = o.team;
    this.ball.lastTouch = o;
    this.ball.roll += 0.018;
    this.ball.vx = 0;
    this.ball.vy = 0;
  }

  releaseShot() {
    if (!this.charge) return;
    const q = this.charge.quality;
    const aim = this.charge.aimY;
    this.charge = null;
    if (this.ball.owner !== this.user) return;
    this.startShot(this.user, aim, q);
  }

  userPass() {
    if (this.ball.owner !== this.user) return;
    this.charge = null;
    const target = this.pickPassTarget(this.user);
    if (target) this.startPass(this.user, target);
    else this.kickForward(this.user);
    this.tension = clamp(this.tension + 2, 0, 100);
  }

  kickForward(p) {
    const dir = p.team === HOME ? 1 : -1;
    this.ball.owner = null;
    this.ball.flight = null;
    this.ball.shot = null;
    this.ball.vx = dir * 300;
    this.ball.vy = rand(-40, 40);
    this.ball.team = p.team;
    this.ball.lastTouch = p;
    this.audio?.sfx?.('pass');
  }

  userTackle() {
    const p = this.user;
    if (p.tackleCd > 0) return;
    p.tackleCd = 0.7;
    const owner = this.ball.owner;
    if (owner && owner.team === AWAY && d2(owner, p) < 25) {
      const roll = p.stats.power * 0.58 + p.stats.technique * 0.42 + rand(0, 26);
      const hold = owner.stats.technique * 0.6 + owner.stats.power * 0.4 + rand(0, 24);
      if (roll > hold) {
        this.setOwner(p);
        owner.stun = 0.75;
        this.tension = clamp(this.tension + 8, 0, 100);
        this.addDust(p.x, p.y, 8, '#f7e8c8');
        this.audio?.sfx?.('tackle');
        this.ui.say('CARLOS', 'Won it back with a little samba.', 2.2);
      } else {
        p.stun = 0.45;
        this.tension = clamp(this.tension + 1, 0, 100);
        this.audio?.sfx?.('tackle');
      }
    } else {
      p.stun = 0.2;
    }
  }

  /* ------------------------------------------------------------------ */
  /* SPECIALS                                                            */
  /* ------------------------------------------------------------------ */

  getSpecialOptions() {
    const keys = Object.keys(SPECIALS).filter((k) => this.unlocked.has(k));
    const hasBall = this.ball.owner === this.user;
    return keys.map((key) => {
      const d = SPECIALS[key];
      const enough = this.tension >= d.cost;
      return {
        key, name: d.name, cost: d.cost, icon: d.icon, desc: d.desc,
        enabled: enough && hasBall && !this.finished,
        reason: !hasBall ? 'NEED THE BALL' : !enough ? `NEED ${d.cost} SAMBA` : ''
      };
    });
  }

  openSpecial() {
    this.menuOpen = true;
    this.charge = null;
    this.ui.openSpecial(this.getSpecialOptions(), this.tension);
    this.audio?.sfx?.('select');
  }

  closeSpecial() {
    this.menuOpen = false;
    this.ui.closeSpecial();
  }

  handleMenuKeys() {
    const input = this.input;
    if (input.take('pause')) { this.closeSpecial(); return; }
    if (input.take('opt1')) this.useSpecial('samba');
    else if (input.take('opt2')) this.useSpecial('combi');
    else if (input.take('opt3')) this.useSpecial('rotation');
  }

  useSpecial(key) {
    if (!this.unlocked.has(key)) return;
    const d = SPECIALS[key];
    if (this.tension < d.cost) {
      this.ui.toast('NOT ENOUGH SAMBA', 'Keep the rhythm going.');
      return;
    }
    if (this.ball.owner !== this.user) {
      this.ui.toast('NEED THE BALL', 'Win it back first.');
      return;
    }
    this.closeSpecial();
    this.tension = clamp(this.tension - d.cost, 0, 100);
    this.stats.specialsUsed += 1;
    this.triggerSpecial(key);
  }

  triggerSpecial(key) {
    this.audio?.sfx?.('special');
    if (key === 'samba') {
      this.ui.banner('SPECIAL MOVE', 'SAMBA STEP', 'CARLOS SANTANA', 2100);
      this.startCine('samba', 1.75, () => {
        const def = this.nearestOpponent(this.user);
        if (def) {
          def.stun = 1.15;
          this.addDust(def.x, def.y, 10, '#ffe28a');
        }
        const dir = this.user.team === HOME ? 1 : -1;
        this.user.x = clamp(this.user.x + dir * 66, FIELD.l + 12, FIELD.r - 12);
        this.user.y = clamp(this.user.y + rand(-18, 18), FIELD.t + 12, FIELD.b - 12);
        this.setOwner(this.user);
        this.flash = 0.18;
        this.ui.toast('SAMBA STEP|The defender is still looking for the ball.', 'green');
      });
    } else if (key === 'combi') {
      this.ui.banner('SPECIAL MOVE', 'GOLDEN COMBI', 'THE BAND PLAYS TWICE', 2100);
      this.startCine('combi', 1.8, () => {
        const mate = this.home.players
          .filter((p) => p !== this.user && p.role !== 'GK')
          .sort((a, b) => b.stats.technique - a.stats.technique)[0] || this.user;
        this.user.x = clamp(this.user.x + (this.user.team === HOME ? 52 : -52), FIELD.l + 12, FIELD.r - 12);
        if (mate === this.user) this.setOwner(this.user);
        else {
          this.setOwner(mate);
          this.combiReturn = { mate, t: 0.52 };
          this.ui.toast('GOLDEN COMBI|One-two into space!', 'green');
        }
      });
    } else if (key === 'rotation') {
      this.ui.banner('SPECIAL MOVE', 'SANTANA ROTATION', 'CARLOS SANTANA', 2400);
      this.startCine('rotation', 2.15, () => {
        this.stats.shots[HOME] += 1;
        this.scoreGoal(HOME, this.user.name, { special: 'rotation' });
      });
    }
  }

  startCine(kind, dur, onEnd) {
    this.state = 'cine';
    this.stateT = 0;
    this.cine = { kind, t: 0, dur, onEnd };
    this.charge = null;
  }

  updateCine(dt) {
    const c = this.cine;
    c.t += dt;
    if (c.t >= c.dur) {
      const cb = c.onEnd;
      this.cine = null;
      this.state = 'play';
      this.stateT = 0;
      this.ball.shot = null;
      this.ball.flight = null;
      if (this.ball.owner) this.followOwner();
      cb?.();
    }
  }

  /* ------------------------------------------------------------------ */
  /* BALL / SHOTS / PASSES                                               */
  /* ------------------------------------------------------------------ */

  setOwner(p) {
    if (!p) return;
    if (this.ball.owner && this.ball.owner !== p) this.ball.owner.hold = 0;
    this.ball.owner = p;
    this.ball.team = p.team;
    this.ball.lastTouch = p;
    this.ball.flight = null;
    this.ball.shot = null;
    this.ball.vx = this.ball.vy = 0;
    p.hold = Math.max(p.hold || 0, 0.18);
  }

  startShot(p, aimY, quality, opts = {}) {
    if (!p) return;
    const team = p.team;
    const goalX = team === HOME ? FIELD.r : FIELD.l;
    const ty = clamp(CENTER.y + aimY * 30 + rand(-3, 3), GOAL.top - 12, GOAL.bottom + 12);
    const dur = clamp(Math.hypot(goalX - p.x, ty - p.y) / 520, 0.3, 0.8);
    this.ball.owner = null;
    this.ball.flight = null;
    this.ball.shot = {
      sx: p.x, sy: p.y, tx: goalX, ty,
      t: 0, dur, team, scorer: p.name, quality,
      special: opts.special || null, fromX: p.x
    };
    this.ball.team = team;
    this.ball.lastTouch = p;
    this.ball.vx = this.ball.vy = 0;
    this.ball.trail = [];
    this.stats.shots[team] += 1;
    this.charge = null;
    this.shake = Math.max(this.shake, 1.2);
    this.audio?.sfx?.('shot');
    if (p === this.user) this.ui.say('CARLOS', 'SHOOT!', 1.5);
  }

  updateShot(dt) {
    const s = this.ball.shot;
    s.t += dt;
    const q = clamp(s.t / s.dur, 0, 1);
    this.ball.x = s.sx + (s.tx - s.sx) * q;
    this.ball.y = s.sy + (s.ty - s.sy) * q - Math.sin(q * Math.PI) * 7;
    this.ball.roll += dt * 12;
    this.ball.trail.push({ x: this.ball.x, y: this.ball.y });
    if (this.ball.trail.length > 16) this.ball.trail.shift();
    if (q >= 1) this.resolveShot(s);
  }

  resolveShot(s) {
    const defTeam = 1 - s.team;
    const gk = this.gkOf(defTeam);
    const onTarget = s.ty > GOAL.top + 2 && s.ty < GOAL.bottom - 2;
    const rating = defTeam === HOME ? this.home.gkRating ?? 60 : this.away.gkRating ?? 60;
    let saveChance = clamp(0.30 + (rating - 60) * 0.009 + (1 - s.quality) * 0.32, 0.06, 0.82);
    if (s.special === 'rotation') saveChance = 0;
    if (s.special === 'drive') saveChance = 0;

    this.ball.shot = null;
    this.ball.trail = [];
    if (!onTarget) {
      this.ball.x = s.tx;
      this.ball.y = s.ty;
      this.addText('OFF TARGET', s.tx + (s.team === HOME ? -24 : 24), s.ty - 18, '#cdbfa5', 8);
      this.audio?.sfx?.('save');
      this.ui.say('CROWD', 'Oooooh. Wide of the post.', 1.8);
      this.goalKick(defTeam);
      return;
    }
    if (Math.random() < saveChance) {
      this.stats.saves[defTeam] += 1;
      this.addText('SAVED!', s.tx + (s.team === HOME ? -22 : 22), s.ty - 20, '#3ddc84', 10);
      this.addDust(s.tx, s.ty, 8, '#f7e8c8');
      this.audio?.sfx?.('save');
      this.ui.say('KEEPER', 'Denied!', 1.8);
      this.goalKick(defTeam);
    } else {
      this.scoreGoal(s.team, s.scorer, { special: s.special });
    }
  }

  goalKick(team) {
    const gk = this.gkOf(team);
    if (gk) this.setOwner(gk);
    this.state = 'play';
    this.stateT = 0;
  }

  scoreGoal(team, scorer, opts = {}) {
    this.score[team] += 1;
    this.stats.goals[team] += 1;
    this.lastGoalTeam = team;
    this.lastScorer = scorer;
    this.state = 'goal';
    this.stateT = 0;
    this.ball.owner = null;
    this.ball.flight = null;
    this.ball.shot = null;
    this.ball.x = team === HOME ? FIELD.r - 7 : FIELD.l + 7;
    this.ball.y = CENTER.y;
    this.charge = null;
    this.tension = clamp(this.tension + (team === HOME ? 14 : 2), 0, 100);
    this.ui.goal(scorer, team);
    this.ui.say(team === HOME ? 'GOOOOL' : 'HEARTBREAK', `${scorer} scores for ${team === HOME ? this.home.name : this.away.name}!`, 3);
    this.audio?.sfx?.('goal');
    this.shake = 5.5;
    this.flash = 0.34;
    this.addConfetti(team === HOME ? 90 : 45, this.ball.x, CENTER.y, team);
    this.addText('GOOOOL!', 320, 150, 20, '#ffc84a', 1);
    if (opts.special === 'rotation') this.ui.toast('SANTANA ROTATION|The whole stadium saw that.', 'green');
    if (opts.special === 'drive') this.ui.toast('DRIVE SHOT|Tsubasa answers.', 'coral');
  }

  startPass(from, to) {
    if (!from || !to) return;
    const lead = to.team === HOME ? 1 : -1;
    const tx = clamp(to.x + lead * 6, FIELD.l + 10, FIELD.r - 10);
    const ty = clamp(to.y, FIELD.t + 10, FIELD.b - 10);
    const dur = clamp(Math.hypot(tx - from.x, ty - from.y) / 430, 0.18, 0.62);
    this.ball.owner = null;
    this.ball.shot = null;
    this.ball.flight = {
      kind: 'pass', sx: from.x, sy: from.y, tx, ty,
      t: 0, dur, fromId: from.id, targetId: to.id, team: from.team
    };
    this.ball.team = from.team;
    this.ball.lastTouch = from;
    this.ball.vx = this.ball.vy = 0;
    this.ball.trail = [];
    this.audio?.sfx?.('pass');
    if (from === this.user) this.tension = clamp(this.tension + 1, 0, 100);
  }

  updateFlight(dt) {
    const f = this.ball.flight;
    f.t += dt;
    const q = clamp(f.t / f.dur, 0, 1);
    this.ball.x = f.sx + (f.tx - f.sx) * q;
    this.ball.y = f.sy + (f.ty - f.sy) * q;
    this.ball.roll += dt * 7;
    this.ball.trail.push({ x: this.ball.x, y: this.ball.y });
    if (this.ball.trail.length > 10) this.ball.trail.shift();

    if (f.t > f.dur * 0.18) {
      for (const p of this.allPlayers()) {
        if (p.team === f.team || p.role === 'GK') continue;
        if (dPoint(p, this.ball.x, this.ball.y) < 10 && Math.random() < dt * 3.4) {
          this.setOwner(p);
          this.addText('INTERCEPTED', p.x, p.y - 28, '#ff5d6c', 8);
          this.audio?.sfx?.('tackle');
          return;
        }
      }
    }

    if (q >= 1) {
      this.ball.flight = null;
      let target = this.allPlayers().find((p) => p.id === f.targetId);
      if (!target || dPoint(target, this.ball.x, this.ball.y) > 34) {
        target = this.nearestPlayer(this.ball.x, this.ball.y, f.team, 38);
      }
      if (target) {
        this.setOwner(target);
        if (f.team === HOME) this.tension = clamp(this.tension + 2, 0, 100);
      } else {
        this.ball.vx = rand(-30, 30);
        this.ball.vy = rand(-30, 30);
      }
    }
  }

  updateBall(dt) {
    if (this.ball.shot) { this.updateShot(dt); return; }
    if (this.ball.flight) { this.updateFlight(dt); return; }
    if (this.ball.owner) return;

    const b = this.ball;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.roll += Math.hypot(b.vx, b.vy) * dt * 0.06;
    const friction = Math.exp(-2.7 * dt);
    b.vx *= friction;
    b.vy *= friction;

    if (b.x < FIELD.l + 4) { b.x = FIELD.l + 4; b.vx = Math.abs(b.vx) * 0.55; }
    if (b.x > FIELD.r - 4) { b.x = FIELD.r - 4; b.vx = -Math.abs(b.vx) * 0.55; }
    if (b.y < FIELD.t + 4) { b.y = FIELD.t + 4; b.vy = Math.abs(b.vy) * 0.55; }
    if (b.y > FIELD.b - 4) { b.y = FIELD.b - 4; b.vy = -Math.abs(b.vy) * 0.55; }

    let best = null, bestD = 12;
    for (const p of this.allPlayers()) {
      const range = p.role === 'GK' ? 15 : 10;
      const d = dPoint(p, b.x, b.y);
      if (d < Math.min(bestD, range)) { best = p; bestD = d; }
    }
    if (best) {
      this.setOwner(best);
      if (best.team === HOME) this.tension = clamp(this.tension + 1.5, 0, 100);
    }
  }

  /* ------------------------------------------------------------------ */
  /* AI                                                                  */
  /* ------------------------------------------------------------------ */

  allPlayers() {
    return this.home.players.concat(this.away.players);
  }

  gkOf(team) {
    return (team === HOME ? this.home : this.away).players.find((p) => p.role === 'GK');
  }

  nearestOpponent(p) {
    let best = null, bd = Infinity;
    for (const o of this.allPlayers()) {
      if (o.team === p.team) continue;
      const d = d2(p, o);
      if (d < bd) { bd = d; best = o; }
    }
    return best;
  }

  nearestPlayer(x, y, team, maxDist = Infinity) {
    let best = null, bd = maxDist;
    for (const p of this.allPlayers()) {
      if (team !== undefined && p.team !== team) continue;
      const d = dPoint(p, x, y);
      if (d < bd) { bd = d; best = p; }
    }
    return best;
  }

  nearestOutfield(x, y, team) {
    let best = null, bd = Infinity;
    for (const p of (team === HOME ? this.home : this.away).players) {
      if (p.role === 'GK' || p.isUser) continue;
      const d = dPoint(p, x, y);
      if (d < bd) { bd = d; best = p; }
    }
    return best;
  }

  pickPassTarget(from) {
    const dir = from.team === HOME ? 1 : -1;
    let best = null, bestScore = -Infinity;
    for (const p of (from.team === HOME ? this.home : this.away).players) {
      if (p === from || p.role === 'GK') continue;
      const d = d2(from, p);
      if (d < 24 || d > 300) continue;
      const opp = this.nearestOpponent(p);
      const open = opp ? d2(p, opp) : 80;
      const score = (p.x - from.x) * dir * 0.55 + open * 0.75 - d * 0.22 + (p.isUser ? 20 : 0) + rand(0, 26);
      if (score > bestScore) { bestScore = score; best = p; }
    }
    return best;
  }

  aiPass(p) {
    const target = this.pickPassTarget(p);
    if (!target) return false;
    this.startPass(p, target);
    p.decisionT = rand(0.7, 1.4);
    return true;
  }

  aiShoot(p) {
    const q = clamp(0.38 + rand(0, 0.36) + this.difficulty * 0.16, 0.2, 0.96);
    this.startShot(p, rand(-0.72, 0.72), q);
    p.decisionT = rand(1, 1.8);
  }

  updateAI(dt) {
    const owner = this.ball.owner;
    const chaserHome = this.nearestOutfield(this.ball.x, this.ball.y, HOME);
    const chaserAway = this.nearestOutfield(this.ball.x, this.ball.y, AWAY);

    for (const p of this.allPlayers()) {
      if (p.isUser) continue;
      if (p.stun > 0) {
        p.stun -= dt;
        p.vx *= 0.7; p.vy *= 0.7;
        continue;
      }
      if (p.tackleCd > 0) p.tackleCd -= dt;
      if (p.hold > 0) p.hold -= dt;
      if (p.role === 'GK') { this.updateGK(p, dt, owner); continue; }

      const chaser = p.team === HOME ? chaserHome : chaserAway;
      const dir = p.team === HOME ? 1 : -1;

      if (owner === p) {
        if (this.combiReturn && this.combiReturn.mate === p) {
          p.tx = p.x; p.ty = p.y;
          this.moveToward(p, dt, 0);
          continue;
        }
        p.decisionT -= dt;
        const goalX = p.team === HOME ? FIELD.r : FIELD.l;
        const range = Math.abs(goalX - p.x);
        if (range < 108 && p.decisionT <= 0.45 && Math.random() < dt * 2.8) {
          this.aiShoot(p);
          continue;
        }
        const pressure = this.nearestOpponent(p);
        const pressed = pressure && d2(p, pressure) < 24;
        if ((pressed || p.decisionT <= 0) && Math.random() < (pressed ? 0.7 : 0.3)) {
          p.decisionT = rand(0.55, 1.3);
          if (this.aiPass(p)) continue;
        }
        p.tx = p.x + dir * 78;
        p.ty = clamp(p.y + Math.sin(this.time * 1.4 + p.num) * 17, FIELD.t + 16, FIELD.b - 16);
        this.moveToward(p, dt, 1);
      } else if (owner && owner.team === p.team) {
        const run = p.role === 'FW' ? 46 : p.role === 'MF' ? 26 : 8;
        p.tx = clamp(p.baseX + dir * run, FIELD.l + 16, FIELD.r - 16);
        p.ty = clamp(p.baseY + Math.sin(this.time * 1.1 + p.num * 0.7) * 14, FIELD.t + 16, FIELD.b - 16);
        this.moveToward(p, dt, 0.92);
      } else if (owner && owner.team !== p.team) {
        if (p === chaser) {
          p.tx = owner.x; p.ty = owner.y;
          this.moveToward(p, dt, 1.04);
          if (d2(p, owner) < 13 && p.tackleCd <= 0) {
            p.tackleCd = 1.05;
            const chance = clamp(0.24 + (p.stats.power - owner.stats.technique) * 0.011 + this.difficulty * 0.04, 0.08, 0.56);
            if (Math.random() < chance) {
              this.setOwner(p);
              owner.stun = 0.5;
              if (p.team === HOME) this.tension = clamp(this.tension + 4, 0, 100);
              this.audio?.sfx?.('tackle');
            } else {
              p.stun = 0.28;
            }
          }
        } else {
          p.tx = clamp(p.baseX - dir * 18, FIELD.l + 16, FIELD.r - 16);
          p.ty = p.baseY;
          this.moveToward(p, dt, 0.85);
        }
      } else {
        if (p === chaser) {
          p.tx = this.ball.x; p.ty = this.ball.y;
          this.moveToward(p, dt, 1.02);
        } else {
          p.tx = p.baseX; p.ty = p.baseY;
          this.moveToward(p, dt, 0.8);
        }
      }
    }
  }

  updateGK(p, dt, owner) {
    const line = p.team === HOME ? FIELD.l + 20 : FIELD.r - 20;
    p.tx = line;
    p.ty = clamp(this.ball.y, GOAL.top + 5, GOAL.bottom - 5);
    this.moveToward(p, dt, 1.05);
    if (owner === p) {
      p.hold -= dt;
      if (p.hold <= 0) {
        p.hold = 0.9;
        const target = this.pickPassTarget(p);
        if (target) this.startPass(p, target);
        else this.kickForward(p);
      }
    }
  }

  moveToward(p, dt, mult = 1) {
    const dx = p.tx - p.x;
    const dy = p.ty - p.y;
    const d = Math.hypot(dx, dy);
    const speed = this.speedOf(p) * mult;
    if (d > 1.5) {
      p.vx = dx / d * speed;
      p.vy = dy / d * speed;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.speed = speed;
      if (Math.abs(p.vx) > 4) p.facing = p.vx > 0 ? 1 : -1;
      p.anim += dt;
    } else {
      p.vx = p.vy = 0;
      p.speed = 0;
      p.anim += dt * 0.25;
    }
    inField(p);
  }

  tryDuels(dt) {
    if (this.duelCooldown > 0 || this.charge?.active) return false;
    const owner = this.ball.owner;
    if (owner === this.user) {
      const def = this.nearestOpponent(this.user);
      if (def && d2(def, this.user) < 15 && Math.random() < dt * 3.4) {
        this.startDuel('attack', this.user, def);
        return true;
      }
    } else if (owner && owner.team === AWAY) {
      if (d2(owner, this.user) < 15 && Math.random() < dt * 2.6) {
        this.startDuel('defense', owner, this.user);
        return true;
      }
    }
    return false;
  }

  canShoot(player) {
    if (!player) return false;
    return player.team === HOME ? player.x > FIELD.l + 150 : player.x < FIELD.r - 150;
  }

  /* ------------------------------------------------------------------ */
  /* 1v1 DUELS                                                           */
  /* ------------------------------------------------------------------ */

  startDuel(type, attacker, defender) {
    this.state = 'duel';
    this.stateT = 0;
    this.charge = null;
    this.duel = {
      type, attacker, defender,
      phase: 'choose', command: null,
      meter: 0, dir: 1, speed: 1.15,
      resultT: 0
    };
    this.ball.owner = attacker;
    this.audio?.sfx?.('duel');
    this.ui.openDuel(this);
  }

  chooseDuelCommand(cmd) {
    const d = this.duel;
    if (!d || d.phase !== 'choose') return;

    if (cmd === 'special') {
      if (this.tension < 20) return;
      this.tension = clamp(this.tension - 20, 0, 100);
      this.stats.specialsUsed += 1;
      this.audio?.sfx?.('special');
      this.addDust(d.attacker.x, d.attacker.y, 12, '#ffe28a');
      if (d.type === 'attack') {
        d.defender.stun = 1.1;
        this.setOwner(this.user);
        this.stats.duelsWon += 1;
        this.tension = clamp(this.tension + 8, 0, 100);
        this.ui.duelOutcome('SAMBA STEP!', false);
        this.audio?.sfx?.('win-duel');
      } else {
        this.setOwner(this.user);
        d.attacker.stun = 1.0;
        this.stats.duelsWon += 1;
        this.tension = clamp(this.tension + 10, 0, 100);
        this.ui.duelOutcome('SAMBA TACKLE!', false);
        this.audio?.sfx?.('win-duel');
      }
      d.phase = 'result';
      d.resultT = 0.9;
      return;
    }

    if (d.type === 'attack') {
      if (!['dribble', 'pass', 'shoot'].includes(cmd)) return;
      if (cmd === 'shoot' && !this.canShoot(d.attacker)) return;
    } else if (!['tackle', 'contain', 'slide'].includes(cmd)) return;

    d.command = cmd;
    d.phase = 'meter';
    d.meter = 0;
    d.dir = 1;
    d.speed = 1.15 + rand(0, 0.55);
    this.ui.duelChoosePhase();
    this.audio?.sfx?.('ui');
  }

  updateDuel(dt) {
    const d = this.duel;
    if (!d) return;

    if (d.phase === 'choose') {
      const attackMap = ['dribble', 'pass', 'shoot', 'special'];
      const defendMap = ['tackle', 'contain', 'slide', 'special'];
      const map = d.type === 'attack' ? attackMap : defendMap;
      for (let i = 0; i < 4; i++) {
        if (this.input.take(`opt${i + 1}`)) this.chooseDuelCommand(map[i]);
      }
      return;
    }

    if (d.phase === 'meter') {
      d.meter += d.dir * dt * d.speed;
      if (d.meter > 1) { d.meter = 1; d.dir = -1; }
      if (d.meter < 0) { d.meter = 0; d.dir = 1; }
      this.ui.updateDuelMeter(d.meter);
      if (this.input.take('shoot') || this.input.take('confirm')) this.lockDuel();
      return;
    }

    if (d.phase === 'result') {
      d.resultT -= dt;
      if (d.resultT <= 0) {
        this.ui.closeDuel();
        this.duel = null;
        this.state = 'play';
        this.stateT = 0;
        this.duelCooldown = 2.1;
        this.input.take('shoot');
      }
    }
  }

  lockDuel() {
    const d = this.duel;
    if (!d || d.phase !== 'meter') return;
    const quality = clamp(1 - Math.abs(d.meter - 0.5) * 2, 0, 1);
    const bonus = quality * 30;
    const perfect = quality > 0.78;

    if (d.type === 'attack') {
      if (d.command === 'dribble') {
        const att = d.attacker, def = d.defender;
        const rollA = att.stats.technique + bonus + rand(0, 24);
        const rollD = def.stats.technique + rand(0, 25);
        if (rollA > rollD) {
          this.setOwner(att);
          def.stun = 0.95;
          att.x = clamp(att.x + (att.team === HOME ? 12 : -12), FIELD.l + 10, FIELD.r - 10);
          this.tension = clamp(this.tension + 9, 0, 100);
          this.stats.duelsWon += 1;
          this.ui.duelOutcome(perfect ? 'PERFECT DRIBBLE!' : 'PAST HIM!', false);
          this.audio?.sfx?.('win-duel');
        } else {
          this.setOwner(def);
          att.stun = 0.55;
          this.ui.duelOutcome('TACKLED', true);
          this.audio?.sfx?.('lose-duel');
        }
      } else if (d.command === 'pass') {
        const att = d.attacker, def = d.defender;
        const target = this.pickPassTarget(att);
        const ok = target && att.stats.technique + bonus + rand(0, 24) > def.stats.technique + rand(0, 24);
        if (ok) {
          this.startPass(att, target);
          this.tension = clamp(this.tension + 7, 0, 100);
          this.stats.duelsWon += 1;
          this.ui.duelOutcome('NICE BALL!', false);
          this.audio?.sfx?.('win-duel');
        } else {
          this.setOwner(def);
          att.stun = 0.4;
          this.ui.duelOutcome('PASS READ', true);
          this.audio?.sfx?.('lose-duel');
        }
      } else if (d.command === 'shoot') {
        const att = d.attacker;
        const aim = rand(-0.48, 0.48);
        this.ui.closeDuel();
        this.duel = null;
        this.state = 'play';
        this.stateT = 0;
        this.duelCooldown = 1.4;
        this.startShot(att, aim, clamp(0.55 + quality * 0.42, 0.55, 0.97));
        return;
      }
    } else {
      const att = d.attacker, def = d.defender;
      if (d.command === 'tackle') {
        const rollD = def.stats.power + bonus + rand(0, 25);
        const rollA = att.stats.technique + rand(0, 26);
        if (rollD > rollA) {
          this.setOwner(def);
          att.stun = 0.8;
          this.tension = clamp(this.tension + 9, 0, 100);
          this.stats.duelsWon += 1;
          this.ui.duelOutcome(perfect ? 'PERFECT TACKLE!' : 'WON IT!', false);
          this.audio?.sfx?.('win-duel');
        } else {
          def.stun = 0.5;
          this.ui.duelOutcome('BEATEN', true);
          this.audio?.sfx?.('lose-duel');
        }
      } else if (d.command === 'contain') {
        const ok = def.stats.technique + bonus + rand(0, 20) > att.stats.technique + rand(0, 24);
        if (ok) {
          att.stun = 0.2;
          att.x = clamp(att.x - (att.team === HOME ? 10 : -10), FIELD.l + 10, FIELD.r - 10);
          this.tension = clamp(this.tension + 4, 0, 100);
          this.ui.duelOutcome('STAYED CLOSE', false);
        } else {
          att.x = clamp(att.x + (att.team === HOME ? 18 : -18), FIELD.l + 10, FIELD.r - 10);
          this.ui.duelOutcome('SLIPPED PAST', true);
        }
      } else if (d.command === 'slide') {
        const rollD = def.stats.power + bonus + rand(0, 28) + 8;
        const rollA = att.stats.technique + rand(0, 28);
        if (rollD > rollA) {
          this.setOwner(def);
          att.stun = 1.0;
          this.tension = clamp(this.tension + 11, 0, 100);
          this.stats.duelsWon += 1;
          this.ui.duelOutcome('CLEAN SLIDE!', false);
          this.audio?.sfx?.('win-duel');
        } else {
          def.stun = 1.3;
          att.x = clamp(att.x + (att.team === HOME ? 22 : -22), FIELD.l + 10, FIELD.r - 10);
          this.ui.duelOutcome('MISSED THE SLIDE', true);
          this.audio?.sfx?.('lose-duel');
        }
      }
    }

    d.phase = 'result';
    d.resultT = perfect ? 1.25 : 0.95;
  }

  /* ------------------------------------------------------------------ */
  /* PENALTY SHOOTOUT                                                    */
  /* ------------------------------------------------------------------ */

  startPenalties() {
    this.state = 'penalties';
    this.stateT = 0;
    this.ball.owner = null;
    this.pen = {
      home: 0, away: 0, homeKicks: 0, awayKicks: 0,
      round: 1, turn: 'home', phase: 'kick',
      wait: 0, after: null, done: false,
      message: 'THE STORY NEEDS A WINNER'
    };
    this.ui.closeSpecial();
    this.ui.openPenalty();
    this.syncPenalty();
    this.ui.say('SHOOTOUT', 'Five kicks each. The night will not end in a draw.', 4);
  }

  syncPenalty() {
    const p = this.pen;
    this.ui.setPenalty({
      home: p.home, away: p.away,
      round: p.round, turn: p.turn, phase: p.phase,
      message: p.message, animating: false
    });
  }

  updatePenalties(dt) {
    const p = this.pen;
    if (!p) return;
    if (p.wait > 0) {
      p.wait -= dt;
      if (p.wait <= 0) {
        const fn = p.after;
        p.after = null;
        fn?.();
      }
      return;
    }
    if (p.done) return;
    if (p.turn === 'home') {
      if (this.input.take('opt1')) this.choosePenalty('left');
      else if (this.input.take('opt2')) this.choosePenalty('center');
      else if (this.input.take('opt3')) this.choosePenalty('right');
    } else {
      if (this.input.take('opt1')) this.choosePenalty('left');
      else if (this.input.take('opt2')) this.choosePenalty('center');
      else if (this.input.take('opt3')) this.choosePenalty('right');
    }
  }

  choosePenalty(dir) {
    const p = this.pen;
    if (!p || p.wait > 0 || p.done) return;
    const choices = ['left', 'center', 'right'];
    if (p.turn === 'home') {
      const keeper = choices[Math.floor(Math.random() * 3)];
      const saved = Math.random() < 0.18;
      this.ui.animatePenalty(dir, keeper, saved, false);
      this.ui.penaltyResult(saved ? 'SAVED!' : 'GOAL!');
      this.audio?.sfx?.(saved ? 'save' : 'goal');
      p.wait = 1.3;
      p.after = () => {
        if (!saved) p.home += 1;
        p.homeKicks += 1;
        this.afterPenaltyKick();
      };
    } else {
      const kick = choices[Math.floor(Math.random() * 3)];
      const saved = dir === kick && Math.random() < 0.72;
      this.ui.animatePenalty(kick, dir, saved, true);
      this.ui.penaltyResult(saved ? 'YOU SAVED IT!' : 'THEY SCORE!');
      this.audio?.sfx?.(saved ? 'save' : 'goal');
      p.wait = 1.3;
      p.after = () => {
        if (!saved) p.away += 1;
        p.awayKicks += 1;
        this.afterPenaltyKick();
      };
    }
  }

  afterPenaltyKick() {
    const p = this.pen;
    const remH = Math.max(0, 5 - p.homeKicks);
    const remA = Math.max(0, 5 - p.awayKicks);
    let decided = false;
    if (p.homeKicks >= 5 && p.awayKicks >= 5) {
      if (p.homeKicks === p.awayKicks && p.home !== p.away) decided = true;
    } else {
      if (p.home > p.away + remA) decided = true;
      if (p.away > p.home + remH) decided = true;
    }

    if (decided) {
      p.done = true;
      const win = p.home > p.away;
      this.ui.penaltyResult(win ? 'BRASIL WIN THE SHOOTOUT!' : 'JAPAN WIN THE SHOOTOUT');
      this.audio?.sfx?.(win ? 'win' : 'lose');
      p.wait = 1.6;
      p.after = () => this.finishMatch(win);
      this.syncPenalty();
      return;
    }

    p.turn = p.homeKicks <= p.awayKicks ? 'home' : 'away';
    p.round = Math.max(1, Math.min(p.homeKicks, p.awayKicks) + 1);
    p.phase = p.turn === 'home' ? 'kick' : 'dive';
    p.message = p.turn === 'home' ? 'PICK YOUR CORNER' : 'PICK YOUR DIVE';
    p.wait = 0.3;
    p.after = () => this.syncPenalty();
    this.syncPenalty();
  }

  /* ------------------------------------------------------------------ */
  /* STORY SCRIPTS                                                       */
  /* ------------------------------------------------------------------ */

  checkScripts() {
    const minute = this.minute;
    for (const s of this.config.scripts || []) {
      if (this.scripted.has(s) || minute < s.minute) continue;
      this.scripted.add(s);
      if (s.type === 'drive') {
        this.ui.say(s.speaker, s.text, 4);
        if (this.score[AWAY] <= this.score[HOME] && !this.cine) {
          this.ui.banner('SPECIAL MOVE', 'DRIVE SHOT', 'TSUBASA OZORA', 2300);
          this.audio?.sfx?.('special');
          this.startCine('drive', 2.5, () => {
            this.stats.shots[AWAY] += 1;
            this.scoreGoal(AWAY, 'TSUBASA OZORA', { special: 'drive' });
          });
        }
      } else {
        this.ui.say(s.speaker, s.text, 4.4);
      }
      if (s.unlock && !this.unlocked.has(s.unlock)) {
        this.unlocked.add(s.unlock);
        this.ui.toast('SPECIAL UNLOCKED|' + (SPECIALS[s.unlock]?.name || s.unlock), 'green');
        this.audio?.sfx?.('unlock');
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* EFFECTS / PAUSE                                                     */
  /* ------------------------------------------------------------------ */

  addDust(x, y, n = 8, color = '#f7e8c8') {
    for (let i = 0; i < n; i++) {
      const life = rand(0.35, 0.7);
      this.effects.push({
        kind: 'dust', x, y, vx: rand(-50, 50), vy: rand(-50, 20),
        size: rand(2, 5), color, life, max: life
      });
    }
  }

  addConfetti(n, x, y, team) {
    const colors = team === HOME
      ? ['#ffc84a', '#3ddc84', '#f7e8c8', '#3aa7ff']
      : ['#3aa7ff', '#f7e8c8', '#ff5d6c', '#1d5fd1'];
    for (let i = 0; i < n; i++) {
      const life = rand(1.1, 2.2);
      this.effects.push({
        kind: 'confetti', x: x + rand(-40, 40), y: y + rand(-20, 20),
        vx: rand(-90, 90), vy: rand(-190, -40),
        size: rand(1.5, 3.5), color: colors[i % colors.length],
        life, max: life
      });
    }
  }

  addText(text, x, y, color, size = 8, life = 1.2) {
    this.effects.push({ kind: 'text', text, x, y, vx: 0, vy: -26, size, color, life, max: life });
  }

  updateEffects(dt) {
    for (const fx of this.effects) {
      fx.life -= dt;
      fx.x += (fx.vx || 0) * dt;
      fx.y += (fx.vy || 0) * dt;
      if (fx.kind === 'confetti') fx.vy += 300 * dt;
      if (fx.kind === 'dust') { fx.vx *= 0.96; fx.vy *= 0.96; }
    }
    this.effects = this.effects.filter((fx) => fx.life > 0);
  }

  togglePause() {
    if (this.finished) return;
    if (this.paused) { this.resume(); return; }
    if (this.menuOpen || this.cine || this.state === 'penalties' || this.state === 'over') return;
    this.paused = true;
    this.charge = null;
    this.ui.openPause(this);
    this.audio?.sfx?.('ui');
  }

  resume() {
    this.paused = false;
    this.ui.closePause();
    this.audio?.sfx?.('ui');
  }

  destroy() {
    this.ui.destroy();
    this.audio?.setCrowd?.(0);
  }
}


