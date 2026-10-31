// ---------------------------------------------------------------------------
// Match engine — pure logic, no DOM. Vertical pitch, turn-based duels.
// Team 0 attacks upward (toward y = 0), team 1 attacks downward.
// ---------------------------------------------------------------------------

import { MOVES } from './story.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

const FORMATION = [
  [50, 92], [14, 77], [36, 81], [64, 81], [86, 77],
  [34, 63], [50, 56], [66, 63],
  [20, 36], [50, 29], [80, 36]
];

function cloneTeam(def, teamIndex) {
  return {
    name: def.name,
    short: def.short,
    colors: { ...def.colors },
    teamIndex,
    players: def.players.map((p, i) => {
      const base = FORMATION[i] || [50, 50];
      const y = teamIndex === 0 ? base[1] : 100 - base[1];
      return {
        ...p,
        id: `${teamIndex}-${i}`,
        team: teamIndex,
        slot: i,
        x: base[0],
        y,
        baseX: base[0],
        baseY: y,
        stamina: p.maxStamina || 100,
        maxStamina: p.maxStamina || 100,
        goals: 0,
        shots: 0,
        look: { ...(p.look || {}) },
        moves: [...(p.moves || [])]
      };
    })
  };
}

export function createMatch(opts) {
  const {
    home, away, playerTeam = 0, minutes = 90,
    goldenGoal = false, difficulty = 1, rng = Math.random
  } = opts;

  const state = {
    teams: [cloneTeam(home, 0), cloneTeam(away, 1)],
    playerTeam,
    minutes,
    goldenGoal,
    difficulty,
    rng,
    minute: 0,
    half: 1,
    extra: false,
    suddenDeath: false,
    score: [0, 0],
    possession: 0,
    carrier: null,
    ball: { x: 50, y: 50 },
    phase: 'play',
    finished: false,
    winner: null,
    log: [],
    goals: [],
    lastEvent: null,
    stats: { shots: [0, 0], saves: [0, 0], tackles: [0, 0] }
  };

  // give keepers their own stamina pool
  for (const team of state.teams) {
    for (const p of team.players) {
      p.maxStamina = p.maxStamina || 100;
      p.stamina = clamp(p.stamina, 0, p.maxStamina);
    }
  }

  kickoff(state, 0, true);
  state.log.push('KICK OFF');
  return state;
}

export function teamOf(state, index) { return state.teams[index]; }
export function playerById(state, id) {
  for (const t of state.teams) {
    const p = t.players.find(pl => pl.id === id);
    if (p) return p;
  }
  return null;
}
export function getCarrier(state) {
  return state.carrier ? playerById(state, state.carrier) : null;
}
export function attackDir(teamIndex) { return teamIndex === 0 ? -1 : 1; }
export function progressOf(player) {
  return player.team === 0 ? 100 - player.y : player.y;
}
export function distanceToGoal(player) {
  return 100 - progressOf(player);
}
export function goalY(teamIndex) { return teamIndex === 0 ? 2 : 98; }

function rnd(state) { return state.rng(); }
function rndRange(state, a, b) { return a + rnd(state) * (b - a); }

function nearest(state, player, filter) {
  let best = null, bestD = Infinity;
  for (const t of state.teams) {
    if (t.teamIndex === player.team) continue;
    for (const p of t.players) {
      if (filter && !filter(p)) continue;
      const d = dist(player, p);
      if (d < bestD) { bestD = d; best = p; }
    }
  }
  return best ? { player: best, distance: bestD } : null;
}

function nearestOpponentToPoint(state, teamIndex, point, filter) {
  let best = null, bestD = Infinity;
  for (const p of state.teams[1 - teamIndex].players) {
    if (filter && !filter(p)) continue;
    const d = dist(point, p);
    if (d < bestD) { bestD = d; best = p; }
  }
  return best ? { player: best, distance: bestD } : null;
}

function findRole(state, teamIndex, role) {
  return state.teams[teamIndex].players.find(p => p.role === role);
}

function staminaFactor(p) {
  return 0.72 + 0.28 * clamp(p.stamina / p.maxStamina, 0, 1);
}

// ---------------------------------------------------------------------------
// Kickoff / halftime / fulltime
// ---------------------------------------------------------------------------

function kickoff(state, teamIndex, first = false) {
  for (const team of state.teams) {
    for (const p of team.players) {
      p.x = p.baseX;
      p.y = p.baseY;
    }
  }
  const cm = findRole(state, teamIndex, 'CM') || findRole(state, teamIndex, 'AM') || state.teams[teamIndex].players[6];
  cm.x = 50;
  cm.y = teamIndex === 0 ? 53 : 47;
  state.possession = teamIndex;
  state.carrier = cm.id;
  state.ball = { x: cm.x, y: cm.y };
  state.phase = 'play';
  if (first) {
    state.minute = 0;
    state.half = 1;
  }
}

export function resumeSecondHalf(state) {
  if (state.phase !== 'halftime') return;
  state.half = 2;
  state.minute = Math.max(45, state.minute);
  state.phase = 'play';
  for (const team of state.teams) {
    for (const p of team.players) {
      p.stamina = clamp(p.stamina + 24, 0, p.maxStamina);
    }
  }
  state.log.push('SECOND HALF');
}

export function resumeExtraTime(state) {
  if (state.phase !== 'extra') return;
  state.phase = 'play';
  for (const team of state.teams) {
    for (const p of team.players) {
      p.stamina = clamp(p.stamina + 18, 0, p.maxStamina);
    }
  }
  state.log.push('EXTRA TIME — GOLDEN GOAL');
}

function finish(state) {
  state.finished = true;
  state.phase = 'finished';
  state.winner = state.score[0] === state.score[1] ? null : (state.score[0] > state.score[1] ? 0 : 1);
  state.log.push('FULL TIME');
}

function checkClock(state) {
  if (state.finished) return;
  if (!state.extra) {
    if (state.half === 1 && state.minute >= 45) {
      state.minute = 45;
      state.half = 2;
      state.phase = 'halftime';
      return;
    }
    if (state.minute >= state.minutes) {
      if (state.score[0] === state.score[1] && state.goldenGoal) {
        state.extra = true;
        state.minute = state.minutes;
        state.phase = 'extra';
      } else {
        finish(state);
      }
    }
  } else {
    if (state.minute >= state.minutes + 30 && state.score[0] === state.score[1]) {
      state.suddenDeath = true;
    }
  }
}

function advanceClock(state, mins) {
  if (state.finished) return;
  state.minute += mins;
  checkClock(state);
}

// ---------------------------------------------------------------------------
// Queries used by the UI
// ---------------------------------------------------------------------------

export function isPlayerAttack(state) {
  return state.possession === state.playerTeam;
}

export function canShoot(state) {
  const c = getCarrier(state);
  if (!c) return false;
  return progressOf(c) >= 45;
}

export function passOptions(state) {
  const c = getCarrier(state);
  if (!c) return [];
  const mates = state.teams[c.team].players
    .filter(p => p.id !== c.id && p.role !== 'GK')
    .map(p => ({ player: p, progress: progressOf(p), d: dist(c, p) }))
    .filter(o => o.d <= 62)
    .sort((a, b) => (b.progress - b.d * 0.25) - (a.progress - a.d * 0.25));
  return mates.slice(0, 3).map(o => o.player);
}

export function availableMoves(state) {
  const c = getCarrier(state);
  if (!c) return [];
  return c.moves.map(id => {
    const move = MOVES[id];
    if (!move) return null;
    const adv = progressOf(c);
    let usable = true;
    let reason = '';
    if (c.stamina < move.cost) { usable = false; reason = 'TIRED'; }
    else if (move.type === 'shot' && adv < (move.minAdv ?? 45)) { usable = false; reason = 'TOO FAR'; }
    return { id, move, usable, reason };
  }).filter(Boolean);
}

export function playerStamina(state, teamIndex = state.playerTeam) {
  const p = state.teams[teamIndex].players.find(pl => pl.name === 'CARLOS SANTANA');
  return p ? { value: p.stamina, max: p.maxStamina } : null;
}

// ---------------------------------------------------------------------------
// AI action choice
// ---------------------------------------------------------------------------

function aiChooseAction(state) {
  const c = getCarrier(state);
  if (!c) return { type: 'hold' };
  const adv = progressOf(c);
  const team = state.teams[c.team];
  const behind = state.score[c.team] < state.score[1 - c.team];
  const late = state.minute > 75;

  if (c.role === 'GK') {
    const options = passOptions(state);
    if (options.length) return { type: 'pass', targetId: options[0].id };
    return { type: 'hold' };
  }

  const specialShots = c.moves
    .map(id => MOVES[id])
    .filter(m => m && m.type === 'shot' && c.stamina >= m.cost && adv >= (m.minAdv ?? 45));
  const specialDribbles = c.moves
    .map(id => MOVES[id])
    .filter(m => m && m.type === 'dribble' && c.stamina >= m.cost);

  // desperate / brilliant moments
  if (specialShots.length && rnd(state) < (adv > 65 ? 0.3 : 0.12)) {
    const move = specialShots[Math.floor(rnd(state) * specialShots.length)];
    return { type: 'special', move: move.name, moveId: Object.keys(MOVES).find(k => MOVES[k] === move) };
  }

  const shootChance = adv >= 70 ? 0.36 : adv >= 58 ? 0.18 : 0;
  if (shootChance && rnd(state) < shootChance + (behind && late ? 0.12 : 0)) {
    return { type: 'shoot' };
  }

  if (specialDribbles.length && adv > 40 && rnd(state) < 0.22) {
    const move = specialDribbles[Math.floor(rnd(state) * specialDribbles.length)];
    return { type: 'special', move: move.name, moveId: Object.keys(MOVES).find(k => MOVES[k] === move) };
  }

  if (rnd(state) < 0.58) return { type: 'dribble' };

  const options = passOptions(state);
  if (options.length) {
    const target = options[Math.floor(rnd(state) * Math.min(2, options.length))];
    return { type: 'pass', targetId: target.id };
  }
  return { type: 'dribble' };
}

// ---------------------------------------------------------------------------
// Plan building
// ---------------------------------------------------------------------------

function attackPlan(state, action) {
  const c = getCarrier(state);
  if (!c) return null;
  const team = state.teams[c.team];
  const opp = state.teams[1 - c.team];
  const def = nearest(state, c, p => p.role !== 'GK');
  const gk = opp.players.find(p => p.role === 'GK');
  const adv = progressOf(c);
  const cost = { dribble: 4, pass: 2, shoot: 6, hold: -10, special: 0 };

  if (action.type === 'hold') {
    return {
      kind: 'hold', side: 'attack', actorId: c.id, contested: false,
      attackBase: 0, defenseBase: 0, cost: -10,
      attackLabel: 'REST', defenseLabel: '', attackValue: 0, defenseValue: 0,
      description: `${c.name} slows the tempo.`
    };
  }

  if (action.type === 'pass') {
    const target = playerById(state, action.targetId) || passOptions(state)[0];
    if (!target) return attackPlan(state, { type: 'dribble' });
    const mid = { x: (c.x + target.x) / 2, y: (c.y + target.y) / 2 };
    const inter = nearestOpponentToPoint(state, c.team, mid, p => p.role !== 'GK');
    const contested = !!inter && inter.distance < 30;
    return {
      kind: 'pass', side: 'attack', actorId: c.id, targetId: target.id,
      defenderId: contested ? inter.player.id : null,
      contested,
      attackBase: c.pass * 1.12 * staminaFactor(c),
      defenseBase: contested ? (inter.player.tackle * 0.86 + inter.player.speed * 0.2) * staminaFactor(inter.player) : 0,
      cost: cost.pass,
      attackLabel: 'PASS', defenseLabel: 'INTERCEPT',
      attackValue: c.pass, defenseValue: contested ? inter.player.tackle : 0,
      description: `${c.name} looks for ${target.name}.`
    };
  }

  if (action.type === 'shoot' || action.type === 'special') {
    let move = null;
    if (action.type === 'special') {
      move = MOVES[action.moveId];
      if (!move || move.type !== 'shot') return attackPlan(state, { type: 'dribble' });
    }
    const shotPower = c.shot * 0.98
      + Math.max(0, 55 - distanceToGoal(c)) * 0.09
      + (move ? move.power * 0.65 : 0);
    const closeDef = nearest(state, c, p => p.role !== 'GK' && dist(p, c) < 26);
    const gkBonus = closeDef ? closeDef.player.tackle * 0.15 : 0;
    const gkBase = (gk.catch * 1.0 + 1.5 + gkBonus) * staminaFactor(gk);
    return {
      kind: 'shoot', side: 'attack', actorId: c.id,
      defenderId: gk.id, gkId: gk.id,
      contested: true,
      attackBase: shotPower * staminaFactor(c),
      defenseBase: gkBase,
      cost: move ? move.cost : cost.shoot,
      moveId: action.moveId || null,
      cutin: move ? { name: c.name, move, playerId: c.id } : null,
      attackLabel: move ? 'SPECIAL' : 'SHOT',
      defenseLabel: 'SAVE',
      attackValue: c.shot + (move ? move.power : 0),
      defenseValue: gk.catch,
      description: `${c.name} lets fly!`
    };
  }

  // dribble
  const move = action.type === 'special' ? MOVES[action.moveId] : null;
  return {
    kind: 'dribble', side: 'attack', actorId: c.id,
    defenderId: def ? def.player.id : null,
    contested: !!def,
    attackBase: (c.dribble * 0.98 + c.speed * 0.2 + (move ? move.power * 0.8 : 0)) * staminaFactor(c),
    defenseBase: def ? (def.player.tackle * 1.0 + def.player.speed * 0.2) * staminaFactor(def.player) : 0,
    cost: move ? move.cost : cost.dribble,
    moveId: action.moveId || null,
    cutin: move ? { name: c.name, move, playerId: c.id } : null,
    attackLabel: move ? 'SPECIAL' : 'DRIBBLE',
    defenseLabel: 'TACKLE',
    attackValue: c.dribble + (move ? move.power : 0),
    defenseValue: def ? def.player.tackle : 0,
    description: `${c.name} takes on ${def ? def.player.name : 'space'}.`
  };
}

export function beginAttack(state, action) {
  if (state.finished || state.phase !== 'play') return null;
  if (state.possession !== state.playerTeam) return null;
  if (action.type === 'special' && !action.moveId) return null;
  return attackPlan(state, action);
}

export function beginDefense(state, posture) {
  if (state.finished || state.phase !== 'play') return null;
  if (state.possession === state.playerTeam) return null;

  const aiAction = aiChooseAction(state);
  const c = getCarrier(state);
  const team = state.teams[1 - state.playerTeam];
  const defTeam = state.teams[state.playerTeam];
  const def = nearest(state, c, p => p.role !== 'GK');
  const gk = defTeam.players.find(p => p.role === 'GK');

  let plan;
  if (aiAction.type === 'pass') {
    plan = attackPlan(state, aiAction);
    plan.side = 'defense';
    plan.auto = posture === 'fallback';
    plan.posture = posture;
    if (posture === 'fallback') plan.contested = false;
    if (posture === 'block') plan.auto = true;
    plan.defenderId = plan.contested ? (nearestOpponentToPoint(state, c.team, {
      x: (c.x + (playerById(state, plan.targetId)?.x ?? c.x)) / 2,
      y: (c.y + (playerById(state, plan.targetId)?.y ?? c.y)) / 2
    }, p => p.role !== 'GK')?.player.id ?? null) : null;
    if (plan.defenderId) {
      const d = playerById(state, plan.defenderId);
      plan.defenseBase = (d.tackle * 0.86 + d.speed * 0.2) * staminaFactor(d);
      plan.defenseValue = d.tackle;
    }
  } else if (aiAction.type === 'shoot' || aiAction.type === 'special') {
    plan = attackPlan(state, aiAction);
    plan.side = 'defense';
    plan.auto = posture !== 'press' && posture !== 'block';
    plan.posture = posture;
    if (posture === 'fallback') {
      // the keeper still tries, but without the player's timing help
      plan.contested = true;
      plan.auto = true;
      plan.defenseBase *= 0.88;
      plan.defenseLabel = 'SAVE';
    } else if (posture === 'block' && def) {
      plan.contested = true;
      plan.defenseBase += def.player.tackle * 0.3 * staminaFactor(def.player);
      plan.defenseValue += 3;
      plan.defenseLabel = 'SAVE + BLOCK';
      plan.blockerId = def.player.id;
    } else if (posture === 'press') {
      plan.contested = true;
    }
  } else {
    plan = attackPlan(state, aiAction);
    plan.side = 'defense';
    plan.posture = posture;
    plan.auto = posture !== 'press';
    if (posture === 'fallback') {
      plan.contested = false;
    } else if (posture === 'press' && def) {
      plan.contested = true;
      plan.defenderId = def.player.id;
      plan.defenseBase = (def.player.tackle * 0.94 + def.player.speed * 0.2) * staminaFactor(def.player);
      plan.defenseValue = def.player.tackle;
    }
  }

  // the player always provides the timing for their own duels
  if (plan.cutin) plan.cutin.opponent = true;
  plan.playerTiming = posture === 'press' || posture === 'block';
  plan.aiAction = aiAction;
  return plan;
}

// ---------------------------------------------------------------------------
// Resolution
// ---------------------------------------------------------------------------

function gainPossession(state, player) {
  state.possession = player.team;
  state.carrier = player.id;
  state.ball = { x: player.x, y: player.y };
}

function settle(state) {
  const carrier = getCarrier(state);
  for (const team of state.teams) {
    for (const p of team.players) {
      if (carrier && p.id === carrier.id) continue;
      if (p.role === 'GK') {
        const gx = 50 + (state.ball.x - 50) * 0.18;
        p.x += (clamp(gx, 40, 60) - p.x) * 0.25;
        p.y += (p.baseY - p.y) * 0.25;
        continue;
      }
      const pullX = (state.ball.x - p.baseX) * 0.12;
      const pullY = (state.ball.y - p.baseY) * 0.1;
      const tx = clamp(p.baseX + pullX, 8, 92);
      const ty = clamp(p.baseY + pullY, 6, 94);
      p.x += (tx - p.x) * 0.35;
      p.y += (ty - p.y) * 0.35;
    }
  }
}

function recover(state, amount = 0.7) {
  for (const team of state.teams) {
    for (const p of team.players) {
      p.stamina = clamp(p.stamina + amount, 0, p.maxStamina);
    }
  }
}

function goal(state, scorer, teamIndex, moveName) {
  state.score[teamIndex]++;
  scorer.goals++;
  state.goals.push({ playerId: scorer.id, name: scorer.name, team: teamIndex, minute: state.minute, move: moveName || null });
  const other = 1 - teamIndex;
  const ended = state.extra || state.minute >= state.minutes;
  if (ended) {
    finish(state);
  } else {
    kickoff(state, other);
  }
  return ended;
}

export function resolvePlan(state, plan, timing) {
  if (!plan) return null;
  const actor = playerById(state, plan.actorId);
  const teamIndex = actor.team;
  const team = state.teams[teamIndex];
  const opp = state.teams[1 - teamIndex];
  const defender = plan.defenderId ? playerById(state, plan.defenderId) : null;
  const move = plan.moveId ? MOVES[plan.moveId] : null;

  if (plan.kind === 'hold') {
    actor.stamina = clamp(actor.stamina + 14, 0, actor.maxStamina);
    advanceClock(state, 2 + Math.floor(rnd(state) * 2));
    recover(state, 0.8);
    settle(state);
    const ev = {
      kind: 'hold', success: true, side: plan.side,
      text: `${actor.name} slows the tempo and catches his breath.`,
      timing: 0.5
    };
    state.lastEvent = ev;
    return ev;
  }

  let atkTiming, defTiming;
  if (plan.auto) {
    atkTiming = rndRange(state, 0.3, 0.75);
    defTiming = rndRange(state, 0.3, 0.7);
  } else if (plan.side === 'attack') {
    atkTiming = timing;
    defTiming = rndRange(state, 0.32, 0.74);
  } else {
    defTiming = timing;
    atkTiming = rndRange(state, 0.32, 0.78);
  }

  const atkPower = plan.attackBase * (0.84 + atkTiming * 0.32) * rndRange(state, 0.95, 1.05);
  const defPower = plan.contested ? plan.defenseBase * (0.84 + defTiming * 0.32) * rndRange(state, 0.95, 1.05) : 0;
  const success = !plan.contested || atkPower > defPower;

  // spend stamina
  actor.stamina = clamp(actor.stamina - plan.cost, 0, actor.maxStamina);

  let ev;
  const target = plan.targetId ? playerById(state, plan.targetId) : null;

  if (plan.kind === 'pass') {
    if (success) {
      if (target) {
        target.x = clamp(target.x, 8, 92);
        target.y = clamp(target.y, 6, 94);
        gainPossession(state, target);
      }
      ev = {
        kind: 'pass', success: true, side: plan.side,
        text: `${actor.name} threads it to ${target ? target.name : 'a teammate'}.`,
        atkPower, defPower, timing: atkTiming
      };
    } else {
      const inter = defender || nearestOpponentToPoint(state, teamIndex, actor, p => p.role !== 'GK')?.player;
      if (inter) {
        inter.x = clamp((inter.x + actor.x) / 2, 8, 92);
        inter.y = clamp((inter.y + actor.y) / 2, 6, 94);
        gainPossession(state, inter);
      }
      ev = {
        kind: 'intercept', success: false, side: plan.side,
        text: `${inter ? inter.name : 'A defender'} reads it and intercepts!`,
        atkPower, defPower, timing: defTiming
      };
    }
  } else if (plan.kind === 'dribble') {
    if (success) {
      const dir = attackDir(teamIndex);
      const step = 8 + rnd(state) * 7 + actor.speed * 0.25;
      actor.y = clamp(actor.y + dir * step, 7, 93);
      actor.x = clamp(actor.x + (50 - actor.x) * 0.12, 8, 92);
      state.ball = { x: actor.x, y: actor.y };
      ev = {
        kind: 'dribble', success: true, side: plan.side,
        text: move ? `${move.name}! ${actor.name} dances past ${defender ? defender.name : 'the defender'}!`
          : `${actor.name} beats ${defender ? defender.name : 'the press'} and drives forward!`,
        atkPower, defPower, timing: atkTiming, move: move ? move.name : null
      };
    } else {
      if (defender) {
        defender.x = clamp((defender.x + actor.x) / 2, 8, 92);
        defender.y = clamp((defender.y + actor.y) / 2, 6, 94);
        gainPossession(state, defender);
        state.stats.tackles[defender.team]++;
      }
      ev = {
        kind: 'tackle', success: false, side: plan.side,
        text: `${defender ? defender.name : 'The defence'} stands firm and wins the ball!`,
        atkPower, defPower, timing: defTiming
      };
    }
  } else if (plan.kind === 'shoot') {
    state.stats.shots[teamIndex]++;
    actor.shots++;
    const gk = state.teams[1 - teamIndex].players.find(p => p.role === 'GK');
    if (success) {
      const ended = goal(state, actor, teamIndex, move ? move.name : null);
      ev = {
        kind: 'goal', success: true, side: plan.side,
        text: `GOAL! ${actor.name} scores${move ? ` with the ${move.name}` : ''}!`,
        atkPower, defPower, timing: atkTiming, move: move ? move.name : null,
        goalTeam: teamIndex, ended
      };
      state.lastEvent = ev;
      return ev;
    }
    state.stats.saves[1 - teamIndex]++;
    const wide = rnd(state) < 0.22;
    if (wide) {
      gk.y = clamp(gk.y, 3, 97);
      gainPossession(state, gk);
      ev = {
        kind: 'wide', success: false, side: plan.side,
        text: `Wide! ${actor.name}'s shot kisses the wrong side of the post.`,
        atkPower, defPower, timing: atkTiming
      };
    } else {
      gainPossession(state, gk);
      ev = {
        kind: 'save', success: false, side: plan.side,
        text: `${gk.name} gets a strong hand to it! SAVED!`,
        atkPower, defPower, timing: defTiming
      };
    }
  } else {
    ev = { kind: 'none', success: false, text: '...', atkPower, defPower };
  }

  // clock & recovery
  const mins = 2 + Math.floor(rnd(state) * 2) + (plan.moveId ? 1 : 0);
  advanceClock(state, mins);
  recover(state, 0.75);
  settle(state);
  state.ball = { x: getCarrier(state)?.x ?? 50, y: getCarrier(state)?.y ?? 50 };
  state.lastEvent = ev;
  return ev;
}

// ---------------------------------------------------------------------------
// Utility for UI / results
// ---------------------------------------------------------------------------

export function matchSummary(state) {
  const scorers = state.goals.reduce((acc, g) => {
    const key = g.playerId;
    if (!acc[key]) acc[key] = { name: g.name, team: g.team, goals: 0, minutes: [] };
    acc[key].goals++;
    acc[key].minutes.push(g.minute);
    return acc;
  }, {});
  const list = Object.values(scorers).sort((a, b) => b.goals - a.goals);
  const playerTeamPlayers = state.teams[state.playerTeam].players;
  const mvp = list.find(s => s.team === state.playerTeam) || list[0] || { name: playerTeamPlayers[9]?.name || playerTeamPlayers[0].name, goals: 0 };
  return { scorers: list, mvp };
}

export function staminaBar(state) {
  const p = state.teams[state.playerTeam].players.find(pl => pl.name === 'CARLOS SANTANA');
  if (!p) return 100;
  return Math.round((p.stamina / p.maxStamina) * 100);
}

export function clockLabel(state) {
  if (state.extra) {
    const over = Math.max(0, state.minute - state.minutes);
    return over > 0 ? `90+${over}'` : '90\'';
  }
  return `${Math.min(state.minute, state.minutes)}'`;
}

export function simulateMatch(opts, strategy = () => ({})) {
  // headless helper used by tests: plays random-ish actions until full time
  const state = createMatch(opts);
  let guard = 0;
  while (!state.finished && guard++ < 400) {
    if (state.phase === 'halftime') { resumeSecondHalf(state); continue; }
    if (state.phase === 'extra') { resumeExtraTime(state); continue; }
    let plan;
    if (state.possession === state.playerTeam) {
      const actions = ['dribble', 'dribble', 'pass', 'shoot', 'special'];
      let action = { type: actions[Math.floor(Math.random() * actions.length)] };
      if (action.type === 'pass') {
        const opts2 = passOptions(state);
        if (!opts2.length) action = { type: 'dribble' };
        else action.targetId = opts2[0].id;
      }
      if (action.type === 'shoot' && !canShoot(state)) action = { type: 'dribble' };
      if (action.type === 'special') {
        const m = availableMoves(state).filter(x => x.usable);
        if (!m.length) action = { type: 'dribble' };
        else action = { type: 'special', moveId: m[0].id };
      }
      plan = beginAttack(state, action);
      if (!plan) { advanceClock(state, 1); continue; }
      resolvePlan(state, plan, 0.5 + Math.random() * 0.4);
    } else {
      const posture = ['press', 'press', 'block', 'fallback'][Math.floor(Math.random() * 4)];
      plan = beginDefense(state, posture);
      if (!plan) { advanceClock(state, 1); continue; }
      resolvePlan(state, plan, 0.5 + Math.random() * 0.4);
    }
  }
  return state;
}
