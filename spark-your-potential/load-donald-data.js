/**
 * Load Donald Pirie's Complete Coaching Data
 * Run with: node load-donald-data.js
 *
 * This script loads Donald's full Spark Your Potential data including:
 * - User account
 * - Questionnaire responses
 * - Career blueprint with evidence
 */

require('dotenv').config();
const db = require('./db');

// Donald's questionnaire responses (from coaching sessions)
const DONALD_PIRIE = {
    name: "Donald Pirie",
    email: "donald@example.com",
    password: "SparkDonald2025!",

    // Questionnaire Responses - Evidence Collection
    outcomes: [
        "At UBS, I transformed how the bank saw itself - from cold institution to craftspeople who take pride in their work. The 'Banking is our Craft' positioning became the global template and fundamentally changed brand perception. The team said they'd never felt prouder of their work.",

        "At UPS EMEA, I united 25+ fragmented markets under a single strategic vision - 'United Problem Solvers'. Teams went from disconnected and lacking purpose to aligned and energised. We achieved +20% EMEA brand engagement and created a cohesive regional strategy for the first time.",

        "At Juniper Networks, I repositioned a legacy tech brand as a future-focused innovator with 'The Now Way to Network'. The challenge was differentiating in a crowded networking market - the fresh positioning was adopted across global markets and revitalised the brand.",

        "Led a complete brand transformation that connected craft and expertise to banking excellence at UBS. The campaign didn't just change messaging - it transformed how employees saw their own work and became a template for global communications.",

        "Built strategic positioning that united diverse EMEA teams at UPS under a shared identity. The problem wasn't strategy - it was that teams had lost connection to why their work matters. Once they rediscovered that, everything aligned."
    ],

    thread: "I find the authentic story organisations have forgotten about themselves, then make it undeniable. Every major success follows the same pattern: I arrive when an organisation is lost in complexity, ask different questions, and help them see who they really are. UBS, UPS, Juniper - different industries, same transformation.",

    intuition: "I knew within 15 minutes of meeting the UBS team that their problem wasn't strategy - it was that they'd lost connection to why banking matters. I can sense when organisations are disconnected from their own story, drowning in corporate speak.",

    questions: "What made you proud before all the complexity? When did you last feel excited about what you do? What would you say about this brand if no one from marketing was listening?",

    noticing: "The gap between what organisations say and what their people actually believe. The moment when corporate language takes over and authentic voice disappears. Who in the room still remembers why this work matters.",

    whatFeelsEasy: "Synthesising complex information into clear, compelling narratives. Finding the human truth inside corporate complexity. Connecting strategy to emotion in a way that actually sticks.",

    ofCourseMoments: "When the strategy lands, clients say 'that's exactly who we are - why couldn't we see it?' It's not about inventing something new - it's about revealing what was always there but invisible.",

    clientBefore: "Disconnected from their own story, drowning in corporate speak, strategies that don't stick. Teams that have lost connection to their purpose. Organisations where complexity has buried the simple truth.",

    clientAfter: "Clear on their unique value, aligned teams, strategies that people actually want to execute. Organisations that have rediscovered who they really are. From confusion to conviction.",

    problemMagnet: "I attract organisations that have lost their way - the ones drowning in complexity, the brands that sound like everyone else, the teams that have forgotten why their work matters. People bring me in when they need to rediscover their authentic story.",

    howOthersSeeYou: "The person who finds the story others missed. Someone who asks different questions. Calm clarity in strategic chaos. The one who helps you see what was always there.",

    underestimatedAbility: "Finding the human truth inside corporate complexity. I think others see the strategic outcomes but not how fundamental the shift is. It's not about better messaging - it's about reconnecting organisations to who they really are.",

    patternRecognised: "Transformational Brand Strategist - I don't just create campaigns, I help organisations rediscover their authentic story and make it undeniable.",

    transformationEnabled: "From confusion to conviction. From corporate speak to authentic voice. From fragmented teams to aligned purpose. From 'we've lost our way' to 'that's exactly who we are'.",

    permission: "I'm giving myself permission to claim what I actually do: I find the authentic story organisations have forgotten about themselves. I'm not just a strategist - I'm a catalyst for rediscovery."
};

// Donald's Career Blueprint
const DONALD_BLUEPRINT = {
    name: "Donald Pirie",
    core_pattern: "You find the authentic story organisations have forgotten about themselves, then make it undeniable.",
    thread: "Connecting human truth to strategic clarity - finding what was always there but invisible",
    role_identity: "Transformational Brand Strategist",
    what_you_do: "find the authentic story organisations have forgotten about themselves and make it undeniable",
    who_you_serve: "brands and teams who've lost connection to their purpose",
    unique_approach: "connect human truth to strategic clarity - finding what was always there but invisible",
    background: "15+ years helping global brands like UBS, UPS, and Juniper rediscover their authentic story",
    where_heading: "seeking roles where strategic transformation creates lasting cultural change",
    positioning_statement: "I'm a Transformational Brand Strategist who finds the authentic story organisations have forgotten about themselves for brands and teams who've lost connection to their purpose. I connect human truth to strategic clarity - finding what was always there but invisible. After 15+ years helping global brands like UBS, UPS, and Juniper rediscover their authentic story, I'm seeking roles where strategic transformation creates lasting cultural change.",
    evidence: [
        {
            company: "UBS",
            description: "Transformed how the bank saw itself - from cold institution to craftspeople",
            result: "'Banking is our Craft' became global template, transformed brand perception"
        },
        {
            company: "UPS EMEA",
            description: "United 25+ fragmented markets under single strategic vision",
            result: "+20% EMEA brand engagement, first cohesive regional strategy"
        },
        {
            company: "Juniper Networks",
            description: "Repositioned legacy tech brand as future-focused innovator",
            result: "'The Now Way to Network' adopted across global markets"
        }
    ],
    belief_moments: [
        {
            title: "The UBS Transformation",
            story: "Within 15 minutes I knew their problem wasn't strategy - they'd lost connection to why banking matters. 'Banking is our Craft' didn't just change messaging, it transformed how employees saw their own work."
        },
        {
            title: "The UPS Unification",
            story: "25+ EMEA markets, zero alignment, everyone frustrated. I found 'United Problem Solvers' - a truth that connected all of them while making each market feel heard. First joined-up strategy in years."
        },
        {
            title: "The Juniper Repositioning",
            story: "Legacy tech brand drowning in sameness. 'The Now Way to Network' wasn't about being different - it was about revealing what Juniper had always been but couldn't articulate."
        }
    ],
    red_flags: [
        { flag: "Execution only briefs", description: "No room for strategic transformation" },
        { flag: "Surface-level rebrands", description: "Changing colours, not conviction" },
        { flag: "Politics over purpose", description: "Energy goes to wrong places" },
        { flag: "No C-suite access", description: "Can't drive real change through layers" },
        { flag: "Short-term campaigns", description: "Transformation needs time" }
    ],
    green_flags: [
        { flag: "Lost their story", description: "Your superpower zone" },
        { flag: "Cultural transformation", description: "Real change, not polish" },
        { flag: "Direct leadership access", description: "Where shifts happen" },
        { flag: "Multi-market complexity", description: "Finding unified truth" },
        { flag: "Purpose-driven ambition", description: "Something meaningful to unlock" }
    ]
};

async function loadDonaldData() {
    console.log('🚀 Loading Donald Pirie\'s SYP data...\n');

    try {
        // Initialise database tables
        await db.initDatabase();

        // Step 1: Create or update Donald's user account
        console.log('📧 Creating user account...');
        const user = await db.createClientAccount(
            DONALD_PIRIE.email,
            DONALD_PIRIE.name,
            DONALD_PIRIE.password
        );
        console.log(`   ✅ User: ${user.email} (ID: ${user.id})`);

        // Step 2: Save Donald's blueprint with questionnaire responses
        console.log('\n📋 Saving career blueprint...');
        const blueprintData = {
            ...DONALD_BLUEPRINT,
            questionnaire_responses: {
                outcomes: DONALD_PIRIE.outcomes,
                thread: DONALD_PIRIE.thread,
                intuition: DONALD_PIRIE.intuition,
                questions: DONALD_PIRIE.questions,
                noticing: DONALD_PIRIE.noticing,
                whatFeelsEasy: DONALD_PIRIE.whatFeelsEasy,
                ofCourseMoments: DONALD_PIRIE.ofCourseMoments,
                clientBefore: DONALD_PIRIE.clientBefore,
                clientAfter: DONALD_PIRIE.clientAfter,
                problemMagnet: DONALD_PIRIE.problemMagnet,
                howOthersSeeYou: DONALD_PIRIE.howOthersSeeYou,
                underestimatedAbility: DONALD_PIRIE.underestimatedAbility,
                patternRecognised: DONALD_PIRIE.patternRecognised,
                transformationEnabled: DONALD_PIRIE.transformationEnabled,
                permission: DONALD_PIRIE.permission
            }
        };

        const blueprint = await db.saveBlueprint(user.id, blueprintData);
        console.log(`   ✅ Blueprint saved (ID: ${blueprint.id})`);

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('🎉 Donald Pirie\'s data loaded successfully!');
        console.log('='.repeat(60));
        console.log('\n📌 Login Credentials:');
        console.log(`   Email:    ${DONALD_PIRIE.email}`);
        console.log(`   Password: ${DONALD_PIRIE.password}`);
        console.log('\n📊 Data Loaded:');
        console.log('   ✓ User account created');
        console.log('   ✓ Questionnaire responses (15 fields)');
        console.log('   ✓ Career blueprint');
        console.log('   ✓ 3 career evidence entries (UBS, UPS, Juniper)');
        console.log('   ✓ 3 belief moments');
        console.log('   ✓ 5 red flags');
        console.log('   ✓ 5 green flags');
        console.log('\n🔗 Donald can now log in and access:');
        console.log('   - Dashboard');
        console.log('   - Ability Recognition questionnaire (pre-filled)');
        console.log('   - Career Blueprint');
        console.log('   - CV Builder');
        console.log('   - Decision Framework');

    } catch (error) {
        console.error('\n❌ Error loading data:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        // Close database connection
        await db.pool.end();
        console.log('\n✅ Database connection closed');
    }
}

// Run the script
loadDonaldData();
