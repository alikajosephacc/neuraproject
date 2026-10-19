import { RankInfo } from '../types';

export const RANKS: RankInfo[] = [
  {
    index: 0,
    title: 'Intern',
    minXp: 0,
    badge: '📎',
    blurb: 'Copies keys, un-jams the 3rd floor printer, and nods thoughtfully in All-Hands meetings.',
    linkedInAnnouncement: `🚀 I'm humbled and thrilled to announce that I've officially joined the corporate ecosystem as an Intern! 

Over the past 48 hours, I've mastered the art of holding an empty coffee mug while looking intensely focused on a spreadsheet. 

Key learnings so far:
1. "Let's circle back" means no.
2. The coffee machine has its own politics.
3. Replying "Noted with thanks" within 90 seconds unlocks executive visibility.

Grateful to my thought partners and mentors. The grind never sleeps! Agree? 🪴💼 #Gratitude #Hustle #CircleBack`
  },
  {
    index: 1,
    title: 'Associate',
    minXp: 120,
    badge: '💼',
    blurb: 'Learned to reply "Noted with thanks" within 4 minutes and schedule 15-minute syncs.',
    linkedInAnnouncement: `🎉 PROMOTION UPDATE: I'm delighted to share that I have been promoted to Associate! 

In this new chapter, I will be doubling down on calendar invites, driving cross-functional alignment, and ensuring action items are properly parked. 

Special shoutout to my skipped-level leadership for recognizing my passion for formatting Google Slides in corporate dark-mode. 

Onwards and upwards! Agree? 🚀📊 #CareerGrowth #Synergy #CorporateLadder`
  },
  {
    index: 2,
    title: 'Senior Associate',
    minXp: 300,
    badge: '📊',
    blurb: 'Can say "Let\'s take this offline" without blinking. Master of the 2-page executive summary.',
    linkedInAnnouncement: `🔥 EXCITED TO ANNOUNCE: Senior Associate status unlocked! 

What got me here? Relentless commitment to moving the needle without actually touching the machinery. 

Three things I've learned about leadership:
• If you can't solve it, put it in the parking lot.
• A 30,000-foot view hides all implementation fires.
• Never attend a Friday 4 PM meeting without a pre-planned "hard stop".

Thank you to my ecosystem of thought leaders. Agree? 🥂📈 #Leadership #ExecutivePresence #NextChapter`
  },
  {
    index: 3,
    title: 'Manager',
    minXp: 550,
    badge: '☕',
    blurb: 'Delegates all action items. Calendar is a solid wall of overlapping color-coded rectangles.',
    linkedInAnnouncement: `👔 HUMBLED & HONORED: Promoted to Manager! 

People ask me: "How do you manage bandwidth across high-velocity deliverables?" 

Simple: I delegate the heavy lifting and schedule a weekly cadence to inspect the optics. When an employee cries, I hand them a tissue branded with our core values and remind them of their growth mindset.

Here's to unlocking holistic synergies with my rockstar direct reports! 🚀🌱 #Management #CultureFirst #PeopleLeader`
  },
  {
    index: 4,
    title: 'Director',
    minXp: 850,
    badge: '🎯',
    blurb: 'Uses words like "omnichannel paradigm shift" unironically. Flies business class for 45-minute presentations.',
    linkedInAnnouncement: `🏆 MILESTONE: Stepping into the role of Director of Strategic Alignment! 

At this elevation (cruising altitude: 45,000 feet), words like "details" and "code" are mere abstractions. My focus is entirely on steering paradigm shifts, evangelizing high-leverage paradigms, and orchestrating board-level storytelling.

Remember: you don't build software. You curate transformational value ecosystems. Agree? 🌟🏢 #Visionary #EnterpriseStrategy #Disruption`
  },
  {
    index: 5,
    title: 'Vice President',
    minXp: 1250,
    badge: '💎',
    blurb: 'Hasn\'t opened a spreadsheet since 2019. Communicates exclusively via keynote slides and Slack emojis.',
    linkedInAnnouncement: `👑 THRILLED TO SHARE: Appointed Vice President of Global Synergy Operations! 

Today, as I reflect on my journey from Intern to the VP suite, I am filled with radical gratitude. I have replaced all verbal communication with thumbs-up reactions and enigmatic 4-word emails sent from my phone at 5:14 AM.

"A great leader doesn't boil the ocean. A great leader sells bottled ocean vapor to private equity." 

Agree? Drop a comment below! 👇🌐 #ExecutiveLeadership #Scale #BillionDollarMindset`
  },
  {
    index: 6,
    title: 'Chief Synergy Officer',
    minXp: 1750,
    badge: '👑',
    blurb: 'Transcendental corporate existence. Only speaks in buzzwords. Has ascended beyond physical deliverables.',
    linkedInAnnouncement: `🌌 ULTIMATE ASCENSION: Chief Synergy Officer (CSO)! 

I have reached the peak of the corporate mountain. I no longer have meetings; the company meets inside my consciousness. My presence in an All-Hands automatically boosts our stock valuation by 4.2%. 

Every breath is a paradigm shift. Every blink is a deep dive. Gerald the Ficus waters himself when I walk by.

Thank you to everyone who ever circled back with me. You made this synergy possible. Agree? 🪐✨ #ChiefSynergyOfficer #Ascended #CorporateGodMode`
  }
];

export function getRankForXp(xp: number): RankInfo {
  let currentRank = RANKS[0];
  for (const rank of RANKS) {
    if (xp >= rank.minXp) {
      currentRank = rank;
    } else {
      break;
    }
  }
  return currentRank;
}

export function getNextRank(currentRankIndex: number): RankInfo | null {
  if (currentRankIndex < RANKS.length - 1) {
    return RANKS[currentRankIndex + 1];
  }
  return null;
}
