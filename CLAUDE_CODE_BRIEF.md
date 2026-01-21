# Spark Your Potential - Build Brief for Claude Code

## Overview

Connect the existing "Spark Your Potential" career positioning app into a full platform with user accounts, persistent data, and connected tools.

**Current state:** Single-page questionnaire on Digital Ocean that generates a Career Blueprint HTML via Claude API.

**Target state:** Multi-tool platform where Blueprint data flows into CV Builder, Mapping Guide, Decision Framework, and AI Prompt Library.

---

## Existing Infrastructure

- **Hosting:** Digital Ocean App Platform
- **URL:** https://potential.harnessthespark.com/
- **Database:** PostgreSQL (existing, used for SparkHub - separate product)
- **AI:** Claude API (already integrated for Blueprint generation)

---

## What Needs to Be Built

### 1. User Authentication

- Google OAuth (simplest)
- Email/password as fallback
- Session management
- User profile page

### 2. Database Integration

Use the schema in `database_schema.sql`:

- `users` - account info
- `blueprints` - core data from questionnaire + Claude analysis
- `cv_data` - CV content (populated from Blueprint)
- `decision_frameworks` - criteria and evaluations
- `opportunity_evaluations` - saved opportunity scores

### 3. Blueprint Data Extraction

When Claude generates the Blueprint, **also save structured data** to the `blueprints` table:

```json
{
  "name": "Sarah Mitchell",
  "core_pattern": "You unlock creative potential in clients and teams...",
  "thread": "Connecting creativity with commercial reality",
  "role_identity": "Creative Catalyst",
  "what_you_do": "unlocks creative potential",
  "who_you_serve": "clients and teams that have forgotten what they're capable of",
  "unique_approach": "connect creativity with commercial reality",
  "background": "15 years helping brands like Nike, Spotify and Barclays",
  "where_heading": "seeking roles where I can transform teams",
  "evidence": [
    {"company": "Nike", "description": "Transformed EMEA output", "result": "+40% engagement"}
  ],
  "belief_moments": [
    {"title": "The Nike Creative Director", "story": "I'd given up on this team..."}
  ],
  "red_flags": [
    {"flag": "Execution only briefs", "description": "No room to unlock potential"}
  ],
  "green_flags": [
    {"flag": "Stuck teams", "description": "Your superpower zone"}
  ]
}
```

### 4. Dashboard

After login, user sees:

```
┌─────────────────────────────────────────────────┐
│  Your Career Toolkit                            │
├─────────────────────────────────────────────────┤
│                                                 │
│  📘 Career Blueprint      [View] [Regenerate]   │
│  ✓ Completed 24 Nov 2024                        │
│                                                 │
│  📝 CV Builder            [Open]                │
│  → Pre-filled from Blueprint                    │
│                                                 │
│  🗺️ Mapping Guide         [View]                │
│  → Where your content goes                      │
│                                                 │
│  ⚖️ Decision Framework    [Open]                │
│  → 2 opportunities saved                        │
│                                                 │
│  🤖 AI Prompt Library     [View]                │
│  → Ready-to-use prompts                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 5. CV Builder Integration

When user opens CV Builder:

1. Fetch their Blueprint data from database
2. Pre-populate all fields:
   - Role Identity → "I'm a..." field
   - What You Do → "Who..." field
   - Who You Serve → "For..." field
   - etc.
3. Generate preview proposition automatically
4. Allow editing (saves to `cv_data` table)
5. Export as PDF/DOCX

### 6. Decision Framework Integration

When user opens Decision Framework:

1. Fetch their Blueprint data
2. Pre-populate criteria based on red/green flags
3. Allow adding/editing criteria
4. Save opportunity evaluations
5. Show comparison view

---

## HTML Templates

Use the templates in this folder as the UI foundation:

| File | Purpose |
|------|---------|
| `Sarah_Mitchell_Blueprint.html` | Blueprint display template |
| `Sarah_Mitchell_CV_Builder.html` | CV Builder with sidebar + preview |
| `Sarah_Mitchell_Mapping_Guide.html` | Static reference guide |
| `Sarah_Mitchell_Decision_Framework.html` | Scorecard with inputs |
| `AI_Prompt_Library.html` | Prompt cards with copy buttons |

**Important:** These use Sarah Mitchell as sample data. The app should:
- Replace sample data with user's actual Blueprint data
- Keep the HTML/CSS structure
- Add interactivity (React components or vanilla JS)

---

## Data Flow

```
User completes questionnaire
        ↓
Claude API analyses responses
        ↓
Save to blueprints table (structured JSON)
        ↓
Generate Blueprint HTML (for viewing)
        ↓
User opens CV Builder
        ↓
Fetch blueprint data → pre-fill fields
        ↓
User edits → save to cv_data table
        ↓
Export PDF/DOCX
```

---

## Tech Stack Recommendation

Keep it simple:

- **Frontend:** React or plain HTML/JS with Tailwind
- **Backend:** Node.js/Express or Python/FastAPI (whatever existing app uses)
- **Database:** PostgreSQL (existing)
- **Auth:** Supabase Auth or Auth0 (easiest) or roll your own with sessions
- **PDF Export:** Puppeteer or html-pdf
- **Hosting:** Digital Ocean (existing)

---

## FIRST: Test Database Persistence

Before building anything new, check if the current app saves data:

### Quick Test

1. Fill in the questionnaire with Sarah Mitchell's sample answers
2. Generate the Blueprint
3. Close the browser, reopen the dashboard
4. Is the Blueprint still there?

### Check Postgres Directly

```sql
-- See if any tables exist
\dt

-- Check for saved blueprints
SELECT * FROM blueprints;

-- Check for users
SELECT * FROM users;
```

### If Data is NOT Persisting

The current app likely generates HTML only. You'll need to:

1. Create the database tables (use `database_schema.sql`)
2. Modify Blueprint generation to ALSO save structured JSON to Postgres
3. Add a "load saved Blueprint" function to the dashboard

### If Data IS Persisting

Check the schema matches what we need. Ensure the Blueprint stores structured fields (not just raw HTML) so CV Builder and Decision Framework can read specific values.

---

## Priority Order

1. **Test database persistence** - Check what currently saves
2. **User auth + database connection** - Foundation
2. **Blueprint data extraction** - Save structured data when generating
3. **Dashboard** - Show all tools in one place
4. **CV Builder connection** - Pre-fill from Blueprint
5. **Decision Framework connection** - Pre-fill criteria from red/green flags
6. **Export functionality** - PDF/DOCX download
7. **Polish** - Loading states, error handling, mobile responsive

---

## Sample Data for Testing

Use Sarah Mitchell data throughout development:

```javascript
const sampleUser = {
  name: "Sarah Mitchell",
  email: "sarah@example.com",
  core_pattern: "You unlock creative potential in clients and internal teams that have forgotten what they're capable of",
  thread: "Connecting creativity with commercial reality",
  role_identity: "Creative Catalyst",
  what_you_do: "unlocks creative potential",
  who_you_serve: "clients and teams that have forgotten what they're capable of",
  unique_approach: "connect creativity with commercial reality",
  background: "15 years helping brands like Nike, Spotify and Barclays",
  where_heading: "seeking roles where I can transform teams and deliver award-winning work",
  evidence: [
    {company: "Nike EMEA", description: "Transformed regional campaigns", result: "+40% engagement"},
    {company: "Spotify", description: "Rebuilt team confidence post-restructure", result: "60% retention increase"},
    {company: "Barclays", description: "Led rebrand across 12 markets", result: "First unified campaign in 5 years"}
  ],
  red_flags: [
    {flag: "Execution only briefs", description: "No room to unlock potential"},
    {flag: "Revolving door culture", description: "Can't build belief in 3 months"},
    {flag: "Politics over craft", description: "Energy goes to wrong places"}
  ],
  green_flags: [
    {flag: "Stuck teams", description: "Your superpower zone"},
    {flag: "Transformation briefs", description: "Real change, not polish"},
    {flag: "Direct relationships", description: "Where magic happens"}
  ]
};
```

---

## Questions for Lisa

Before starting, confirm:

1. What's the existing app's tech stack? (Node? Python? React?)
2. Same PostgreSQL instance as SparkHub, or separate database?
3. Auth preference? (Google OAuth, email/password, or both?)
4. Any existing user accounts to migrate?
5. Paid tier features - what should be gated?

---

## Files in This Package

```
SparkYourPotential_Templates/
├── Sarah_Mitchell_Blueprint.html
├── Sarah_Mitchell_CV_Builder.html
├── Sarah_Mitchell_Mapping_Guide.html
├── Sarah_Mitchell_Decision_Framework.html
├── AI_Prompt_Library.html
├── database_schema.sql
└── CLAUDE_CODE_BRIEF.md (this file)
```

---

## Next Steps

1. Feed this brief + templates to Claude Code
2. Connect to existing app repo
3. Set up database tables
4. Build auth
5. Iterate from there

Let's ship it! 🚀
