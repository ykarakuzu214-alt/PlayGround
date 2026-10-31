// ---------------------------------------------------------------------------
// CARLOS SANTANA: SUPER STRIKER — story, characters, teams and special moves
// ---------------------------------------------------------------------------

export const CHARACTERS = {
  carlos: {
    name: 'CARLOS SANTANA', short: 'CARLOS',
    hair: 'spiky', hairColor: '#171310', skin: '#a96b45',
    jersey: '#f2c81c', trim: '#0c7a3e', shorts: '#1450a0',
    accessory: 'headband', headband: '#0c7a3e', number: 10,
    eyes: '#22160e'
  },
  batista: {
    name: 'COACH BATISTA', short: 'BATISTA',
    hair: 'short', hairColor: '#c9c9c9', skin: '#8a5a3b',
    jersey: '#d9d2bd', trim: '#6f2f2f', shorts: '#3c3a35',
    mustache: true, old: true, number: 0, eyes: '#1c1410'
  },
  rafa: {
    name: 'RAFA', short: 'RAFA',
    hair: 'curly', hairColor: '#241a12', skin: '#6b4229',
    jersey: '#f2c81c', trim: '#0c7a3e', shorts: '#1450a0',
    accessory: 'none', number: 5, eyes: '#1a110a'
  },
  diego: {
    name: 'DIEGO VARGAS', short: 'DIEGO',
    hair: 'long', hairColor: '#3a2414', skin: '#c98b5e',
    jersey: '#7fc4f2', trim: '#ffffff', shorts: '#1a1a22',
    accessory: 'headband', headband: '#7fc4f2', number: 10,
    eyes: '#2a1a10'
  },
  schneider: {
    name: 'KLAUS SCHNEIDER', short: 'SCHNEIDER',
    hair: 'short', hairColor: '#e8d9a0', skin: '#e3b58e',
    jersey: '#f2f2f2', trim: '#1a1a1a', shorts: '#1a1a1a',
    accessory: 'none', number: 9, eyes: '#3a5f8a'
  },
  tsubasa: {
    name: 'TSUBASA OZORA', short: 'TSUBASA',
    hair: 'spiky', hairColor: '#4a2c17', skin: '#e8bd93',
    jersey: '#1f4fd8', trim: '#ffffff', shorts: '#ffffff',
    accessory: 'none', number: 10, eyes: '#2a1a10'
  },
  hyuga: {
    name: 'KOJIRO HYUGA', short: 'HYUGA',
    hair: 'short', hairColor: '#1a1a1a', skin: '#d9a878',
    jersey: '#1f4fd8', trim: '#ffffff', shorts: '#ffffff',
    accessory: 'none', number: 9, eyes: '#1a1a1a'
  },
  wakabayashi: {
    name: 'GENZO WAKABAYASHI', short: 'WAKABAYASHI',
    hair: 'short', hairColor: '#3a2a1a', skin: '#e8bd93',
    jersey: '#1f4fd8', trim: '#ffffff', shorts: '#ffffff',
    accessory: 'none', number: 1, eyes: '#2a1a10'
  },
  narrator: { name: '', short: '', narrator: true }
};

export const MOVES = {
  santanaTurn: {
    name: 'SANTANA TURN', type: 'dribble', cost: 12, power: 4,
    desc: 'A samba hip-swivel that leaves defenders grasping at air.'
  },
  gauchoHeel: {
    name: 'GAUCHO HEEL', type: 'dribble', cost: 14, power: 6,
    desc: 'Diego\'s heel-roll. Carlos watched it once and made it his own.'
  },
  sambaStrike: {
    name: 'SAMBA STRIKE', type: 'shot', cost: 16, power: 5, minAdv: 45,
    desc: 'A curling drive struck with the outside of the boot.'
  },
  goldenCyclone: {
    name: 'GOLDEN CYCLONE', type: 'shot', cost: 22, power: 10, minAdv: 38,
    desc: 'Carlos\'s own creation — a spinning shot that changes direction in the air.'
  },
  fireShot: {
    name: 'FIRE SHOT', type: 'shot', cost: 20, power: 6, minAdv: 50,
    desc: 'Schneider\'s blazing drive.'
  },
  driveShot: {
    name: 'DRIVE SHOT', type: 'shot', cost: 18, power: 6, minAdv: 50,
    desc: 'Tsubasa\'s signature shot, curling away from the keeper.'
  },
  tigerShot: {
    name: 'TIGER SHOT', type: 'shot', cost: 20, power: 7, minAdv: 50,
    desc: 'Hyuga\'s ferocious straight-line thunderbolt.'
  }
};

export const STAT_LABELS = {
  shot: 'SHOT', dribble: 'DRIB', pass: 'PASS',
  tackle: 'TACK', speed: 'SPD', stamina: 'STAM'
};

// ---------------------------------------------------------------------------
// Team building
// ---------------------------------------------------------------------------

const FORMATION_433 = [
  [50, 92], [14, 77], [36, 81], [64, 81], [86, 77],
  [34, 63], [50, 56], [66, 63],
  [20, 36], [50, 29], [80, 36]
];

const ROLE_BY_SLOT = ['GK', 'LB', 'CB', 'CB', 'RB', 'DM', 'CM', 'AM', 'LW', 'ST', 'RW'];

const P = (name, number, stats, opts = {}) => ({
  name, number,
  shot: stats.shot, dribble: stats.dribble, pass: stats.pass,
  tackle: stats.tackle, speed: stats.speed, catch: stats.catch ?? 1,
  maxStamina: stats.stamina ?? 100,
  moves: opts.moves || [],
  look: opts.look || {}
});

const LOOKS = {
  br: [
    { hair: 'short', hairColor: '#241a12', skin: '#6b4229' },
    { hair: 'curly', hairColor: '#1a120c', skin: '#8a5a3b' },
    { hair: 'short', hairColor: '#3a2414', skin: '#a96b45' },
    { hair: 'spiky', hairColor: '#1a120c', skin: '#c98b5e' }
  ],
  ar: [
    { hair: 'short', hairColor: '#2a1a10', skin: '#c98b5e' },
    { hair: 'long', hairColor: '#3a2414', skin: '#d9a878' },
    { hair: 'curly', hairColor: '#1a120c', skin: '#8a5a3b' }
  ],
  de: [
    { hair: 'short', hairColor: '#c9a45a', skin: '#e3b58e' },
    { hair: 'short', hairColor: '#6b4a2a', skin: '#e8bd93' },
    { hair: 'spiky', hairColor: '#d9c07a', skin: '#e3b58e' }
  ],
  jp: [
    { hair: 'short', hairColor: '#1a1a1a', skin: '#e8bd93' },
    { hair: 'spiky', hairColor: '#2a1a10', skin: '#d9a878' }
  ]
};

function roster(list) {
  return list.map((p, i) => ({
    ...p,
    role: ROLE_BY_SLOT[i],
    look: { ...p.look }
  }));
}

const C = {
  bra: { shirt: '#f2c81c', trim: '#0c7a3e', shorts: '#1450a0', text: '#0b3d22' },
  san: { shirt: '#f2c81c', trim: '#0c7a3e', shorts: '#1450a0', text: '#0b3d22' },
  por: { shirt: '#2b6fd6', trim: '#ffffff', shorts: '#ffffff', text: '#123a78' },
  arg: { shirt: '#7fc4f2', trim: '#ffffff', shorts: '#1a1a22', text: '#123a78' },
  ger: { shirt: '#f2f2f2', trim: '#1a1a1a', shorts: '#1a1a1a', text: '#222222' },
  jpn: { shirt: '#1f4fd8', trim: '#ffffff', shorts: '#ffffff', text: '#0c1f5e' }
};

function santosYouth(save) {
  const c = save.stats;
  return {
    name: 'SANTOS U-17', short: 'SAN', colors: C.san,
    players: roster([
      P('TONINHO', 1, { shot: 1, dribble: 2, pass: 4, tackle: 3, speed: 4, catch: 7 }),
      P('LÉO', 2, { shot: 3, dribble: 6, pass: 5, tackle: 6, speed: 7 }, { look: LOOKS.br[0] }),
      P('MARCÃO', 3, { shot: 2, dribble: 3, pass: 4, tackle: 7, speed: 4 }, { look: LOOKS.br[1] }),
      P('BETO', 4, { shot: 2, dribble: 4, pass: 4, tackle: 6, speed: 5 }, { look: LOOKS.br[2] }),
      P('DUDU', 6, { shot: 3, dribble: 6, pass: 5, tackle: 5, speed: 8 }, { look: LOOKS.br[3] }),
      P('RAFA', 5, { shot: 4, dribble: 7, pass: 8, tackle: 6, speed: 6 }, { look: CHARACTERS.rafa }),
      P('MARCELINHO', 8, { shot: 4, dribble: 7, pass: 8, tackle: 4, speed: 6 }, { look: LOOKS.br[1] }),
      P('DINHO', 7, { shot: 5, dribble: 8, pass: 7, tackle: 4, speed: 7 }, { look: LOOKS.br[0] }),
      P('NENÉM', 11, { shot: 5, dribble: 8, pass: 5, tackle: 3, speed: 9 }, { look: LOOKS.br[2] }),
      P('CARLOS SANTANA', 10, { ...c, catch: 1 }, { moves: [...save.moves], look: CHARACTERS.carlos }),
      P('TICO', 9, { shot: 6, dribble: 6, pass: 5, tackle: 3, speed: 7 }, { look: LOOKS.br[3] })
    ])
  };
}

function brazilU20(save) {
  const c = save.stats;
  return {
    name: 'BRAZIL U-20', short: 'BRA', colors: C.bra,
    players: roster([
      P('ZÉ GRANDE', 1, { shot: 1, dribble: 2, pass: 5, tackle: 4, speed: 4, catch: 12 }),
      P('LÉO', 2, { shot: 4, dribble: 8, pass: 8, tackle: 9, speed: 10 }, { look: LOOKS.br[0] }),
      P('MARCÃO', 3, { shot: 3, dribble: 4, pass: 6, tackle: 10, speed: 6 }, { look: LOOKS.br[1] }),
      P('BETO', 4, { shot: 3, dribble: 5, pass: 6, tackle: 9, speed: 7 }, { look: LOOKS.br[2] }),
      P('DUDU', 6, { shot: 4, dribble: 8, pass: 8, tackle: 8, speed: 10 }, { look: LOOKS.br[3] }),
      P('RAFA', 5, { shot: 6, dribble: 9, pass: 10, tackle: 9, speed: 8 }, { look: CHARACTERS.rafa }),
      P('MARCELINHO', 8, { shot: 7, dribble: 9, pass: 10, tackle: 6, speed: 8 }, { look: LOOKS.br[1] }),
      P('DINHO', 7, { shot: 8, dribble: 10, pass: 9, tackle: 5, speed: 9 }, { look: LOOKS.br[0] }),
      P('NENÉM', 11, { shot: 8, dribble: 10, pass: 7, tackle: 4, speed: 11 }, { look: LOOKS.br[2] }),
      P('CARLOS SANTANA', 10, { ...c, catch: 1 }, { moves: [...save.moves], look: CHARACTERS.carlos }),
      P('TICO', 9, { shot: 9, dribble: 8, pass: 7, tackle: 4, speed: 9 }, { look: LOOKS.br[3] })
    ])
  };
}

function brazilSenior(save) {
  const c = save.stats;
  return {
    name: 'BRAZIL', short: 'BRA', colors: C.bra,
    players: roster([
      P('ZÉ GRANDE', 1, { shot: 1, dribble: 2, pass: 6, tackle: 5, speed: 5, catch: 17 }),
      P('LÉO', 2, { shot: 5, dribble: 10, pass: 10, tackle: 13, speed: 12 }, { look: LOOKS.br[0] }),
      P('MARCÃO', 3, { shot: 4, dribble: 5, pass: 8, tackle: 14, speed: 8 }, { look: LOOKS.br[1] }),
      P('BETO', 4, { shot: 4, dribble: 6, pass: 8, tackle: 13, speed: 9 }, { look: LOOKS.br[2] }),
      P('DUDU', 6, { shot: 5, dribble: 10, pass: 10, tackle: 12, speed: 12 }, { look: LOOKS.br[3] }),
      P('RAFA', 5, { shot: 8, dribble: 12, pass: 13, tackle: 13, speed: 10 }, { look: CHARACTERS.rafa }),
      P('MARCELINHO', 8, { shot: 10, dribble: 12, pass: 14, tackle: 8, speed: 10 }, { look: LOOKS.br[1] }),
      P('DINHO', 7, { shot: 11, dribble: 13, pass: 13, tackle: 7, speed: 11 }, { look: LOOKS.br[0] }),
      P('NENÉM', 11, { shot: 11, dribble: 13, pass: 10, tackle: 5, speed: 14 }, { look: LOOKS.br[2] }),
      P('CARLOS SANTANA', 10, { ...c, catch: 1 }, { moves: [...save.moves], look: CHARACTERS.carlos }),
      P('TICO', 9, { shot: 12, dribble: 11, pass: 9, tackle: 5, speed: 11 }, { look: LOOKS.br[3] })
    ])
  };
}

function portoAcademy() {
  return {
    name: 'PORTO ACADEMY', short: 'POR', colors: C.por,
    players: roster([
      P('VITOR', 1, { shot: 1, dribble: 2, pass: 4, tackle: 3, speed: 4, catch: 8 }),
      P('PAULO', 2, { shot: 3, dribble: 5, pass: 5, tackle: 6, speed: 6 }, { look: LOOKS.br[0] }),
      P('NUNO', 3, { shot: 2, dribble: 3, pass: 4, tackle: 7, speed: 4 }, { look: LOOKS.br[1] }),
      P('RUI', 4, { shot: 2, dribble: 3, pass: 4, tackle: 7, speed: 4 }, { look: LOOKS.br[2] }),
      P('ANDRÉ', 6, { shot: 3, dribble: 5, pass: 5, tackle: 6, speed: 6 }, { look: LOOKS.br[3] }),
      P('HUGO', 5, { shot: 4, dribble: 6, pass: 6, tackle: 6, speed: 6 }, { look: LOOKS.br[0] }),
      P('TIAGO', 8, { shot: 6, dribble: 7, pass: 7, tackle: 5, speed: 7 }, { look: LOOKS.br[1] }),
      P('SÉRGIO', 7, { shot: 6, dribble: 8, pass: 6, tackle: 4, speed: 7 }, { look: LOOKS.br[2] }),
      P('BRUNO', 11, { shot: 7, dribble: 8, pass: 5, tackle: 3, speed: 8 }, { look: LOOKS.br[3] }),
      P('DIOGO', 9, { shot: 8, dribble: 7, pass: 5, tackle: 3, speed: 7 }, { look: LOOKS.br[1] }),
      P('MIGUEL', 10, { shot: 7, dribble: 8, pass: 7, tackle: 3, speed: 7 }, { look: LOOKS.br[0] })
    ])
  };
}

function argentinaU20() {
  return {
    name: 'ARGENTINA U-20', short: 'ARG', colors: C.arg,
    players: roster([
      P('CHOLO', 1, { shot: 1, dribble: 2, pass: 5, tackle: 4, speed: 5, catch: 12 }),
      P('PIBE', 2, { shot: 4, dribble: 9, pass: 8, tackle: 10, speed: 10 }, { look: LOOKS.ar[0] }),
      P('TANO', 3, { shot: 3, dribble: 5, pass: 6, tackle: 11, speed: 7 }, { look: LOOKS.ar[1] }),
      P('RULO', 4, { shot: 3, dribble: 5, pass: 6, tackle: 11, speed: 7 }, { look: LOOKS.ar[2] }),
      P('NACHO', 6, { shot: 4, dribble: 9, pass: 8, tackle: 10, speed: 10 }, { look: LOOKS.ar[0] }),
      P('MATÍAS', 5, { shot: 7, dribble: 11, pass: 11, tackle: 10, speed: 8 }, { look: LOOKS.ar[1] }),
      P('DIEGO VARGAS', 10, { shot: 13, dribble: 14, pass: 13, tackle: 6, speed: 12 }, { moves: ['gauchoHeel'], look: CHARACTERS.diego }),
      P('LUCHO', 8, { shot: 8, dribble: 11, pass: 11, tackle: 7, speed: 9 }, { look: LOOKS.ar[2] }),
      P('TATO', 11, { shot: 10, dribble: 11, pass: 7, tackle: 4, speed: 11 }, { look: LOOKS.ar[0] }),
      P('EL TORO', 9, { shot: 12, dribble: 9, pass: 6, tackle: 4, speed: 9 }, { look: LOOKS.ar[1] }),
      P('COCO', 7, { shot: 9, dribble: 10, pass: 8, tackle: 4, speed: 10 }, { look: LOOKS.ar[2] })
    ])
  };
}

function germany() {
  return {
    name: 'GERMANY', short: 'GER', colors: C.ger,
    players: roster([
      P('WERNER', 1, { shot: 1, dribble: 2, pass: 6, tackle: 5, speed: 5, catch: 15 }),
      P('KRANZ', 2, { shot: 5, dribble: 11, pass: 11, tackle: 13, speed: 12 }, { look: LOOKS.de[0] }),
      P('BECKER', 3, { shot: 4, dribble: 6, pass: 8, tackle: 14, speed: 8 }, { look: LOOKS.de[1] }),
      P('HOFFMANN', 4, { shot: 4, dribble: 6, pass: 8, tackle: 14, speed: 8 }, { look: LOOKS.de[2] }),
      P('FUCHS', 6, { shot: 5, dribble: 11, pass: 11, tackle: 13, speed: 12 }, { look: LOOKS.de[0] }),
      P('KLEIN', 5, { shot: 8, dribble: 13, pass: 13, tackle: 12, speed: 10 }, { look: LOOKS.de[1] }),
      P('WAGNER', 8, { shot: 11, dribble: 13, pass: 14, tackle: 9, speed: 11 }, { look: LOOKS.de[2] }),
      P('KAISER', 7, { shot: 12, dribble: 14, pass: 13, tackle: 8, speed: 12 }, { look: LOOKS.de[0] }),
      P('BRANDT', 11, { shot: 12, dribble: 13, pass: 10, tackle: 6, speed: 13 }, { look: LOOKS.de[1] }),
      P('KLAUS SCHNEIDER', 9, { shot: 17, dribble: 16, pass: 12, tackle: 7, speed: 14 }, { moves: ['fireShot'], look: CHARACTERS.schneider }),
      P('VOGEL', 10, { shot: 12, dribble: 13, pass: 12, tackle: 6, speed: 12 }, { look: LOOKS.de[2] })
    ])
  };
}

function japan() {
  return {
    name: 'JAPAN', short: 'JPN', colors: C.jpn,
    players: roster([
      P('GENZO WAKABAYASHI', 1, { shot: 1, dribble: 3, pass: 8, tackle: 6, speed: 7, catch: 17 }, { look: CHARACTERS.wakabayashi }),
      P('ISHIZAKI', 2, { shot: 6, dribble: 12, pass: 12, tackle: 13, speed: 14 }, { look: LOOKS.jp[0] }),
      P('JITO', 3, { shot: 5, dribble: 7, pass: 10, tackle: 14, speed: 9 }, { look: LOOKS.jp[1] }),
      P('SODA', 4, { shot: 5, dribble: 7, pass: 10, tackle: 14, speed: 9 }, { look: LOOKS.jp[0] }),
      P('KAZUO', 6, { shot: 6, dribble: 12, pass: 12, tackle: 13, speed: 14 }, { look: LOOKS.jp[1] }),
      P('MISAKI', 5, { shot: 10, dribble: 15, pass: 17, tackle: 12, speed: 13 }, { look: LOOKS.jp[0] }),
      P('TSUBASA OZORA', 10, { shot: 17, dribble: 18, pass: 17, tackle: 11, speed: 15 }, { moves: ['driveShot'], look: CHARACTERS.tsubasa }),
      P('AOI', 8, { shot: 12, dribble: 15, pass: 15, tackle: 9, speed: 14 }, { look: LOOKS.jp[1] }),
      P('NITTA', 11, { shot: 12, dribble: 15, pass: 11, tackle: 6, speed: 16 }, { look: LOOKS.jp[0] }),
      P('KOJIRO HYUGA', 9, { shot: 16, dribble: 14, pass: 10, tackle: 7, speed: 14 }, { moves: ['tigerShot'], look: CHARACTERS.hyuga }),
      P('SORIMACHI', 7, { shot: 12, dribble: 14, pass: 11, tackle: 6, speed: 15 }, { look: LOOKS.jp[1] })
    ])
  };
}

// ---------------------------------------------------------------------------
// Chapters
// ---------------------------------------------------------------------------

const line = (who, text) => ({ who, text });

export const CHAPTERS = [
  {
    id: 'ch1',
    number: 1,
    title: 'THE BOY FROM VILA NOVA',
    place: 'SÃO PAULO, BRAZIL',
    subtitle: 'A rag ball. A cracked street. A dream.',
    sky: 'linear-gradient(180deg,#0b1a33 0%,#243a5c 32%,#a85c47 68%,#e29a56 84%,#2b1b20 100%)',
    intro: [
      line('narrator', 'Vila Nova, São Paulo. The rain has stopped, and the hill smells of wet earth and charcoal.'),
      line('narrator', 'On a slope of cracked concrete, a boy keeps a ball of rolled rags in the air. Forty-one. Forty-two...'),
      line('carlos', 'Forty-three... forty-four... Don\'t you dare fall now.'),
      line('rafa', 'CARLOS! Coach Batista is here! The Santos scout! He came to watch YOU!'),
      line('carlos', 'Then he had better watch closely.'),
      line('batista', 'Hmph. A rag ball on a broken street. And yet the boy plays like the ball is dancing.'),
      line('batista', 'Santana. Tomorrow, at the Santos training ground. Bring boots. If you own any.'),
      line('carlos', 'I\'ll bring my football, sir. The boots can wait.'),
      line('batista', '...Cheeky. I like that.'),
      line('narrator', 'That night, Carlos practices until the streetlights hum.')
    ],
    trainingLead: 'The streetlights hum. Carlos has one night to sharpen his game.',
    training: [
      { id: 'shot', title: 'ROCKET SHOTS', text: 'Fire the rag ball at a painted square on the wall until his thigh burns.', stat: 'shot', amount: 1 },
      { id: 'dribble', title: 'BRICK-WEAVE DRILLS', text: 'Weave between loose bricks at full speed, ball glued to his feet.', stat: 'dribble', amount: 1 },
      { id: 'speed', title: 'HILL SPRINTS', text: 'Sprint the favela hill until his lungs taste like metal.', stat: 'speed', amount: 1 }
    ],
    preMatch: [
      line('batista', 'The Porto Academy boys have played on grass their whole lives. Show them what the street taught you.'),
      line('rafa', 'I\'ll be behind you, captain.'),
      line('carlos', 'Let\'s make them dance.')
    ],
    match: {
      home: (save) => santosYouth(save),
      away: () => portoAcademy(),
      minutes: 50,
      goldenGoal: false,
      difficulty: 1
    },
    win: [
      line('batista', 'You play like you\'re hungry. Good. But hunger alone won\'t survive the world stage.'),
      line('carlos', 'Then I\'ll learn everything. Every trick. Every move.'),
      line('batista', 'Careful, boy. Copy too much and you\'ll forget your own rhythm.'),
      line('narrator', 'Carlos signs his first contract. In the margin, he writes one word: EVERYTHING.'),
      line('narrator', 'He learns the SANTANA TURN — a samba hip-swivel born on this very hill.')
    ],
    lose: [
      line('batista', 'Not yet. You have feet, but no plan. Watch. Learn. Come back.'),
      line('carlos', 'I\'ll be back. I\'ll be better.'),
      line('narrator', 'Carlos stays on the pitch long after the lights go out.')
    ],
    rewards: { moves: ['santanaTurn'], stats: { shot: 1 }, text: 'SANTANA TURN learned!  SHOT +1' },
    quote: 'The ball doesn\'t care where you were born.'
  },
  {
    id: 'ch2',
    number: 2,
    title: 'THE FOOTBALL CYBORG',
    place: 'BUENOS AIRES, ARGENTINA',
    subtitle: 'Brazil vs Argentina — the South American final.',
    sky: 'linear-gradient(180deg,#06122a 0%,#0d2a4a 40%,#1d4a63 66%,#5c6b53 84%,#1a2418 100%)',
    intro: [
      line('narrator', 'Two years later. The South American U-20 final. Forty thousand voices press down on the pitch.'),
      line('diego', 'So this is the street kid everyone whispers about. The "football cyborg."'),
      line('carlos', 'Cyborg? I just watch. And I remember.'),
      line('diego', 'Then remember this. GAUCHO HEEL!'),
      line('narrator', 'Diego rolls the ball behind his standing leg and vanishes past two defenders.'),
      line('carlos', '...Oh. I see it now.'),
      line('diego', 'You see nothing, favela boy.'),
      line('rafa', 'Carlos, he\'s mocking you!'),
      line('carlos', 'Let him. I need one more look.'),
      line('batista', 'Listen to me, boy. A copy is only worth something when you know WHY it works.'),
      line('carlos', 'Then I\'ll learn why.')
    ],
    trainingLead: 'Diego\'s heel-roll loops in Carlos\'s head. He works it out on the hotel roof.',
    training: [
      { id: 'pass', title: 'ONE-TOUCH RONDO', text: 'Keep the ball moving with Rafa in a six-yard box. No first touch wasted.', stat: 'pass', amount: 1 },
      { id: 'tackle', title: 'SHADOW DEFENDING', text: 'Mirror Diego\'s movements in his head until the heel-roll has nowhere to hide.', stat: 'tackle', amount: 1 },
      { id: 'stamina', title: 'ALTITUDE RUNS', text: 'Run the stadium steps twice. The final will demand every breath.', stat: 'stamina', amount: 8 }
    ],
    preMatch: [
      line('diego', 'I hope you brought a notebook, cyborg. I\'m about to write a new chapter.'),
      line('carlos', 'Good. I\'m a fast reader.'),
      line('rafa', 'He\'s got the whole stadium. We\'ve got us.'),
      line('carlos', 'Then let\'s give them something to scream about.')
    ],
    match: {
      home: (save) => brazilU20(save),
      away: () => argentinaU20(),
      minutes: 70,
      goldenGoal: false,
      difficulty: 2
    },
    win: [
      line('diego', 'You... copied my heel? In one match?'),
      line('carlos', 'You showed me. Thank you.'),
      line('diego', 'Tch. Next time I\'ll invent something you can\'t steal.'),
      line('carlos', 'Good. I\'ll be watching.'),
      line('narrator', 'Carlos adds the GAUCHO HEEL to his arsenal — and invents the SAMBA STRIKE on the flight home.'),
      line('narrator', 'The cyborg is learning to create.')
    ],
    lose: [
      line('diego', 'Stay down, street kid. The world is bigger than your hill.'),
      line('carlos', 'Bigger just means more to learn.'),
      line('narrator', 'Carlos watches the tape again. And again. And again.')
    ],
    rewards: { moves: ['gauchoHeel', 'sambaStrike'], stats: { dribble: 1 }, text: 'GAUCHO HEEL + SAMBA STRIKE learned!  DRIBBLE +1' },
    quote: 'Copy the move. Then make it yours.'
  },
  {
    id: 'ch3',
    number: 3,
    title: 'THE FIRE OF EUROPE',
    place: 'WORLD CUP SEMIFINAL — PARIS',
    subtitle: 'Brazil vs Germany. Ninety minutes from the final.',
    sky: 'linear-gradient(180deg,#050a18 0%,#0b1a33 42%,#263a5c 68%,#3d4a63 86%,#10131c 100%)',
    intro: [
      line('narrator', 'The World Cup semifinal. Under the floodlights, the pitch looks like a sheet of glass.'),
      line('schneider', 'So you are the copycat. I am Klaus Schneider. I do not copy. I burn.'),
      line('carlos', 'Then I\'ll learn to play with fire.'),
      line('batista', 'Brazil hasn\'t won this cup in twenty-four years. No pressure, boy.'),
      line('carlos', 'Pressure is just another defender, coach.'),
      line('rafa', 'And this one hits like a truck.'),
      line('carlos', 'Then we don\'t let him get close enough to swing.'),
      line('narrator', 'In the tunnel, Carlos closes his eyes and listens for a rhythm only he can hear.')
    ],
    trainingLead: 'One night before the biggest match of his life, Carlos trains alone.',
    training: [
      { id: 'shot', title: 'CURLING REPETITIONS', text: 'Bend shot after shot around a line of training dummies.', stat: 'shot', amount: 1 },
      { id: 'speed', title: 'FIRST-STEP WORK', text: 'Explode out of a crouch, over and over, until the burst is instinct.', stat: 'speed', amount: 1 },
      { id: 'stamina', title: 'RECOVERY PROTOCOL', text: 'Ice baths, breathing drills, sleep. Save the legs for the fire.', stat: 'stamina', amount: 8 }
    ],
    preMatch: [
      line('schneider', 'When the Fire Shot hits the net, remember who lit the match.'),
      line('carlos', 'I\'ll remember. I remember everything.'),
      line('batista', 'Play your own rhythm, boy. Not his. Not mine. Yours.'),
      line('carlos', 'Yes, coach. Let\'s dance.')
    ],
    match: {
      home: (save) => brazilSenior(save),
      away: () => germany(),
      minutes: 90,
      goldenGoal: false,
      difficulty: 3
    },
    win: [
      line('schneider', 'You didn\'t copy my Fire Shot. You answered it with something of your own.'),
      line('carlos', 'I finally heard my own rhythm.'),
      line('schneider', 'Then I will see you in the final one day. Bring that rhythm.'),
      line('narrator', 'In the dressing room, Batista draws one last play on a napkin: the GOLDEN CYCLONE.'),
      line('batista', 'A shot that spins against the wind. Impossible to read. Just like you, boy.'),
      line('carlos', 'Let\'s make it real.')
    ],
    lose: [
      line('schneider', 'Fire burns. Remember that.'),
      line('carlos', 'Then I\'ll learn to dance in it.'),
      line('narrator', 'The dream waits one more night.')
    ],
    rewards: { moves: ['goldenCyclone'], stats: { shot: 1 }, text: 'GOLDEN CYCLONE learned!  SHOT +1' },
    quote: 'Pressure is just another defender.'
  },
  {
    id: 'ch4',
    number: 4,
    title: 'THE FINAL DANCE',
    place: 'WORLD CUP FINAL — RIO DE JANEIRO',
    subtitle: 'Brazil vs Japan. One night. One trophy.',
    sky: 'linear-gradient(180deg,#0a0f24 0%,#241a3e 38%,#7a3f3a 64%,#d97a3e 82%,#2b1a1a 100%)',
    intro: [
      line('narrator', 'The Maracanã. Two hundred thousand heartbeats in one bowl of light.'),
      line('tsubasa', 'Carlos Santana. I\'ve watched every match of yours.'),
      line('carlos', 'And I\'ve watched yours, Tsubasa. You\'re the reason I started copying moves.'),
      line('tsubasa', 'Then today, let\'s show each other something new.'),
      line('carlos', 'Deal. May the better dancer win.'),
      line('batista', 'The whole world is watching, boy. But don\'t play for them. Play for the ball.'),
      line('carlos', 'For the ball. For the hill. For every kid with a rag and a dream.'),
      line('narrator', 'Carlos looks up at the stands. Somewhere in the noise, he hears a samba drum.'),
      line('carlos', 'Let\'s dance.')
    ],
    trainingLead: 'The last training session. The last quiet hour before the world stops.',
    training: [
      { id: 'shot', title: 'THE IMPOSSIBLE ANGLE', text: 'Strike from impossible angles until the net starts to feel like a suggestion.', stat: 'shot', amount: 2 },
      { id: 'dribble', title: 'SAMBA FOOTWORK', text: 'A rhythm drill with the whole squad clapping. The ball never touches the ground.', stat: 'dribble', amount: 2 },
      { id: 'pass', title: 'TRUST DRILL', text: 'Blindfolded one-touch passes with Rafa. Trust is a skill too.', stat: 'pass', amount: 1 }
    ],
    preMatch: [
      line('hyuga', 'Don\'t think this is your fairy tale, Santana. The tiger is hungry.'),
      line('carlos', 'Then let him chase me all night.'),
      line('wakabayashi', 'Nothing gets past me. Nothing.'),
      line('carlos', 'Good. I\'d hate for this to be easy.'),
      line('tsubasa', 'Carlos. Let\'s give them a match they\'ll never forget.'),
      line('carlos', 'That\'s the plan, my friend.')
    ],
    match: {
      home: (save) => brazilSenior(save),
      away: () => japan(),
      minutes: 90,
      goldenGoal: true,
      difficulty: 4
    },
    win: [
      line('narrator', 'The whistle dies. The Maracanã becomes a single, roaring heartbeat.'),
      line('tsubasa', 'That last shot... I couldn\'t read it. What was it?'),
      line('carlos', 'I don\'t know. I made it up. Right there, in the air.'),
      line('tsubasa', 'Then I\'ll have to invent something to answer it.'),
      line('carlos', 'I\'m counting on it.'),
      line('narrator', 'They trade shirts at the center circle. Two number tens, grinning like children.'),
      line('narrator', 'Carlos Santana lifts the trophy. Somewhere in Vila Nova, a boy kicks a rag ball against a wall and dreams.'),
      line('narrator', 'THE END — but football never ends.')
    ],
    lose: [
      line('tsubasa', 'Thank you for the match, Carlos. It was beautiful.'),
      line('carlos', 'Not beautiful enough. Not yet.'),
      line('narrator', 'The trophy glitters in someone else\'s hands tonight. The hill is still waiting.')
    ],
    rewards: { trophy: true, text: 'WORLD CHAMPION!' },
    quote: 'Somewhere in Vila Nova, a boy kicks a rag ball against a wall.'
  }
];

export const ENDING = {
  title: 'WORLD CHAMPION',
  lines: [
    line('narrator', 'The confetti falls like warm rain. Carlos holds the trophy above his head.'),
    line('rafa', 'You did it, captain. You actually did it.'),
    line('carlos', 'WE did it. The whole hill did it.'),
    line('batista', 'You found your rhythm, boy. Took you long enough.'),
    line('carlos', 'Coach... thank you. For the rag ball. For everything.'),
    line('narrator', 'Far away, on a cracked street in São Paulo, a child juggles a ball of rolled rags. Forty-one. Forty-two...')
  ]
};

export function chapterById(id) {
  return CHAPTERS.find(c => c.id === id);
}
