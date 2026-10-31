# PlayGround

<!-- omgithub:readme:start -->
## 🚀 Build, play, and remix with OMGithub

**Created using [OMGithub.com](https://omgithub.com).**

[![OMGithub](https://img.shields.io/badge/OMGithub-Open%20project-orange?style=for-the-badge)](https://omgithub.com/ykarakuzu214-alt/PlayGround)
[![GitHub](https://img.shields.io/badge/GitHub-Source-181717?logo=github&style=for-the-badge)](https://github.com/ykarakuzu214-alt/PlayGround)

- 🎮 [Open the project](https://omgithub.com/ykarakuzu214-alt/PlayGround).
- ✨ [Remix this project](https://omgithub.com/?remix=ykarakuzu214-alt%2FPlayGround).
- 💻 [Explore the source](https://github.com/ykarakuzu214-alt/PlayGround).
- 🛠️ [Check build runs](https://github.com/ykarakuzu214-alt/PlayGround/actions).
- 🐛 [Report an issue](https://github.com/ykarakuzu214-alt/PlayGround/issues).
- 👤 [Explore the creator's projects](https://omgithub.com/ykarakuzu214-alt).
- 🌍 [Create with OMGithub](https://omgithub.com).
<!-- omgithub:readme:end -->

## ⚽ Carlos Santana: Super Striker

A story-driven retro soccer RPG in the spirit of *Captain Tsubasa 2: Super Striker*. Follow Carlos Santana from a cracked street in Vila Nova, São Paulo, to the World Cup final at the Maracanã.

- **4 chapters** with dialogue scenes, rivals, training drills, and a final trophy ending.
- **Turn-based matches** with dribble / pass / shoot / special / hold commands and press / block / fall-back defense.
- **Timing duels** for every contested action — stop the marker in the green zone to beat stronger opponents.
- **Special moves** with pixel cut-ins: Santana Turn, Gaucho Heel, Samba Strike, and the Golden Cyclone.
- **Stamina, halftime recovery, extra time, and golden-goal rules.**
- **Mobile + desktop**: responsive layout, touch controls, and keyboard support.

### Play

```bash
PORT=3002 ./start.sh
```

Open `http://localhost:3002`. There is no build step — the game is plain HTML, CSS, and ES modules.

### Controls

- **Keyboard:** arrows / WASD to choose, Enter or Space to confirm, Space to stop the timing meter.
- **Touch:** tap commands, tap anywhere on the meter to stop it.
- **Pause:** the ❚❚ button opens resume, restart, quit, and sound options.

Progress, learned moves, training, and trophies are saved to `localStorage` under `carlos_santana_super_striker_v1`.

### Source map

- `src/story.js` — characters, teams, moves, chapters, dialogue, rewards.
- `src/engine.js` — pure match engine (clock, AI, duels, plans, summaries).
- `src/main.js` — screen flow, save data, story player, command menus, meter, results.
- `src/render.js` — canvas pitch, crowd, sprites, ball, and screen shake.
- `src/portrait.js` — procedural pixel portraits and the trophy.
- `src/audio.js` — WebAudio chiptune music, crowd, and SFX.
- `index.html`, `styles.css` — markup and responsive retro theme.
