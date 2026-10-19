import * as fs from 'fs';
import * as path from 'path';
import { Unit, Exercise, TranslateExercise, MatchExercise, ContextExercise, BossExercise, Lesson } from '../src/types';

// Helper to parse simple CSV
function parseCsv(content: string): Array<{ unit: number; phrase: string; plain: string; snark: string }> {
  const lines = content.trim().split('\n');
  const rows: Array<{ unit: number; phrase: string; plain: string; snark: string }> = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV line with quoted fields
    const matches: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        matches.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    matches.push(cur.trim());

    if (matches.length >= 4) {
      rows.push({
        unit: parseInt(matches[0], 10),
        phrase: matches[1].replace(/^"|"$/g, '').trim(),
        plain: matches[2].replace(/^"|"$/g, '').trim(),
        snark: matches[3].replace(/^"|"$/g, '').trim(),
      });
    }
  }
  return rows;
}

// Distractor words for wordbank tiles
const DISTRACTORS: Record<number, string[]> = {
  1: ['immediately', 'never', 'secretly', 'angry', 'bonus', 'loudly', 'fire', 'tomorrow'],
  2: ['carefully', 'yelled', 'regret', 'forever', 'coffee', 'manager', 'ignored', 'lawyer'],
  3: ['promotion', 'raise', 'easy', 'relax', 'failure', 'quit', 'vacation', 'fired'],
  4: ['sad', 'bored', 'unemployed', 'crying', 'modest', 'cheap', 'ordinary', 'zero'],
};

// Corporate senders by unit
const SENDERS = [
  { name: 'Brad from BizDev', role: 'Head of Partnerships', channel: 'slack' as const },
  { name: 'Linda from HR', role: 'Chief Culture Officer', channel: 'email' as const },
  { name: 'Chadwick (VP)', role: 'SVP of Synergies', channel: 'meeting' as const },
  { name: 'Chloe (Product Lead)', role: 'Senior PM', channel: 'slack' as const },
  { name: 'Todd (Strategy)', role: 'Managing Director', channel: 'email' as const },
  { name: 'Brenda (Client Success)', role: 'Principal Escalations', channel: 'meeting' as const },
];

// Hand-crafted Context Scenarios per unit
const CONTEXT_SCENARIOS: Record<number, ContextExercise[]> = {
  1: [
    {
      id: 'ctx-1-1',
      type: 'context',
      channel: 'slack',
      sender: 'Brad from BizDev',
      senderRole: 'VP of Partnerships',
      email: 'Hey team, quick sync: let’s table the architectural refactor discussion, put database sharding in the parking lot, and double-click on Q4 deliverables instead.',
      options: [
        'He wants to deeply optimize the database architecture tonight.',
        'He wants to avoid technical problems and focus only on short-term sales targets.',
        'He is taking everyone to a literal parking lot for team bonding.',
        'He wants the engineers to build new database tables immediately.'
      ],
      answer: 1,
      why: "'Table' and 'parking lot' are corporate graveyard terms to shut down complex engineering work."
    },
    {
      id: 'ctx-1-2',
      type: 'context',
      channel: 'email',
      sender: 'Chadwick (VP of Strategy)',
      senderRole: 'SVP of Global Synergies',
      subject: 'Urgent: High-Altitude Alignment',
      email: 'Team, I have a hard stop at 2:00 PM for a bio break, but net-net we need a 30,000-foot view of why the pipeline is stalled. Who has bandwidth to drive this?',
      options: [
        'He is volunteering to do the deep technical investigation himself.',
        'He wants someone else to do the work while he leaves in 5 minutes.',
        'He is inviting everyone on an airplane ride at 30,000 feet.',
        'He is extending the meeting by two hours.'
      ],
      answer: 1,
      why: "A 'hard stop' combined with 'who has bandwidth' means 'assign someone else before I escape.'"
    },
    {
      id: 'ctx-1-3',
      type: 'context',
      channel: 'meeting',
      sender: 'Brenda (Operations)',
      senderRole: 'Director of Process',
      email: "Let's not boil the ocean here. What is the low-hanging fruit we can pluck before the board meeting so we can show we moved the needle?",
      options: [
        'She wants to solve the most difficult systemic problems first.',
        'She wants quick cosmetic fixes that look good on a slide deck.',
        'She wants to buy fresh fruit for the board members.',
        'She is advocating for ocean conservation.'
      ],
      answer: 1,
      why: "'Low-hanging fruit' means doing whatever takes 10 minutes so executives can brag to the board."
    }
  ],
  2: [
    {
      id: 'ctx-2-1',
      type: 'context',
      channel: 'email',
      sender: 'Todd (Client Relations)',
      senderRole: 'Account Manager',
      subject: 'Re: Project Timeline Delay',
      email: 'Per my last email, the revised milestone deck was attached on Tuesday. Bumping this to the top of your inbox. Please advise on how you wish to proceed.',
      options: [
        'Todd is politely asking if you are having a nice week.',
        'Todd is furious that you ignored his email and is creating a paper trail to blame you.',
        'Todd accidentally deleted the milestone deck and needs a new copy.',
        'Todd wants to collaborate in person over coffee.'
      ],
      answer: 1,
      why: "'Per my last email' + 'bumping this' is the corporate equivalent of slapping you with a glove."
    },
    {
      id: 'ctx-2-2',
      type: 'context',
      channel: 'email',
      sender: 'Linda (Legal & Compliance)',
      senderRole: 'Head of Legal',
      subject: 'FWD: Vendor Contract Liability',
      email: "Attaching for your visibility. I am looping in Dave from procurement, and per our offline conversation, taking myself off this thread. Thanks in advance!",
      options: [
        'Linda is deeply committed to managing this project personally.',
        'Linda sees a liability disaster, dumped it on Dave, and is running away.',
        'Linda forgot Dave’s email address.',
        'Linda is taking the whole team out for lunch.'
      ],
      answer: 1,
      why: "'Taking myself off this thread' after dumping a contract means 'this bomb will not detonate near me.'"
    },
    {
      id: 'ctx-2-3',
      type: 'context',
      channel: 'slack',
      sender: 'Chloe (Product)',
      senderRole: 'Group Product Manager',
      email: "Happy to discuss live! Correct me if I'm wrong, but wasn't the API contract signed off in Q1? Re-attaching with track changes for visibility.",
      options: [
        'Chloe is seeking feedback because she genuinely doubts her memory.',
        'Chloe is about to destroy your argument with timestamped evidence in a live call.',
        'Chloe wants to cancel the API contract entirely.',
        'Chloe is praising your thoughtful code design.'
      ],
      answer: 1,
      why: "'Correct me if I'm wrong' accompanied by track changes is a fatal checkmate."
    }
  ],
  3: [
    {
      id: 'ctx-3-1',
      type: 'context',
      channel: 'meeting',
      sender: 'Dave (Engineering Director)',
      senderRole: 'Director of Engineering',
      email: "In Q4, we have a real opportunity for growth. You've done well, but we need you to demonstrate more ownership, manage up, and be comfortable with ambiguity.",
      options: [
        'You are getting a massive raise and a promotion next week.',
        'You will be doing your manager’s job with no instructions and no additional pay.',
        'The company has well-defined roadmaps and clear documentation.',
        'Your manager wants to teach you how to write code.'
      ],
      answer: 1,
      why: "'Comfortable with ambiguity' means management has no plan, and 'ownership' means you carry the burden."
    },
    {
      id: 'ctx-3-2',
      type: 'context',
      channel: 'email',
      sender: 'Sarah (VP of People)',
      senderRole: 'VP of HR',
      subject: 'Annual Review Follow-up',
      email: "We value self-starters who wear multiple hats and lean in. To raise the bar on executive presence, let’s see you do more heavy lifting on the critical path.",
      options: [
        'You will get a personal assistant and an executive wardrobe allowance.',
        'You are expected to work unpaid overtime doing the tasks of three vacant positions.',
        'You need to hit the corporate gym and lift heavier weights.',
        'Your workload will be reduced by 50% to maintain work-life balance.'
      ],
      answer: 1,
      why: "'Wear multiple hats' is hiring code for 'we understaffed this team by 60%.'"
    },
    {
      id: 'ctx-3-3',
      type: 'context',
      channel: 'slack',
      sender: 'Marcus (Chief Architect)',
      senderRole: 'Staff Architect',
      email: "The previous microservice architecture hit bandwidth limits. We need an agile pivot to demonstrate synergistic alignment with our core competencies.",
      options: [
        'The architecture worked perfectly according to plan.',
        'The system collapsed and they are abandoning it while using buzzwords to save face.',
        'The team is going on a synchronized gymnastics retreat.',
        'Customers asked for fewer features.'
      ],
      answer: 1,
      why: "'Agile pivot' when infrastructure crashes is euphemistic surrender wrapped in consultants' jargon."
    }
  ],
  4: [
    {
      id: 'ctx-4-1',
      type: 'context',
      channel: 'slack',
      sender: 'Preston (Founder & Visionary)',
      senderRole: 'Founder / CEO',
      email: "Humbled and thrilled to announce our game-changing milestone! We disrupted the paradigm and supercharged growth to unlock unprecedented synergies. Agree?",
      options: [
        'The company cured a disease or accomplished something historic.',
        'They changed a button color from blue to indigo and need social media engagement.',
        'Preston is feeling humble and quiet about the accomplishment.',
        'The company is going bankrupt tomorrow.'
      ],
      answer: 1,
      why: "'Humbled and thrilled' combined with 'Agree?' is classic LinkedIn engagement bait for trivial updates."
    },
    {
      id: 'ctx-4-2',
      type: 'context',
      channel: 'email',
      sender: 'Elena (VP of Synergy)',
      senderRole: 'Executive VP',
      subject: 'Strategic Transformation & Next Chapter',
      email: "As part of our commitment to future-proof the business and optimize our north star metric, we are unlocking synergies by empowering team members to explore new external horizons.",
      options: [
        'Everyone is receiving an annual bonus and stock options.',
        'The company is laying off a large percentage of the workforce today.',
        'The company is launching an astronomy research telescope.',
        'Employees are being sent to Hawaii on a corporate retreat.'
      ],
      answer: 1,
      why: "'Unlocking synergies' and 'exploring new external horizons' are the ultimate corporate euphemisms for layoffs."
    },
    {
      id: 'ctx-4-3',
      type: 'context',
      channel: 'email',
      sender: 'Harrison (Angel Investor)',
      senderRole: 'Catalyst & Thought Partner',
      subject: 'Disrupting the Ecosystem from Zero to One',
      email: "I had coffee with a 10x engineer this morning. Here are 5 lessons from failure on why having a seat at the table will supercharge your holistic flywheel. Agree?",
      options: [
        'Harrison has valuable proprietary business secrets to share.',
        'Harrison is reciting hollow Silicon Valley clichés to harvest likes from strangers.',
        'Harrison bought a literal table and flywheel for his garage.',
        'Harrison is offering free engineering consulting.'
      ],
      answer: 1,
      why: "A post listing '5 lessons from failure' ending with 'Agree?' is pure algorithm optimization with zero substance."
    }
  ]
};

// Hand-tuned Ideas & Synonyms for Typed Translate Exercises (Units 3 and 4)
const TYPED_IDEAS: Record<string, { ideas: string[][]; labels: string[]; needed: number }> = {
  // Unit 3
  "Opportunity for growth": {
    ideas: [
      ['bad', 'terrible', 'failed', 'suck', 'poor', 'not good', 'mistake', 'flaw', 'weakness'],
      ['improve', 'better', 'fix', 'learn', 'work on']
    ],
    labels: ['acknowledging failure/poor performance', 'need for improvement'],
    needed: 1
  },
  "Needs to manage up": {
    ideas: [
      ['boss', 'manager', 'executive', 'supervisor'],
      ['job', 'work', 'babysit', 'help', 'do their job', 'manage', 'remind']
    ],
    labels: ['referencing the boss/manager', 'doing their work or babysitting them'],
    needed: 2
  },
  "Demonstrate more ownership": {
    ideas: [
      ['work overtime', 'overtime', 'extra hours', 'unpaid', 'weekend', 'more work', 'responsibility', 'blame'],
      ['no pay', 'without extra pay', 'no raise', 'no authority', 'take blame']
    ],
    labels: ['working more/overtime', 'without compensation or authority'],
    needed: 1
  },
  "Needs more executive presence": {
    ideas: [
      ['dress', 'clothes', 'suit', 'appearance', 'look better'],
      ['speak', 'confidence', 'unearned', 'sound confident', 'act confident', 'pretend']
    ],
    labels: ['dressing better/appearance', 'speaking with confidence/acting important'],
    needed: 1
  },
  "Lean in": {
    ideas: [
      ['sacrifice', 'give up', 'work late', 'work through', 'overtime', 'no life', 'personal life', 'work harder'],
      ['life', 'dinner', 'weekend', 'burnout']
    ],
    labels: ['sacrificing personal time', 'overworking/burning out'],
    needed: 1
  },
  "Growth mindset": {
    ideas: [
      ['complain', 'accept', 'endure', 'tolerate', 'deal with', 'smile'],
      ['unreasonable', 'demands', 'bad', 'scope creep', 'overwork', 'abuse', 'hardship']
    ],
    labels: ['accepting or not complaining', 'unreasonable corporate conditions'],
    needed: 1
  },
  "Wear multiple hats": {
    ideas: [
      ['three', 'multiple', 'many', 'several', 'two'],
      ['jobs', 'roles', 'work', 'understaffed', 'people', 'positions']
    ],
    labels: ['multiple roles/jobs', 'doing work of several people'],
    needed: 1
  },
  "Self-starter": {
    ideas: [
      ['no training', 'no help', 'figure it out', 'alone', 'on your own', 'nobody will help', 'sink or swim'],
      ['help', 'train', 'guide', 'support', 'documentation']
    ],
    labels: ['lack of training/support', 'working completely alone'],
    needed: 1
  },
  "Culture fit": {
    ideas: [
      ['beer', 'drink', 'like you', 'hang out', 'friends', 'homogeneous', 'same', 'club'],
      ['friday', 'social', 'party']
    ],
    labels: ['social conformity or drinking beer', 'arbitrary subjective likeness'],
    needed: 1
  },
  "Thought leadership": {
    ideas: [
      ['posting', 'platitudes', 'obvious', 'cliches', 'talk', 'linkedin', 'social media', 'hot air'],
      ['internet', 'online', 'pointless', 'pretentious']
    ],
    labels: ['posting obvious platitudes', 'online corporate posturing'],
    needed: 1
  },
  "Agile pivot": {
    ideas: [
      ['failed', 'disaster', 'scrapped', 'gave up', 'plan failed', 'ruined', 'broke', 'didn\'t work'],
      ['panic', 'start over', 'change direction', 'sudden change']
    ],
    labels: ['failure of the original plan', 'panicked sudden change'],
    needed: 1
  },
  "Heavy lifting": {
    ideas: [
      ['hard', 'actual', 'dirty', 'real', 'labor', 'work', 'unglamorous'],
      ['junior', 'delegated', 'underpaid', 'no credit', 'slaves']
    ],
    labels: ['hard unglamorous labor', 'delegated to junior staff'],
    needed: 1
  },
  "Comfortable with ambiguity": {
    ideas: [
      ['no idea', 'no plan', 'clueless', 'nobody knows', 'confused', 'chaos', 'no strategy'],
      ['management', 'leadership', 'bosses', 'direction']
    ],
    labels: ['total lack of direction or plan', 'management confusion'],
    needed: 1
  },
  "Critical path": {
    ideas: [
      ['late', 'delayed', 'fail', 'yelled at', 'fired', 'trouble', 'ruined'],
      ['important', 'dependency', 'crucial', 'cliff']
    ],
    labels: ['danger of delay or getting blamed', 'key bottleneck'],
    needed: 1
  },
  "Synergistic alignment": {
    ideas: [
      ['agreeing', 'nodding', 'yes', 'concur', 'obeying', 'sucking up'],
      ['boss', 'executive', 'highest paid', 'hippo', 'manager']
    ],
    labels: ['blindly agreeing/nodding', 'deferring to the highest paid boss'],
    needed: 1
  },
  "Value add": {
    ideas: [
      ['useful', 'helpful', 'worthwhile', 'good', 'effective', 'works'],
      ['actually', 'finally', 'for once', 'real']
    ],
    labels: ['actually being useful', 'delivering genuine value'],
    needed: 1
  },

  // Unit 4
  "Humbled and thrilled": {
    ideas: [
      ['bragging', 'arrogant', 'proud', 'showing off', 'flexing', 'boasting', 'not humble'],
      ['job', 'promotion', 'announcement', 'career', 'move']
    ],
    labels: ['shameless bragging/boasting', 'new job/career announcement'],
    needed: 1
  },
  "Excited to share my next chapter": {
    ideas: [
      ['new job', 'hired', 'quit', 'switched', 'moved', 'money', 'different company'],
      ['slightly more money', 'salary', 'better pay']
    ],
    labels: ['standard job change', 'leaving for more money'],
    needed: 1
  },
  "Agree?": {
    ideas: [
      ['comment', 'comments', 'engagement', 'algorithm', 'likes', 'boost', 'attention'],
      ['trap', 'bait', 'reach', 'traffic']
    ],
    labels: ['soliciting comments/engagement', 'manipulating social media algorithm'],
    needed: 1
  },
  "Open to new opportunities": {
    ideas: [
      ['laid off', 'fired', 'unemployed', 'quit', 'lost job', 'rage', 'let go'],
      ['looking', 'hire me', 'available', 'desperate']
    ],
    labels: ['laid off or unemployed', 'actively seeking employment'],
    needed: 1
  },
  "Thought partner": {
    ideas: [
      ['bounce', 'talk', 'buzzwords', 'nod', 'echo', 'chum', 'pal'],
      ['expensive', 'lunch', 'meetings', 'nodding']
    ],
    labels: ['person to echo buzzwords with', 'lunch companion who nods'],
    needed: 1
  },
  "Visionary catalyst": {
    ideas: [
      ['unemployed', 'consultant', 'pretentious', 'fake', 'made up', 'canva'],
      ['grandeur', 'buzzword', 'no real job', 'fluff']
    ],
    labels: ['unemployed consultant or fake title', 'meaningless grandiosity'],
    needed: 1
  },
  "Unlock synergies": {
    ideas: [
      ['lay off', 'fire', 'firing', 'layoffs', 'cut', 'downsize', 'redundant', 'eliminate'],
      ['jobs', 'people', 'departments', 'severance', 'overlap']
    ],
    labels: ['firing people / layoffs', 'cutting overlapping departments'],
    needed: 1
  },
  "Disrupt the paradigm": {
    ideas: [
      ['same', 'copy', 'subscription', 'rebrand', 'ordinary', 'nothing new'],
      ['expensive', 'software', 'saas', 'monthly fee']
    ],
    labels: ['selling the same thing with a subscription', 'rebranding mundane concepts'],
    needed: 1
  },
  "Game-changing milestone": {
    ideas: [
      ['minor', 'small', 'tiny', 'patch', 'tweak', 'insignificant', 'dropdown', 'button'],
      ['celebrating', 'hyped', 'exaggerating', 'overblown', 'nothing']
    ],
    labels: ['hyping a minor update', 'celebrating trivial changes'],
    needed: 1
  },
  "Lessons from failure": {
    ideas: [
      ['mistake', 'screwed up', 'genius', 'humblebrag', 'bragging', 'failure', 'justifying'],
      ['bullet points', 'post', 'pretending']
    ],
    labels: ['reframing a blunder into a genius lesson', 'humblebragging'],
    needed: 1
  },
  "Supercharge growth": {
    ideas: [
      ['spend', 'burn', 'waste', 'ads', 'venture capital', 'reckless', 'money'],
      ['runway', 'charts', 'top line', 'growth at all costs']
    ],
    labels: ['burning venture capital on ads', 'reckless runway consumption'],
    needed: 1
  },
  "Move fast and break things": {
    ideas: [
      ['buggy', 'bugs', 'broken', 'careless', 'sloppy', 'mess', 'support'],
      ['ship', 'code', 'rush', 'audit']
    ],
    labels: ['shipping buggy broken code', 'glorified carelessness'],
    needed: 1
  }
};

function main() {
  const csvPath = path.resolve(process.cwd(), 'src/data/phrases.csv');
  const bossesPath = path.resolve(process.cwd(), 'src/data/bosses.json');
  const outPath = path.resolve(process.cwd(), 'src/data/units.json');

  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const phrases = parseCsv(csvContent);

  const bosses: BossExercise[] = JSON.parse(fs.readFileSync(bossesPath, 'utf8')).map((b: any) => ({
    ...b,
    id: `boss-unit-${b.unitId}`,
    type: 'boss',
  }));

  const unitConfigs = [
    {
      id: 1,
      title: 'Unit 1: Meeting Survival',
      theme: 'Meeting Survival',
      description: 'Master the art of escaping syncs, parking conversations, and surviving 30,000-foot slide decks.',
      color: '#10b981', // emerald
      iconName: 'Users',
      lessonTitles: [
        'The Art of Postponement',
        'Meeting Escapes & Bio Breaks',
        'Alignment & High-Altitude Views',
      ],
      lessonDescriptions: [
        'Learn how to defer discussions until the end of time without looking lazy.',
        'Polite escape hatches, bio breaks, and fake hard stops to protect your sanity.',
        'High-elevation metaphors to hide the fact that nobody has looked at the details.',
      ]
    },
    {
      id: 2,
      title: 'Unit 2: Email Passive-Aggression',
      theme: 'Email Passive-Aggression',
      description: 'Decode weaponized pleasantries, lethal paper trails, and presumptive compliance.',
      color: '#3b82f6', // blue
      iconName: 'Mail',
      lessonTitles: [
        'The Opening Salvo',
        'Paper Trails & Blame Shifting',
        'Presumptive Compliance',
      ],
      lessonDescriptions: [
        'How to translate the razor-sharp blade of "per my last email" and friendly bumps.',
        'CC’ing the entire leadership chain to ensure mutual assured destruction.',
        'Saying "thanks in advance" so victims have zero legal room to say no.',
      ]
    },
    {
      id: 3,
      title: 'Unit 3: Performance Review Speak',
      theme: 'Performance Review Speak',
      description: 'Translate catastrophic feedback disguised as expansive horizons and self-starting opportunities.',
      color: '#8b5cf6', // purple
      iconName: 'TrendingUp',
      lessonTitles: [
        'Expanding Your Horizons',
        'Ownership & Unreasonable Demands',
        'Executive Presence & Pivoting',
      ],
      lessonDescriptions: [
        'Why "opportunity for growth" means you failed, and how to nod serenely.',
        'Taking ownership of things you cannot control while wearing multiple hats.',
        'Speaking with unearned authority and calling panicked roadmap collapses "pivots".',
      ]
    },
    {
      id: 4,
      title: 'Unit 4: LinkedIn Announcements',
      theme: 'LinkedIn Announcements',
      description: 'Dissect the humblebrag, visionary catalysts, and the existential question: Agree?',
      color: '#f59e0b', // amber
      iconName: 'Linkedin',
      lessonTitles: [
        'The Humblebrag Awakening',
        'Visionaries & Ecosystem Plays',
        'Agree? Paradigm Disruption',
      ],
      lessonDescriptions: [
        'How getting laid off transforms into a transcendent spiritual milestone.',
        'Consultants with Canva accounts preaching holistic synergy optimization.',
        'Ending completely absurd anecdotes with single-word algorithmic engagement traps.',
      ]
    }
  ];

  const units: Unit[] = [];

  for (const config of unitConfigs) {
    const unitPhrases = phrases.filter((p) => p.unit === config.id);
    const unitBoss = bosses.find((b) => b.unitId === config.id)!;
    const unitContexts = CONTEXT_SCENARIOS[config.id] || [];

    // Distribute phrases across 3 lessons (e.g. 7 phrases per lesson)
    const phrasesPerLesson = Math.floor(unitPhrases.length / 3);
    const lessons: Lesson[] = [];

    for (let l = 0; l < 3; l++) {
      const lessonPhrases = unitPhrases.slice(l * phrasesPerLesson, (l + 1) * phrasesPerLesson);
      const isWordBankMode = config.id <= 2; // Units 1 & 2 are wordbank, 3 & 4 are typed

      const exercises: Exercise[] = [];

      // 1. Four translation exercises from phrases
      const translationCount = Math.min(4, lessonPhrases.length);
      for (let t = 0; t < translationCount; t++) {
        const item = lessonPhrases[t];
        const senderObj = SENDERS[(l * 2 + t) % SENDERS.length];

        if (isWordBankMode) {
          // Word Bank Mode: Split plain English into words/phrases + add distractors
          // Model: plain English
          const cleanPlain = item.plain.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
          const words = cleanPlain.split(/\s+/).filter(Boolean);

          const distractors = DISTRACTORS[config.id] || ['randomly', 'never', 'secretly'];
          const pickedDistractors = [
            distractors[t % distractors.length],
            distractors[(t + 3) % distractors.length],
          ];

          // Combine tiles and shuffle deterministically
          const tiles = [...words, ...pickedDistractors].sort(() => 0.5 - ((t + 1) % 3));

          exercises.push({
            id: `u${config.id}-l${l + 1}-t${t + 1}`,
            type: 'translate',
            mode: 'wordbank',
            channel: senderObj.channel,
            sender: senderObj.name,
            senderRole: senderObj.role,
            text: item.phrase,
            model: item.plain,
            snark: item.snark,
            tiles,
            accepted: [words],
          } as TranslateExercise);
        } else {
          // Typed Mode: Tuned ideas and synonym groups
          const tuned = TYPED_IDEAS[item.phrase] || {
            ideas: [
              item.plain.toLowerCase().split(/\s+/).slice(0, 3),
              ['work', 'boss', 'team', 'company', 'problem']
            ],
            labels: ['core meaning', 'contextual implication'],
            needed: 1
          };

          exercises.push({
            id: `u${config.id}-l${l + 1}-t${t + 1}`,
            type: 'translate',
            mode: 'typed',
            channel: senderObj.channel,
            sender: senderObj.name,
            senderRole: senderObj.role,
            text: item.phrase,
            model: item.plain,
            snark: item.snark,
            ideas: tuned.ideas,
            ideaLabels: tuned.labels,
            needed: tuned.needed,
          } as TranslateExercise);
        }
      }

      // 2. One Match exercise (pairs 4 phrases with their meanings)
      const matchPool = lessonPhrases.slice(0, 4);
      const matchPairs: [string, string][] = matchPool.map((p) => [p.phrase, p.plain]);
      exercises.push({
        id: `u${config.id}-l${l + 1}-match`,
        type: 'match',
        pairs: matchPairs,
      } as MatchExercise);

      // 3. One Context exercise
      const contextEx = unitContexts[l] || unitContexts[0];
      exercises.push(contextEx);

      lessons.push({
        id: `unit-${config.id}-lesson-${l + 1}`,
        unitId: config.id,
        lessonIndex: l + 1,
        title: config.lessonTitles[l],
        description: config.lessonDescriptions[l],
        exercises, // 6 exercises per lesson!
      });
    }

    units.push({
      id: config.id,
      title: config.title,
      theme: config.theme,
      description: config.description,
      color: config.color,
      iconName: config.iconName,
      lessons,
      boss: unitBoss,
    });
  }

  fs.writeFileSync(outPath, JSON.stringify(units, null, 2), 'utf8');
  console.log(`Successfully generated ${units.length} units with ${units.reduce((acc, u) => acc + u.lessons.length, 0)} lessons into ${outPath}`);
}

main();
