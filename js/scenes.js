/* =========================================================
   SCENES — procedural background art for story & title
   ========================================================= */

import {
  W, H, px, circle, ring, line, text, bands, cloud, makeCanvas,
  mulberry32, clamp, lerp
} from './pixel.js';

const baseCache = new Map();

export function drawScene(ctx, key, t) {
  const base = getBase(key);
  ctx.drawImage(base, 0, 0);
  drawSceneDynamic(ctx, key, t);
}

export function getBase(key) {
  if (!baseCache.has(key)) {
    const c = makeCanvas(W, H);
    paintBase(c.getContext('2d'), key);
    baseCache.set(key, c);
  }
  return baseCache.get(key);
}

function paintBase(c, key) {
  if (key.startsWith('beach')) paintBeach(c, key);
  else if (key.startsWith('street')) paintStreet(c, key);
  else if (key.startsWith('stadium')) paintStadium(c, key);
  else if (key === 'locker') paintLocker(c);
  else if (key === 'tunnel') paintTunnel(c);
  else if (key === 'home') paintHome(c);
  else paintBeach(c, 'beach_sunset');
}

/* ------------------------------------------------------------------ */
/* BEACH                                                               */
/* ------------------------------------------------------------------ */

const BEACH = {
  beach_sunset: {
    sky: ['#161b3e', '#2b2752', '#5b3766', '#98465f', '#d36556', '#f19251', '#ffc86a'],
    sun: { x: 494, y: 122, r: 38, color: '#ffd878', glow: 'rgba(255,200,90,0.22)' },
    sea: ['#31465f', '#2a5a73', '#267082', '#2c8790', '#3d9a95'],
    sand: '#e3b878', sandDark: '#c9985b', sandLight: '#f0cc92',
    palm: '#1c2c2a', palmLight: '#2b4138',
    clouds: '#f6b09a', cloudShade: '#d9837d',
    night: false
  },
  beach_night: {
    sky: ['#03060f', '#071128', '#0b1c3c', '#122a52', '#1a3a66'],
    sun: { x: 500, y: 78, r: 26, color: '#e8e5cf', glow: 'rgba(220,230,255,0.15)' },
    sea: ['#0a1f3a', '#0e2b4a', '#12375a', '#174365', '#1c4d6c'],
    sand: '#6f675b', sandDark: '#565047', sandLight: '#837a6b',
    palm: '#08110f', palmLight: '#101d1a',
    clouds: '#233257', cloudShade: '#182442',
    night: true
  },
  beach_dawn: {
    sky: ['#1b2545', '#3b3563', '#7d4b70', '#c16672', '#ee9370', '#ffc58c', '#ffe0a8'],
    sun: { x: 152, y: 148, r: 27, color: '#fff0b8', glow: 'rgba(255,220,150,0.18)' },
    sea: ['#2a4a65', '#2b6179', '#2f7a89', '#3b9197', '#56a8a0'],
    sand: '#e8c48c', sandDark: '#cf9e64', sandLight: '#f3d6a5',
    palm: '#20302c', palmLight: '#30463b',
    clouds: '#ffceb0', cloudShade: '#e59a8d',
    night: false
  }
};

function paintBeach(c, key) {
  const p = BEACH[key] || BEACH.beach_sunset;
  bands(c, p.sky, 0, 0, W, 214);

  if (p.night) {
    const rnd = mulberry32(77);
    for (let i = 0; i < 90; i++) {
      const x = rnd() * W, y = rnd() * 180;
      px(c, x, y, i % 11 === 0 ? 2 : 1, i % 11 === 0 ? 2 : 1, i % 7 === 0 ? 'rgba(255,235,180,.9)' : 'rgba(220,235,255,.6)');
    }
    // moon crescent
    circle(c, p.sun.x, p.sun.y, p.sun.r, p.sun.color);
    circle(c, p.sun.x + 10, p.sun.y - 5, p.sun.r * .9, p.sky[1]);
    px(c, p.sun.x - 8, p.sun.y - 8, 4, 2, 'rgba(0,0,0,0.05)');
  } else {
    // sun glow
    for (let r = p.sun.r + 28; r > p.sun.r; r -= 6) {
      circle(c, p.sun.x, p.sun.y, r, `rgba(255,210,120,${0.015 + (p.sun.r + 28 - r) * 0.001})`);
    }
    circle(c, p.sun.x, p.sun.y, p.sun.r, p.sun.color);
    // retro cutout bands
    for (let i = 0; i < 5; i++) {
      const y = p.sun.y - p.sun.r + 10 + i * 12;
      px(c, p.sun.x - p.sun.r - 4, y, p.sun.r * 2 + 8, i % 2 ? 2 : 3, p.sky[Math.min(p.sky.length - 1, 4 + (i > 2 ? 1 : 0))]);
    }
  }

  // clouds
  cloud(c, 62, 64, 1.2, p.clouds);
  px(c, 60, 70, 52, 2, p.cloudShade);
  cloud(c, 244, 92, 0.8, p.clouds);
  cloud(c, 380, 48, 1.5, p.clouds);
  px(c, 378, 55, 70, 2, p.cloudShade);
  cloud(c, 526, 74, 0.7, p.clouds);

  // distant island
  px(c, 0, 202, W, 10, p.sea[0]);
  c.fillStyle = p.sea[0];
  c.beginPath();
  c.moveTo(0, 204); c.lineTo(86, 187); c.lineTo(140, 197); c.lineTo(182, 204); c.closePath(); c.fill();

  // sea
  const seaTop = 208;
  bands(c, p.sea, 0, seaTop, W, 72);
  for (let i = 0; i < 22; i++) {
    const y = seaTop + 6 + i * 3.1;
    const x = (i * 53) % W;
    px(c, x, y, 18 + (i % 4) * 9, 1, p.night ? 'rgba(90,150,190,.22)' : 'rgba(255,225,180,.32)');
    px(c, (x + 280) % W, y + 1, 9 + (i % 3) * 6, 1, p.night ? 'rgba(70,120,160,.2)' : 'rgba(255,200,150,.2)');
  }
  // sailboat
  px(c, 552, 236, 14, 2, '#f2e7d2');
  px(c, 558, 220, 1, 16, '#e7d9bf');
  c.fillStyle = '#f7edda';
  c.beginPath(); c.moveTo(559, 221); c.lineTo(559, 235); c.lineTo(571, 233); c.closePath(); c.fill();
  px(c, 549, 238, 20, 3, '#29323f');

  // sand
  bands(c, [p.sandLight, p.sand, p.sandDark], 0, 276, W, 84);
  const rnd = mulberry32(19);
  for (let i = 0; i < 150; i++) {
    px(c, rnd() * W, 280 + rnd() * 80, 1 + (i % 3), 1, i % 4 ? 'rgba(255,235,190,.18)' : 'rgba(0,0,0,.12)');
  }
  // wet-sand scallops
  for (let i = 0; i < 12; i++) {
    px(c, i * 58, 282 + (i % 2) * 2, 38, 2, 'rgba(255,240,205,.28)');
  }

  // palms
  paintPalm(c, 38, 312, 1.12, p.palm, p.palmLight, 1);
  paintPalm(c, 606, 330, 1.35, p.palm, p.palmLight, -1);

  // little beach goal at right
  px(c, 470, 286, 2, 28, '#f0e6d1');
  px(c, 548, 290, 2, 24, '#f0e6d1');
  px(c, 470, 286, 80, 2, 'rgba(240,230,209,.9)');
  for (let i = 0; i < 10; i++) {
    line(c, 472 + i * 8, 288, 472 + i * 8, 310, 'rgba(240,230,209,.18)', 1);
  }
  for (let i = 0; i < 4; i++) line(c, 470, 290 + i * 6, 550, 290 + i * 6, 'rgba(240,230,209,.14)', 1);

  // distant kids silhouettes
  paintMiniKid(c, 408, 292, 1, p.night ? '#0d1524' : 'rgba(45,38,50,.62)');
  paintMiniKid(c, 430, 294, .9, p.night ? '#0d1524' : 'rgba(45,38,50,.55)');
  paintMiniKid(c, 456, 291, 1.05, p.night ? '#0d1524' : 'rgba(45,38,50,.6)');
}

function paintPalm(c, x, ground, s, dark, light, dir) {
  let pxX = x;
  for (let i = 0; i < 8; i++) {
    const w = 5 - Math.floor(i / 3);
    px(c, pxX, ground - i * 17 * s, w, 18 * s, dark);
    px(c, pxX + w - 1, ground - i * 17 * s, 1, 18 * s, light);
    pxX += dir * 2.2 * s;
  }
  const topX = pxX, topY = ground - 8 * 17 * s;
  // coconuts
  circle(c, topX - 4, topY + 6, 3, dark);
  circle(c, topX + 4, topY + 7, 2.5, dark);
  // fronds
  const fronds = [
    [-1, -0.35, 44], [-0.55, -0.9, 46], [0.1, -1.05, 48], [0.78, -0.72, 45], [1, -0.15, 42], [0.5, 0.28, 34], [-0.7, 0.2, 32]
  ];
  for (const [dx, dy, len] of fronds) {
    for (let i = 0; i < 10; i++) {
      const k = i / 10;
      const fx = topX + dx * len * k;
      const fy = topY + dy * len * k + k * k * 8;
      const w = Math.max(1, 4 - i * 0.3);
      px(c, fx, fy, w, 2, i % 2 ? dark : light);
      if (i % 3 === 0) px(c, fx + w, fy + 1, 2, 1, dark);
    }
  }
}

function paintMiniKid(c, x, y, s, color) {
  px(c, x - 2 * s, y - 9 * s, 4 * s, 4 * s, color);
  px(c, x - 3 * s, y - 5 * s, 6 * s, 5 * s, color);
  px(c, x - 3 * s, y, 2 * s, 5 * s, color);
  px(c, x + 1 * s, y, 2 * s, 5 * s, color);
  px(c, x + 3 * s, y - 6 * s, 1 * s, 4 * s, color);
}

/* ------------------------------------------------------------------ */
/* STREET / SALVADOR                                                   */
/* ------------------------------------------------------------------ */

function paintStreet(c, key) {
  const day = key === 'street_day';
  bands(c, day ? ['#5f8fc0', '#82b2d3', '#b9d7df', '#f3d7ad'] : ['#161b3e', '#3d2c54', '#7a3f58', '#c46a54'], 0, 0, W, 280);
  if (day) {
    circle(c, 542, 46, 22, 'rgba(255,245,200,.9)');
    cloud(c, 70, 40, .9, 'rgba(255,255,255,.65)');
    cloud(c, 330, 26, .7, 'rgba(255,255,255,.5)');
  } else {
    const rnd = mulberry32(33);
    for (let i = 0; i < 40; i++) px(c, rnd() * W, rnd() * 120, 1, 1, 'rgba(255,240,200,.6)');
    circle(c, 530, 54, 16, '#ffe6a8');
    circle(c, 536, 49, 14, '#2b2447');
  }

  // skyline / distant buildings
  px(c, 0, 110, W, 90, '#2b2a44');
  const rnd = mulberry32(8);
  for (let i = 0; i < 20; i++) {
    const x = i * 34, h = 40 + rnd() * 70;
    px(c, x, 200 - h, 30, h, i % 2 ? '#32314e' : '#28273f');
    for (let j = 0; j < 4; j++) {
      if (rnd() > .45) px(c, x + 5 + (j % 2) * 13, 208 - h + j * 10, 4, 5, 'rgba(255,210,120,.35)');
    }
  }

  // row of Salvador houses
  const houses = [
    { x: 4, w: 94, h: 104, wall: '#d85d55', roof: '#7a2f2f', trim: '#f4d79c' },
    { x: 102, w: 88, h: 126, wall: '#2f8a86', roof: '#1c5757', trim: '#f7e8c8' },
    { x: 194, w: 100, h: 112, wall: '#e0a13e', roof: '#8b5521', trim: '#fff0c4' },
    { x: 298, w: 84, h: 134, wall: '#6e5fb1', roof: '#3d356b', trim: '#f4d79c' },
    { x: 386, w: 104, h: 118, wall: '#c94f78', roof: '#7d2848', trim: '#ffddb0' },
    { x: 494, w: 142, h: 138, wall: '#3f7fae', roof: '#275272', trim: '#f7e8c8' }
  ];
  for (const h of houses) {
    const y = 256 - h.h;
    px(c, h.x, y, h.w, h.h, h.wall);
    px(c, h.x, y, h.w, 4, h.trim);
    // roof
    px(c, h.x - 4, y - 7, h.w + 8, 7, h.roof);
    px(c, h.x - 2, y - 11, h.w + 4, 5, h.roof);
    // roof tiles
    for (let i = 0; i < h.w; i += 10) px(c, h.x + i, y - 6, 7, 2, 'rgba(0,0,0,.18)');
    // windows
    const cols = Math.max(2, Math.floor(h.w / 32));
    const rows = Math.max(2, Math.floor(h.h / 38));
    for (let wx = 0; wx < cols; wx++) {
      for (let wy = 0; wy < rows; wy++) {
        const x = h.x + 12 + wx * 30;
        const yy = y + 16 + wy * 36;
        px(c, x - 2, yy - 2, 18, 25, h.trim);
        px(c, x, yy, 14, 21, wy === 0 && wx === 1 ? '#ffe1a0' : '#1b2038');
        px(c, x + 6, yy, 2, 21, h.trim);
        px(c, x, yy + 9, 14, 2, h.trim);
        if (wy === 0 && wx === 0) px(c, x + 2, yy + 3, 4, 3, 'rgba(255,255,255,.2)');
      }
    }
    // door
    const dx = h.x + h.w - 30;
    px(c, dx - 2, 256 - 36, 22, 36, h.trim);
    px(c, dx, 256 - 33, 18, 33, '#3a2a26');
    px(c, dx + 13, 256 - 18, 2, 2, '#ffc84a');
    // balcony
    if (h.h > 110) {
      px(c, h.x + 8, y + 34, h.w - 16, 3, h.roof);
      for (let i = 0; i < 6; i++) px(c, h.x + 10 + i * 12, y + 37, 2, 8, h.roof);
    }
  }

  // graffiti wall
  px(c, 0, 246, W, 16, '#7c5a44');
  px(c, 0, 246, W, 3, '#a77b59');
  for (let i = 0; i < 10; i++) px(c, i * 67, 248, 31, 1, 'rgba(0,0,0,.18)');
  text(c, 'AURORA', 24, 259, 10, 'rgba(255,200,74,.65)', 'left', 'Press Start 2P');
  text(c, '10', 584, 260, 12, 'rgba(255,200,74,.6)', 'right', 'Press Start 2P');
  text(c, 'SALVADOR', 420, 259, 7, 'rgba(247,232,200,.4)', 'left', 'Press Start 2P');

  // street
  bands(c, ['#6c5b50', '#5b4c43', '#4b3e37'], 0, 262, W, 98);
  const r2 = mulberry32(72);
  for (let row = 0; row < 5; row++) {
    const y = 266 + row * 19;
    for (let col = 0; col < 18; col++) {
      const x = col * 38 + (row % 2) * 18;
      const w = 30 + r2() * 4;
      px(c, x, y, w, 14, row % 2 ? '#78655a' : '#6f5d52');
      px(c, x + 2, y + 1, w - 4, 2, 'rgba(255,240,210,.12)');
      px(c, x, y + 12, w, 2, 'rgba(0,0,0,.18)');
    }
  }

  // laundry lines
  line(c, 96, 150, 196, 160, 'rgba(40,30,35,.7)', 1);
  line(c, 296, 132, 390, 150, 'rgba(40,30,35,.7)', 1);
  const shirts = [[110, 152, '#ffc84a'], [148, 156, '#3ddc84'], [176, 158, '#ff5d6c'], [312, 136, '#f7e8c8'], [348, 142, '#3aa7ff']];
  for (const [x, y, col] of shirts) {
    px(c, x, y, 12, 12, col);
    px(c, x - 3, y + 2, 3, 5, col);
    px(c, x + 12, y + 2, 3, 5, col);
    px(c, x + 3, y + 12, 2, 4, col);
    px(c, x + 7, y + 12, 2, 4, col);
  }

  // lamps
  for (const lx of [84, 404, 602]) {
    px(c, lx, 216, 3, 64, '#252a39');
    px(c, lx - 5, 212, 13, 4, '#333a4e');
    circle(c, lx + 1, 214, 5, 'rgba(255,200,100,.22)');
    px(c, lx, 212, 3, 4, '#ffe0a0');
  }

  // power lines
  line(c, 0, 126, W, 138, 'rgba(20,18,30,.55)', 1);
  line(c, 0, 130, W, 142, 'rgba(20,18,30,.35)', 1);

  // kids playing
  paintMiniKid(c, 242, 300, 1.05, 'rgba(25,20,28,.75)');
  paintMiniKid(c, 262, 304, .9, 'rgba(25,20,28,.65)');
  paintMiniKid(c, 286, 298, 1, 'rgba(25,20,28,.7)');
  circle(c, 306, 287, 3, 'rgba(247,232,200,.8)');
}

/* ------------------------------------------------------------------ */
/* LOCKER ROOM                                                         */
/* ------------------------------------------------------------------ */

function paintLocker(c) {
  px(c, 0, 0, W, H, '#162e2c');
  // wall tiles
  for (let y = 0; y < 280; y += 22) {
    for (let x = 0; x < W; x += 34) {
      px(c, x, y, 32, 20, (x / 34 + y / 22) % 2 ? '#1a3532' : '#18312e');
    }
  }
  px(c, 0, 0, W, 12, '#0d1c1c');
  // floor
  bands(c, ['#3d3026', '#33281f', '#2a211a'], 0, 278, W, 82);
  for (let i = 0; i < 10; i++) line(c, 0, 282 + i * 9, W, 282 + i * 9, 'rgba(0,0,0,.18)', 1);
  for (let i = 0; i < 12; i++) line(c, i * 58, 278, i * 58 + 10, 360, 'rgba(0,0,0,.12)', 1);

  // left lockers
  for (let i = 0; i < 3; i++) {
    const x = 12 + i * 56, y = 56;
    px(c, x, y, 50, 176, '#264c47');
    px(c, x, y, 50, 3, '#3a6e64');
    px(c, x + 4, y + 10, 42, 2, 'rgba(0,0,0,.25)');
    for (let v = 0; v < 5; v++) px(c, x + 4, y + 18 + v * 3, 42, 1, 'rgba(0,0,0,.13)');
    px(c, x + 22, y + 58, 6, 3, '#d9c7a3');
    px(c, x + 22, y + 61, 3, 8, '#8f7f60');
    text(c, String(i + 4), x + 25, y + 30, 11, 'rgba(247,232,200,.4)', 'center', 'Press Start 2P');
  }
  // right lockers (partial)
  for (let i = 0; i < 2; i++) {
    const x = 486 + i * 70;
    px(c, x, 50, 62, 190, '#23443f');
    px(c, x, 50, 62, 3, '#37665d');
    px(c, x + 6, 62, 50, 2, 'rgba(0,0,0,.24)');
    px(c, x + 28, 112, 7, 3, '#d9c7a3');
  }

  // window with light
  px(c, 414, 44, 54, 84, '#0b1720');
  px(c, 418, 48, 46, 76, '#b7e4e2');
  px(c, 441, 48, 3, 76, '#395e63');
  px(c, 418, 84, 46, 3, '#395e63');
  // light rays
  c.save();
  c.globalAlpha = .1;
  c.fillStyle = '#d8ffff';
  c.beginPath(); c.moveTo(418, 48); c.lineTo(466, 48); c.lineTo(600, 340); c.lineTo(420, 340); c.closePath(); c.fill();
  c.restore();

  // hanging jerseys
  px(c, 344, 40, 70, 3, '#6c5a44');
  for (const [x, col] of [[352, '#1d5fd1'], [386, '#f7e8c8']]) {
    px(c, x, 43, 26, 34, col);
    px(c, x - 4, 46, 4, 16, col);
    px(c, x + 26, 46, 4, 16, col);
    px(c, x + 8, 43, 10, 5, 'rgba(0,0,0,.28)');
    text(c, x + 13, 68, 10, 'rgba(10,14,25,.55)', 'center', 'Press Start 2P');
  }

  // tactics board
  px(c, 252, 34, 128, 92, '#20332e');
  px(c, 256, 38, 120, 84, '#2c4a3f');
  px(c, 258, 40, 116, 80, 'rgba(247,232,200,.08)');
  line(c, 316, 44, 316, 116, 'rgba(247,232,200,.4)', 1);
  ring(c, 316, 80, 13, 'rgba(247,232,200,.4)', 1);
  for (const [x, y, col] of [[278, 62, '#ffc84a'], [294, 96, '#ffc84a'], [338, 58, '#ff5d6c'], [352, 94, '#ff5d6c'], [316, 80, '#3ddc84']]) {
    circle(c, x, y, 3, col);
  }
  line(c, 280, 66, 314, 80, 'rgba(255,255,255,.35)', 1);
  line(c, 296, 92, 314, 82, 'rgba(255,255,255,.35)', 1);
  line(c, 316, 80, 336, 62, 'rgba(255,255,255,.25)', 1);
  text(c, 'AURORA', 262, 116, 6, 'rgba(247,232,200,.5)', 'left', 'Press Start 2P');

  // bench
  px(c, 180, 242, 286, 10, '#7b5a38');
  px(c, 188, 252, 12, 34, '#543c27');
  px(c, 444, 252, 12, 34, '#543c27');
  px(c, 180, 242, 286, 2, '#a97d4e');
  // boots on bench
  px(c, 240, 232, 15, 8, '#e7dcc7');
  px(c, 240, 239, 17, 3, '#25252c');
  px(c, 249, 230, 4, 6, '#e7dcc7');
  // bag
  px(c, 402, 218, 30, 24, '#1d5fd1');
  px(c, 408, 212, 18, 7, '#164a9e');
  px(c, 412, 224, 10, 3, '#f7e8c8');

  // sign
  text(c, 'AURORA FC', 320, 170, 18, 'rgba(247,232,200,.15)', 'center', 'Press Start 2P');
  text(c, 'AURORA FC', 320, 168, 18, 'rgba(247,232,200,.28)', 'center', 'Press Start 2P');

  // door right
  px(c, 600, 80, 40, 180, '#3a2c24');
  px(c, 604, 86, 32, 168, '#4b382c');
  px(c, 610, 170, 4, 4, '#ffc84a');
}

/* ------------------------------------------------------------------ */
/* TUNNEL                                                              */
/* ------------------------------------------------------------------ */

function paintTunnel(c) {
  px(c, 0, 0, W, H, '#060a12');
  // walls
  const vx = 320, vy = 182;
  c.save();
  // outer wall gradient
  for (let i = 0; i < 20; i++) {
    const t = i / 20;
    px(c, 0, i * 18, W, 19, `rgba(${18 + t * 8},${26 + t * 10},${44 + t * 12},1)`);
  }
  // bright opening
  px(c, 244, 104, 152, 182, '#3b6f5a');
  px(c, 250, 110, 140, 170, '#4e8c6c');
  px(c, 258, 118, 124, 154, '#65a97f');
  // pitch opening glow
  c.globalAlpha = .22;
  circle(c, 320, 196, 120, '#b8ffd0');
  c.restore();

  // tunnel walls perspective
  const wall = '#101828';
  c.fillStyle = wall;
  c.beginPath(); c.moveTo(0, 0); c.lineTo(244, 104); c.lineTo(244, 286); c.lineTo(0, 360); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(W, 0); c.lineTo(396, 104); c.lineTo(396, 286); c.lineTo(W, 360); c.closePath(); c.fill();
  // ceiling
  c.fillStyle = '#0a101d';
  c.beginPath(); c.moveTo(0, 0); c.lineTo(W, 0); c.lineTo(396, 104); c.lineTo(244, 104); c.closePath(); c.fill();
  // floor
  c.fillStyle = '#0d1523';
  c.beginPath(); c.moveTo(0, 360); c.lineTo(244, 286); c.lineTo(396, 286); c.lineTo(W, 360); c.closePath(); c.fill();
  // floor perspective lines
  for (const x of [0, 80, 160, 244]) {
    line(c, x, 360, 320 + (x - 320) * .22, 286, 'rgba(120,150,190,.12)', 1);
  }
  line(c, W, 360, 320 + (W - 320) * .22, 286, 'rgba(120,150,190,.12)', 1);
  // ceiling lights
  for (let i = 0; i < 4; i++) {
    const y = 18 + i * 23;
    const w = 28 - i * 4;
    px(c, 320 - w, y, w * 2, 4, 'rgba(255,245,210,.55)');
    c.globalAlpha = .08;
    c.fillStyle = '#fff5d2';
    c.beginPath(); c.moveTo(320 - w, y + 4); c.lineTo(320 + w, y + 4); c.lineTo(320 + w + 26, y + 50); c.lineTo(320 - w - 26, y + 50); c.closePath(); c.fill();
    c.globalAlpha = 1;
  }
  // doorway frame
  px(c, 240, 100, 8, 190, '#0a101d');
  px(c, 392, 100, 8, 190, '#0a101d');
  px(c, 240, 96, 160, 8, '#0a101d');
  // silhouettes walking
  paintBackSilhouette(c, 292, 330, 1.5, '#05080f');
  paintBackSilhouette(c, 352, 326, 1.35, '#05080f');
  // sign
  text(c, 'WORLD YOUTH', 320, 88, 8, 'rgba(255,200,74,.72)', 'center', 'Press Start 2P');
  text(c, 'FINAL · TOKYO', 320, 100, 6, 'rgba(247,232,200,.5)', 'center', 'Press Start 2P');
  // foreground dark
  px(c, 0, 346, W, 14, '#04070e');
}

function paintBackSilhouette(c, x, y, s, color) {
  px(c, x - 4 * s, y - 21 * s, 8 * s, 8 * s, color);
  px(c, x - 7 * s, y - 13 * s, 14 * s, 11 * s, color);
  px(c, x - 6 * s, y - 2 * s, 4 * s, 13 * s, color);
  px(c, x + 2 * s, y - 2 * s, 4 * s, 13 * s, color);
  px(c, x - 10 * s, y - 12 * s, 3 * s, 9 * s, color);
  px(c, x + 7 * s, y - 12 * s, 3 * s, 9 * s, color);
}

/* ------------------------------------------------------------------ */
/* STADIUM (story view)                                                */
/* ------------------------------------------------------------------ */

function paintStadium(c, key) {
  const night = key === 'stadium_night';
  if (night) {
    bands(c, ['#03060f', '#071128', '#0a1830', '#0d203c'], 0, 0, W, 220);
    const rnd = mulberry32(11);
    for (let i = 0; i < 50; i++) px(c, rnd() * W, rnd() * 90, 1, 1, 'rgba(255,255,255,.4)');
  } else {
    bands(c, ['#5d9ec8', '#7ab8d9', '#a3d3e5', '#d7eef0'], 0, 0, W, 220);
    cloud(c, 90, 36, 1, 'rgba(255,255,255,.65)');
    cloud(c, 460, 52, .8, 'rgba(255,255,255,.55)');
  }

  // roof
  px(c, 0, 56, W, 14, night ? '#101a2c' : '#38536e');
  px(c, 0, 70, W, 4, night ? '#1d2b45' : '#54728c');

  // floodlights
  for (const x of [96, 544]) {
    px(c, x - 4, 14, 8, 44, '#29364e');
    px(c, x - 26, 8, 52, 12, '#1b2740');
    for (let i = 0; i < 4; i++) px(c, x - 22 + i * 12, 10, 8, 8, '#fff3c9');
    if (night) {
      c.save(); c.globalAlpha = .11; c.fillStyle = '#fff3c9';
      c.beginPath(); c.moveTo(x - 20, 18); c.lineTo(x + 20, 18); c.lineTo(x + 96, 300); c.lineTo(x - 96, 300); c.closePath(); c.fill();
      c.restore();
    }
  }

  // stands tiers
  px(c, 0, 74, W, 126, night ? '#0c1526' : '#284a60');
  for (let tier = 0; tier < 3; tier++) {
    const y = 80 + tier * 40;
    px(c, 0, y, W, 34, night ? '#111d33' : '#2f5a70');
    px(c, 0, y, W, 3, night ? '#1d2e4a' : '#477c90');
    const rnd = mulberry32(40 + tier);
    for (let i = 0; i < 230; i++) {
      const x = rnd() * W;
      const col = rnd() > .62 ? (night ? '#ffc84a' : '#f7e8c8') : (rnd() > .4 ? '#3aa7ff' : '#ff5d6c');
      px(c, x, y + 6 + rnd() * 24, 2, 2, col);
    }
  }
  // banners
  px(c, 118, 136, 92, 12, '#ffc84a');
  text(c, 'BRASIL', 164, 146, 8, '#0a0e19', 'center', 'Press Start 2P');
  px(c, 430, 136, 92, 12, '#3aa7ff');
  text(c, 'JAPÃO', 476, 146, 8, '#f7e8c8', 'center', 'Press Start 2P');
  // big screen
  px(c, 256, 92, 128, 48, '#0a101c');
  px(c, 260, 96, 120, 40, night ? '#16233d' : '#263d56');
  text(c, 'WORLD YOUTH', 320, 112, 7, '#f7e8c8', 'center', 'Press Start 2P');
  text(c, 'FINAL', 320, 126, 10, '#ffc84a', 'center', 'Press Start 2P');

  // ad boards
  px(c, 0, 200, W, 26, night ? '#0b1322' : '#1a3048');
  const ads = [['SAMBA COLA', '#ffc84a', '#0a0e19'], ['AURORA', '#3aa7ff', '#f7e8c8'], ['VIVA FUTEBOL', '#ff5d6c', '#f7e8c8'], ['PRAIA DO FAROL', '#3ddc84', '#0a0e19']];
  for (let i = 0; i < 4; i++) {
    const [label, bg, fg] = ads[i];
    px(c, 6 + i * 158, 204, 148, 18, bg);
    text(c, label, 80 + i * 158, 217, 7, fg, 'center', 'Press Start 2P');
  }

  // pitch
  bands(c, night ? ['#1f6e4a', '#237a52', '#1a6040'] : ['#3c9a5c', '#44a866', '#358d52'], 0, 228, W, 132);
  for (let i = 0; i < 8; i++) px(c, i * 80, 228, 40, 132, 'rgba(255,255,255,.03)');
  // lines
  line(c, 0, 252, W, 252, 'rgba(240,250,245,.75)', 2);
  ring(c, 320, 306, 40, 'rgba(240,250,245,.6)', 2);
  line(c, 320, 228, 320, 360, 'rgba(240,250,245,.5)', 2);
  // confetti (night)
  if (night) {
    const rnd = mulberry32(91);
    for (let i = 0; i < 100; i++) {
      const x = rnd() * W, y = rnd() * H;
      px(c, x, y, 2, 3, ['#ffc84a', '#3ddc84', '#3aa7ff', '#ff5d6c', '#f7e8c8'][i % 5]);
    }
  }
}

/* ------------------------------------------------------------------ */
/* HOME                                                                */
/* ------------------------------------------------------------------ */

function paintHome(c) {
  px(c, 0, 0, W, H, '#25202b');
  // wall
  bands(c, ['#3c2f3c', '#352a35', '#2e242e'], 0, 0, W, 280);
  for (let i = 0; i < 18; i++) px(c, i * 38, 0, 2, 280, 'rgba(255,255,255,.025)');
  // floor
  bands(c, ['#5a4030', '#4a3528', '#3d2c21'], 0, 276, W, 84);
  for (let i = 0; i < 9; i++) line(c, i * 70, 276, i * 70 + 20, 360, 'rgba(0,0,0,.15)', 1);

  // window
  px(c, 40, 48, 116, 100, '#1b2029');
  px(c, 46, 54, 104, 88, '#0c1b34');
  const rnd = mulberry32(5);
  for (let i = 0; i < 24; i++) px(c, 48 + rnd() * 98, 56 + rnd() * 78, 1, 1, 'rgba(255,240,190,.7)');
  circle(c, 128, 78, 12, '#f2e4b8');
  circle(c, 133, 74, 10, '#0c1b34');
  px(c, 44, 100, 108, 4, '#3b2a24');
  px(c, 96, 54, 4, 88, '#3b2a24');
  // curtains
  px(c, 34, 42, 12, 112, '#7a3b3e');
  px(c, 150, 42, 12, 112, '#7a3b3e');

  // framed photo
  px(c, 228, 58, 52, 64, '#6b4b2f');
  px(c, 232, 62, 44, 56, '#253d46');
  circle(c, 254, 82, 9, '#c98e63');
  px(c, 244, 92, 20, 16, '#ff7a3c');
  px(c, 254, 76, 18, 3, '#2b1a10');
  text(c, 'MÃE', 254, 112, 6, '#f7e8c8', 'center', 'Press Start 2P');

  // TV
  px(c, 430, 112, 138, 92, '#16151d');
  px(c, 438, 120, 112, 70, '#0c2030');
  // pitch on screen
  px(c, 442, 126, 104, 58, '#2c7a4d');
  line(c, 494, 126, 494, 184, 'rgba(255,255,255,.5)', 1);
  ring(c, 494, 155, 14, 'rgba(255,255,255,.4)', 1);
  circle(c, 472, 148, 2, '#ffc84a');
  circle(c, 516, 162, 2, '#3aa7ff');
  circle(c, 494, 155, 2, '#f7e8c8');
  px(c, 438, 190, 112, 2, '#2b3444');
  px(c, 476, 204, 42, 5, '#0f0e14');
  px(c, 488, 209, 18, 8, '#0f0e14');
  px(c, 422, 198, 8, 16, '#0f0e14');
  px(c, 568, 198, 8, 16, '#0f0e14');

  // table
  px(c, 160, 246, 310, 10, '#8a5c36');
  px(c, 176, 256, 12, 48, '#694428');
  px(c, 442, 256, 12, 48, '#694428');
  px(c, 160, 246, 310, 2, '#b07a48');
  // plate + fish dinner
  circle(c, 300, 242, 14, '#d9cdb8');
  px(c, 290, 240, 18, 4, '#d99a62');
  px(c, 306, 238, 4, 2, '#3ddc84');
  // mug
  px(c, 350, 232, 12, 14, '#d9c7a3');
  px(c, 362, 236, 4, 6, '#d9c7a3');

  // father silhouette seated
  px(c, 214, 190, 14, 14, '#18131b');
  px(c, 204, 202, 34, 26, '#18131b');
  px(c, 194, 224, 16, 24, '#18131b');
  px(c, 242, 224, 16, 24, '#18131b');
  px(c, 204, 228, 44, 8, '#18131b');

  // fan
  px(c, 532, 42, 6, 42, '#4c3a2c');
  ring(c, 535, 42, 22, 'rgba(247,232,200,.18)', 2);
  for (let i = 0; i < 3; i++) {
    const a = i * Math.PI * 2 / 3;
    line(c, 535, 42, 535 + Math.cos(a) * 20, 42 + Math.sin(a) * 20, 'rgba(247,232,200,.18)', 3);
  }

  // plant
  px(c, 596, 210, 22, 34, '#7a4a2b');
  for (let i = 0; i < 5; i++) {
    px(c, 600 + i * 3, 190 - i * 3, 3, 22 + i * 2, '#2f6b45');
    px(c, 598 + i * 4, 196 - i * 2, 8, 3, '#3d8456');
  }

  // lamp
  px(c, 370, 34, 3, 40, '#141018');
  px(c, 354, 30, 38, 8, '#33252a');
  circle(c, 373, 34, 10, 'rgba(255,200,120,.10)');
  px(c, 362, 36, 22, 2, 'rgba(255,200,120,.4)');
}

/* ------------------------------------------------------------------ */
/* DYNAMIC LAYERS                                                      */
/* ------------------------------------------------------------------ */

function drawSceneDynamic(c, key, t) {
  if (key.startsWith('beach')) {
    drawBeachDynamic(c, key, t);
  } else if (key.startsWith('street')) {
    drawStreetDynamic(c, key, t);
  } else if (key === 'locker') {
    drawLockerDynamic(c, t);
  } else if (key === 'tunnel') {
    drawTunnelDynamic(c, t);
  } else if (key.startsWith('stadium')) {
    drawStadiumDynamic(c, key, t);
  } else if (key === 'home') {
    drawHomeDynamic(c, t);
  }
}

function drawBeachDynamic(c, key, t) {
  const night = key === 'beach_night';
  // waves
  for (let i = 0; i < 7; i++) {
    const y = 218 + i * 8;
    const off = Math.sin(t * 0.7 + i) * 8;
    for (let x = -40; x < W + 40; x += 70) {
      px(c, x + off + i * 9, y, 24 + (i % 3) * 8, 1, night ? 'rgba(120,180,220,.16)' : 'rgba(255,230,190,.28)');
    }
  }
  // foam
  for (let i = 0; i < 14; i++) {
    const x = (i * 53 + Math.sin(t * .6 + i) * 10) % W;
    const y = 274 + Math.sin(t * .9 + i * 1.7) * 2;
    px(c, x, y, 16 + (i % 4) * 5, 2, 'rgba(255,245,220,.5)');
  }
  // sun glitter
  const rnd = mulberry32(21);
  for (let i = 0; i < 24; i++) {
    const x = 440 + rnd() * 110 + Math.sin(t * 1.4 + i) * 2;
    const y = 214 + rnd() * 56;
    px(c, x, y, 2 + (i % 3), 1, `rgba(255,235,170,${.1 + (Math.sin(t * 2 + i) + 1) * .08})`);
  }
  // birds
  for (let i = 0; i < 4; i++) {
    const x = (t * 12 + i * 150) % (W + 80) - 40;
    const y = 96 + Math.sin(t * .6 + i * 2) * 8 + i * 10;
    const flap = Math.sin(t * 5 + i) * 1.5;
    px(c, x - 4, y + flap, 3, 1, 'rgba(20,20,32,.45)');
    px(c, x - 1, y + 1, 3, 1, 'rgba(20,20,32,.45)');
    px(c, x + 3, y + flap, 3, 1, 'rgba(20,20,32,.45)');
  }
  if (night) {
    // fireflies
    for (let i = 0; i < 10; i++) {
      const x = (i * 73 + Math.sin(t * .5 + i) * 14) % W;
      const y = 250 + Math.sin(t * .8 + i * 1.4) * 12;
      const a = .25 + (Math.sin(t * 2 + i) + 1) * .2;
      px(c, x, y, 2, 2, `rgba(255,220,120,${a})`);
    }
    // campfire glow
    const gx = 176, gy = 276;
    circle(c, gx, gy, 34, 'rgba(255,140,50,.05)');
    circle(c, gx, gy, 18, 'rgba(255,160,60,.07)');
    px(c, gx - 5, gy - 2, 10, 3, '#8a4a2a');
    px(c, gx - 3, gy - 7 - Math.sin(t * 6) * 2, 3, 6, '#ffb347');
    px(c, gx + 2, gy - 6 + Math.cos(t * 5) * 1, 2, 5, '#ff7a3c');
  } else if (key === 'beach_sunset') {
    // warm rays
    c.save();
    c.globalAlpha = .05;
    c.fillStyle = '#ffe2a0';
    for (let i = 0; i < 6; i++) {
      const x = 494 + i * 18;
      c.beginPath(); c.moveTo(x, 122); c.lineTo(x + 20, 122); c.lineTo(x + 120, 360); c.lineTo(x + 60, 360); c.closePath(); c.fill();
    }
    c.restore();
  }
}

function drawStreetDynamic(c, key, t) {
  const day = key === 'street_day';
  const rnd = mulberry32(64);
  // lamp glow flicker
  for (const lx of [84, 404, 602]) {
    const a = .06 + (Math.sin(t * 7 + lx) + 1) * .015;
    circle(c, lx + 1, 214, 18, `rgba(255,200,100,${a})`);
  }
  // dust motes
  for (let i = 0; i < 14; i++) {
    const x = (rnd() * W + t * (6 + i % 3)) % W;
    const y = 100 + rnd() * 210 + Math.sin(t * .7 + i) * 4;
    px(c, x, y, 1, 1, `rgba(255,240,210,${.1 + (i % 3) * .05})`);
  }
  // laundry sway - draw one shirt over baked line
  for (let i = 0; i < 3; i++) {
    const x = 112 + i * 34 + Math.sin(t * 1.2 + i) * 2;
    const y = 154 + i * 2;
    px(c, x, y, 1, 1, 'rgba(255,255,255,.15)');
  }
  if (!day) {
    // window glows nth
    for (let i = 0; i < 6; i++) {
      const x = 40 + i * 88, y = 140;
      px(c, x, y, 2, 2, `rgba(255,220,140,${.2 + (Math.sin(t * 3 + i) + 1) * .1})`);
    }
  }
}

function drawLockerDynamic(c, t) {
  // light shaft shimmer
  c.save();
  c.globalAlpha = .04 + Math.sin(t * .7) * .012;
  c.fillStyle = '#d8ffff';
  c.beginPath(); c.moveTo(418, 48); c.lineTo(466, 48); c.lineTo(620, 350); c.lineTo(400, 350); c.closePath(); c.fill();
  c.restore();
  // dust
  const rnd = mulberry32(14);
  for (let i = 0; i < 16; i++) {
    const x = 400 + rnd() * 210 + Math.sin(t * .3 + i) * 10;
    const y = 60 + rnd() * 210 - (t * 3 + i * 7) % 40;
    px(c, x, y, 1, 1, 'rgba(220,255,250,.25)');
  }
  // jersey sway
  px(c, 352 + Math.sin(t) * 1, 43, 26, 1, 'rgba(255,255,255,.08)');
}

function drawTunnelDynamic(c, t) {
  // pulse of light
  c.save();
  c.globalAlpha = .05 + Math.sin(t * 1.2) * .015;
  c.fillStyle = '#d9ffe8';
  circle(c, 320, 196, 90, c.fillStyle);
  c.restore();
  // dust
  const rnd = mulberry32(31);
  for (let i = 0; i < 22; i++) {
    const x = 150 + rnd() * 340 + Math.sin(t * .4 + i) * 6;
    const y = 100 + rnd() * 210 + Math.cos(t * .3 + i) * 4;
    px(c, x, y, 1, 1, 'rgba(230,255,245,.18)');
  }
  // silhouettes walking
  const walk = Math.sin(t * 2) * 2;
  px(c, 286, 316 + walk, 2, 10, '#04070e');
  px(c, 356, 312 - walk, 2, 9, '#04070e');
}

function drawStadiumDynamic(c, key, t) {
  const night = key === 'stadium_night';
  // crowd flashes
  const rnd = mulberry32(55);
  for (let i = 0; i < 9; i++) {
    const x = rnd() * W;
    const y = 78 + rnd() * 96;
    const on = Math.sin(t * (2 + i * .4) + i * 2) > .93;
    if (on) px(c, x, y, 3, 3, 'rgba(255,255,255,.9)');
  }
  // flags waving
  for (let i = 0; i < 5; i++) {
    const x = 30 + i * 140;
    const y = 80 + (i % 2) * 8;
    px(c, x, y, 24, 10, i % 2 ? '#ffc84a' : '#3ddc84');
    const wav = Math.sin(t * 3 + i) * 2;
    px(c, x + 24, y + wav, 8, 3, i % 2 ? '#ffc84a' : '#3ddc84');
  }
  if (night) {
    // drifting confetti
    for (let i = 0; i < 30; i++) {
      const x = (i * 47 + t * 8) % W;
      const y = (i * 31 + t * 22) % H;
      px(c, x, y, 2, 3, ['#ffc84a', '#3ddc84', '#3aa7ff', '#ff5d6c'][i % 4]);
    }
    // camera flashes in stands
    for (let i = 0; i < 4; i++) {
      const x = (i * 173 + t * 17) % W;
      const y = 86 + (i % 3) * 24;
      if (Math.sin(t * 9 + i * 4) > .8) px(c, x, y, 2, 2, '#fff');
    }
  }
}

function drawHomeDynamic(c, t) {
  // TV glow
  c.save();
  c.globalAlpha = .06 + Math.sin(t * 8) * .012;
  c.fillStyle = '#6fe8b0';
  c.beginPath(); c.moveTo(438, 120); c.lineTo(550, 120); c.lineTo(590, 220); c.lineTo(410, 220); c.closePath(); c.fill();
  c.restore();
  // fan spin
  const a0 = t * 9;
  for (let i = 0; i < 3; i++) {
    const a = a0 + i * Math.PI * 2 / 3;
    line(c, 535, 42, 535 + Math.cos(a) * 19, 42 + Math.sin(a) * 19, 'rgba(247,232,200,.22)', 3);
  }
  // lamp flicker
  circle(c, 373, 40, 22, `rgba(255,200,120,${.025 + (Math.sin(t * 4) + 1) * .008})`);
  // dust
  const rnd = mulberry32(17);
  for (let i = 0; i < 8; i++) {
    const x = 20 + rnd() * 600;
    const y = 20 + rnd() * 240 + Math.sin(t * .4 + i) * 3;
    px(c, x, y, 1, 1, 'rgba(255,240,200,.15)');
  }
}

/* ------------------------------------------------------------------ */
/* TITLE                                                               */
/* ------------------------------------------------------------------ */

export function drawTitleScene(c, t) {
  drawScene(c, 'beach_sunset', t);

  // foreground silhouettes
  drawForegroundCarlos(c, 104, 342, 2.25, t);
  drawForegroundCarlos(c, 552, 348, 1.45, t + 1.6);

  // floating light motes
  for (let i = 0; i < 16; i++) {
    const x = (i * 47 + Math.sin(t * .3 + i) * 16 + t * 4) % W;
    const y = 60 + (i * 19) % 210 + Math.sin(t * .5 + i) * 6;
    px(c, x, y, 1, 1, `rgba(255,230,170,${.15 + (i % 4) * .06})`);
  }

  // subtle bottom gradient for UI
  const grad = c.createLinearGradient(0, 250, 0, 360);
  grad.addColorStop(0, 'rgba(5,8,16,0)');
  grad.addColorStop(1, 'rgba(5,8,16,.72)');
  c.fillStyle = grad; c.fillRect(0, 250, W, 110);
}

function drawForegroundCarlos(c, x, ground, s, t) {
  const col = '#0b1220';
  const bob = Math.sin(t * 2.2) * 3;
  // shadow
  c.fillStyle = 'rgba(0,0,0,.25)';
  c.beginPath(); c.ellipse(x, ground + 4, 26 * s, 6 * s, 0, 0, Math.PI * 2); c.fill();
  // legs
  px(c, x - 10 * s, ground - 20 * s, 7 * s, 20 * s, col);
  px(c, x + 3 * s, ground - 20 * s, 7 * s, 20 * s, col);
  // shorts/body
  px(c, x - 13 * s, ground - 42 * s + bob, 27 * s, 24 * s, col);
  px(c, x - 18 * s, ground - 42 * s + bob, 5 * s, 20 * s, col);
  px(c, x + 14 * s, ground - 42 * s + bob, 5 * s, 20 * s, col);
  // head
  circle(c, x, ground - 52 * s + bob, 9 * s, col);
  // hair curls
  for (let i = 0; i < 5; i++) {
    circle(c, x - 6 * s + i * 3 * s, ground - 59 * s + bob, 3 * s, col);
  }
  // ball
  const bx = x + 30 * s + Math.sin(t * 1.4) * 4;
  const by = ground - 67 * s - Math.abs(Math.sin(t * 3.4)) * 28 * s;
  circle(c, bx, by, 4.2 * s, 'rgba(247,232,200,.9)');
  circle(c, bx, by, 4.2 * s, 'rgba(0,0,0,0)');
  c.strokeStyle = 'rgba(10,14,25,.5)'; c.lineWidth = Math.max(1, s * .5);
  c.beginPath(); c.arc(bx, by, 4.2 * s, 0, Math.PI * 2); c.stroke();
  // motion trail
  for (let i = 1; i < 4; i++) {
    circle(c, bx - i * 2, by + i * 3, 3.2 * s - i * .4, `rgba(247,232,200,${.16 - i * .035})`);
  }
}
