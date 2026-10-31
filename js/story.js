/* =========================================================
   STORY DATA — Carlos Santana: O Camisa 10
   All prose and characters written as an original fan tribute.
   ========================================================= */

export const SAVE_KEY = 'carlos-santana-camisa10-save-v1';

const N = { portrait: null, speaker: 'NARRATOR', role: '' };

export const CHAPTERS = [
  {
    id: 'salt-and-sand',
    num: 1,
    title: 'SALT & SAND',
    pt: 'SAL E AREIA',
    location: 'SALVADOR, BAHIA',
    year: '1994',
    competition: 'BEACH CUP · FINAL',
    venue: 'PRAIA DO FAROL · 17:40',
    baseStats: { pace: 64, technique: 60, power: 56, flair: 72 },
    pre: [
      { ...N, bg: 'beach_sunset', text: 'In Salvador, the sun does not set. It dribbles down the sky, one last stepover, and drops into the sea.' },
      { ...N, bg: 'beach_sunset', text: 'On the sand of Praia do Farol, a boy keeps a ball of rolled rags alive. Ten touches. Twenty. Thirty.' },
      { bg: 'beach_sunset', speaker: 'CARLOS', role: '11 YEARS OLD', portrait: 'carlos', expr: 'smile', text: 'Thirty-one. Thirty-two. The sun goes down when I say so.' },
      { bg: 'beach_sunset', speaker: 'JOAQUIM', role: 'CARLOS\'S FATHER', portrait: 'joaquim', expr: 'smile', text: 'Carlinhos! The fish won\'t sell themselves... and your dinner is getting cold.' },
      { bg: 'beach_sunset', speaker: 'CARLOS', role: '11 YEARS OLD', portrait: 'carlos', expr: 'smile', text: 'Pai, the Falcões challenged us. Winner keeps the beach pitch until Sunday.' },
      { bg: 'beach_sunset', speaker: 'JOAQUIM', role: 'CARLOS\'S FATHER', portrait: 'joaquim', expr: 'smirk', text: 'A whole pitch? For a ball of rags?' },
      { bg: 'beach_sunset', speaker: 'CARLOS', role: '11 YEARS OLD', portrait: 'carlos', expr: 'smile', text: 'For joy, Pai. The pitch is just where it happens.' },
      { ...N, bg: 'beach_sunset', text: 'Joaquim reaches under the fish stall and produces a pair of boots. Old leather. One size too big. Polished until they shine.' },
      { bg: 'beach_sunset', speaker: 'JOAQUIM', role: 'CARLOS\'S FATHER', portrait: 'joaquim', expr: 'soft', text: 'From the market. The man said they belonged to a professional. I said they belonged to my son.' },
      { bg: 'beach_sunset', speaker: 'CARLOS', role: '11 YEARS OLD', portrait: 'carlos', expr: 'surprised', text: '...They\'re perfect.' },
      { bg: 'beach_sunset', speaker: 'DONA ZEFA', role: 'COACH · BARRA DO SOL', portrait: 'zefa', expr: 'smile', text: 'Menino! Stop hugging boots and listen. A ball is a drum. You don\'t fight the rhythm. You listen to it.' },
      { bg: 'beach_sunset', speaker: 'DONA ZEFA', role: 'COACH · BARRA DO SOL', portrait: 'zefa', expr: 'stern', text: 'No out of bounds tonight. No excuses. First to three... or whoever is still dancing when the light goes.' },
      { bg: 'beach_sunset', speaker: 'RATINHO', role: 'FALCÕES DO MORRO', portrait: 'ratinho', expr: 'smirk', text: 'Santana! Tonight the only thing you\'ll juggle is sand.' },
      { bg: 'beach_sunset', speaker: 'CARLOS', role: '11 YEARS OLD', portrait: 'carlos', expr: 'smirk', text: 'Keep talking, Ratinho. The ball can\'t hear you.' },
      {
        type: 'choice',
        bg: 'beach_sunset',
        prompt: 'What does Carlos play for?',
        options: [
          { label: 'For the joy.', effect: { flair: 5, technique: 1 }, reply: 'Then play loud enough for the whole beach to hear it.' },
          { label: 'For my father.', effect: { power: 4, technique: 2 }, reply: 'Then every touch carries his name.' },
          { label: 'For everyone here.', effect: { technique: 4, flair: 2 }, reply: 'Then don\'t forget to pass. A rhythm is shared.' }
        ]
      },
      { ...N, bg: 'beach_sunset', text: 'Zefa claps twice. The beach goes quiet. Somewhere, a drum answers.' },
      { bg: 'beach_sunset', speaker: 'DONA ZEFA', role: 'COACH · BARRA DO SOL', portrait: 'zefa', expr: 'intense', text: 'BARRA DO SOL! Let\'s show them how the sand dances.' },
      { type: 'match' }
    ],
    training: {
      eyebrow: 'TOUCH & RHYTHM',
      title: 'SAND KEEPY-UPPY',
      text: 'Tap the ball as the needle crosses the sand-gold zone. Eight touches. Every two clean touches adds a match bonus.',
      scene: 'beach_sunset',
      stat: 'technique',
      attempts: 8,
      speed: 1.05,
      zone: 0.26
    },
    match: {
      id: 'falcoes',
      arena: 'street',
      competition: 'BEACH CUP · FINAL',
      venue: 'PRAIA DO FAROL · 17:40',
      halfSeconds: 50,
      difficulty: 0.58,
      goldenGoal: true,
      home: {
        name: 'BARRA DO SOL', short: 'BARRA', abbr: 'BDS', color: '#ffc84a', accent: '#00a86b',
        stars: 2, gkRating: 52,
        lineup: [
          { name: 'BETO', num: 1, role: 'GK', pace: 46, technique: 44, power: 50 },
          { name: 'RUI', num: 2, role: 'DF', pace: 56, technique: 48, power: 58 },
          { name: 'IAGO', num: 3, role: 'DF', pace: 54, technique: 50, power: 60 },
          { name: 'ZECA', num: 5, role: 'MF', pace: 58, technique: 56, power: 52 },
          { name: 'DUDU', num: 8, role: 'MF', pace: 60, technique: 54, power: 54 },
          { name: 'CARLOS', num: 10, role: 'FW', isUser: true }
        ]
      },
      away: {
        name: 'FALCÕES DO MORRO', short: 'FALCÕES', abbr: 'FDM', color: '#ff5d6c', accent: '#1a1a24',
        stars: 2, gkRating: 48,
        lineup: [
          { name: 'CARECA', num: 1, role: 'GK', pace: 45, technique: 42, power: 48 },
          { name: 'TOCO', num: 2, role: 'DF', pace: 52, technique: 45, power: 56 },
          { name: 'BODE', num: 3, role: 'DF', pace: 50, technique: 46, power: 58 },
          { name: 'PIOLHO', num: 5, role: 'MF', pace: 55, technique: 50, power: 50 },
          { name: 'RATINHO', num: 7, role: 'MF', pace: 59, technique: 56, power: 50, portrait: 'ratinho' },
          { name: 'FORMIGA', num: 9, role: 'FW', pace: 57, technique: 50, power: 54 }
        ]
      },
      danger: 'RATINHO — quick, mouthy, and faster than he looks. Do not let him settle on the ball.',
      brief: 'Beach rules: no out of bounds, no excuses, and the whole neighbourhood is watching. Win to keep the pitch until Sunday.',
      scripts: [
        { minute: 4, speaker: 'ZEFA', text: 'Rhythm first, Carlinhos! Let the ball breathe.' },
        { minute: 22, speaker: 'RATINHO', text: 'Sand in your boots, beach boy? You\'re dancing alone!' },
        { minute: 38, speaker: 'ZEFA', text: 'Look up! Dudu is making the run. Trust the band.' }
      ],
      winQuote: 'The beach keeps its promise. The boy keeps his.',
      loseQuote: 'The Falcões dance on the sand tonight. The beach will wait for a rematch.'
    },
    post: [
      { ...N, bg: 'beach_sunset', text: 'The final whistle is swallowed by the sea.' },
      { bg: 'beach_sunset', speaker: 'DONA ZEFA', role: 'COACH · BARRA DO SOL', portrait: 'zefa', expr: 'smile', text: 'You passed the ball, Carlinhos. Twice! I almost fainted.' },
      { bg: 'beach_sunset', speaker: 'RATINHO', role: 'FALCÕES DO MORRO', portrait: 'ratinho', expr: 'grumpy', text: 'Lucky sand. Next time, I\'m bringing my cousin.' },
      { bg: 'beach_sunset', speaker: 'CARLOS', role: '11 YEARS OLD', portrait: 'carlos', expr: 'smile', text: 'Bring the whole family. It\'s a big beach.' },
      { ...N, bg: 'beach_sunset', text: 'A man in a linen suit steps over the touchline. His shoes are too clean for Salvador.' },
      { bg: 'beach_sunset', speaker: 'SR. ALMEIDA', role: 'SCOUT · AURORA FC', portrait: 'almeida', expr: 'neutral', text: 'Carlos Santana. I represent Aurora FC, São Paulo. I have watched you for three days.' },
      { bg: 'beach_sunset', speaker: 'CARLOS', role: '11 YEARS OLD', portrait: 'carlos', expr: 'surprised', text: 'Three days? I would have waved.' },
      { bg: 'beach_sunset', speaker: 'SR. ALMEIDA', role: 'SCOUT · AURORA FC', portrait: 'almeida', expr: 'stern', text: 'I don\'t need waves. I need answers. Can you play without the beach? Without the sun? Without your father\'s fish?' },
      { bg: 'beach_sunset', speaker: 'JOAQUIM', role: 'CARLOS\'S FATHER', portrait: 'joaquim', expr: 'intense', text: 'He can play anywhere. The beach goes with him.' },
      {
        type: 'choice',
        bg: 'beach_sunset',
        prompt: 'The scout waits. What does Carlos say?',
        options: [
          { label: 'I\'m ready.', effect: { power: 3 }, reply: 'Good. Ready is the only luggage that fits.' },
          { label: 'Only if my father says yes.', effect: { technique: 3 }, reply: 'Joaquim laughs. "He asks permission to chase the world. That is why he will catch it."' },
          { label: 'Only if I can wear number ten.', effect: { flair: 4 }, reply: 'Almeida almost smiles. "The ten is earned. But I like your nerve."' }
        ]
      },
      { bg: 'beach_sunset', speaker: 'SR. ALMEIDA', role: 'SCOUT · AURORA FC', portrait: 'almeida', expr: 'neutral', text: 'A trial. One week. If the city eats you, I\'ll buy you a ticket home. No promises.' },
      { bg: 'beach_sunset', speaker: 'JOAQUIM', role: 'CARLOS\'S FATHER', portrait: 'joaquim', expr: 'soft', text: 'Take the beach with you, Carlinhos. And those boots.' },
      { ...N, bg: 'beach_night', text: 'That night, Carlos sleeps with the boots beside his pillow. In the morning, his feet hurt. He wears them anyway.' }
    ],
    complete: {
      copy: 'A scout saw a boy play. The boy saw a door open. The beach is still in his feet.',
      statLine: 'TECHNIQUE +2 · FLAIR +2'
    }
  },

  {
    id: 'the-trial',
    num: 2,
    title: 'THE TRIAL',
    pt: 'A PENEIRA',
    location: 'SÃO PAULO, SP',
    year: '1995',
    competition: 'COPA JUVENTUDE · SEMIFINAL',
    venue: 'ESTÁDIO AURORA · 15:00',
    baseStats: { pace: 74, technique: 78, power: 70, flair: 85 },
    pre: [
      { ...N, bg: 'street_day', text: 'São Paulo does not smell like salt. It smells like rain on concrete, diesel, and other people\'s dreams.' },
      { ...N, bg: 'street_day', text: 'Carlos steps off the bus with a cardboard suitcase, a pair of oversized boots, and a ball under his arm.' },
      { bg: 'street_day', speaker: 'CARLOS', role: '12 YEARS OLD', portrait: 'carlos', expr: 'neutral', text: 'The boots are still too big. The city is bigger.' },
      { bg: 'locker', speaker: 'SR. ALMEIDA', role: 'SCOUT · AURORA FC', portrait: 'almeida', expr: 'neutral', text: 'Aurora FC. Under-17s. Coach Vidal has made three professionals and buried twice as many egos.' },
      { bg: 'locker', speaker: 'MESTRE VIDAL', role: 'COACH · AURORA FC', portrait: 'vidal', expr: 'stern', text: 'So. The beach boy. Show me what the sand taught you.' },
      { ...N, bg: 'locker', text: 'Carlos flicks the ball behind his heel, spins, and finds the ball gone. A boy with a blue jersey is already walking away with it.' },
      { bg: 'locker', speaker: 'NANDO', role: 'AURORA FC · NUMBER 7', portrait: 'nando', expr: 'smirk', text: 'Cute. In São Paulo, we also play defense.' },
      { bg: 'locker', speaker: 'CARLOS', role: '12 YEARS OLD', portrait: 'carlos', expr: 'smirk', text: 'Then you\'ll love the part where I go past you.' },
      { bg: 'locker', speaker: 'NANDO', role: 'AURORA FC · NUMBER 7', portrait: 'nando', expr: 'grumpy', text: 'Another showboat. Great.' },
      { bg: 'locker', speaker: 'MESTRE VIDAL', role: 'COACH · AURORA FC', portrait: 'vidal', expr: 'intense', text: 'Enough. Magic without a plan is just a circus. You want the ten? Earn the pass.' },
      {
        type: 'choice',
        bg: 'locker',
        prompt: 'How does Carlos answer the coach?',
        options: [
          { label: 'Teach me the plan.', effect: { technique: 4 }, reply: 'Vidal nods once. "First sensible thing you\'ve said all morning."' },
          { label: 'I\'ll make my own plan.', effect: { flair: 5 }, reply: 'Vidal\'s eyebrow climbs. "Then you\'d better be a genius. Or very fast."' },
          { label: 'Let\'s build one together.', effect: { technique: 3, power: 2 }, reply: 'Nando looks up. It is the first time the beach boy has looked at the team instead of the ball.' }
        ]
      },
      { ...N, bg: 'street_day', text: 'That night, Carlos practices passes against a wall until the streetlights blink off.' },
      { bg: 'street_day', speaker: 'DONA ZEFA', role: 'LETTER FROM SALVADOR', portrait: 'zefa', expr: 'soft', text: 'A ball is a drum, menino. But a team is the whole band. And a boy without a band is just noise.' },
      { bg: 'locker', speaker: 'MESTRE VIDAL', role: 'COACH · AURORA FC', portrait: 'vidal', expr: 'intense', text: 'Copa Juventude semifinal. Rojo Juniors. Argentina. They have Mateo Rojas. The Butcher of the Box.' },
      { bg: 'locker', speaker: 'NANDO', role: 'AURORA FC · NUMBER 7', portrait: 'nando', expr: 'smirk', text: 'He has broken prettier ankles than yours.' },
      { bg: 'locker', speaker: 'CARLOS', role: '12 YEARS OLD', portrait: 'carlos', expr: 'smirk', text: 'If I\'m scared, I\'ll pass. Actually... pass anyway.' },
      { bg: 'locker', speaker: 'NANDO', role: 'AURORA FC · NUMBER 7', portrait: 'nando', expr: 'smile', text: 'Deal. But when you pass, you\'d better run.' },
      { type: 'match' }
    ],
    training: {
      eyebrow: 'TOUCH & TEMPO',
      title: 'CAGE RONDO',
      text: 'The cage court is smaller, the ball is faster. Keep the rhythm for eight touches. Every two clean touches adds a match bonus.',
      scene: 'street_day',
      stat: 'technique',
      attempts: 8,
      speed: 1.3,
      zone: 0.23
    },
    match: {
      id: 'rojo',
      arena: 'club',
      competition: 'COPA JUVENTUDE · SEMIFINAL',
      venue: 'ESTÁDIO AURORA · 15:00',
      halfSeconds: 55,
      difficulty: 0.74,
      goldenGoal: true,
      home: {
        name: 'AURORA FC', short: 'AURORA', abbr: 'AUR', color: '#3aa7ff', accent: '#f7e8c8',
        stars: 3, gkRating: 64,
        lineup: [
          { name: 'CÉSAR', num: 1, role: 'GK', pace: 58, technique: 58, power: 64 },
          { name: 'LÉO', num: 2, role: 'DF', pace: 68, technique: 64, power: 70 },
          { name: 'IAGO', num: 3, role: 'DF', pace: 66, technique: 62, power: 72 },
          { name: 'NANDO', num: 7, role: 'MF', pace: 76, technique: 78, power: 68, portrait: 'nando' },
          { name: 'TICO', num: 8, role: 'MF', pace: 70, technique: 72, power: 66 },
          { name: 'CARLOS', num: 10, role: 'FW', isUser: true }
        ]
      },
      away: {
        name: 'ROJO JUNIORS', short: 'ROJO', abbr: 'ROJ', color: '#ff5d6c', accent: '#1a1a24',
        stars: 3, gkRating: 62,
        lineup: [
          { name: 'VARGAS', num: 1, role: 'GK', pace: 56, technique: 58, power: 64 },
          { name: 'ROJAS', num: 4, role: 'DF', pace: 72, technique: 74, power: 82, portrait: 'rojas' },
          { name: 'MOLINA', num: 3, role: 'DF', pace: 68, technique: 66, power: 74 },
          { name: 'CRUZ', num: 5, role: 'MF', pace: 70, technique: 72, power: 72 },
          { name: 'PEREZ', num: 8, role: 'MF', pace: 74, technique: 76, power: 68 },
          { name: 'TOLEDO', num: 9, role: 'FW', pace: 78, technique: 76, power: 76 }
        ]
      },
      danger: 'MATEO ROJAS — a wall with a temper. He wins the ball and your lunch money. Do not dribble into him twice.',
      brief: 'Aurora\'s first semifinal in nine years. Rojas will press high and hit on the break. Survive the first storm, then make the ball sing.',
      specials: ['samba'],
      scripts: [
        { minute: 5, speaker: 'VIDAL', text: 'Keep your shape! Let them chase the ball, not your shadows.' },
        { minute: 15, speaker: 'NANDO', text: 'Oi, showboat! When you\'re surrounded, I\'m open. Try the GOLDEN COMBI!', unlock: 'combi' },
        { minute: 31, speaker: 'VIDAL', text: 'You\'ve been hiding it all week. Show them the SANTANA ROTATION!', unlock: 'rotation' },
        { minute: 44, speaker: 'ROJAS', text: 'You dance pretty, Santana. Let\'s see you dance through me.' }
      ],
      winQuote: 'The showboat learned the band. The band learned the show.',
      loseQuote: 'Rojas owns the box tonight. The Copa will have to wait for another dance.'
    },
    post: [
      { ...N, bg: 'stadium_day', text: 'Rojas lies on the grass, staring at the sky. He is not hurt. He is confused.' },
      { bg: 'stadium_day', speaker: 'MATEO ROJAS', role: 'ROJO JUNIORS', portrait: 'rojas', expr: 'surprised', text: 'You... you passed. Everyone said you were selfish.' },
      { bg: 'stadium_day', speaker: 'CARLOS', role: '13 YEARS OLD', portrait: 'carlos', expr: 'smile', text: 'I\'m full of surprises.' },
      { bg: 'stadium_day', speaker: 'NANDO', role: 'AURORA FC · NUMBER 7', portrait: 'nando', expr: 'smirk', text: 'Don\'t get used to it. He only passed because I was open.' },
      { bg: 'stadium_day', speaker: 'CARLOS', role: '13 YEARS OLD', portrait: 'carlos', expr: 'smile', text: 'You were open because I passed.' },
      { bg: 'stadium_day', speaker: 'NANDO', role: 'AURORA FC · NUMBER 7', portrait: 'nando', expr: 'smile', text: 'Same thing.' },
      { ...N, bg: 'stadium_day', text: 'Nando offers a hand. Carlos takes it. Somewhere in the stand, a drum begins.' },
      { bg: 'locker', speaker: 'MESTRE VIDAL', role: 'COACH · AURORA FC', portrait: 'vidal', expr: 'soft', text: 'Today you were not a soloist. You were the rhythm section. The whole band heard you.' },
      { ...N, bg: 'locker', text: 'The club president walks in with a fax and the expression of a man holding a live fish.' },
      { bg: 'locker', speaker: 'SR. ALMEIDA', role: 'SCOUT · AURORA FC', portrait: 'almeida', expr: 'intense', text: 'Brazil Under-20. The World Youth final. Tokyo. Against Japan. Against Tsubasa Ozora.' },
      { bg: 'locker', speaker: 'CARLOS', role: '13 YEARS OLD', portrait: 'carlos', expr: 'surprised', text: 'Tsubasa? The boy who bends the ball like a question mark?' },
      { bg: 'locker', speaker: 'SR. ALMEIDA', role: 'SCOUT · AURORA FC', portrait: 'almeida', expr: 'neutral', text: 'The same. He asked about you by name.' },
      { bg: 'locker', speaker: 'CARLOS', role: '13 YEARS OLD', portrait: 'carlos', expr: 'intense', text: 'Then I should answer in person.' },
      {
        type: 'choice',
        bg: 'locker',
        prompt: 'What will Carlos take to Tokyo?',
        options: [
          { label: 'The beach.', effect: { flair: 4 }, reply: 'Almeida sighs. "Of course. Try not to get sand in the trophy."' },
          { label: 'My father\'s boots.', effect: { power: 4 }, reply: 'Vidal looks at the old leather. "They\'ve got one more story in them."' },
          { label: 'My teammates.', effect: { technique: 3, power: 2 }, reply: 'Nando grins. "Finally. A luggage that talks back."' }
        ]
      },
      { bg: 'home', speaker: 'JOAQUIM', role: 'ON THE PHONE', portrait: 'joaquim', expr: 'soft', text: 'I sold the fish cart. I\'m coming to watch. Don\'t cry. I\'ll cry enough for both of us.' },
      { ...N, bg: 'home', text: 'Carlos looks at the boots. They finally fit.' }
    ],
    complete: {
      copy: 'The showboat learned the band. The band learned the show. Tokyo is calling.',
      statLine: 'TECHNIQUE +3 · POWER +2'
    }
  },

  {
    id: 'world-stage',
    num: 3,
    title: 'THE WORLD STAGE',
    pt: 'O PALCO DO MUNDO',
    location: 'TOKYO, JAPAN',
    year: '1996',
    competition: 'WORLD YOUTH · FINAL',
    venue: 'TOKYO NATIONAL STADIUM · 20:00',
    baseStats: { pace: 86, technique: 93, power: 84, flair: 97 },
    pre: [
      { ...N, bg: 'stadium_night', text: 'Sixty thousand people. One ball. The night smells like rain, popcorn, and destiny.' },
      { ...N, bg: 'tunnel', text: 'In the tunnel, Carlos hears a drum. It is not a drum. It is his own heart.' },
      { bg: 'tunnel', speaker: 'TSUBASA OZORA', role: 'JAPAN · NUMBER 10', portrait: 'tsubasa', expr: 'neutral', text: 'Carlos Santana. I have watched every match. You play like the ball is singing.' },
      { bg: 'tunnel', speaker: 'CARLOS', role: '14 YEARS OLD', portrait: 'carlos', expr: 'smirk', text: 'And you play like it owes you an answer.' },
      { bg: 'tunnel', speaker: 'TSUBASA OZORA', role: 'JAPAN · NUMBER 10', portrait: 'tsubasa', expr: 'intense', text: 'Tonight, I want an answer.' },
      { bg: 'tunnel', speaker: 'CARLOS', role: '14 YEARS OLD', portrait: 'carlos', expr: 'intense', text: 'Then listen.' },
      { ...N, bg: 'stadium_night', text: 'In the stands, Joaquim holds a tiny Brazilian flag and a paper bag he is pretending is not for crying into.' },
      { bg: 'stadium_night', speaker: 'JOAQUIM', role: 'IN THE STANDS', portrait: 'joaquim', expr: 'smile', text: 'That\'s my son! The one with the boots!' },
      { bg: 'stadium_night', speaker: 'DONA ZEFA', role: 'ON THE RADIO', portrait: 'zefa', expr: 'soft', text: 'Remember, menino: rhythm first. Then the thunder.' },
      {
        type: 'choice',
        bg: 'stadium_night',
        prompt: 'What will Carlos show the world?',
        options: [
          { label: 'The joy of Salvador.', effect: { flair: 5 }, reply: 'Then the world had better stretch. Joy takes up space.' },
          { label: 'The strength of my family.', effect: { power: 5 }, reply: 'Every muscle remembers who carried him here.' },
          { label: 'The future of football.', effect: { technique: 5 }, reply: 'A dangerous promise. The ball seems to agree.' }
        ]
      },
      { ...N, bg: 'stadium_night', text: 'The referee checks his watch. The floodlights lean in.' },
      { bg: 'stadium_night', speaker: 'TSUBASA OZORA', role: 'JAPAN · NUMBER 10', portrait: 'tsubasa', expr: 'smile', text: 'Santana. Let\'s make it unforgettable.' },
      { bg: 'stadium_night', speaker: 'CARLOS', role: '14 YEARS OLD', portrait: 'carlos', expr: 'smile', text: 'I was planning to. Try to keep up.' },
      { type: 'match' }
    ],
    training: {
      eyebrow: 'TOUCH & THUNDER',
      title: 'FLOODLIGHT JUGGLE',
      text: 'The final warm-up. The lights are bright, the ball is quick. Eight touches. Every two clean touches adds a match bonus.',
      scene: 'stadium_night',
      stat: 'flair',
      attempts: 8,
      speed: 1.55,
      zone: 0.2
    },
    match: {
      id: 'japan',
      arena: 'final',
      competition: 'WORLD YOUTH · FINAL',
      venue: 'TOKYO NATIONAL STADIUM · 20:00',
      halfSeconds: 60,
      difficulty: 0.9,
      goldenGoal: true,
      home: {
        name: 'BRASIL', short: 'BRASIL', abbr: 'BRA', color: '#ffc84a', accent: '#00a86b',
        stars: 4, gkRating: 70,
        lineup: [
          { name: 'BETO', num: 1, role: 'GK', pace: 62, technique: 64, power: 72 },
          { name: 'LÉO', num: 2, role: 'DF', pace: 76, technique: 72, power: 78 },
          { name: 'RUI', num: 3, role: 'DF', pace: 74, technique: 70, power: 80 },
          { name: 'NANDO', num: 7, role: 'MF', pace: 84, technique: 86, power: 76, portrait: 'nando' },
          { name: 'TICO', num: 8, role: 'MF', pace: 80, technique: 82, power: 74 },
          { name: 'CARLOS', num: 10, role: 'FW', isUser: true }
        ]
      },
      away: {
        name: 'JAPÃO', short: 'JAPÃO', abbr: 'JPN', color: '#3aa7ff', accent: '#f7e8c8',
        stars: 5, gkRating: 82,
        lineup: [
          { name: 'GENZO', num: 1, role: 'GK', pace: 72, technique: 78, power: 84 },
          { name: 'ISHIZAKI', num: 2, role: 'DF', pace: 72, technique: 68, power: 80 },
          { name: 'MISUGI', num: 4, role: 'DF', pace: 80, technique: 82, power: 76, portrait: 'misugi' },
          { name: 'MISAKI', num: 8, role: 'MF', pace: 84, technique: 88, power: 72 },
          { name: 'HYUGA', num: 9, role: 'FW', pace: 86, technique: 84, power: 94, portrait: 'hyuga' },
          { name: 'TSUBASA', num: 10, role: 'FW', pace: 92, technique: 96, power: 88, portrait: 'tsubasa' }
        ]
      },
      danger: 'TSUBASA OZORA — the whole pitch is his orchestra. He bends shots, finds passes that do not exist, and never stops believing. And Genzo in goal is a second wall.',
      brief: 'The World Youth final. Win it with the team, or win it alone—but you cannot win it without a little samba. Tsubasa will punish every loose touch.',
      specials: ['samba', 'combi', 'rotation'],
      scripts: [
        { minute: 3, speaker: 'TSUBASA', text: 'Show me something I can\'t predict, Santana.' },
        { minute: 28, speaker: 'NANDO', text: 'They\'re doubling you. Use the GOLDEN COMBI and I\'ll find you!' },
        { minute: 45, speaker: 'JOAQUIM', text: 'That\'s my boy! The one with the boots! Nobody takes the beach out of him!' },
        { minute: 66, type: 'drive', speaker: 'TSUBASA', text: 'Then let me answer you. DRIVE SHOT!' },
        { minute: 78, speaker: 'ZEFA', text: 'Rhythm first, menino. Then the thunder. Now BOTH!' }
      ],
      winQuote: 'From the sand to the world. The rhythm stays.',
      loseQuote: 'Tsubasa\'s answer lands first. The world will wait for the next verse.'
    },
    post: [
      { ...N, bg: 'stadium_night', text: 'The stadium is a hurricane of yellow.' },
      { bg: 'stadium_night', speaker: 'TSUBASA OZORA', role: 'JAPAN · NUMBER 10', portrait: 'tsubasa', expr: 'tired', text: 'You were... unpredictable. All of you.' },
      { bg: 'stadium_night', speaker: 'CARLOS', role: '14 YEARS OLD', portrait: 'carlos', expr: 'smile', text: 'That\'s the secret. There\'s no solo. Only samba.' },
      { bg: 'stadium_night', speaker: 'TSUBASA OZORA', role: 'JAPAN · NUMBER 10', portrait: 'tsubasa', expr: 'smile', text: 'Next time, I\'ll bring more friends.' },
      { bg: 'stadium_night', speaker: 'CARLOS', role: '14 YEARS OLD', portrait: 'carlos', expr: 'smirk', text: 'Next time, bring better ones.' },
      { ...N, bg: 'stadium_night', text: 'Carlos climbs the podium. The trophy is lighter than he expected. The noise is heavier.' },
      { bg: 'stadium_night', speaker: 'JOAQUIM', role: 'IN THE STANDS', portrait: 'joaquim', expr: 'crying', text: 'Your mother would have screamed so loud the fish would have jumped out of the sea.' },
      { bg: 'stadium_night', speaker: 'CARLOS', role: '14 YEARS OLD', portrait: 'carlos', expr: 'soft', text: 'Then let\'s make enough noise for her to hear.' },
      { ...N, bg: 'beach_dawn', text: 'Months later, on Praia do Farol, a boy with no boots asks for a trick.' },
      { bg: 'beach_dawn', speaker: 'CARLOS', role: 'THE NUMBER 10', portrait: 'carlos', expr: 'smile', text: 'First lesson. The ball is a drum. Listen.' },
      { ...N, bg: 'beach_dawn', text: 'Carlos passes the boots to the boy. They are still one size too big. He\'ll grow.' },
      { ...N, bg: 'beach_dawn', text: 'Some stories end with a trophy. This one ends with a kickoff.' }
    ],
    complete: {
      copy: 'From the sand to the world. The rhythm stays.',
      statLine: 'THE STORY IS COMPLETE'
    }
  }
];

/* Additional portraits / characters used by the renderer. */
export const CHARACTERS = {
  carlos:   { name: 'CARLOS SANTANA', role: 'O CAMISA 10', skin: '#7a4a2b', hair: '#17100e', jersey: '#ffc84a', accent: '#00a86b' },
  joaquim:  { name: 'JOAQUIM SANTANA', role: 'FATHER', skin: '#6b3f24', hair: '#2b1a10', jersey: '#2e6b5e', accent: '#d9c7a3' },
  zefa:     { name: 'DONA ZEFA', role: 'COACH', skin: '#5a3520', hair: '#1a120c', jersey: '#ff7a3c', accent: '#f2e3c0' },
  ratinho:  { name: 'RATINHO', role: 'FALCÕES', skin: '#8a5a35', hair: '#2a1a12', jersey: '#ff5d6c', accent: '#1a1a24' },
  almeida:  { name: 'SR. ALMEIDA', role: 'SCOUT', skin: '#c78e63', hair: '#bdb3a5', jersey: '#2b3a55', accent: '#d9c7a3' },
  nando:    { name: 'NANDO', role: 'AURORA FC', skin: '#a06a42', hair: '#1b1410', jersey: '#1d5fd1', accent: '#f7e8c8' },
  vidal:    { name: 'MESTRE VIDAL', role: 'COACH', skin: '#8a5a35', hair: '#241a14', jersey: '#2e6b5e', accent: '#f7e8c8' },
  rojas:    { name: 'MATEO ROJAS', role: 'ROJO JUNIORS', skin: '#b07a52', hair: '#2a1a12', jersey: '#d21f3c', accent: '#f7e8c8' },
  tsubasa:  { name: 'TSUBASA OZORA', role: 'JAPAN', skin: '#e0b48a', hair: '#1a1a24', jersey: '#1f4fd1', accent: '#f7e8c8' },
  misugi:   { name: 'JUN MISUGI', role: 'JAPAN', skin: '#d7a77c', hair: '#201a1a', jersey: '#1f4fd1', accent: '#f7e8c8' },
  hyuga:    { name: 'KOJIRO HYUGA', role: 'JAPAN', skin: '#c98f62', hair: '#17131a', jersey: '#1f4fd1', accent: '#f7e8c8' }
};
