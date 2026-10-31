/* =========================================================
   CINEMATICS — oversized special-move illustrations
   ========================================================= */

import { W, H, px, circle, ring, line, text, clamp, lerp, mulberry32 } from './pixel.js';
import { drawPlayer } from './arena.js';

export function drawCinematic(c, match, t) {
  const cine = match.cine;
  const p = clamp(cine.t / cine.dur, 0, 1);
  const accent = cine.kind === 'drive' ? '#3aa7ff' : cine.kind === 'rotation' ? '#ffc84a' : cine.kind === 'samba' ? '#3ddc84' : '#ffc84a';

  // dark backdrop
  const grad = c.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#04070f');
  grad.addColorStop(.55, '#0a1222');
  grad.addColorStop(1, '#050810');
  c.fillStyle = grad; c.fillRect(0, 0, W, H);

  // radial burning sky
  c.save();
  c.translate(W / 2, H / 2 + 10);
  c.rotate(t * .12);
  for (let i = 0; i < 30; i++) {
    const a = i * Math.PI * 2 / 30;
    c.fillStyle = `rgba(${accent === '#3aa7ff' ? '58,167,255' : '255,200,74'},${.018 + (i % 3) * .008})`;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(Math.cos(a) * 700, Math.sin(a) * 700);
    c.lineTo(Math.cos(a + .055) * 700, Math.sin(a + .055) * 700);
    c.closePath(); c.fill();
  }
  c.restore();

  // stadium silhouette
  px(c, 0, H - 46, W, 46, 'rgba(3,6,12,.85)');
  px(c, 0, H - 48, W, 3, 'rgba(255,255,255,.08)');
  for (let i = 0; i < 40; i++) {
    const x = (i * 37) % W;
    px(c, x, H - 38 - (i % 4) * 3, 2, 2, 'rgba(255,220,150,.25)');
  }
  // crowd flashes
  const rnd = mulberry32(41);
  for (let i = 0; i < 12; i++) {
    const x = rnd() * W, y = H - 44 + rnd() * 20;
    if (Math.sin(t * 5 + i) > .6) px(c, x, y, 2, 2, 'rgba(255,255,255,.8)');
  }

  if (cine.kind === 'rotation') drawRotation(c, match, cine, p, t);
  else if (cine.kind === 'samba') drawSamba(c, match, cine, p, t);
  else if (cine.kind === 'combi') drawCombi(c, match, cine, p, t);
  else if (cine.kind === 'drive') drawDrive(c, match, cine, p, t);
  else if (cine.kind === 'save') drawSave(c, match, cine, p, t);

  // letterbox
  px(c, 0, 0, W, 12, '#03050b');
  px(c, 0, H - 12, W, 12, '#03050b');
  px(c, 0, 12, W, 1, 'rgba(255,255,255,.09)');
  px(c, 0, H - 13, W, 1, 'rgba(255,255,255,.09)');

  // impact flash
  if (cine.kind === 'rotation') {
    const impact = 1 - Math.abs(p - .5) * 9;
    if (impact > 0) {
      c.fillStyle = `rgba(255,255,255,${clamp(impact, 0, .7) * .32})`;
      c.fillRect(0, 0, W, H);
    }
  }
  if (cine.kind === 'drive') {
    const impact = 1 - Math.abs(p - .78) * 10;
    if (impact > 0) {
      c.fillStyle = `rgba(180,225,255,${clamp(impact, 0, .8) * .42})`;
      c.fillRect(0, 0, W, H);
    }
  }

  // film grain
  for (let i = 0; i < 20; i++) {
    px(c, Math.random() * W, Math.random() * H, 1, 1, 'rgba(255,255,255,.05)');
  }
}

function fakePlayer(team, isUser, num) {
  return {
    x: 0, y: 0, vx: 8, vy: 0, num, team, role: isUser ? 'FW' : 'MF',
    isUser, kit: team === 0 ? { color: '#ffc84a', accent: '#00a86b' } : { color: '#3aa7ff', accent: '#f7e8c8' },
    anim: 0, facing: 1, speed: 8
  };
}

function bigCarlos(c, x, y, scale, t, opts = {}) {
  const p = fakePlayer(0, true, 10);
  p.x = x; p.y = y; p.anim = t;
  drawPlayer(c, p, t, { scale, noUi: true, tag: false });
}

function bigNando(c, x, y, scale, t) {
  const p = fakePlayer(0, false, 7);
  p.kit = { color: '#1d5fd1', accent: '#f7e8c8' };
  p.x = x; p.y = y; p.anim = t;
  drawPlayer(c, p, t, { scale, noUi: true, tag: false });
}

function bigTsubasa(c, x, y, scale, t) {
  const p = fakePlayer(1, false, 10);
  p.kit = { color: '#1f4fd1', accent: '#f7e8c8' };
  p.x = x; p.y = y; p.anim = t;
  drawPlayer(c, p, t, { scale, noUi: true, tag: false });
}

/* ------------------------------------------------------------------ */
/* SANTANA ROTATION                                                    */
/* ------------------------------------------------------------------ */

function drawRotation(c, match, cine, p, t) {
  // ground glow
  c.save();
  c.globalAlpha = .14;
  circle(c, 250, 286, 120, '#ffc84a');
  c.restore();

  // goal silhouette at right
  drawGoalSilhouette(c, 596, 196, 'right');

  const leap = Math.sin(clamp(p / .52, 0, 1) * Math.PI) * 44;
  const spin = p < .52 ? -(p / .52) * Math.PI * 2.3 : -Math.PI * 2.3;

  // after-images
  for (let i = 4; i >= 1; i--) {
    c.save();
    c.globalAlpha = .06 + i * .015;
    c.translate(250 + i * 8, 286 - leap * (1 - i * .07));
    c.rotate(spin * (1 - i * .12));
    bigCarlos(c, 0, 0, 4.1, t - i * .08);
    c.restore();
  }

  // main body
  c.save();
  c.translate(250, 286 - leap);
  c.rotate(spin);
  // aura
  c.globalAlpha = .16;
  circle(c, 0, -44, 76, '#ffc84a');
  c.globalAlpha = 1;
  bigCarlos(c, 0, 0, 4.1, t);
  c.restore();

  // ball at foot before impact
  const fx = 250, fy = 286 - leap - 18;
  if (p < .5) {
    circle(c, fx + 22 * Math.cos(spin), fy + 22 * Math.sin(spin), 9, '#f7f0df');
    circle(c, fx + 22 * Math.cos(spin), fy + 22 * Math.sin(spin), 9, 'rgba(255,255,255,.2)');
    px(c, fx + 22 * Math.cos(spin) - 3, fy + 22 * Math.sin(spin) - 2, 6, 5, '#1c2333');
  } else {
    // golden arc into the net
    const q = clamp((p - .5) / .44, 0, 1);
    const bx = lerp(282, 595, q);
    const by = lerp(250, 196, q) - Math.sin(q * Math.PI) * 82;
    // trail
    for (let i = 0; i < 22; i++) {
      const k = i / 22;
      const tx = lerp(282, bx, k);
      const ty = lerp(250, by, k) - Math.sin(k * Math.PI) * (82 * (bx - 282) / 313);
      circle(c, tx, ty, 2 + k * 7, `rgba(255,214,102,${.03 + k * .18})`);
    }
    // ball
    circle(c, bx, by, 9, '#fff5d6');
    circle(c, bx, by, 5, '#ffc84a');
    // net ripple
    if (q > .88) {
      for (let i = 0; i < 4; i++) ring(c, 596, 196, 10 + i * 9, `rgba(255,230,140,${.35 - i * .07})`, 2);
      circle(c, 596, 196, 20, 'rgba(255,255,255,.25)');
    }
  }

  // speed lines
  c.save();
  c.globalAlpha = .22;
  for (let i = 0; i < 12; i++) {
    const y = 40 + i * 25;
    line(c, 0, y, 60 + (i % 4) * 30, y - 3, '#ffc84a', 1);
    line(c, W, y + 8, W - 60 - (i % 3) * 30, y + 5, '#ffc84a', 1);
  }
  c.restore();

  // big caption shadow
  c.save();
  c.globalAlpha = .8;
  text(c, 'SANTANA', 250, 84, 12, '#ffc84a', 'center', 'Press Start 2P');
  text(c, 'ROTATION', 250, 100, 12, '#f7e8c8', 'center', 'Press Start 2P');
  c.restore();
}

function drawGoalSilhouette(c, x, y, side) {
  const left = side === 'left';
  const nx = left ? x - 18 : x;
  const top = y - 40, bottom = y + 40;
  px(c, nx, top, 18, 80, 'rgba(2,6,12,.7)');
  for (let yy = top; yy < bottom; yy += 6) line(c, nx, yy, x, yy, 'rgba(235,245,255,.28)', 1);
  for (let xx = nx; xx <= x; xx += 5) line(c, xx, top, xx, bottom, 'rgba(235,245,255,.22)', 1);
  line(c, x, top, x, top + 4, '#f0f6ff', 3);
  line(c, x, bottom, x, bottom - 4, '#f0f6ff', 3);
  line(c, nx, top, x, top, '#e7f0ff', 2);
  line(c, nx, bottom, x, bottom, '#e7f0ff', 2);
}

/* ------------------------------------------------------------------ */
/* SAMBA STEP                                                          */
/* ------------------------------------------------------------------ */

function drawSamba(c, match, cine, p, t) {
  // field ground
  px(c, 0, 270, W, 90, 'rgba(7,16,24,.65)');
  for (let i = 0; i < 10; i++) line(c, 0, 276 + i * 9, W, 276 + i * 9, 'rgba(255,255,255,.025)', 1);

  const speed = p * 180;
  // after-images trail
  for (let i = 4; i >= 0; i--) {
    c.save();
    c.globalAlpha = .1 + i * .05;
    bigCarlos(c, 100 + i * 52 + speed * .35, 292 - (i % 2) * 6, 3.1, t - i * .06);
    c.restore();
  }
  // main carlos
  bigCarlos(c, 100 + speed, 292, 3.1, t);

  // ball zig-zag
  for (let i = 0; i < 6; i++) {
    const k = (p * 1.4 + i * .16) % 1;
    const bx = 140 + k * 380;
    const by = 258 - Math.sin(k * Math.PI * 2) * 26;
    px(c, bx, by, 4, 4, i % 2 ? '#ffc84a' : '#f7f0df');
  }

  // defenders falling
  const defenders = [[300, 292, .5], [380, 286, .8], [455, 294, 1.05]];
  for (let i = 0; i < defenders.length; i++) {
    const [dx, dy, rot] = defenders[i];
    if (p > .25 + i * .16) {
      c.save();
      c.translate(dx, dy + Math.min(.25, p - .25 - i * .16) * 20);
      c.rotate(rot * Math.min(1, (p - .25 - i * .16) * 4));
      const fake = fakePlayer(1, false, i + 4);
      fake.kit = { color: i % 2 ? '#1d5fd1' : '#ff5d6c', accent: '#f7e8c8' };
      fake.x = 0; fake.y = 0; fake.anim = t;
      drawPlayer(c, fake, t, { scale: 2.4, noUi: true, tag: false });
      c.restore();
    }
  }

  // dust
  for (let i = 0; i < 16; i++) {
    circle(c, 120 + i * 28 + Math.sin(t + i) * 10, 300 - (i % 5) * 2, 3 + (i % 3), 'rgba(240,220,180,.11)');
  }

  c.save();
  c.globalAlpha = .85;
  text(c, 'SAMBA STEP', 320, 92, 13, '#ffc84a', 'center', 'Press Start 2P');
  c.restore();
}

/* ------------------------------------------------------------------ */
/* GOLDEN COMBI                                                        */
/* ------------------------------------------------------------------ */

function drawCombi(c, match, cine, p, t) {
  px(c, 0, 268, W, 92, 'rgba(6,14,22,.7)');
  for (let i = 0; i < 12; i++) line(c, 0, 274 + i * 8, W, 274 + i * 8, 'rgba(255,255,255,.025)', 1);

  bigCarlos(c, 150, 300, 3.3, t);
  bigNando(c, 465, 300, 3.1, t);

  // defender between
  c.save();
  c.globalAlpha = .8;
  const def = fakePlayer(1, false, 4);
  def.kit = { color: '#ff5d6c', accent: '#1a1a24' };
  def.x = 310; def.y = 300; def.anim = t;
  drawPlayer(c, def, t, { scale: 2.8, noUi: true, tag: false });
  c.restore();

  // ball path
  const phase = (p * 3) % 1;
  const startX = phase < .5 ? 190 : 420;
  const endX = phase < .5 ? 420 : 190;
  const bx = lerp(startX, endX, phase < .5 ? phase * 2 : (phase - .5) * 2);
  const by = 250 - Math.sin((phase < .5 ? phase * 2 : (phase - .5) * 2) * Math.PI) * 34;
  for (let i = 0; i < 16; i++) {
    const k = i / 16;
    const xx = lerp(startX, bx, k);
    const yy = lerp(250, by, k);
    circle(c, xx, yy, 1.5 + k * 2, `rgba(255,214,102,${.03 + k * .13})`);
  }
  circle(c, bx, by, 7, '#f7f0df');
  circle(c, bx, by, 4, '#ffc84a');

  // golden light path behind
  c.save();
  c.globalAlpha = .18;
  line(c, 190, 260, 420, 260, '#ffc84a', 4);
  line(c, 420, 260, 600, 220, '#ffc84a', 3);
  c.restore();

  // forward arrow after pass
  if (p > .55) {
    c.save();
    c.globalAlpha = clamp((p - .55) * 3, 0, .7);
    const ax = lerp(190, 600, clamp((p - .55) / .45, 0, 1));
    line(c, ax - 30, 244, ax, 228, '#ffc84a', 5);
    c.fillStyle = '#ffc84a';
    c.beginPath(); c.moveTo(ax + 8, 224); c.lineTo(ax - 8, 218); c.lineTo(ax - 4, 234); c.closePath(); c.fill();
    c.restore();
  }

  c.save();
  c.globalAlpha = .85;
  text(c, 'GOLDEN COMBI', 320, 92, 13, '#ffc84a', 'center', 'Press Start 2P');
  c.restore();
}

/* ------------------------------------------------------------------ */
/* TSUBASA'S DRIVE SHOT                                                */
/* ------------------------------------------------------------------ */

function drawDrive(c, match, cine, p, t) {
  // blue storm background
  c.save();
  c.globalAlpha = .18;
  for (let i = 0; i < 24; i++) {
    const y = 20 + i * 14;
    line(c, 0, y, W, y + 30, 'rgba(58,167,255,.32)', 1);
  }
  c.restore();

  // goal silhouette left
  drawGoalSilhouette(c, 44, 196, 'left');

  // giant Tsubasa
  bigTsubasa(c, 470, 306, 4.2, t);
  c.save();
  c.globalAlpha = .16 + Math.sin(t * 5) * .05;
  circle(c, 470, 232, 82, '#3aa7ff');
  c.restore();

  // charging ball
  if (p < .35) {
    const bx = 420, by = 250;
    circle(c, bx, by, 10 + Math.sin(t * 12) * 2, 'rgba(120,210,255,.4)');
    circle(c, bx, by, 6, '#e8f7ff');
    circle(c, bx, by, 3, '#3aa7ff');
  } else {
    const q = clamp((p - .35) / .5, 0, 1);
    const bx = lerp(420, 55, q);
    const by = lerp(246, 196, q) - Math.sin(q * Math.PI) * 64;
    for (let i = 0; i < 26; i++) {
      const k = i / 26;
      const tx = lerp(420, bx, k);
      const ty = lerp(246, by, k) - Math.sin(k * Math.PI) * (64 * (bx - 420) / -365);
      circle(c, tx, ty, 2 + k * 8, `rgba(78,180,255,${.02 + k * .17})`);
    }
    circle(c, bx, by, 10, '#dff4ff');
    circle(c, bx, by, 5, '#3aa7ff');
    // goalkeeper dive
    const gx = lerp(90, 62, q);
    const gy = 300 - q * 60;
    c.save();
    c.translate(gx, gy);
    c.rotate(-.7 * q);
    const gk = fakePlayer(0, false, 1);
    gk.role = 'GK';
    gk.kit = { color: '#3ddc84', accent: '#0a0e19' };
    gk.x = 0; gk.y = 0; gk.anim = t;
    drawPlayer(c, gk, t, { scale: 3.2, noUi: true, tag: false });
    c.restore();

    if (q > .9) {
      for (let i = 0; i < 4; i++) ring(c, 44, 196, 12 + i * 11, `rgba(120,215,255,${.4 - i * .08})`, 2);
      circle(c, 44, 196, 22, 'rgba(255,255,255,.28)');
    }
  }

  c.save();
  c.globalAlpha = .85;
  text(c, 'DRIVE SHOT', 320, 92, 13, '#3aa7ff', 'center', 'Press Start 2P');
  c.restore();
}

/* ------------------------------------------------------------------ */
/* BIG SAVE                                                            */
/* ------------------------------------------------------------------ */

function drawSave(c, match, cine, p, t) {
  drawGoalSilhouette(c, 44, 196, 'left');
  const q = clamp(p / .65, 0, 1);
  const gx = lerp(90, 52, q);
  const gy = 300 - q * 48;
  c.save();
  c.translate(gx, gy);
  c.rotate(-.8 * q);
  const gk = fakePlayer(0, false, 1);
  gk.role = 'GK';
  gk.kit = { color: '#3ddc84', accent: '#0a0e19' };
  gk.x = 0; gk.y = 0; gk.anim = t;
  drawPlayer(c, gk, t, { scale: 4, noUi: true, tag: false });
  c.restore();

  const bx = lerp(500, 48, clamp(p / .8, 0, 1));
  const by = lerp(250, 182, clamp(p / .8, 0, 1)) - Math.sin(clamp(p / .8, 0, 1) * Math.PI) * 38;
  circle(c, bx, by, 8, '#e8f7ff');
  circle(c, bx, by, 4, '#3aa7ff');
  for (let i = 0; i < 12; i++) {
    const k = i / 12;
    circle(c, lerp(500, bx, k), lerp(250, by, k), 1.5 + k * 4, `rgba(120,210,255,${.02 + k * .1})`);
  }
  if (p > .6) {
    c.save();
    c.globalAlpha = clamp((p - .6) * 4, 0, 1);
    text(c, 'SAVED!', 320, 110, 20, '#3ddc84', 'center', 'Press Start 2P');
    c.restore();
  }
}
