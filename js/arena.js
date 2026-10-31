/* =========================================================
   ARENA — pitch, players, ball, match presentation
   ========================================================= */

import {
  W, H, px, circle, ring, line, text, bands, makeCanvas,
  mulberry32, clamp, lerp
} from './pixel.js';
import { drawScene } from './scenes.js';
import { drawCinematic } from './cinematics.js';

export const FIELD = { l: 44, r: 596, t: 74, b: 318 };
export const GOAL = { top: 164, bottom: 228, depth: 13 };
export const CENTER = { x: 320, y: 196 };
export const PW = FIELD.r - FIELD.l;
export const PH = FIELD.b - FIELD.t;

const arenaCache = new Map();

export function getArenaBase(arena) {
  if (!arenaCache.has(arena)) {
    const c = makeCanvas(W, H);
    paintArena(c.getContext('2d'), arena);
    arenaCache.set(arena, c);
  }
  return arenaCache.get(arena);
}

/* ------------------------------------------------------------------ */
/* ARENA BASES                                                         */
/* ------------------------------------------------------------------ */

function paintArena(c, arena) {
  if (arena === 'street') paintStreetArena(c);
  else if (arena === 'club') paintClubArena(c);
  else paintFinalArena(c);
}

function paintStreetArena(c) {
  // sunset sky
  bands(c, ['#1a1f46', '#3b2d5c', '#7a3f63', '#c05a56', '#f08a4b', '#ffc86a'], 0, 0, W, 74);
  circle(c, 512, 46, 22, '#ffd878');
  for (let i = 0; i < 4; i++) px(c, 505, 36 + i * 8, 30, 2, i > 1 ? '#f08a4b' : '#c05a56');
  // distant houses
  const rnd = mulberry32(9);
  for (let i = 0; i < 11; i++) {
    const x = i * 61, h = 24 + rnd() * 26;
    px(c, x, 74 - h, 52, h, i % 2 ? '#3d3049' : '#332a44');
    for (let j = 0; j < 3; j++) if (rnd() > .4) px(c, x + 7 + j * 15, 74 - h + 7, 4, 5, 'rgba(255,210,120,.35)');
  }
  // palms
  paintPalmSilhouette(c, 16, 86, .9, '#1a2430');
  paintPalmSilhouette(c, 626, 92, 1, '#1a2430');
  // low wall + spectators
  px(c, 0, 58, W, 16, '#6b4b3d');
  px(c, 0, 58, W, 3, '#8f6a55');
  for (let i = 0; i < 22; i++) {
    const x = 8 + i * 29 + (i % 3) * 3;
    px(c, x, 52, 5, 6, i % 3 === 0 ? '#e7c48a' : '#d9b47c');
    px(c, x - 1, 47, 6, 5, '#2b2238');
    if (i % 2) px(c, x - 3, 50, 2, 3, '#2b2238');
  }
  // bunting
  for (let i = 0; i < 16; i++) {
    const x = 10 + i * 40;
    const col = ['#ffc84a', '#3ddc84', '#ff5d6c', '#3aa7ff'][i % 4];
    px(c, x, 8 + Math.sin(i * .8) * 3, 10, 7, col);
    c.fillStyle = col;
    c.beginPath(); c.moveTo(x, 15); c.lineTo(x + 10, 15); c.lineTo(x + 5, 21); c.closePath(); c.fill();
  }
  // ad boards top
  px(c, 0, 74, W, 0, '#000');
  // side sand
  px(c, 0, 74, FIELD.l, 260, '#b98d55');
  px(c, FIELD.r, 74, W - FIELD.r, 260, '#b98d55');
  for (let i = 0; i < 18; i++) px(c, 2 + rnd() * 38, 90 + rnd() * 220, 2, 1, 'rgba(255,230,180,.25)');
  // pitch
  paintPitch(c, 'street');
  // corner flags
  paintCornerFlags(c, '#ff5d6c');
  // bottom boards
  px(c, 0, 320, W, 22, '#10141f');
  const ads = [['SAMBA COLA', '#ffc84a', '#0a0e19'], ['PRAIA DO FAROL', '#3ddc84', '#0a0e19'], ['AURORA', '#3aa7ff', '#f7e8c8'], ['BOLA DE OURO', '#ff5d6c', '#f7e8c8']];
  for (let i = 0; i < 4; i++) {
    const [label, bg, fg] = ads[i];
    px(c, 4 + i * 160, 324, 152, 14, bg);
    text(c, label, 80 + i * 160, 335, 6, fg, 'center', 'Press Start 2P');
  }
  px(c, 0, 342, W, 18, '#0a0e16');
  text(c, 'PRAIA DO FAROL', 320, 355, 6, 'rgba(247,232,200,.28)', 'center', 'Press Start 2P');
}

function paintClubArena(c) {
  // night-ish indoor bowl
  bands(c, ['#070c17', '#0c1424', '#111c30'], 0, 0, W, 74);
  // stands
  paintCrowdBand(c, 0, 8, W, 48, 1201, ['#f7e8c8', '#3aa7ff', '#ff5d6c', '#ffc84a']);
  // roof
  px(c, 0, 0, W, 8, '#060a12');
  px(c, 0, 8, W, 2, '#243652');
  // banners
  px(c, 82, 24, 126, 15, '#1d5fd1');
  text(c, 'AURORA FC', 145, 35, 7, '#f7e8c8', 'center', 'Press Start 2P');
  px(c, 432, 24, 126, 15, '#ffc84a');
  text(c, 'COPA JUVENTUDE', 495, 35, 5, '#0a0e19', 'center', 'Press Start 2P');
  // floodlights
  for (const x of [60, 580]) {
    px(c, x - 3, 4, 6, 18, '#2b3a55');
    px(c, x - 16, 2, 32, 6, '#1b2740');
    for (let i = 0; i < 3; i++) px(c, x - 13 + i * 9, 3, 6, 4, '#fff3c9');
  }
  // side areas
  px(c, 0, 74, FIELD.l, 260, '#1d5c3e');
  px(c, FIELD.r, 74, W - FIELD.r, 260, '#1d5c3e');
  for (let i = 0; i < 20; i++) px(c, 2 + (i * 17) % 40, 90 + (i * 11) % 220, 2, 1, 'rgba(255,255,255,.1)');
  paintPitch(c, 'club');
  paintCornerFlags(c, '#ffc84a');
  // bottom boards
  px(c, 0, 320, W, 22, '#0b1322');
  const ads = [['AURORA', '#3aa7ff', '#f7e8c8'], ['SAMBA COLA', '#ffc84a', '#0a0e19'], ['COPA JUVENTUDE', '#3ddc84', '#0a0e19'], ['VIVA FUTEBOL', '#ff5d6c', '#f7e8c8']];
  for (let i = 0; i < 4; i++) {
    const [label, bg, fg] = ads[i];
    px(c, 4 + i * 160, 324, 152, 14, bg);
    text(c, label, 80 + i * 160, 335, 6, fg, 'center', 'Press Start 2P');
  }
  px(c, 0, 342, W, 18, '#070c16');
  text(c, 'ESTÁDIO AURORA', 320, 355, 6, 'rgba(247,232,200,.28)', 'center', 'Press Start 2P');
}

function paintFinalArena(c) {
  // night sky
  bands(c, ['#03060f', '#071128', '#0a1830', '#0c1d38'], 0, 0, W, 74);
  const rnd = mulberry32(404);
  for (let i = 0; i < 30; i++) px(c, rnd() * W, rnd() * 30, 1, 1, 'rgba(255,255,255,.4)');
  // big stands, split colours
  px(c, 0, 6, W / 2, 52, '#3a2f14');
  px(c, W / 2, 6, W / 2, 52, '#14294d');
  paintCrowdBand(c, 0, 8, W / 2, 48, 77, ['#ffc84a', '#ffc84a', '#3ddc84', '#f7e8c8']);
  paintCrowdBand(c, W / 2, 8, W / 2, 48, 91, ['#3aa7ff', '#3aa7ff', '#f7e8c8', '#1d5fd1']);
  // tifo flags
  for (let i = 0; i < 8; i++) {
    const x = 20 + i * 78;
    px(c, x, 14, 28, 12, i % 2 ? 'rgba(255,200,74,.8)' : 'rgba(58,167,255,.8)');
    px(c, x + 28, 14 + Math.sin(i) * 2, 8, 4, i % 2 ? 'rgba(255,200,74,.6)' : 'rgba(58,167,255,.6)');
  }
  // scoreboard screen
  px(c, 270, 10, 100, 26, '#05090f');
  px(c, 274, 13, 92, 20, '#121f37');
  text(c, 'WORLD YOUTH', 320, 23, 5, '#f7e8c8', 'center', 'Press Start 2P');
  text(c, 'FINAL', 320, 31, 7, '#ffc84a', 'center', 'Press Start 2P');
  // floodlights
  for (const x of [48, 592]) {
    px(c, x - 5, -2, 10, 30, '#27364f');
    px(c, x - 30, -8, 60, 11, '#18253c');
    for (let i = 0; i < 5; i++) px(c, x - 26 + i * 12, -5, 8, 6, '#fff3c9');
    c.save();
    c.globalAlpha = .055;
    c.fillStyle = '#fff3c9';
    c.beginPath(); c.moveTo(x - 30, 4); c.lineTo(x + 30, 4); c.lineTo(x + 130, 330); c.lineTo(x - 130, 330); c.closePath(); c.fill();
    c.restore();
  }
  // side temporary stands
  px(c, 0, 74, FIELD.l, 260, '#13263f');
  px(c, FIELD.r, 74, W - FIELD.r, 260, '#13263f');
  paintCrowdBand(c, 0, 80, FIELD.l, 230, 31, ['#ffc84a', '#3ddc84', '#f7e8c8']);
  paintCrowdBand(c, FIELD.r, 80, W - FIELD.r, 230, 47, ['#3aa7ff', '#f7e8c8', '#1d5fd1']);
  paintPitch(c, 'final');
  paintCornerFlags(c, '#ffc84a');
  // bottom boards
  px(c, 0, 320, W, 22, '#07101e');
  const ads = [['WORLD YOUTH', '#f7e8c8', '#0a0e19'], ['SAMBA COLA', '#ffc84a', '#0a0e19'], ['BRASIL', '#3ddc84', '#0a0e19'], ['JAPÃO', '#3aa7ff', '#f7e8c8']];
  for (let i = 0; i < 4; i++) {
    const [label, bg, fg] = ads[i];
    px(c, 4 + i * 160, 324, 152, 14, bg);
    text(c, label, 80 + i * 160, 335, 6, fg, 'center', 'Press Start 2P');
  }
  px(c, 0, 342, W, 18, '#040810');
  text(c, 'TOKYO NATIONAL STADIUM', 320, 355, 6, 'rgba(247,232,200,.3)', 'center', 'Press Start 2P');
}

function paintCrowdBand(c, x, y, w, h, seed, colors) {
  const rnd = mulberry32(seed);
  px(c, x, y, w, h, '#0b1220');
  for (let row = 0; row < Math.floor(h / 6); row++) {
    for (let i = 0; i < Math.floor(w / 4); i++) {
      const xx = x + i * 4 + (row % 2) * 2;
      const yy = y + row * 6;
      if (rnd() > .35) px(c, xx, yy + rnd() * 3, 2, 2, colors[Math.floor(rnd() * colors.length)]);
    }
  }
  // tier rails
  for (let row = 0; row < 3; row++) px(c, x, y + 16 + row * 17, w, 2, 'rgba(255,255,255,.07)');
}

function paintPitch(c, kind) {
  const pal = kind === 'street'
    ? { a: '#c49a60', b: '#cfa96e', c: '#b78c54', line: 'rgba(250,244,220,.72)', side: '#b4864f' }
    : kind === 'final'
      ? { a: '#1c6a47', b: '#227852', c: '#185d3d', line: 'rgba(245,255,248,.9)', side: '#155639' }
      : { a: '#278456', b: '#2e9260', c: '#21744a', line: 'rgba(245,255,248,.82)', side: '#1d6a47' };

  // pitch
  px(c, FIELD.l, FIELD.t, PW, PH, pal.a);
  const stripe = PW / 8;
  for (let i = 0; i < 8; i++) {
    if (i % 2) px(c, FIELD.l + i * stripe, FIELD.t, stripe + 1, PH, pal.b);
  }
  // lighting from top
  const grad = c.createLinearGradient(0, FIELD.t, 0, FIELD.b);
  grad.addColorStop(0, 'rgba(0,0,0,.16)');
  grad.addColorStop(.45, 'rgba(255,255,255,.03)');
  grad.addColorStop(1, 'rgba(0,0,0,.08)');
  c.fillStyle = grad; c.fillRect(FIELD.l, FIELD.t, PW, PH);
  // speckles
  const rnd = mulberry32(kind === 'street' ? 17 : 29);
  for (let i = 0; i < 260; i++) {
    const x = FIELD.l + rnd() * PW, y = FIELD.t + rnd() * PH;
    px(c, x, y, 1 + (i % 2), 1, i % 3 ? 'rgba(255,255,220,.07)' : 'rgba(0,0,0,.09)');
  }
  // worn patches
  for (let i = 0; i < 8; i++) {
    const x = FIELD.l + 40 + rnd() * (PW - 80);
    const y = FIELD.t + 30 + rnd() * (PH - 60);
    px(c, x, y, 12 + rnd() * 20, 2, 'rgba(0,0,0,.05)');
  }

  // lines
  c.save();
  c.strokeStyle = pal.line;
  c.lineWidth = 2;
  c.strokeRect(FIELD.l, FIELD.t, PW, PH);
  line(c, CENTER.x, FIELD.t, CENTER.x, FIELD.b, pal.line, 2);
  ring(c, CENTER.x, CENTER.y, 37, pal.line, 2);
  circle(c, CENTER.x, CENTER.y, 2.4, pal.line);
  // penalty boxes
  for (const side of [0, 1]) {
    const dir = side === 0 ? 1 : -1;
    const x = side === 0 ? FIELD.l : FIELD.r;
    const boxW = 62;
    const boxTop = CENTER.y - 43, boxH = 86;
    c.strokeRect(side === 0 ? x : x - boxW, boxTop, boxW, boxH);
    const sixW = 26;
    c.strokeRect(side === 0 ? x : x - sixW, CENTER.y - 21, sixW, 42);
    const spotX = side === 0 ? x + 43 : x - 43;
    circle(c, spotX, CENTER.y, 1.8, pal.line);
    // arc
    c.beginPath();
    c.arc(spotX, CENTER.y, 23, side === 0 ? -Math.PI * .42 : Math.PI * .58, side === 0 ? Math.PI * .42 : Math.PI * 1.42);
    c.stroke();
  }
  // corner arcs
  for (const [x, y] of [[FIELD.l, FIELD.t], [FIELD.r, FIELD.t], [FIELD.l, FIELD.b], [FIELD.r, FIELD.b]]) {
    c.beginPath();
    c.arc(x, y, 10, 0, Math.PI * 2);
    c.stroke();
  }
  c.restore();

  // goal nets
  drawGoal(c, 'left', kind);
  drawGoal(c, 'right', kind);

  // center watermark
  if (kind === 'final') {
    c.save();
    c.globalAlpha = .08;
    text(c, '10', CENTER.x, CENTER.y + 9, 30, '#ffc84a', 'center', 'Press Start 2P');
    c.restore();
  }
}

function drawGoal(c, side, kind) {
  const left = side === 'left';
  const x = left ? FIELD.l : FIELD.r;
  const nx = left ? x - GOAL.depth : x;
  const w = GOAL.depth;
  const top = GOAL.top, bottom = GOAL.bottom;
  // net backing
  px(c, nx, top, w, bottom - top, kind === 'street' ? 'rgba(30,22,18,.55)' : 'rgba(5,12,18,.6)');
  const netCol = kind === 'street' ? 'rgba(240,220,180,.36)' : 'rgba(235,245,255,.34)';
  for (let y = top + 4; y < bottom; y += 5) line(c, nx, y, x, y, netCol, 1);
  for (let xx = nx + 3; xx < x; xx += 5) line(c, xx, top, xx, bottom, netCol, 1);
  // posts
  px(c, left ? x - 1 : x - 1, top - 2, 3, 4, '#f0f6ff');
  px(c, left ? x - 1 : x - 1, bottom - 2, 3, 4, '#f0f6ff');
  line(c, nx, top, x, top, '#e7f0ff', 2);
  line(c, nx, bottom, x, bottom, '#e7f0ff', 2);
  line(c, nx, top, nx, bottom, 'rgba(230,240,255,.5)', 1);
  // goal shadow
  c.fillStyle = 'rgba(0,0,0,.18)';
  c.beginPath(); c.ellipse(left ? x + 5 : x - 5, CENTER.y, 9, 35, 0, 0, Math.PI * 2); c.fill();
}

function paintCornerFlags(c, color) {
  const corners = [[FIELD.l, FIELD.t], [FIELD.r, FIELD.t], [FIELD.l, FIELD.b], [FIELD.r, FIELD.b]];
  for (const [x, y] of corners) {
    px(c, x - 1, y - 8, 2, 10, '#e8e0cc');
    px(c, x, y - 8, 8, 5, color);
    c.fillStyle = color;
    c.beginPath(); c.moveTo(x + 8, y - 8); c.lineTo(x + 8, y - 3); c.lineTo(x + 12, y - 5); c.closePath(); c.fill();
  }
}

function paintPalmSilhouette(c, x, ground, s, color) {
  let xx = x;
  for (let i = 0; i < 7; i++) {
    px(c, xx, ground - i * 12 * s, 4 * s, 13 * s, color);
    xx += 1.4 * s;
  }
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI * .9 + i * .33;
    for (let j = 0; j < 8; j++) {
      px(c, xx + Math.cos(a) * j * 5 * s, ground - 84 * s + Math.sin(a) * j * 5 * s, 2, 2, color);
    }
  }
}

/* ------------------------------------------------------------------ */
/* PLAYERS                                                             */
/* ------------------------------------------------------------------ */

const SKINS = ['#7a4a2b', '#a06a42', '#c98f62', '#8a5a35', '#6b3f24', '#d7a77c', '#b07a52'];
const HAIRS = ['#17100e', '#241a14', '#2b1a10', '#1a1a24', '#3a2518'];

export function drawPlayer(c, p, t, opts = {}) {
  const scale = opts.scale || 1;
  const x = p.x, y = p.y;
  const team = p.team;
  const gk = p.role === 'GK';
  const jersey = p.kit ? p.kit.color : (team === 0 ? '#ffc84a' : '#ff5d6c');
  const accent = p.kit ? p.kit.accent : (team === 0 ? '#00a86b' : '#1a1a24');
  const shorts = gk ? '#141b2a' : (team === 0 ? '#1d5fd1' : accent);
  const skin = p.skin || SKINS[(p.num || 0) % SKINS.length];
  const hair = p.hair || HAIRS[(p.num || 0) % HAIRS.length];
  const speed = p.speed || Math.hypot(p.vx || 0, p.vy || 0);
  const run = Math.sin((p.anim || 0) * 14 + (p.num || 0));
  const moving = speed > 6;
  const facing = p.facing || (p.vx < -2 ? -1 : 1);
  const bob = moving ? Math.abs(Math.sin((p.anim || 0) * 14)) : Math.sin((t || 0) * 2 + (p.num || 0)) * .4;
  const celeb = p.celebrate;

  c.save();
  c.translate(Math.round(x), Math.round(y));
  if (scale !== 1) c.scale(scale, scale);

  // shadow
  c.fillStyle = 'rgba(0,0,0,.26)';
  c.beginPath(); c.ellipse(0, 1, 7.2, 2.4, 0, 0, Math.PI * 2); c.fill();

  // aura
  if (p.aura && !opts.noUi) {
    c.globalAlpha = .2 + Math.sin((t || 0) * 4) * .07;
    circle(c, 0, -14, 20, '#ffc84a');
    c.globalAlpha = 1;
  }

  // legs
  const swing = moving ? run * 3 : 0;
  if (!celeb) {
    px(c, -4, -9, 3, 7 + swing, skin);
    px(c, 1, -9, 3, 7 - swing, skin);
    px(c, -5, -3 + swing, 4, 3, '#15151d');
    px(c, 1, -3 - swing, 4, 3, '#15151d');
    // socks
    px(c, -4, -6, 3, 3, '#f1ead9');
    px(c, 1, -6, 3, 3, '#f1ead9');
  } else {
    px(c, -4, -9, 3, 8, skin);
    px(c, 1, -9, 3, 8, skin);
    px(c, -5, -2, 4, 3, '#15151d');
    px(c, 1, -2, 4, 3, '#15151d');
  }

  // shorts
  px(c, -5, -12 - bob, 10, 4, shorts);
  px(c, -5, -12 - bob, 10, 1, 'rgba(255,255,255,.15)');

  // torso
  px(c, -6, -21 - bob, 12, 9, jersey);
  px(c, -6, -21 - bob, 12, 1, 'rgba(255,255,255,.22)');
  px(c, -6, -15 - bob, 12, 1, accent);
  // sleeve cuffs
  px(c, -7, -20 - bob, 2, 4, accent);
  px(c, 5, -20 - bob, 2, 4, accent);
  // arms
  const armSwing = moving ? run * 2 : 0;
  px(c, -8, -20 - bob + armSwing, 2, 7, skin);
  px(c, 6, -20 - bob - armSwing, 2, 7, skin);
  if (gk) {
    px(c, -9, -14 - bob + armSwing, 3, 3, '#f7e8c8');
    px(c, 6, -14 - bob - armSwing, 3, 3, '#f7e8c8');
  }

  // head
  px(c, -4, -29 - bob, 8, 8, skin);
  px(c, -4, -29 - bob, 8, 1, 'rgba(255,255,255,.08)');
  // ears
  px(c, -5, -26 - bob, 1, 2, skin);
  px(c, 4, -26 - bob, 1, 2, skin);
  // eye
  if (facing >= 0) px(c, 2, -26 - bob, 1, 2, '#151019');
  else px(c, -3, -26 - bob, 1, 2, '#151019');
  // mouth
  px(c, facing >= 0 ? 2 : -3, -24 - bob, 2, 1, 'rgba(50,20,20,.55)');

  // hair
  if (p.isUser) {
    px(c, -4, -30 - bob, 8, 3, '#17100e');
    px(c, -5, -29 - bob, 1, 3, '#17100e');
    px(c, 4, -29 - bob, 1, 3, '#17100e');
    // curls
    circle(c, -4, -30 - bob, 1.6, '#17100e');
    circle(c, -1, -31 - bob, 1.8, '#17100e');
    circle(c, 2, -31 - bob, 1.8, '#17100e');
    circle(c, 4, -29 - bob, 1.5, '#17100e');
    // headband
    px(c, -4, -27.4 - bob, 8, 1.6, '#ffc84a');
    px(c, 4, -27 - bob, 1, 1, '#ffc84a');
  } else if (gk) {
    px(c, -4, -30 - bob, 8, 3, '#1a1a24');
    px(c, -5, -28 - bob, 1, 2, '#1a1a24');
    px(c, 4, -28 - bob, 1, 2, '#1a1a24');
  } else if ((p.num || 0) % 3 === 0) {
    px(c, -4, -30 - bob, 8, 2, hair);
    px(c, -5, -28 - bob, 1, 2, hair);
    px(c, 4, -28 - bob, 1, 2, hair);
  } else if ((p.num || 0) % 3 === 1) {
    px(c, -4, -30 - bob, 8, 3, hair);
    px(c, -5, -27 - bob, 1, 1, hair);
    px(c, 4, -27 - bob, 1, 1, hair);
  } else {
    px(c, -4, -30 - bob, 8, 2, hair);
    px(c, -4, -28 - bob, 8, 1, hair);
  }

  // tiny number / captain mark
  if (p.isUser) {
    px(c, -1, -19 - bob, 2, 1, '#0a0e19');
    px(c, -1, -17 - bob, 2, 1, '#0a0e19');
  }

  // selection marker
  if (p.isUser && !opts.noUi) {
    const pulse = .5 + Math.sin((t || 0) * 5) * .2;
    c.globalAlpha = .35 + pulse * .25;
    ring(c, 0, 1, 10.5, '#ffc84a', 1.5);
    c.globalAlpha = 1;
    // chevron
    const oy = -38 - bob + Math.sin((t || 0) * 4) * 1.2;
    c.fillStyle = '#ffc84a';
    c.beginPath(); c.moveTo(0, oy); c.lineTo(-3, oy - 4); c.lineTo(3, oy - 4); c.closePath(); c.fill();
    // name tag
    if (opts.tag !== false) {
      px(c, -17, oy - 12, 34, 7, 'rgba(8,13,25,.82)');
      text(c, 'CARLOS 10', 0, oy - 6, 5, '#ffc84a', 'center');
    }
  }

  // stun stars
  if (p.stun > 0) {
    for (let i = 0; i < 3; i++) {
      const a = (t || 0) * 5 + i * 2.1;
      px(c, Math.cos(a) * 8, -33 - bob + Math.sin(a) * 2, 2, 2, '#ffe28a');
    }
  }

  // celebration arms
  if (celeb) {
    px(c, -8, -27 - bob, 2, 8, skin);
    px(c, 6, -27 - bob, 2, 8, skin);
  }

  c.restore();
}

export function drawBall(c, ball, t) {
  const x = Math.round(ball.x), y = Math.round(ball.y);
  // trail
  if (ball.trail && ball.trail.length) {
    for (let i = 0; i < ball.trail.length; i++) {
      const tr = ball.trail[i];
      const a = (i / ball.trail.length) * .32;
      circle(c, tr.x, tr.y, 1.5 + (i / ball.trail.length) * 2.2, ball.team === 0 ? `rgba(255,220,120,${a})` : `rgba(120,210,255,${a})`);
    }
  }
  // shadow
  c.fillStyle = 'rgba(0,0,0,.24)';
  c.beginPath(); c.ellipse(x + 1, y + 3, 4, 1.6, 0, 0, Math.PI * 2); c.fill();
  // ball
  circle(c, x, y, 3.6, '#f7f0df');
  circle(c, x, y, 3.6, 'rgba(255,255,255,.1)');
  const r = (ball.roll || 0);
  const spots = [[0, 0], [Math.cos(r) * 2, Math.sin(r) * 2], [Math.cos(r + 2.1) * 2, Math.sin(r + 2.1) * 2], [Math.cos(r + 4.2) * 2, Math.sin(r + 4.2) * 2]];
  for (let i = 0; i < spots.length; i++) {
    const [sx, sy] = spots[i];
    px(c, x + sx - .8, y + sy - .8, 1.6, 1.6, '#1c2333');
  }
  c.strokeStyle = 'rgba(20,25,40,.4)'; c.lineWidth = .8;
  c.beginPath(); c.arc(x, y, 3.6, 0, Math.PI * 2); c.stroke();
}

/* ------------------------------------------------------------------ */
/* MATCH PRESENTATION                                                  */
/* ------------------------------------------------------------------ */

export function drawMatchScene(c, match, t) {
  c.drawImage(getArenaBase(match.config.arena), 0, 0);
  drawArenaDynamic(c, match, t);

  if (match.cine) {
    drawCinematic(c, match, t);
    return;
  }

  // players sorted by feet y
  const players = [...match.home.players, ...match.away.players];
  players.sort((a, b) => a.y - b.y);
  for (const p of players) drawPlayer(c, p, t);

  // ball
  drawBall(c, match.ball, t);

  // charge ring + aim
  if (match.charge && match.charge.active) {
    const p = match.user;
    const q = match.charge.quality || 0;
    const col = q > .72 ? '#3ddc84' : q > .4 ? '#ffc84a' : '#ff5d6c';
    ring(c, p.x, p.y, 15 + Math.sin(t * 10) * 1.5, col, 1.5);
    c.globalAlpha = .8;
    line(c, p.x, p.y, 596, 196 + (match.charge.aimY || 0) * 26, col, 1);
    c.globalAlpha = .25;
    line(c, p.x, p.y - 1, 596, 196 + (match.charge.aimY || 0) * 26, col, 4);
    c.globalAlpha = 1;
  }

  // effects
  for (const fx of match.effects || []) {
    const a = clamp(fx.life / fx.max, 0, 1);
    if (fx.kind === 'confetti') {
      px(c, fx.x, fx.y, fx.size, fx.size * 1.6, fx.color);
    } else if (fx.kind === 'dust') {
      c.globalAlpha = a * .5;
      circle(c, fx.x, fx.y, fx.size * (1.4 - a * .4), fx.color);
      c.globalAlpha = 1;
    } else if (fx.kind === 'spark') {
      c.globalAlpha = a;
      line(c, fx.x, fx.y, fx.x - fx.vx * .04, fx.y - fx.vy * .04, fx.color, 1.4);
      c.globalAlpha = 1;
    } else if (fx.kind === 'text') {
      c.globalAlpha = a;
      text(c, fx.text, fx.x, fx.y, fx.size || 8, fx.color, 'center', 'Press Start 2P');
      c.globalAlpha = 1;
    }
  }

  // goal / halftime tints
  if (match.state === 'goal') {
    const flash = Math.max(0, 1 - match.stateT * 1.8);
    c.fillStyle = `rgba(255,255,255,${flash * .32})`;
    c.fillRect(0, 0, W, H);
    drawCelebrationConfetti(c, match, t);
  }

  if (match.tension >= 100) {
    const p = match.user;
    c.globalAlpha = .1 + Math.sin(t * 6) * .05;
    circle(c, p.x, p.y - 12, 26, '#ffc84a');
    c.globalAlpha = 1;
  }

  // final flash
  if (match.flash > 0) {
    c.fillStyle = `rgba(255,255,255,${clamp(match.flash, 0, .7)})`;
    c.fillRect(0, 0, W, H);
  }
}

function drawArenaDynamic(c, match, t) {
  const arena = match.config.arena;
  const rnd = mulberry32(arena === 'final' ? 71 : arena === 'club' ? 41 : 23);
  const standH = 74;
  // crowd flashes
  for (let i = 0; i < 10; i++) {
    const x = rnd() * W;
    const y = 10 + rnd() * 52;
    const on = Math.sin(t * (1.5 + i * .35) + i * 2.7) > .94;
    if (on) px(c, x, y, 2, 2, 'rgba(255,255,255,.95)');
  }
  // flags
  for (let i = 0; i < 5; i++) {
    const x = 24 + i * 140;
    const y = 20 + (i % 2) * 8;
    const wav = Math.sin(t * 2.4 + i) * 2;
    px(c, x, y, 20, 8, i % 2 ? (arena === 'final' ? '#ffc84a' : '#3aa7ff') : (arena === 'final' ? '#3ddc84' : '#ffc84a'));
    px(c, x + 20, y + wav, 7, 3, i % 2 ? (arena === 'final' ? '#ffc84a' : '#3aa7ff') : (arena === 'final' ? '#3ddc84' : '#ffc84a'));
  }
  // corner flags wave
  if (Math.sin(t * 3) > 0) {
    px(c, FIELD.r + 1, FIELD.t - 8, 7, 4, '#ffc84a');
  }
  // ambient confetti at final
  if (arena === 'final') {
    for (let i = 0; i < 18; i++) {
      const x = (i * 41 + t * 9) % W;
      const y = (i * 29 + t * 18) % H;
      px(c, x, y, 1, 2, ['#ffc84a', '#3ddc84', '#3aa7ff', '#ff5d6c', '#f7e8c8'][i % 5]);
    }
  }
  // light beams
  if (arena === 'final') {
    c.save();
    c.globalAlpha = .05 + Math.sin(t * .7) * .012;
    c.fillStyle = '#fff4cf';
    c.beginPath(); c.moveTo(48, 8); c.lineTo(92, 8); c.lineTo(190, 320); c.lineTo(20, 320); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(548, 8); c.lineTo(592, 8); c.lineTo(622, 320); c.lineTo(452, 320); c.closePath(); c.fill();
    c.restore();
  }
  // ball shadow on field? ball handles
}

function drawCelebrationConfetti(c, match, t) {
  const col = match.lastGoalTeam === 0 ? ['#ffc84a', '#3ddc84', '#f7e8c8'] : ['#3aa7ff', '#f7e8c8', '#ff5d6c'];
  for (let i = 0; i < 90; i++) {
    const x = (i * 73 + Math.sin(t * 3 + i) * 18 + t * 30) % W;
    const y = (i * 37 + t * 65 + Math.sin(t * 2 + i) * 20) % H;
    px(c, x, y, 2, 3, col[i % col.length]);
  }
  // golden glow
  c.save();
  c.globalAlpha = .12;
  circle(c, match.user.x, match.user.y - 10, 50, '#ffc84a');
  c.restore();
}

/* ------------------------------------------------------------------ */
/* TRAINING VIEW                                                       */
/* ------------------------------------------------------------------ */

export function drawTrainingView(c, data, t) {
  drawScene(c, data.scene || 'beach_sunset', t);
  // vignette + bottom scrim
  const grad = c.createLinearGradient(0, 180, 0, 360);
  grad.addColorStop(0, 'rgba(5,8,16,0)');
  grad.addColorStop(1, 'rgba(5,8,16,.72)');
  c.fillStyle = grad; c.fillRect(0, 180, W, 180);

  const bx = 320;
  const ground = 306;
  // spotlight
  c.save();
  c.globalAlpha = .1 + Math.sin(t * 2) * .025;
  circle(c, bx, ground - 30, 90, '#fff1c2');
  c.restore();

  // coach silhouette
  drawCoach(c, 468, 312, t);

  // Carlos juggling
  const fake = {
    x: bx, y: ground, vx: 0, vy: 0, num: 10, team: 0, role: 'FW', isUser: true,
    kit: { color: '#ffc84a', accent: '#00a86b' }, anim: t,
    facing: 1, speed: 0
  };
  drawPlayer(c, fake, t, { scale: 1.75, tag: false });

  // ball arc
  const hp = data.ballHeight || 0;
  const ballY = ground - 48 - hp * 82;
  const ballX = bx + 6 + Math.sin(t * 4) * 8;
  circle(c, ballX, ground - 8, 8, 'rgba(255,240,180,.05)');
  circle(c, ballX, ballY, 6, '#f7f0df');
  circle(c, ballX, ballY, 6, 'rgba(255,255,255,.08)');
  px(c, ballX - 2, ballY - 2, 4, 4, '#1c2333');
  px(c, ballX - 3, ballY + 3, 2, 2, '#1c2333');
  // trail
  for (let i = 1; i < 5; i++) {
    circle(c, ballX - i * .6, ballY + i * 4, 4.5 - i * .6, `rgba(255,240,200,${.16 - i * .028})`);
  }
  // hit sparkle
  if (data.hitFlash > 0) {
    c.save();
    c.globalAlpha = clamp(data.hitFlash, 0, 1);
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      line(c, ballX, ballY, ballX + Math.cos(a) * 22, ballY + Math.sin(a) * 22, '#ffc84a', 2);
    }
    c.restore();
    text(c, data.hitText || 'NICE!', 320, 120, 14, '#ffc84a', 'center', 'Press Start 2P');
  }

  // pips
  for (let i = 0; i < (data.attempts || 8); i++) {
    const x = 268 + i * 15;
    circle(c, x, 82, 3, i < (data.hits || 0) ? '#ffc84a' : 'rgba(247,232,200,.18)');
  }
}

function drawCoach(c, x, y, t) {
  const col = 'rgba(18,14,22,.75)';
  px(c, x - 4, y - 24, 8, 8, col);
  px(c, x - 7, y - 16, 14, 12, col);
  px(c, x - 7, y - 4, 4, 6, col);
  px(c, x + 2, y - 4, 4, 6, col);
  px(c, x - 11, y - 17 + Math.sin(t * 3) * 2, 4, 9, col);
  px(c, x + 7, y - 17 - Math.sin(t * 3) * 2, 4, 9, col);
  // whistle
  px(c, x + 4, y - 12, 2, 2, '#ffc84a');
}
