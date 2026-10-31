/* =========================================================
   RENDERER — canvas orchestration for every screen mode
   ========================================================= */

import { W, H, clamp, mulberry32 } from './pixel.js';
import { drawScene, drawTitleScene } from './scenes.js';
import { drawMatchScene, drawTrainingView } from './arena.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.c = canvas.getContext('2d', { alpha: false });
    this.c.imageSmoothingEnabled = false;
    this.lastBg = 'beach_sunset';
    this.flash = 0;
  }

  render(app, t) {
    const c = this.c;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, W, H);

    const mode = app.mode || 'title';
    const match = app.match;

    // shake is driven by the match; sheets stay stable
    let sx = 0, sy = 0;
    if (match && match.shake > 0 && (mode === 'match')) {
      const s = Math.min(6, match.shake);
      sx = Math.sin(t * 91) * s;
      sy = Math.cos(t * 77) * s * 0.7;
    }

    c.save();
    c.translate(sx, sy);

    if (mode === 'title') {
      drawTitleScene(c, t);
      this.lastBg = 'beach_sunset';
    } else if (mode === 'training') {
      drawTrainingView(c, app.training || {}, t);
    } else if (mode === 'match' && match) {
      drawMatchScene(c, match, t);
      this.lastBg = app.storyBg || this.lastBg;
    } else {
      const key = app.storyBg || this.lastBg;
      this.lastBg = key;
      drawScene(c, key, t);
      // keep non-match sheets legible against busy art
      if (mode !== 'story') {
        c.fillStyle = 'rgba(4,7,14,.28)';
        c.fillRect(0, 0, W, H);
      }
    }

    c.restore();

    // a soft universal flash for big transitions / impacts
    if (this.flash > 0) {
      c.fillStyle = `rgba(255,255,255,${clamp(this.flash, 0, 0.7)})`;
      c.fillRect(0, 0, W, H);
      this.flash = Math.max(0, this.flash - 0.035);
    }
  }

  burst(amount = 0.5) {
    this.flash = Math.max(this.flash, amount);
  }
}
