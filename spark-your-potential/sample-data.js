/**
 * Sample Data - Sarah Mitchell
 * Demo questionnaire responses for testing the full flow
 */

const SARAH_MITCHELL = {
    name: "Sarah Mitchell",
    email: "sarah.mitchell@demo.com",

    // Questionnaire Responses
    outcomes: [
        "At Nike EMEA, I transformed 'safe' regional campaigns into award-winning work. The team went from just executing briefs to actually creating. We saw +40% engagement and won three industry awards that year. The creative director said he'd 'given up on this team' before I arrived.",

        "At Spotify, I rebuilt the in-house team's confidence after a brutal restructure. Half the team had been laid off, and the survivors were paralysed. I didn't just fix process — I rebuilt belief. We created a new brand platform from scratch that became the global template. Team retention went up 60%.",

        "Led the Barclays rebrand across 12 markets. Everyone said it couldn't be done — 12 markets, 12 opinions, zero alignment. I found the thread that connected all of them while making each market feel heard. It was their first joined-up campaign in 5 years.",

        "Rescued a failing pitch for a major automotive client. The team had lost confidence after two rounds of bad feedback. I came in with 48 hours to go, helped them find the story they'd buried, and we won the account. £4M annual revenue.",

        "Built a creative development programme at my last agency that's still running three years later. Started because I noticed junior creatives losing their spark within 18 months. Now it's their main retention tool."
    ],

    thread: "Connecting creativity with commercial reality — I see the spark in teams that others have written off, and I know how to fan it into something that actually ships. I think what makes it work is that I genuinely believe in people's potential before they do. I've always been drawn to the underdog projects, the 'difficult' teams, the briefs everyone else passed on. And somehow, those are the ones that end up winning awards.",

    intuition: "I can walk into a room and know within 5 minutes whether a team believes in what they're pitching. It's not about the slides or the words — it's something in the energy. And I can usually tell who's the one holding the real idea, even if they're not talking.",

    questions: "1. What would you make if no one was watching?\n2. What's the version of this you're secretly proud of but afraid to show?\n3. When was the last time this team surprised themselves?",

    noticing: "Body language shifts when people talk about work they actually care about. The moment someone's eyes light up versus when they're just performing enthusiasm. Who's protecting whom in the room. The idea that got mentioned once and then buried.",

    whatFeelsEasy: "Reading a room and knowing what's really going on beneath the surface. Getting people to share the idea they were afraid to mention. Finding the thread that connects seemingly unrelated projects. Turning a scattered brainstorm into a clear story in real time.",

    ofCourseMoments: "Of course — it's not about the campaign, it's about the team's belief in themselves. Of course — the best ideas are always hiding in plain sight, someone just needs to notice them. Of course — you can't unlock creativity without first unlocking trust.",

    clientBefore: "Stuck teams that have lost confidence. Brilliant people producing mediocre work because they've forgotten what they're capable of. Creative departments that have become execution factories. Organisations where politics has strangled the craft.",

    clientAfter: "Teams that surprise themselves with what they can produce. Creative confidence that sticks. Award-winning work from people who'd been written off. Retention rates that make HR actually smile.",

    problemMagnet: "I attract the 'difficult' briefs — the ones with political complexity, the teams everyone else has given up on, the turnaround situations. People bring me in when they've tried everything else and nothing's worked. Usually turns out the problem isn't the team at all.",

    howOthersSeeYou: "The person who sees potential others miss. Calm in chaos. Someone who makes people feel capable again. Annoyingly optimistic about 'impossible' situations, and annoyingly often right.",

    underestimatedAbility: "How quickly I can build trust with skeptical people. I think others see the outcomes but not how fast the shift happens. The Nike team went from hostile to collaborative in 3 weeks. That's not process — that's something else.",

    patternRecognised: "Creative Catalyst — I don't just run campaigns, I unlock creative potential in clients and internal teams that have forgotten what they're capable of.",

    transformationEnabled: "From stuck to surprising themselves. From executing to creating. From political to collaborative. From 'we've tried everything' to 'we didn't know we could do that'.",

    permission: "I'm giving myself permission to stop hiding behind 'strategy' and own that what I actually do is unlock belief. I'm a creative catalyst, not a process person with creative tendencies."
};

// Blueprint data derived from Sarah's responses
const SARAH_BLUEPRINT = {
    name: "Sarah Mitchell",
    core_pattern: "You don't just run campaigns. You unlock creative potential in clients and internal teams that have forgotten what they're capable of.",
    thread: "Connecting creativity with commercial reality",
    role_identity: "Creative Catalyst",
    what_you_do: "unlocks creative potential in teams",
    who_you_serve: "clients and teams that have forgotten what they're capable of",
    unique_approach: "connect creativity with commercial reality, believing in people's potential before they do",
    background: "15 years transforming 'stuck' creative teams at Nike, Spotify, Barclays and beyond",
    where_heading: "seeking roles where I can catalyse creative transformation at scale",
    positioning_statement: "I'm a Creative Catalyst who unlocks creative potential in teams that have forgotten what they're capable of. I connect creativity with commercial reality, believing in people's potential before they do. With 15 years transforming stuck teams at Nike, Spotify, Barclays and beyond, I'm seeking roles where I can catalyse creative transformation at scale.",
    evidence: [
        {
            company: "Nike EMEA",
            description: "Transformed 'safe' regional campaigns into award-winning work",
            result: "+40% engagement, 3 industry awards"
        },
        {
            company: "Spotify",
            description: "Rebuilt in-house team confidence post-restructure, created new brand platform",
            result: "60% increase in team retention, platform became global template"
        },
        {
            company: "Barclays",
            description: "Led rebrand across 12 markets, unified creative approach",
            result: "First joined-up campaign in 5 years"
        }
    ],
    belief_moments: [
        {
            title: "The Nike Creative Director",
            story: "\"I'd given up on this team. Sarah walked in and within 3 months they were producing the best work in EMEA. I still don't fully understand how she did it.\""
        },
        {
            title: "The Spotify Restructure",
            story: "After layoffs, the remaining team was paralysed. Sarah didn't just rebuild process — she rebuilt belief. The platform they created became the template for global."
        },
        {
            title: "The Barclays Brief",
            story: "12 markets, 12 opinions, zero alignment. Everyone said it couldn't be done. Sarah found the thread that connected all of them — and made each market feel heard."
        }
    ],
    red_flags: [
        { flag: "Execution only briefs", description: "No room to unlock potential" },
        { flag: "Revolving door culture", description: "Can't build belief in 3 months" },
        { flag: "Politics over craft", description: "Energy goes to wrong places" },
        { flag: "Safe as a compliment", description: "Creative potential dies here" },
        { flag: "No client access", description: "Can't catalyse through layers" }
    ],
    green_flags: [
        { flag: "Stuck teams", description: "Your superpower zone" },
        { flag: "Transformation briefs", description: "Real change, not polish" },
        { flag: "Direct client relationships", description: "Where magic happens" },
        { flag: "Long-term commitment", description: "Belief takes time" },
        { flag: "Creative ambition", description: "Something to unlock" }
    ]
};

module.exports = { SARAH_MITCHELL, SARAH_BLUEPRINT };
