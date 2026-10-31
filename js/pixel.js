/* =========================================================
   PIXEL — shared drawing helpers and procedural portraits
   ========================================================= */

export const W = 640;
export const H = 360;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (a, b) => a + Math.random() * (b - a);

export function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function makeCanvas(w = W, h = H) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

export function px(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}

export function ring(ctx, x, y, r, color, width = 1) {
  ctx.strokeStyle = color; ctx.lineWidth = width;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
}

export function line(ctx, x1, y1, x2, y2, color, width = 1) {
  ctx.strokeStyle = color; ctx.lineWidth = width;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}

export function text(ctx, str, x, y, size, color, align = 'left', font = 'VT323') {
  ctx.fillStyle = color;
  ctx.font = `${size}px "${font}", monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, Math.round(x), Math.round(y));
}

export function bands(ctx, colors, x, y, w, h) {
  const bh = h / colors.length;
  for (let i = 0; i < colors.length; i++) px(ctx, x, y + i * bh, w, bh + 1, colors[i]);
}

export function cloud(ctx, x, y, s, color) {
  px(ctx, x, y, 26 * s, 7 * s, color);
  px(ctx, x + 6 * s, y - 5 * s, 10 * s, 5 * s, color);
  px(ctx, x + 14 * s, y - 8 * s, 7 * s, 8 * s, color);
  px(ctx, x - 4 * s, y + 3 * s, 10 * s, 4 * s, color);
  px(ctx, x + 30 * s, y + 2 * s, 12 * s, 4 * s, color);
}

/* ------------------------------------------------------------------ */
/* Portrait art — drawn at 48x48 and scaled 2x for chunky pixels       */
/* ------------------------------------------------------------------ */

export const CHAR_ART = {
  carlos:  { skin: '#7a4a2b', light: '#9a633c', hair: '#17100e', jersey: '#ffc84a', accent: '#00a86b', bg: '#12372e', style: 'curly' },
  joaquim: { skin: '#6b3f24', light: '#8a5533', hair: '#2b1a10', jersey: '#2e6b5e', accent: '#d9c7a3', bg: '#26312c', style: 'cap' },
  zefa:    { skin: '#5a3520', light: '#7c4a2c', hair: '#1a120c', jersey: '#ff7a3c', accent: '#f2e3c0', bg: '#3a251f', style: 'wrap' },
  ratinho: { skin: '#8a5a35', light: '#a87145', hair: '#2a1a12', jersey: '#ff5d6c', accent: '#1a1a24', bg: '#3a1b25', style: 'buzz' },
  almeida: { skin: '#c78e63', light: '#dfa87c', hair: '#bdb3a5', jersey: '#2b3a55', accent: '#d9c7a3', bg: '#232b3a', style: 'slick' },
  nando:   { skin: '#a06a42', light: '#bd8258', hair: '#1b1410', jersey: '#1d5fd1', accent: '#f7e8c8', bg: '#1a2c51', style: 'fade' },
  vidal:   { skin: '#8a5a35', light: '#a87145', hair: '#241a14', jersey: '#2e6b5e', accent: '#f7e8c8', bg: '#25372f', style: 'bald' },
  rojas:   { skin: '#b07a52', light: '#c99265', hair: '#2a1a12', jersey: '#d21f3c', accent: '#f7e8c8', bg: '#411a24', style: 'headband' },
  tsubasa: { skin: '#e0b48a', light: '#f0c79f', hair: '#1a1a24', jersey: '#1f4fd1', accent: '#f7e8c8', bg: '#172a55', style: 'fringe' },
  misugi:  { skin: '#d7a77c', light: '#e8bd94', hair: '#201a1a', jersey: '#1f4fd1', accent: '#f7e8c8', bg: '#172a55', style: 'neat' },
  hyuga:   { skin: '#c98f62', light: '#dda57a', hair: '#17131a', jersey: '#1f4fd1', accent: '#f7e8c8', bg: '#172a55', style: 'spiky' }
};

const portraitCache = new Map();

export function drawPortrait(canvasEl, who = 'carlos', expr = 'neutral') {
  if (!canvasEl) return;
  const key = `${who}_${expr}`;
  let art = portraitCache.get(key);
  if (!art) {
    art = makeCanvas(48, 48);
    paintPortrait(art.getContext('2d'), who, expr);
    portraitCache.set(key, art);
  }
  const ctx = canvasEl.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  ctx.drawImage(art, 0, 0, 48, 48, 0, 0, canvasEl.width, canvasEl.height);
}

function paintPortrait(c, who, expr) {
  const a = CHAR_ART[who] || CHAR_ART.carlos;
  const rnd = mulberry32(who.length * 97 + expr.length * 13 + 5);

  // background
  px(c, 0, 0, 48, 48, a.bg);
  px(c, 0, 0, 48, 48, 'rgba(5,8,16,0.18)');
  for (let i = 0; i < 15; i++) {
    px(c, i * 4 - 10, 0, 3, 48, 'rgba(255,255,255,0.018)');
  }
  for (let i = 0; i < 30; i++) {
    px(c, rnd() * 48, rnd() * 48, 1, 1, 'rgba(255,255,255,0.08)');
  }
  // corner frame
  px(c, 0, 0, 48, 1, 'rgba(255,255,255,0.2)');
  px(c, 0, 47, 48, 1, 'rgba(0,0,0,0.35)');

  // shoulders / jersey
  px(c, 4, 34, 40, 14, a.jersey);
  px(c, 4, 34, 40, 2, 'rgba(255,255,255,0.18)');
  px(c, 0, 38, 6, 10, a.jersey);
  px(c, 42, 38, 6, 10, a.jersey);
  px(c, 4, 44, 40, 4, 'rgba(0,0,0,0.24)');
  // collar
  px(c, 18, 33, 12, 3, a.accent);
  px(c, 20, 36, 8, 2, 'rgba(0,0,0,0.25)');
  px(c, 21, 34, 6, 2, a.skin);

  // custom torso details
  if (who === 'almeida') {
    px(c, 4, 33, 40, 15, '#2b3a55');
    px(c, 18, 33, 12, 6, '#e9e2d2');
    px(c, 22, 36, 4, 12, '#8f2f3f');
    px(c, 18, 33, 3, 13, '#1b2740');
    px(c, 27, 33, 3, 13, '#1b2740');
  } else if (who === 'zefa') {
    for (let i = 0; i < 12; i++) px(c, 6 + rnd() * 36, 36 + rnd() * 10, 1, 1, a.accent);
  } else if (who === 'joaquim') {
    px(c, 10, 38, 6, 5, 'rgba(0,0,0,0.18)');
    px(c, 11, 39, 4, 1, a.accent);
  } else if (who === 'vidal') {
    px(c, 32, 33, 2, 12, a.accent);
    circle(c, 33, 44, 2, '#c9c2b4');
    px(c, 32, 44, 3, 1, '#5a5347');
  } else {
    px(c, 10, 37, 28, 2, a.accent);
    px(c, 10, 37, 28, 1, 'rgba(255,255,255,0.2)');
    px(c, 27, 40, 2, 5, 'rgba(0,0,0,0.24)');
  }

  // neck
  px(c, 21, 29, 6, 5, a.skin);
  px(c, 22, 32, 4, 2, 'rgba(0,0,0,0.22)');

  // ears
  px(c, 11, 19, 3, 6, a.skin);
  px(c, 34, 19, 3, 6, a.skin);
  px(c, 12, 21, 1, 3, a.light);
  px(c, 35, 21, 1, 3, a.light);

  // face
  px(c, 14, 10, 20, 21, a.skin);
  px(c, 15, 9, 18, 1, a.skin);
  px(c, 15, 30, 18, 1, a.skin);
  px(c, 13, 12, 1, 16, a.skin);
  px(c, 34, 12, 1, 16, a.skin);
  // shading
  px(c, 15, 26, 3, 3, 'rgba(0,0,0,0.08)');
  px(c, 31, 25, 2, 2, 'rgba(0,0,0,0.07)');
  px(c, 17, 13, 6, 2, 'rgba(255,255,255,0.08)');

  // hair styles
  paintHair(c, a, who);

  // eyes and expression
  paintExpression(c, a, who, expr);

  // earring for Carlos
  if (who === 'carlos') {
    px(c, 36, 25, 2, 2, '#ffc84a');
    px(c, 36, 27, 1, 1, '#ffc84a');
  }
  if (who === 'zefa') {
    ring(c, 11, 27, 2, '#d9c7a3', 1);
    ring(c, 37, 27, 2, '#d9c7a3', 1);
  }

  // subtle vignette
  px(c, 0, 0, 48, 2, 'rgba(0,0,0,0.2)');
  px(c, 0, 0, 2, 48, 'rgba(0,0,0,0.16)');
  px(c, 46, 0, 2, 48, 'rgba(0,0,0,0.16)');
}

function paintHair(c, a, who) {
  const style = a.style;
  if (style === 'curly') {
    // crown of curls
    const curls = [
      [14, 5, 5, 5], [19, 3, 6, 5], [25, 4, 6, 5], [30, 6, 4, 5],
      [12, 9, 4, 5], [33, 9, 4, 5], [13, 14, 3, 2], [33, 14, 3, 2]
    ];
    for (const [x, y, w, h] of curls) px(c, x, y, w, h, a.hair);
    px(c, 16, 6, 3, 2, 'rgba(255,255,255,0.12)');
    px(c, 26, 5, 3, 2, 'rgba(255,255,255,0.1)');
    // headband
    px(c, 13, 14, 22, 3, a.jersey);
    px(c, 13, 16, 22, 1, 'rgba(0,0,0,0.18)');
    px(c, 13, 14, 22, 1, 'rgba(255,255,255,0.35)');
  } else if (style === 'cap') {
    px(c, 13, 8, 22, 7, '#d9c7a3');
    px(c, 11, 13, 27, 3, '#b6a482');
    px(c, 17, 6, 14, 3, '#e7d8b7');
    px(c, 13, 15, 3, 5, a.hair);
    px(c, 33, 15, 3, 5, a.hair);
    px(c, 14, 19, 2, 1, '#d9c7a3');
    // mustache
    px(c, 19, 26, 11, 2, a.hair);
    px(c, 19, 25, 4, 1, a.hair);
    px(c, 26, 25, 4, 1, a.hair);
    px(c, 20, 28, 3, 1, 'rgba(0,0,0,0.25)');
  } else if (style === 'wrap') {
    px(c, 12, 7, 24, 8, a.jersey);
    px(c, 14, 5, 20, 3, '#ff9a5c');
    px(c, 12, 13, 24, 2, '#d95a2a');
    px(c, 35, 6, 4, 7, a.jersey);
    px(c, 38, 8, 2, 4, '#ff9a5c');
    for (let i = 0; i < 8; i++) px(c, 13 + i * 3, 9 + (i % 2), 1, 1, '#ffd9a8');
    px(c, 13, 15, 2, 4, a.hair);
    px(c, 34, 15, 2, 4, a.hair);
  } else if (style === 'buzz') {
    px(c, 14, 8, 20, 5, a.hair);
    px(c, 13, 12, 2, 5, a.hair);
    px(c, 34, 12, 2, 5, a.hair);
    px(c, 17, 8, 3, 1, 'rgba(255,255,255,0.12)');
  } else if (style === 'slick') {
    px(c, 13, 7, 22, 6, a.hair);
    px(c, 15, 6, 16, 3, a.hair);
    px(c, 13, 12, 6, 3, a.hair);
    px(c, 28, 12, 8, 2, a.hair);
    px(c, 16, 7, 12, 1, 'rgba(255,255,255,0.25)');
    // glasses
    ring(c, 19, 21, 4, '#d9c7a3', 1);
    ring(c, 30, 21, 4, '#d9c7a3', 1);
    px(c, 23, 20, 3, 1, '#d9c7a3');
  } else if (style === 'fade') {
    px(c, 14, 7, 20, 7, a.hair);
    px(c, 13, 8, 2, 8, '#f0e0b8');
    px(c, 33, 8, 2, 8, '#f0e0b8');
    px(c, 17, 7, 5, 2, '#f7e8c8');
    px(c, 28, 7, 4, 1, '#f7e8c8');
    px(c, 15, 13, 2, 3, a.hair);
    px(c, 31, 13, 2, 3, a.hair);
  } else if (style === 'bald') {
    px(c, 14, 10, 20, 2, 'rgba(255,255,255,0.15)');
    // beard
    px(c, 14, 24, 3, 7, a.hair);
    px(c, 31, 24, 3, 7, a.hair);
    px(c, 17, 29, 14, 3, a.hair);
    px(c, 17, 26, 2, 3, a.hair);
    px(c, 29, 26, 2, 3, a.hair);
    px(c, 20, 24, 8, 2, a.hair);
    px(c, 20, 25, 8, 1, a.skin);
  } else if (style === 'headband') {
    px(c, 14, 6, 20, 8, a.hair);
    px(c, 13, 8, 23, 3, '#d21f3c');
    px(c, 13, 12, 3, 6, a.hair);
    px(c, 32, 12, 3, 6, a.hair);
    px(c, 17, 7, 2, 1, 'rgba(255,255,255,0.18)');
    // brow scar
    px(c, 28, 17, 1, 3, '#9a5b4e');
    px(c, 29, 18, 1, 1, '#9a5b4e');
  } else if (style === 'fringe') {
    px(c, 13, 7, 22, 7, a.hair);
    px(c, 14, 12, 5, 4, a.hair);
    px(c, 21, 12, 6, 3, a.hair);
    px(c, 30, 12, 4, 5, a.hair);
    px(c, 13, 15, 2, 5, a.hair);
    px(c, 33, 15, 2, 5, a.hair);
    px(c, 16, 8, 5, 1, 'rgba(255,255,255,0.12)');
  } else if (style === 'neat') {
    px(c, 13, 7, 22, 7, a.hair);
    px(c, 16, 6, 15, 2, a.hair);
    px(c, 13, 12, 3, 5, a.hair);
    px(c, 32, 12, 3, 5, a.hair);
    px(c, 22, 7, 5, 2, 'rgba(255,255,255,0.2)');
  } else if (style === 'spiky') {
    px(c, 13, 7, 22, 6, a.hair);
    const spikes = [[13, 5, 4, 3], [18, 3, 4, 4], [23, 4, 4, 3], [28, 3, 4, 4], [33, 6, 3, 3]];
    for (const [x, y, w, h] of spikes) px(c, x, y, w, h, a.hair);
    px(c, 13, 12, 3, 5, a.hair);
    px(c, 32, 12, 3, 5, a.hair);
    px(c, 18, 7, 3, 1, 'rgba(255,255,255,0.1)');
  }
}

function paintExpression(c, a, who, expr) {
  const eyeY = 20;
  let browL = 17, browR = 28;
  let mouth = 'line';
  let closed = false;
  let big = false;
  let tear = false;

  if (['smile', 'soft'].includes(expr)) { mouth = 'smile'; }
  if (expr === 'smirk') { mouth = 'smirk'; }
  if (['grumpy'].includes(expr)) { mouth = 'frown'; }
  if (['stern', 'intense'].includes(expr)) { mouth = 'straight'; }
  if (expr === 'surprised') { mouth = 'o'; big = true; }
  if (expr === 'tired') { mouth = 'soft'; closed = true; }
  if (expr === 'crying') { mouth = 'open'; tear = true; }

  // eye whites
  if (!closed) {
    px(c, 16, eyeY, 5, big ? 4 : 3, '#f6efe4');
    px(c, 27, eyeY, 5, big ? 4 : 3, '#f6efe4');
    px(c, 18, eyeY + 1, big ? 2 : 1, big ? 3 : 2, '#161019');
    px(c, 29, eyeY + 1, big ? 2 : 1, big ? 3 : 2, '#161019');
    if (big) {
      px(c, 18, eyeY, 2, 1, '#161019');
      px(c, 29, eyeY, 2, 1, '#161019');
    }
    // eyelids
    px(c, 16, eyeY - 1, 5, 1, 'rgba(0,0,0,0.16)');
    px(c, 27, eyeY - 1, 5, 1, 'rgba(0,0,0,0.16)');
  } else {
    px(c, 16, eyeY + 1, 5, 1, a.hair);
    px(c, 27, eyeY + 1, 5, 1, a.hair);
  }

  // eyebrows
  let by = 17;
  if (expr === 'surprised') by = 16;
  if (expr === 'grumpy' || expr === 'intense' || expr === 'stern') {
    px(c, 16, by + (who === 'rojas' ? 0 : 1), 5, 1, a.hair);
    px(c, 27, by + (who === 'rojas' ? 0 : 1), 5, 1, a.hair);
    px(c, 19, by + 2, 2, 1, a.hair);
    px(c, 27, by + 2, 2, 1, a.hair);
  } else if (expr === 'smirk') {
    px(c, 15, by + 1, 6, 1, a.hair);
    px(c, 27, by, 6, 1, a.hair);
  } else if (expr === 'surprised') {
    px(c, 16, by, 5, 1, a.hair);
    px(c, 27, by, 5, 1, a.hair);
  } else {
    px(c, 16, by, 5, 1, a.hair);
    px(c, 27, by, 5, 1, a.hair);
  }

  // nose
  px(c, 23, 23, 2, 3, a.light);
  px(c, 22, 25, 1, 1, 'rgba(0,0,0,0.18)');

  // mouth
  const my = 27;
  if (mouth === 'smile') {
    px(c, 20, my, 8, 1, '#4a1c1c');
    px(c, 19, my - 1, 1, 1, '#4a1c1c');
    px(c, 28, my - 1, 1, 1, '#4a1c1c');
    px(c, 21, my + 1, 6, 1, 'rgba(255,255,255,0.36)');
  } else if (mouth === 'smirk') {
    px(c, 21, my, 7, 1, '#4a1c1c');
    px(c, 28, my - 1, 1, 1, '#4a1c1c');
    px(c, 20, my, 1, 1, 'rgba(0,0,0,0.2)');
  } else if (mouth === 'frown') {
    px(c, 21, my + 1, 6, 1, '#4a1c1c');
    px(c, 20, my, 1, 1, '#4a1c1c');
    px(c, 27, my, 1, 1, '#4a1c1c');
  } else if (mouth === 'straight') {
    px(c, 20, my, 8, 1, '#4a1c1c');
  } else if (mouth === 'o') {
    px(c, 22, my, 4, 3, '#4a1c1c');
    px(c, 23, my + 1, 2, 1, '#2a0f0f');
  } else if (mouth === 'soft') {
    px(c, 21, my, 6, 1, '#4a1c1c');
    px(c, 22, my + 1, 4, 1, 'rgba(255,255,255,0.18)');
  } else if (mouth === 'open') {
    px(c, 21, my, 6, 3, '#4a1c1c');
    px(c, 22, my + 1, 4, 1, '#2a0f0f');
  }

  if (tear) {
    px(c, 18, 23, 1, 4, '#7fd8ff');
    px(c, 30, 23, 1, 4, '#7fd8ff');
    px(c, 18, 27, 1, 1, '#bdefff');
  }
  if (who === 'zefa' && (expr === 'smile' || expr === 'soft')) {
    px(c, 17, 24, 1, 1, 'rgba(255,140,120,0.3)');
    px(c, 30, 24, 1, 1, 'rgba(255,140,120,0.3)');
  }
}
