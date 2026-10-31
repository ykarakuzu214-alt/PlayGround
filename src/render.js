// ---------------------------------------------------------------------------
// Canvas pitch renderer — vertical pitch, chunky pixel players.
// ---------------------------------------------------------------------------

const CW = 600, CH = 760;
const PX = 55, PY = 70, PW = 490, PH = 620;

function toPx(x, y) {
  return { x: PX + (x / 100) * PW, y: PY + (y / 100) * PH };
}

function rngFactory(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function drawStatic(ctx) {
  // night sky / stands
  ctx.fillStyle = '#060b16';
  ctx.fillRect(0, 0, CW, CH);
  ctx.fillStyle = '#0a1322';
  ctx.fillRect(0, 0, CW, 54);
  ctx.fillRect(0, 706, CW, CH - 706);
  ctx.fillRect(0, 54, PX - 18, 652);
  ctx.fillRect(PX + PW + 18, 54, CW - (PX + PW + 18), 652);

  // crowd dots
  const rnd = rngFactory(77);
  const crowdColors = ['#2a3f63', '#39547f', '#4d6b99', '#6d4a5e', '#7a5c3a', '#3f5f6d'];
  for (let i = 0; i < 900; i++) {
    const side = i % 4;
    let x, y;
    if (side === 0) { x = rnd() * CW; y = 4 + rnd() * 44; }
    else if (side === 1) { x = rnd() * CW; y = 710 + rnd() * 44; }
    else if (side === 2) { x = 4 + rnd() * (PX - 26); y = 58 + rnd() * 640; }
    else { x = PX + PW + 26 + rnd() * (CW - PX - PW - 30); y = 58 + rnd() * 640; }
    ctx.fillStyle = crowdColors[Math.floor(rnd() * crowdColors.length)];
    const s = rnd() < 0.25 ? 3 : 2;
    ctx.fillRect(x | 0, y | 0, s, s);
  }

  // advertising boards
  const ads = ['#173a6b', '#6b1f2a', '#1c5a3a', '#5b3a12', '#2c2c54'];
  for (let i = 0; i < 14; i++) {
    ctx.fillStyle = ads[i % ads.length];
    ctx.fillRect(6, 70 + i * 44, 26, 34);
    ctx.fillRect(CW - 32, 70 + i * 44, 26, 34);
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    ctx.fillRect(9, 76 + i * 44, 20, 3);
    ctx.fillRect(CW - 29, 76 + i * 44, 20, 3);
  }

  // grass
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#1a6339' : '#175a34';
    ctx.fillRect(PX, PY + i * (PH / 10), PW, PH / 10 + 1);
  }
  // mowing shimmer
  ctx.fillStyle = 'rgba(255,255,255,.025)';
  for (let i = 0; i < 10; i += 2) ctx.fillRect(PX, PY + i * (PH / 10), PW, 2);

  const line = 'rgba(232,244,232,.82)';
  ctx.strokeStyle = line;
  ctx.fillStyle = line;
  ctx.lineWidth = 2;

  // boundary
  ctx.strokeRect(PX + 1, PY + 1, PW - 2, PH - 2);
  // halfway
  ctx.beginPath(); ctx.moveTo(PX, PY + PH / 2); ctx.lineTo(PX + PW, PY + PH / 2); ctx.stroke();
  // centre circle
  ctx.beginPath(); ctx.arc(PX + PW / 2, PY + PH / 2, 62, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(PX + PW / 2, PY + PH / 2, 3, 0, Math.PI * 2); ctx.fill();

  // penalty boxes + goal areas
  const boxW = PW * 0.6, boxD = 108;
  const smallW = PW * 0.3, smallD = 46;
  ctx.strokeRect(PX + (PW - boxW) / 2, PY, boxW, boxD);
  ctx.strokeRect(PX + (PW - boxW) / 2, PY + PH - boxD, boxW, boxD);
  ctx.strokeRect(PX + (PW - smallW) / 2, PY, smallW, smallD);
  ctx.strokeRect(PX + (PW - smallW) / 2, PY + PH - smallD, smallW, smallD);

  // penalty spots + arcs
  ctx.beginPath(); ctx.arc(PX + PW / 2, PY + 74, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(PX + PW / 2, PY + PH - 74, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.arc(PX + PW / 2, PY + 74, 44, 0.35, Math.PI - 0.35);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(PX + PW / 2, PY + PH - 74, 44, Math.PI + 0.35, Math.PI * 2 - 0.35);
  ctx.stroke();

  // corner arcs
  const corners = [
    [PX, PY, 0, Math.PI / 2],
    [PX + PW, PY, Math.PI / 2, Math.PI],
    [PX, PY + PH, -Math.PI / 2, 0],
    [PX + PW, PY + PH, Math.PI, Math.PI * 1.5]
  ];
  for (const [cx, cy, a0, a1] of corners) {
    ctx.beginPath(); ctx.arc(cx, cy, 11, a0, a1); ctx.stroke();
  }

  // goals + nets
  const gw = 88;
  const gx = PX + PW / 2 - gw / 2;
  ctx.fillStyle = 'rgba(225,240,255,.08)';
  ctx.fillRect(gx, PY - 20, gw, 20);
  ctx.fillRect(gx, PY + PH, gw, 20);
  ctx.strokeStyle = 'rgba(225,240,255,.45)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= gw; i += 8) {
    ctx.beginPath(); ctx.moveTo(gx + i, PY - 20); ctx.lineTo(gx + i, PY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(gx + i, PY + PH); ctx.lineTo(gx + i, PY + PH + 20); ctx.stroke();
  }
  for (let j = 0; j <= 20; j += 6) {
    ctx.beginPath(); ctx.moveTo(gx, PY - 20 + j); ctx.lineTo(gx + gw, PY - 20 + j); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(gx, PY + PH + j); ctx.lineTo(gx + gw, PY + PH + j); ctx.stroke();
  }
  ctx.strokeStyle = '#f4fbff';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(gx, PY); ctx.lineTo(gx + gw, PY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(gx, PY + PH); ctx.lineTo(gx + gw, PY + PH); ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(gx, PY - 20); ctx.lineTo(gx, PY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(gx + gw, PY - 20); ctx.lineTo(gx + gw, PY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(gx, PY + PH); ctx.lineTo(gx, PY + PH + 20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(gx + gw, PY + PH); ctx.lineTo(gx + gw, PY + PH + 20); ctx.stroke();

  // subtle vignette
  const grad = ctx.createRadialGradient(CW / 2, CH / 2, 240, CW / 2, CH / 2, 520);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,.34)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CW, CH);
}

function drawPlayer(ctx, px, py, p, team, isCarrier, bob) {
  const skin = p.look?.skin || '#a96b45';
  const hair = p.look?.hairColor || '#1a1410';
  const style = p.look?.hair || 'short';
  const shirt = p.role === 'GK' ? (team.colors.gk || '#ff8c42') : team.colors.shirt;
  const shorts = team.colors.shorts;
  const trim = team.colors.trim;
  const s = 1.45;
  const y = py + bob;

  // shadow
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.beginPath();
  ctx.ellipse(px, y + 1, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // legs
  ctx.fillStyle = skin;
  ctx.fillRect(px - 4, y - 7, 3, 6);
  ctx.fillRect(px + 1, y - 7, 3, 6);
  // boots
  ctx.fillStyle = '#121212';
  ctx.fillRect(px - 5, y - 2, 4, 2);
  ctx.fillRect(px + 1, y - 2, 4, 2);
  // shorts
  ctx.fillStyle = shorts;
  ctx.fillRect(px - 5, y - 11, 10, 4);
  ctx.fillStyle = trim;
  ctx.fillRect(px - 5, y - 11, 10, 1);
  // shirt
  ctx.fillStyle = shirt;
  ctx.fillRect(px - 5, y - 19, 10, 8);
  ctx.fillStyle = trim;
  ctx.fillRect(px - 5, y - 19, 10, 2);
  ctx.fillRect(px - 5, y - 13, 10, 1);
  // sleeves
  ctx.fillStyle = shirt;
  ctx.fillRect(px - 7, y - 18, 2, 6);
  ctx.fillRect(px + 5, y - 18, 2, 6);
  ctx.fillStyle = skin;
  ctx.fillRect(px - 7, y - 13, 2, 3);
  ctx.fillRect(px + 5, y - 13, 2, 3);
  // number
  ctx.fillStyle = team.colors.text || '#111';
  ctx.fillRect(px - 1, y - 17, 2, 3);
  // neck
  ctx.fillStyle = skin;
  ctx.fillRect(px - 2, y - 21, 4, 2);
  // head
  ctx.fillStyle = skin;
  ctx.fillRect(px - 3, y - 26, 6, 5);
  // hair
  ctx.fillStyle = hair;
  if (style === 'spiky') {
    ctx.fillRect(px - 4, y - 28, 8, 3);
    ctx.fillRect(px - 4, y - 30, 2, 2);
    ctx.fillRect(px, y - 31, 2, 3);
    ctx.fillRect(px + 3, y - 30, 2, 2);
  } else if (style === 'curly') {
    ctx.fillRect(px - 5, y - 29, 10, 4);
    ctx.fillRect(px - 5, y - 31, 2, 2);
    ctx.fillRect(px + 3, y - 31, 2, 2);
  } else if (style === 'long') {
    ctx.fillRect(px - 4, y - 28, 8, 3);
    ctx.fillRect(px - 5, y - 26, 2, 4);
    ctx.fillRect(px + 3, y - 26, 2, 4);
  } else {
    ctx.fillRect(px - 4, y - 28, 8, 3);
  }
  // eyes
  ctx.fillStyle = '#1a1410';
  ctx.fillRect(px - 2, y - 24, 1, 1);
  ctx.fillRect(px + 1, y - 24, 1, 1);

  if (isCarrier) {
    const t = (Date.now() % 900) / 900;
    const ay = y - 38 - Math.sin(t * Math.PI * 2) * 2;
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath();
    ctx.moveTo(px, ay + 7);
    ctx.lineTo(px - 5, ay);
    ctx.lineTo(px + 5, ay);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,210,63,.28)';
    ctx.beginPath();
    ctx.ellipse(px, y + 1, 11, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBall(ctx, x, y, scale = 1) {
  ctx.fillStyle = 'rgba(0,0,0,.32)';
  ctx.beginPath();
  ctx.ellipse(x + 1, y + 2, 5 * scale, 2.4 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f7f7f2';
  ctx.beginPath();
  ctx.arc(x, y, 5 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#18202e';
  ctx.fillRect(x - 1.5, y - 2, 3, 2);
  ctx.fillRect(x - 4, y + 1, 2, 2);
  ctx.fillRect(x + 2, y + 1, 2, 2);
}

export class PitchRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.bg = document.createElement('canvas');
    this.bg.width = CW;
    this.bg.height = CH;
    drawStatic(this.bg.getContext('2d'));
    this.state = null;
    this.visual = new Map();
    this.ball = { x: 300, y: 380 };
    this.trail = [];
    this.running = false;
    this.raf = 0;
    this.last = 0;
    this.shakeUntil = 0;
    this.flash = 0;
  }

  setMatch(state) {
    this.state = state;
    this.visual.clear();
    for (const team of state.teams) {
      for (const p of team.players) {
        const pt = toPx(p.x, p.y);
        this.visual.set(p.id, { x: pt.x, y: pt.y });
      }
    }
    const b = toPx(state.ball.x, state.ball.y);
    this.ball = { x: b.x, y: b.y };
    this.trail = [];
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const loop = (t) => {
      if (!this.running) return;
      const dt = Math.min(40, t - this.last);
      this.last = t;
      this.step(dt);
      this.draw(t);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  shake(ms = 400) {
    this.shakeUntil = performance.now() + ms;
  }

  step(dt) {
    if (!this.state) return;
    const k = 1 - Math.pow(0.82, dt / 16);
    for (const team of this.state.teams) {
      for (const p of team.players) {
        const target = toPx(p.x, p.y);
        const v = this.visual.get(p.id) || target;
        v.x += (target.x - v.x) * k;
        v.y += (target.y - v.y) * k;
        this.visual.set(p.id, v);
      }
    }
    const b = toPx(this.state.ball.x, this.state.ball.y);
    this.ball.x += (b.x - this.ball.x) * Math.min(0.5, k * 1.7);
    this.ball.y += (b.y - this.ball.y) * Math.min(0.5, k * 1.7);

    if (this.trail.length === 0 || Math.hypot(this.trail[0].x - this.ball.x, this.trail[0].y - this.ball.y) > 6) {
      this.trail.unshift({ x: this.ball.x, y: this.ball.y, life: 1 });
      if (this.trail.length > 8) this.trail.pop();
    }
    for (const t of this.trail) t.life -= dt / 420;
    this.trail = this.trail.filter(t => t.life > 0);
  }

  draw(t) {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, CW, CH);
    let ox = 0, oy = 0;
    if (t < this.shakeUntil) {
      ox = (Math.random() - 0.5) * 8;
      oy = (Math.random() - 0.5) * 8;
    }
    ctx.save();
    ctx.translate(ox, oy);
    ctx.drawImage(this.bg, 0, 0);

    if (!this.state) {
      ctx.restore();
      return;
    }

    // camera flashes in the crowd
    if (Math.random() < 0.08) {
      ctx.fillStyle = 'rgba(255,255,255,.8)';
      const side = Math.random() < 0.5;
      const x = side ? 4 + Math.random() * (PX - 20) : PX + PW + 24 + Math.random() * (CW - PX - PW - 30);
      ctx.fillRect(x, 60 + Math.random() * 620, 2, 2);
    }

    const carrier = this.state.carrier;
    for (const team of this.state.teams) {
      for (const p of team.players) {
        const v = this.visual.get(p.id);
        if (!v) continue;
        const bob = p.id === carrier ? 0 : Math.sin(t / 260 + p.slot) * 1.2;
        drawPlayer(ctx, v.x, v.y, p, team, p.id === carrier, bob);
      }
    }

    // ball trail
    for (const tr of this.trail) {
      ctx.fillStyle = `rgba(255,255,255,${tr.life * 0.25})`;
      ctx.beginPath();
      ctx.arc(tr.x, tr.y, 2 + tr.life * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    drawBall(ctx, this.ball.x, this.ball.y, 1.15);

    // subtle scanline shimmer over the pitch
    ctx.fillStyle = 'rgba(255,255,255,.018)';
    for (let y = PY; y < PY + PH; y += 4) ctx.fillRect(PX, y, PW, 1);

    ctx.restore();
  }
}

export { CW, CH, toPx };
