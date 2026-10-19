# Circle Back: Project Plan

Working title. A course for learning to read corporate speak, built for the Steal//Remake hackathon (Neura AI Club).

## 1. Summary

The player is shown a line of corporate jargon, usually inside a fake message from a manager, HR or a client, and has to rewrite it in plain English. Lessons, morale, XP, streaks and ranks are wrapped around that one action in the style of a language-learning app.

The existing project being remixed is Duolingo (the format: path of units, short lessons, feedback after each answer, progression). Nothing from Duolingo's code, assets or branding is used. The subject matter, the answer checking and the progression theme are new.

## 2. Event constraints

From the Steal//Remake brief:

- The result must be a working project. A cosmetic reskin or a lazy copy does not count.
- Link the original project and explain what changed.
- No paid APIs or paid services may be required. AI is optional.
- Licences and attribution requirements must be respected.
- Suggested format is a 24-hour build followed by a short demo. Judges score originality, functionality, creative value and attribution.

## 3. Attribution

This section is the draft for the README.

**Original project.** Duolingo (https://www.duolingo.com). Used as inspiration for the interaction format only.

**What changed.**
- The subject is corporate speak instead of a foreign language.
- Answers are free-text or word-bank translations from jargon to plain English, checked by meaning rather than by exact string.
- Each unit ends with a reverse-direction boss battle: write the corporate version of a plain request under constraints, scored by a rule-based Jargon Meter.
- Hearts, streak and leagues are replaced by morale, uninterrupted-productivity days and a job-title ladder.
- The mascot, palette, icons and all content are original.

**Related work.** Kagi Translate added a "LinkedIn Speak" output language, and several web tools and a browser extension translate or highlight jargon. These convert text in a single step. This project is a structured course with progression.

**Licences to record before release.**
- `words/buzzwords` (MIT), if used for the Jargon Meter: https://github.com/words/buzzwords
- Font (Nunito, SIL OFL), or whichever font is chosen
- Any icon pack or sound effects, with source and licence

## 4. Scope

### 4.1 Core loop

1. The player opens a lesson from the path. A lesson has 6 questions.
2. Each question shows a message card (sender, channel, corporate text).
3. The player writes what it means in plain English. In units 1 and 2 this is a word bank. From unit 3 it is typed.
4. The player presses Check.
5. A feedback sheet shows pass or fail, the model translation, which ideas were matched and missed, and a one-line note on why people talk this way.
6. A wrong answer costs one morale point and the question is re-queued at the end of the lesson.
7. The lesson-complete screen shows XP earned, streak and rank progress.

### 4.2 Units

| Unit | Theme | Example input |
|---|---|---|
| 1 | Meeting Survival | "Let's take this offline and circle back when we have more bandwidth." |
| 2 | Email Passive-Aggression | "Per my last email, going forward please loop in all stakeholders." |
| 3 | Performance Review Speak | "You have a real opportunity to grow in stakeholder communication." |
| 4 | LinkedIn Announcements | "Humbled and thrilled to announce a new chapter. Agree?" |

Each unit has 3 lessons and one boss battle. Difficulty rises by input length: single phrase, one sentence with two phrases, a full short email (summarise what the sender wants), then a near-fully-jargon announcement.

### 4.3 Exercise types

- **Translate, word bank.** Tap tiles to build the plain-English sentence. Accepted answers are a fixed list.
- **Translate, typed.** Free text, checked by the idea matcher in section 7.
- **Match pairs.** Tap a phrase and its meaning.
- **Context.** Read a short email and choose what the sender actually wants.
- **Boss battle.** Reverse direction, scored by the Jargon Meter in section 8.

### 4.4 Game layer

- **Morale** replaces hearts. Starts at 5, minus 1 per wrong answer. At 0, a "Performance Improvement Plan" modal appears and the player must complete a review lesson, with no morale loss, to continue.
- **XP** per correct answer, with a bonus for a lesson with no mistakes.
- **Streak** is the number of consecutive local calendar days with at least one completed lesson. Labelled "Days of Uninterrupted Productivity".
- **Rank ladder:** Intern, Associate, Senior Associate, Manager, Director, VP, Chief Synergy Officer. Each promotion shows an announcement card written in LinkedIn style.
- **Mascot:** an original character (working name Gerald, an office ficus) with three SVG states: thriving, neutral, wilting. Wilting follows a missed day. His messages are written in corporate speak.
- **Persistence:** all progress is stored in `localStorage`. There is no backend.

### 4.5 Not in scope

- Accounts, sign-in, payments, a database or any server.
- Real multiplayer leaderboards. If a league table exists, it is a fixed list of fictional coworkers.
- Runtime calls to any AI model.
- Native mobile builds.

## 5. Stack

- Vite, React, TypeScript
- Plain CSS or Tailwind (team choice, decided in hour 0)
- State in a single store, persisted to `localStorage` under the key `circleback:v1`
- Vitest for unit tests of the answer checker and the Jargon Meter
- Deployment on Vercel, Netlify or GitHub Pages (free tier)

Persisted state shape:

```ts
type Progress = {
  xp: number;
  morale: number;            // 0-5
  streak: number;
  lastActiveDate: string;    // YYYY-MM-DD, local time
  completedLessons: string[];
  rank: number;              // index into the rank ladder
};
```

## 6. Content

### 6.1 Source of truth

A single `phrases.csv` with the columns:

```
unit, phrase, plain, snark
```

Target is about 80 phrases across the four units. Content may be drafted with an LLM before the event, but every row must be read and edited by a person. Joke quality and accuracy of meaning are part of what is being judged.

### 6.2 Generated and hand-written exercises

A script in `scripts/generate-exercises.ts` reads the CSV and produces match-pairs and context-free translate exercises, taking distractors from the same unit. The following are written by hand directly in JSON:

- Word-bank exercises (tiles and accepted answers)
- Context exercises (about 8)
- Typed-translate exercises that need tuned synonym lists
- Boss battles (4)

### 6.3 Exercise schema

```ts
type Exercise =
  | {
      type: 'translate';
      mode: 'wordbank' | 'typed';
      channel: 'email' | 'slack' | 'meeting';
      sender: string;
      text: string;              // the corporate message
      model: string;             // plain-English answer shown in feedback
      snark: string;
      // wordbank
      tiles?: string[];
      accepted?: string[][];     // each inner array is one accepted tile order
      // typed
      ideas?: string[][];        // each inner array is the synonyms for one required idea
      needed?: number;           // how many ideas must match to pass
    }
  | { type: 'match'; pairs: [string, string][] }
  | { type: 'context'; email: string; options: string[]; answer: number; why: string }
  | { type: 'boss'; prompt: string; bannedWords: string[]; minPhrases: number; passScore: number };
```

## 7. Typed-answer checking

Exact string matching would reject valid answers, so each question stores the ideas a good answer must contain.

Example:

```ts
{
  text: "Let's take this offline and circle back when we have more bandwidth.",
  ideas: [
    ['later', 'not now', 'another time', 'postpone', 'delay'],
    ['busy', 'no time', 'not a priority', 'low priority'],
  ],
  needed: 1,
  model: "I don't want to discuss this now, and I'm not promising we will.",
}
```

Procedure:

1. Lowercase the answer and strip punctuation.
2. For each idea group, check whether any synonym appears in the answer on a word boundary.
3. Pass if the number of matched groups is at least `needed`.
4. The feedback sheet lists the matched and missed ideas.

Known weakness: unusual wording can be marked wrong. Mitigations: word bank in units 1 and 2, generous synonym lists, and a test case file with several wrong-but-reasonable phrasings per question, run in CI.

## 8. Boss battle and Jargon Meter

The player gets a plain-English situation and writes a corporate-speak reply under constraints, for example: "Decline this meeting. Do not use the words no or can't. Use at least three phrases from the list."

Scoring (starting values, to be tuned during testing):

- +10 for each distinct jargon phrase found, capped at 60
- -15 for each banned plain word
- Minimum length of 15 words, otherwise the score is capped at 40
- Pass at 60 or above

The phrase list is the unit's rows from `phrases.csv`, optionally extended with entries from `words/buzzwords`. The meter shows which phrases were detected and which banned words were hit, so the scoring is visible to the player and to judges. Scoring lives in `src/lib/meter.ts` and is covered by unit tests.

## 9. Repository layout

```
.
  README.md
  plan.md
  LICENSE
  CREDITS.md
  scripts/
    generate-exercises.ts
  src/
    data/
      phrases.csv
      units.json            generated
      bosses.json           hand-written
    lib/
      checker.ts
      meter.ts
      store.ts
      ranks.ts
    components/
    screens/
  public/
```

## 10. Schedule

Two people. Person A owns the application code. Person B owns content, design and documentation. Hours are relative to the start of the build window.

| Hours | Person A | Person B |
|---|---|---|
| 0-1 | Repo, LICENSE, Vite scaffold, first deploy | Agree CSV format, start `phrases.csv`, sketch mascot |
| 1-4 | Vertical slice: one lesson, typed and word-bank translate, feedback sheet | 30 phrases, generator script |
| 4-8 | Match, context, path screen, lesson flow | Finish 80 phrases, write word-bank and context exercises, mascot SVGs |
| 8-12 | Morale and PIP modal, XP, streak, ranks, persistence | Palette, icons, promotion cards, mascot lines per event |
| 12-16 | Boss battle and Jargon Meter, checker tests | Write 4 boss prompts and banned-word lists, play-test answers against the checker |
| 16-20 | Mobile layout, keyboard and screen-reader basics, bug fixes | README, screenshots, proofread all content |
| 20-23 | Feature freeze, final deploy, smoke test on a clean browser profile | Demo script, backup screen recording |
| 23-24 | Submit | Submit |

Submit early. Do not use the final hour for new work.

## 11. Priorities

**Must have:** path screen, typed and word-bank translate, feedback sheet, morale and PIP modal, XP, streak, rank ladder, mascot (three states), persistence, deployment, README with the attribution section.

**Should have:** match pairs, context exercises, boss battles with the Jargon Meter, promotion cards.

**Could have:** placement test, shareable certificate or promotion image, text-to-speech reading of jargon, fictional league table, sound effects.

**Cut order if behind:** sound and speech, league table, certificate, placement test, context exercises, match pairs. Keep the boss battle, since it is the clearest difference from the original format.

## 12. Definition of done

- A new visitor can complete Unit 1 on a phone and a laptop without instructions.
- Refreshing the page keeps progress.
- Reaching zero morale shows the PIP modal and recovery works.
- A missed day resets the streak and changes the mascot state.
- Checker and meter tests pass.
- The deployed URL works in a clean browser profile.
- README contains the original project link, a list of changes, related work and licences.
- All third-party assets are listed in `CREDITS.md`.

## 13. Demo outline (about 2 minutes)

1. Open on a boss battle: type a corporate refusal and show the Jargon Meter scoring it.
2. Go back to Unit 1 and answer one translate question wrongly, then correctly, showing the feedback sheet.
3. Trigger the PIP modal.
4. Show a rank promotion card.
5. State the original project and what changed.

## 14. Risks

| Risk | Mitigation |
|---|---|
| Typed answers marked wrong unfairly | Word bank early, wide synonym lists, regression test file |
| Content takes longer than code | Start the CSV in hour 0 and keep generating exercises from it |
| Jokes read as filler | Proofread pass in hours 16-20, cut weak rows rather than keep them |
| Resemblance to Duolingo's branding | Original mascot, palette, name and icons; no use of their assets |
| Scope growth | Follow the cut order in section 11 |

## 15. Decisions for hour 0

- Final name
- Mascot name and look
- CSS approach (plain CSS or Tailwind)
- Font
- Hosting platform
- Who owns README and `CREDITS.md`
