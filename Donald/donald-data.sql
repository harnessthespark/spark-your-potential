-- Donald Pirie's SYP Data Import
-- Run this in DigitalOcean Database Console

-- Step 1: Create user account
INSERT INTO users (email, name, password_hash, is_admin, created_at, last_login)
VALUES (
    'donald@example.com',
    'Donald Pirie',
    '6b7ca9bb444f76a308527ac4cffa4d86:57cab75fcb6af2701d6eca6ffd6db7acdb852b469a3c43c79c3f40f64185ef9ecd60b50d454747091ea4d59cb588cdc6b162ac9a6f41e1919b6082bc32121928',
    false,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    last_login = NOW()
RETURNING id;

-- Step 2: Create blueprint (use the user_id from above)
-- Note: Replace USER_ID_HERE with the actual UUID returned from Step 1
INSERT INTO blueprints (
    user_id,
    name,
    core_pattern,
    thread,
    role_identity,
    what_you_do,
    who_you_serve,
    unique_approach,
    background,
    where_heading,
    positioning_statement,
    evidence,
    belief_moments,
    red_flags,
    green_flags,
    questionnaire_responses,
    completed_at
)
SELECT
    id,
    'Donald Pirie',
    'You find the authentic story organisations have forgotten about themselves, then make it undeniable.',
    'Connecting human truth to strategic clarity - finding what was always there but invisible',
    'Transformational Brand Strategist',
    'find the authentic story organisations have forgotten about themselves and make it undeniable',
    'brands and teams who''ve lost connection to their purpose',
    'connect human truth to strategic clarity - finding what was always there but invisible',
    '15+ years helping global brands like UBS, UPS, and Juniper rediscover their authentic story',
    'seeking roles where strategic transformation creates lasting cultural change',
    'I''m a Transformational Brand Strategist who finds the authentic story organisations have forgotten about themselves for brands and teams who''ve lost connection to their purpose. I connect human truth to strategic clarity - finding what was always there but invisible. After 15+ years helping global brands like UBS, UPS, and Juniper rediscover their authentic story, I''m seeking roles where strategic transformation creates lasting cultural change.',
    '[{"company":"UBS","description":"Transformed how the bank saw itself - from cold institution to craftspeople","result":"''Banking is our Craft'' became global template, transformed brand perception"},{"company":"UPS EMEA","description":"United 25+ fragmented markets under single strategic vision","result":"+20% EMEA brand engagement, first cohesive regional strategy"},{"company":"Juniper Networks","description":"Repositioned legacy tech brand as future-focused innovator","result":"''The Now Way to Network'' adopted across global markets"}]',
    '[{"title":"The UBS Transformation","story":"Within 15 minutes I knew their problem wasn''t strategy - they''d lost connection to why banking matters. ''Banking is our Craft'' didn''t just change messaging, it transformed how employees saw their own work."},{"title":"The UPS Unification","story":"25+ EMEA markets, zero alignment, everyone frustrated. I found ''United Problem Solvers'' - a truth that connected all of them while making each market feel heard. First joined-up strategy in years."},{"title":"The Juniper Repositioning","story":"Legacy tech brand drowning in sameness. ''The Now Way to Network'' wasn''t about being different - it was about revealing what Juniper had always been but couldn''t articulate."}]',
    '[{"flag":"Execution only briefs","description":"No room for strategic transformation"},{"flag":"Surface-level rebrands","description":"Changing colours, not conviction"},{"flag":"Politics over purpose","description":"Energy goes to wrong places"},{"flag":"No C-suite access","description":"Can''t drive real change through layers"},{"flag":"Short-term campaigns","description":"Transformation needs time"}]',
    '[{"flag":"Lost their story","description":"Your superpower zone"},{"flag":"Cultural transformation","description":"Real change, not polish"},{"flag":"Direct leadership access","description":"Where shifts happen"},{"flag":"Multi-market complexity","description":"Finding unified truth"},{"flag":"Purpose-driven ambition","description":"Something meaningful to unlock"}]',
    '{"outcomes":["At UBS, I transformed how the bank saw itself - from cold institution to craftspeople who take pride in their work. The ''Banking is our Craft'' positioning became the global template and fundamentally changed brand perception. The team said they''d never felt prouder of their work.","At UPS EMEA, I united 25+ fragmented markets under a single strategic vision - ''United Problem Solvers''. Teams went from disconnected and lacking purpose to aligned and energised. We achieved +20% EMEA brand engagement and created a cohesive regional strategy for the first time.","At Juniper Networks, I repositioned a legacy tech brand as a future-focused innovator with ''The Now Way to Network''. The challenge was differentiating in a crowded networking market - the fresh positioning was adopted across global markets and revitalised the brand.","Led a complete brand transformation that connected craft and expertise to banking excellence at UBS. The campaign didn''t just change messaging - it transformed how employees saw their own work and became a template for global communications.","Built strategic positioning that united diverse EMEA teams at UPS under a shared identity. The problem wasn''t strategy - it was that teams had lost connection to why their work matters. Once they rediscovered that, everything aligned."],"thread":"I find the authentic story organisations have forgotten about themselves, then make it undeniable. Every major success follows the same pattern: I arrive when an organisation is lost in complexity, ask different questions, and help them see who they really are. UBS, UPS, Juniper - different industries, same transformation.","intuition":"I knew within 15 minutes of meeting the UBS team that their problem wasn''t strategy - it was that they''d lost connection to why banking matters. I can sense when organisations are disconnected from their own story, drowning in corporate speak.","questions":"What made you proud before all the complexity? When did you last feel excited about what you do? What would you say about this brand if no one from marketing was listening?","noticing":"The gap between what organisations say and what their people actually believe. The moment when corporate language takes over and authentic voice disappears. Who in the room still remembers why this work matters.","whatFeelsEasy":"Synthesising complex information into clear, compelling narratives. Finding the human truth inside corporate complexity. Connecting strategy to emotion in a way that actually sticks.","ofCourseMoments":"When the strategy lands, clients say ''that''s exactly who we are - why couldn''t we see it?'' It''s not about inventing something new - it''s about revealing what was always there but invisible.","clientBefore":"Disconnected from their own story, drowning in corporate speak, strategies that don''t stick. Teams that have lost connection to their purpose. Organisations where complexity has buried the simple truth.","clientAfter":"Clear on their unique value, aligned teams, strategies that people actually want to execute. Organisations that have rediscovered who they really are. From confusion to conviction.","problemMagnet":"I attract organisations that have lost their way - the ones drowning in complexity, the brands that sound like everyone else, the teams that have forgotten why their work matters. People bring me in when they need to rediscover their authentic story.","howOthersSeeYou":"The person who finds the story others missed. Someone who asks different questions. Calm clarity in strategic chaos. The one who helps you see what was always there.","underestimatedAbility":"Finding the human truth inside corporate complexity. I think others see the strategic outcomes but not how fundamental the shift is. It''s not about better messaging - it''s about reconnecting organisations to who they really are.","patternRecognised":"Transformational Brand Strategist - I don''t just create campaigns, I help organisations rediscover their authentic story and make it undeniable.","transformationEnabled":"From confusion to conviction. From corporate speak to authentic voice. From fragmented teams to aligned purpose. From ''we''ve lost our way'' to ''that''s exactly who we are''.","permission":"I''m giving myself permission to claim what I actually do: I find the authentic story organisations have forgotten about themselves. I''m not just a strategist - I''m a catalyst for rediscovery."}',
    NOW()
FROM users
WHERE email = 'donald@example.com';

-- Verify the data was loaded
SELECT 'User created:' as status, email, name FROM users WHERE email = 'donald@example.com';
SELECT 'Blueprint created:' as status, role_identity, core_pattern FROM blueprints WHERE name = 'Donald Pirie';
