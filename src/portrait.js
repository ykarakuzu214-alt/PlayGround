// ---------------------------------------------------------------------------
// Procedural pixel-art portraits (64 x 72). No external images.
// ---------------------------------------------------------------------------

const W = 64, H = 72;

function ellipse(ctx, cx, cy, rx, ry, color) {
  ctx.fillStyle = color;
  for (let dy = -ry; dy <= ry; dy++) {
    const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry))));
    if (w > 0) ctx.fillRect(Math.round(cx - w), Math.round(cy + dy), w * 2, 1);
  }
}

function circle(ctx, cx, cy, r, color) {
  ellipse(ctx, cx, cy, r, r, color);
}

function shade(hex, amount) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) * amount));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) * amount));
  const b = Math.max(0, Math.min(255, (n & 255) * amount));
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

const DIGITS = {
  0: ['111', '101', '101', '101', '111'],
  1: ['010', '110', '010', '010', '111'],
  2: ['111', '001', '111', '100', '111'],
  3: ['111', '001', '111', '001', '111'],
  4: ['101', '101', '111', '001', '001'],
  5: ['111', '100', '111', '001', '111'],
  6: ['111', '100', '111', '101', '111'],
  7: ['111', '001', '010', '010', '010'],
  8: ['111', '101', '111', '101', '111'],
  9: ['111', '101', '111', '001', '111']
};

function drawNumber(ctx, num, x, y, color, scale = 2) {
  const str = String(num ?? 0);
  ctx.fillStyle = color;
  let ox = x;
  for (const ch of str) {
    const glyph = DIGITS[ch];
    if (glyph) {
      glyph.forEach((row, ry) => {
        [...row].forEach((bit, rx) => {
          if (bit === '1') ctx.fillRect(ox + rx * scale, y + ry * scale, scale, scale);
        });
      });
    }
    ox += 4 * scale;
  }
}

export function drawPortrait(canvas, char = {}, opts = {}) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, W, H);

  if (char.narrator) {
    drawNarrator(canvas);
    return;
  }

  const skin = char.skin || '#a96b45';
  const skinDark = shade(skin, 0.76);
  const hairColor = char.hairColor || '#1a1410';
  const hairDark = shade(hairColor, 0.7);
  const jersey = opts.jersey || char.jersey || '#f2c81c';
  const trim = opts.trim || char.trim || '#0c7a3e';
  const shorts = opts.shorts || char.shorts || '#1450a0';
  const style = char.hair || 'short';
  const accessory = char.accessory || 'none';

  // ---- shoulders / jersey ----
  ctx.fillStyle = shade(jersey, 0.8);
  ctx.beginPath();
  ctx.moveTo(3, H); ctx.lineTo(8, 58); ctx.lineTo(20, 51);
  ctx.lineTo(44, 51); ctx.lineTo(56, 58); ctx.lineTo(61, H);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = jersey;
  ctx.beginPath();
  ctx.moveTo(5, H); ctx.lineTo(10, 59); ctx.lineTo(22, 52);
  ctx.lineTo(42, 52); ctx.lineTo(54, 59); ctx.lineTo(59, H);
  ctx.closePath(); ctx.fill();

  // shoulder trim
  ctx.fillStyle = trim;
  ctx.fillRect(10, 59, 3, 4);
  ctx.fillRect(51, 59, 3, 4);
  ctx.fillRect(20, 52, 24, 2);

  // collar
  ctx.fillStyle = shade(trim, 0.8);
  ctx.fillRect(27, 52, 10, 2);
  ctx.fillStyle = skinDark;
  ctx.fillRect(29, 52, 6, 3);
  ctx.fillStyle = skin;
  ctx.fillRect(30, 52, 4, 2);

  // jersey number
  drawNumber(ctx, opts.number ?? char.number ?? 10, 28, 60, trim, 2);
  ctx.fillStyle = shade(jersey, 1.15);
  ctx.fillRect(16, 64, 6, 1);
  ctx.fillRect(42, 64, 6, 1);

  // ---- neck ----
  ctx.fillStyle = skinDark;
  ctx.fillRect(27, 45, 10, 8);
  ctx.fillStyle = skin;
  ctx.fillRect(28, 45, 8, 7);
  ctx.fillStyle = skinDark;
  ctx.fillRect(28, 50, 8, 2);

  // ---- long hair behind head ----
  if (style === 'long') {
    ctx.fillStyle = hairDark;
    ctx.fillRect(13, 28, 9, 26);
    ctx.fillRect(42, 28, 9, 26);
    ctx.fillStyle = hairColor;
    ctx.fillRect(14, 29, 7, 24);
    ctx.fillRect(43, 29, 7, 24);
  }

  // ---- head ----
  ellipse(ctx, 32, 33, 16, 18, hairDark);
  ellipse(ctx, 32, 33, 15, 17, skinDark);
  ellipse(ctx, 32, 32, 14, 16, skin);

  // ears
  ctx.fillStyle = skinDark;
  ctx.fillRect(17, 31, 3, 8);
  ctx.fillRect(44, 31, 3, 8);
  ctx.fillStyle = skin;
  ctx.fillRect(18, 32, 2, 5);
  ctx.fillRect(44, 32, 2, 5);

  // cheek shading
  ctx.fillStyle = skinDark;
  ctx.fillRect(20, 39, 2, 4);
  ctx.fillRect(42, 39, 2, 4);
  ctx.fillStyle = shade(skin, 1.08);
  ctx.fillRect(24, 27, 3, 6);
  ctx.fillRect(27, 25, 3, 4);

  // ---- hair ----
  if (style === 'spiky') {
    ctx.fillStyle = hairDark;
    const spikes = [
      [[12, 22], [18, 3], [23, 20]],
      [[19, 18], [27, 0], [31, 17]],
      [[27, 16], [34, 1], [38, 17]],
      [[35, 18], [44, 4], [46, 21]],
      [[42, 21], [52, 9], [50, 26]]
    ];
    for (const tri of spikes) {
      ctx.beginPath();
      ctx.moveTo(tri[0][0], tri[0][1]);
      ctx.lineTo(tri[1][0], tri[1][1]);
      ctx.lineTo(tri[2][0], tri[2][1]);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = hairColor;
    ellipse(ctx, 32, 25, 16, 12, hairColor);
    ctx.fillStyle = hairDark;
    ctx.fillRect(15, 20, 3, 8);
    ctx.fillRect(46, 20, 3, 8);
    // jagged fringe
    ctx.fillStyle = hairColor;
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(18 + i * 6, 22, 4, 4);
    }
    ctx.fillStyle = shade(hairColor, 1.35);
    ctx.fillRect(23, 14, 4, 2);
    ctx.fillRect(35, 11, 3, 2);
  } else if (style === 'curly') {
    ctx.fillStyle = hairDark;
    const puffs = [
      [17, 23, 7], [23, 17, 7], [31, 14, 8], [40, 16, 7],
      [46, 22, 7], [48, 29, 6], [16, 31, 5]
    ];
    for (const [x, y, r] of puffs) circle(ctx, x, y, r, hairDark);
    ctx.fillStyle = hairColor;
    for (const [x, y, r] of puffs) circle(ctx, x - 1, y - 1, r - 2, hairColor);
    ctx.fillStyle = shade(hairColor, 1.3);
    circle(ctx, 24, 17, 3, shade(hairColor, 1.3));
    circle(ctx, 37, 15, 2, shade(hairColor, 1.3));
  } else if (style === 'long') {
    ctx.fillStyle = hairDark;
    ellipse(ctx, 32, 24, 17, 14, hairDark);
    ctx.fillStyle = hairColor;
    ellipse(ctx, 32, 23, 16, 12, hairColor);
    ctx.fillRect(14, 23, 5, 30);
    ctx.fillRect(45, 23, 5, 30);
    ctx.fillStyle = hairDark;
    ctx.fillRect(17, 22, 2, 12);
    ctx.fillRect(45, 22, 2, 12);
    ctx.fillStyle = shade(hairColor, 1.25);
    ctx.fillRect(22, 14, 5, 2);
    // fringe
    ctx.fillStyle = hairColor;
    for (let i = 0; i < 4; i++) ctx.fillRect(20 + i * 6, 23, 5, 3);
  } else {
    // short / old
    ctx.fillStyle = hairDark;
    ellipse(ctx, 32, 24, 16, 13, hairDark);
    ctx.fillStyle = hairColor;
    ellipse(ctx, 32, 23, 15, 11, hairColor);
    ctx.fillStyle = hairDark;
    ctx.fillRect(16, 24, 3, 10);
    ctx.fillRect(45, 24, 3, 10);
    if (char.old) {
      ctx.fillStyle = shade(hairColor, 0.82);
      ctx.fillRect(18, 23, 28, 3);
      ctx.fillStyle = skinDark;
      ctx.fillRect(24, 19, 16, 3);
    }
    ctx.fillStyle = shade(hairColor, 1.25);
    ctx.fillRect(22, 15, 6, 2);
    ctx.fillRect(33, 13, 5, 2);
  }

  // sideburns
  if (style !== 'long') {
    ctx.fillStyle = hairColor;
    ctx.fillRect(17, 27, 3, 7);
    ctx.fillRect(44, 27, 3, 7);
  }

  // ---- headband ----
  if (accessory === 'headband') {
    const band = char.headband || '#f4f4f4';
    ctx.fillStyle = shade(band, 0.72);
    ctx.fillRect(17, 24, 30, 4);
    ctx.fillStyle = band;
    ctx.fillRect(18, 24, 28, 3);
    // knot and tails
    ctx.fillStyle = shade(band, 0.85);
    ctx.fillRect(46, 23, 4, 5);
    ctx.fillStyle = band;
    ctx.fillRect(47, 22, 3, 3);
    ctx.fillStyle = shade(band, 0.8);
    ctx.fillRect(49, 25, 6, 2);
    ctx.fillRect(50, 28, 4, 2);
    ctx.fillStyle = shade(band, 1.2);
    ctx.fillRect(20, 24, 8, 1);
  }

  // ---- eyebrows ----
  ctx.fillStyle = char.old ? '#9a9a9a' : hairDark;
  ctx.fillRect(21, 30, 7, 2);
  ctx.fillRect(36, 30, 7, 2);
  if (char.old) {
    ctx.fillRect(21, 29, 3, 1);
    ctx.fillRect(40, 29, 3, 1);
  }

  // ---- eyes ----
  ctx.fillStyle = '#f7f3ea';
  ctx.fillRect(21, 33, 7, 4);
  ctx.fillRect(36, 33, 7, 4);
  const eyeColor = char.eyes || '#241a12';
  ctx.fillStyle = eyeColor;
  ctx.fillRect(24, 33, 3, 4);
  ctx.fillRect(39, 33, 3, 4);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(24, 33, 1, 1);
  ctx.fillRect(39, 33, 1, 1);
  // lower lid
  ctx.fillStyle = skinDark;
  ctx.fillRect(21, 37, 7, 1);
  ctx.fillRect(36, 37, 7, 1);

  // ---- nose ----
  ctx.fillStyle = skinDark;
  ctx.fillRect(31, 38, 2, 5);
  ctx.fillRect(29, 42, 2, 1);
  ctx.fillStyle = shade(skin, 1.1);
  ctx.fillRect(28, 38, 2, 3);

  // ---- mouth ----
  ctx.fillStyle = shade(skin, 0.55);
  ctx.fillRect(28, 46, 8, 1);
  ctx.fillRect(27, 45, 1, 1);
  ctx.fillRect(36, 45, 1, 1);
  ctx.fillStyle = shade(skin, 0.72);
  ctx.fillRect(30, 47, 4, 1);

  // ---- moustache / beard ----
  if (char.mustache) {
    ctx.fillStyle = char.old ? '#b8b8b8' : hairDark;
    ctx.fillRect(25, 43, 14, 2);
    ctx.fillRect(24, 44, 2, 1);
    ctx.fillRect(38, 44, 2, 1);
    ctx.fillStyle = '#7a5a44';
    ctx.fillRect(28, 45, 8, 1);
  }
  if (char.beard) {
    ctx.fillStyle = hairColor;
    ctx.fillRect(21, 44, 3, 4);
    ctx.fillRect(40, 44, 3, 4);
    ctx.fillRect(24, 48, 16, 2);
  }

  // ---- jersey sleeve shading ----
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  ctx.fillRect(5, 66, 3, 6);
  ctx.fillRect(56, 66, 3, 6);
  ctx.fillStyle = 'rgba(255,255,255,.12)';
  ctx.fillRect(12, 60, 2, 8);
}

function drawNarrator(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  // stylised football
  const cx = 32, cy = 36, r = 20;
  circle(ctx, cx, cy, r + 1, '#0a1526');
  circle(ctx, cx, cy, r, '#e8eef8');
  ctx.fillStyle = '#1a2438';
  // pentagon-ish patches
  ctx.fillRect(28, 23, 8, 3);
  ctx.fillRect(24, 29, 4, 4);
  ctx.fillRect(36, 29, 4, 4);
  ctx.fillRect(29, 35, 6, 5);
  ctx.fillRect(23, 42, 5, 4);
  ctx.fillRect(36, 42, 5, 4);
  ctx.fillRect(28, 49, 8, 3);
  ctx.fillStyle = 'rgba(255,255,255,.7)';
  ctx.fillRect(23, 24, 3, 2);
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ctx.fillRect(18, 50, 28, 3);
  // little shine
  ctx.fillStyle = 'rgba(255,255,255,.35)';
  ctx.fillRect(20, 28, 2, 6);
}

export function drawTrophy(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  const gold = '#ffd23f';
  const goldDark = '#b57600';
  ctx.fillStyle = goldDark;
  ctx.fillRect(18, 8, 28, 4);
  ctx.fillStyle = gold;
  ctx.fillRect(20, 12, 24, 4);
  ctx.fillRect(22, 16, 20, 10);
  ctx.fillRect(25, 26, 14, 6);
  ctx.fillStyle = goldDark;
  ctx.fillRect(22, 16, 3, 10);
  ctx.fillRect(39, 16, 3, 10);
  ctx.fillStyle = gold;
  ctx.fillRect(24, 32, 16, 4);
  ctx.fillRect(30, 36, 4, 12);
  ctx.fillRect(22, 48, 20, 5);
  ctx.fillStyle = goldDark;
  ctx.fillRect(22, 52, 20, 3);
  ctx.fillStyle = '#fff6c4';
  ctx.fillRect(28, 18, 2, 8);
  ctx.fillRect(25, 10, 3, 2);
  // handles
  ctx.strokeStyle = goldDark;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(18, 20, 7, -1.2, 1.4); ctx.stroke();
  ctx.beginPath(); ctx.arc(46, 20, 7, 1.7, 4.4); ctx.stroke();
}
