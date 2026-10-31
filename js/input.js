/* =========================================================
   INPUT — keyboard, touch joystick, action buttons
   ========================================================= */

const KEYMAP = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  Space: 'shoot', KeyJ: 'shoot',
  KeyK: 'pass', KeyX: 'pass',
  KeyL: 'special', KeyC: 'special',
  Escape: 'pause', KeyP: 'pause',
  Enter: 'confirm',
  Digit1: 'opt1', Digit2: 'opt2', Digit3: 'opt3', Digit4: 'opt4',
  KeyM: 'mute'
};

export class Input {
  constructor() {
    this.down = new Set();
    this.pressed = new Set();
    this.touchAxis = { x: 0, y: 0 };
    this.touchActive = false;
    this.joyPointer = null;
    this.isTouch = (navigator.maxTouchPoints || 0) > 0 || matchMedia('(pointer: coarse)').matches;
    this.joystick = null;
    this.stick = null;
    this.onFirstGesture = null;
    this.gestured = false;
    this._init();
  }

  _init() {
    window.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName || '').toLowerCase();
      const isControl = ['button', 'a', 'input', 'select', 'textarea'].includes(tag);
      const action = KEYMAP[e.code];
      if (action) {
        if (!(isControl && (e.code === 'Space' || e.code === 'Enter'))) {
          e.preventDefault();
        }
        if (!e.repeat) {
          this.down.add(action);
          this.pressed.add(action);
          this._gesture();
        }
      }
      if (e.code === 'Tab') return;
    }, { passive: false });

    window.addEventListener('keyup', (e) => {
      const action = KEYMAP[e.code];
      if (action) this.down.delete(action);
    });

    window.addEventListener('blur', () => {
      this.down.clear();
      this.touchAxis.x = 0; this.touchAxis.y = 0;
      this.touchActive = false;
      this._resetStick();
    });

    this._initTouchButtons();
    this._initJoystick();

    window.addEventListener('pointerdown', () => this._gesture(), { once: true });
    window.addEventListener('keydown', () => this._gesture(), { once: true });
  }

  _gesture() {
    if (this.gestured) return;
    this.gestured = true;
    if (this.onFirstGesture) this.onFirstGesture();
  }

  _initTouchButtons() {
    document.querySelectorAll('[data-touch]').forEach((btn) => {
      const action = btn.dataset.touch;
      const press = (e) => {
        e.preventDefault();
        this.pressed.add(action);
        this.down.add(action);
        btn.classList.add('active');
        this._gesture();
      };
      const release = () => {
        this.down.delete(action);
        btn.classList.remove('active');
      };
      btn.addEventListener('pointerdown', press);
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointercancel', release);
      btn.addEventListener('pointerleave', release);
    });
  }

  _initJoystick() {
    this.joystick = document.getElementById('joystick');
    this.stick = document.getElementById('joystick-stick');
    if (!this.joystick || !this.stick) return;
    const max = 34;
    const setFromEvent = (e) => {
      const rect = this.joystick.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let dx = e.clientX - cx;
      let dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > max) { dx = dx / dist * max; dy = dy / dist * max; }
      const nx = dx / max, ny = dy / max;
      const dead = 0.18;
      this.touchAxis.x = Math.abs(nx) < dead ? 0 : nx;
      this.touchAxis.y = Math.abs(ny) < dead ? 0 : ny;
      this.touchActive = true;
      this.stick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    };
    this.joystick.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.joyPointer = e.pointerId;
      this.joystick.setPointerCapture(e.pointerId);
      setFromEvent(e);
      this._gesture();
    });
    this.joystick.addEventListener('pointermove', (e) => {
      if (this.joyPointer !== e.pointerId) return;
      e.preventDefault();
      setFromEvent(e);
    });
    const end = (e) => {
      if (this.joyPointer !== e.pointerId) return;
      this.joyPointer = null;
      this.touchAxis.x = 0; this.touchAxis.y = 0;
      this.touchActive = false;
      this._resetStick();
    };
    this.joystick.addEventListener('pointerup', end);
    this.joystick.addEventListener('pointercancel', end);
    this.joystick.addEventListener('lostpointercapture', end);
  }

  _resetStick() {
    if (this.stick) this.stick.style.transform = 'translate(-50%, -50%)';
  }

  press(action) {
    this.pressed.add(action);
  }

  take(action) {
    if (this.pressed.has(action)) {
      this.pressed.delete(action);
      return true;
    }
    return false;
  }

  isDown(action) {
    return this.down.has(action);
  }

  consumeDirectionPress() {
    for (const dir of ['up', 'down', 'left', 'right']) {
      if (this.pressed.has(dir)) { this.pressed.delete(dir); return dir; }
    }
    return null;
  }

  vector() {
    let x = 0, y = 0;
    if (this.isDown('left')) x -= 1;
    if (this.isDown('right')) x += 1;
    if (this.isDown('up')) y -= 1;
    if (this.isDown('down')) y += 1;
    x += this.touchAxis.x;
    y += this.touchAxis.y;
    const len = Math.hypot(x, y);
    if (len > 1) { x /= len; y /= len; }
    return { x, y };
  }

  endFrame() {
    this.pressed.clear();
  }
}
