# Spark Your Potential - Coach Guide

## Quick Reference

| Task | File to Edit | What to Change |
|------|--------------|----------------|
| Add new client | `client-portal.html` + `dashboard.html` | Add client object to CLIENTS |
| Update client's week | Both files | Change `status` field |
| Add personalised prompt | `client-portal.html` | Update `prompts.weekX` |
| Update blueprint progress | `client-portal.html` | Change `blueprintProgress` (0-100) |
| Create client documents | `/ClientName/` folder | Copy from `/templates/` |

---

## 1. Adding a New Client

### Step 1: Create Client Folder

```
/spark-your-potential/
└── New_Client_Name/
    ├── New_Client_Name_Discovery_Questionnaire.html
    ├── New_Client_Name_Coaching_Agreement.html
    ├── New_Client_Name_Programme_Outline.html
    └── (other documents created as programme progresses)
```

**Quick way:** Copy an existing client folder and rename files.

### Step 2: Add to Dashboard (`dashboard.html`)

Find the `DEFAULT_CLIENTS` object (around line 500) and add:

```javascript
'newemail@example.com': {
    id: 'client-newname',
    name: 'New Client Name',
    email: 'newemail@example.com',
    phone: '',
    folder: 'New_Client_Name',
    status: 'pre-programme',  // See status options below
    enrolledDate: '2025-12-03',
    completedDate: null,
    agreementSigned: false,  // Set to true after they sign
    signedDocuments: [],
    progress: {
        questionnaire: false,
        insightsReport: false,
        blueprint: false,
        decisionFramework: false,
        cvBuilder: false,
        mappingGuide: false
    }
}
```

### Step 3: Add to Client Portal (`client-portal.html`)

Find the `CLIENTS` object (around line 1033) and add:

```javascript
'newemail@example.com': {
    name: 'New Client Name',
    email: 'newemail@example.com',
    folder: 'New_Client_Name',
    status: 'pre-programme',
    agreementSigned: false,
    files: {
        questionnaire: 'New_Client_Name/New_Client_Name_Discovery_Questionnaire.html',
        insights: 'New_Client_Name/New_Client_Name_Career_Insights_Report.html',
        blueprint: 'New_Client_Name/New_Client_Name_Blueprint.html',
        cvBuilder: 'New_Client_Name/New_Client_Name_CV_Builder.html',
        mappingGuide: 'New_Client_Name/New_Client_Name_Mapping_Guide.html',
        decisionFramework: 'New_Client_Name/New_Client_Name_Decision_Framework.html'
    },
    prompts: {
        week1: "",
        week2: "",
        week3: "",
        week4: ""
    },
    blueprintProgress: 0
}
```

### Step 4: Commit and Deploy

```bash
cd /Users/lisagills/spark-your-potential
git add -A
git commit -m "Add new client: Client Name"
git push origin main
```

---

## 2. Status Options

| Status | Meaning | What Client Sees |
|--------|---------|------------------|
| `pre-programme` | Signed up, not started | Week 1 homework, Step 1 active |
| `week-1` | Completed Week 1 session | Week 1-2 homework available |
| `week-2` | Completed Week 2 session | Week 1-3 homework available |
| `week-3` | Completed Week 3 session | Week 1-4 homework available |
| `week-4` | Completed Week 4 session | All homework available |
| `complete` | Programme finished | Everything unlocked + completed |

**To advance a client:**

In both `dashboard.html` and `client-portal.html`, change:
```javascript
status: 'week-1',  // Change to next stage
```

---

## 3. Adding Personalised Prompts

After each session, add a prompt for the client in `client-portal.html`:

```javascript
prompts: {
    week1: "Your questionnaire revealed you're a natural problem-solver who thrives on complexity. This week, I'd like you to identify 3 specific examples where you untangled a messy situation and created clarity.",
    week2: "Building on your 'complexity translator' pattern, think about what environments energise vs drain you. What does sustainable success look like for you?",
    week3: "Time to craft your narrative. How would you introduce yourself in 30 seconds to someone at a networking event?",
    week4: "Final push! Review your CV and LinkedIn - does every line reflect your unique thread?"
}
```

**Tips for writing prompts:**
- Reference specific insights from their questionnaire/session
- Give them a concrete task or question to reflect on
- Keep it personal and encouraging
- 2-3 sentences max

---

## 4. Updating Blueprint Progress

As sessions progress, update the blueprint completion:

```javascript
blueprintProgress: 25   // After Week 1 (foundations captured)
blueprintProgress: 50   // After Week 2 (direction + red/green flags)
blueprintProgress: 75   // After Week 3 (positioning + pitches)
blueprintProgress: 100  // After Week 4 (everything complete)
```

---

## 5. Creating Client Documents

### From Templates

Copy from `/templates/` folder and customise:

| Template | Purpose | When to Create |
|----------|---------|----------------|
| `coaching_agreement.html` | Digital signature agreement | Before programme starts |
| `programme_outline.html` | What they'll receive | With welcome email |
| `CV_Builder_Template.html` | Interactive CV builder | Week 3-4 |

### Creating a CV Builder

1. **Copy the template:**
   ```bash
   cp templates/CV_Builder_Template.html New_Client_Name/New_Client_Name_CV_Builder.html
   ```

2. **Open and customise:**
   - Change `[CLIENT_NAME]` to their name
   - Pre-fill sections from their Blueprint if available

3. **Update client-portal.html:**
   ```javascript
   files: {
       cvBuilder: 'New_Client_Name/New_Client_Name_CV_Builder.html',
       // ...
   }
   ```

### Creating Career Insights Report

After Week 1 session:

1. Create `New_Client_Name/New_Client_Name_Career_Insights_Report.html`
2. Include:
   - Core pattern identified
   - Unique thread
   - Key strengths
   - Career direction insights
   - Belief moments captured

### Creating Blueprint

This builds over sessions:

1. Create `New_Client_Name/New_Client_Name_Blueprint.html`
2. Update after each session with new content
3. Sections:
   - Unique Thread / Core Pattern
   - Belief Moments (stories)
   - Red Flags / Green Flags
   - Positioning Statement
   - Elevator Pitches
   - Career Direction

---

## 6. Marking Agreement as Signed

When client signs their agreement:

**In `dashboard.html`:**
```javascript
agreementSigned: true,
signedDocuments: ['New_Client_Name_Coaching_Agreement.html'],
```

**In `client-portal.html`:**
```javascript
agreementSigned: true,
```

---

## 7. Quick Workflow Checklist

### New Client Onboarding
- [ ] Create client folder
- [ ] Copy and customise Coaching Agreement
- [ ] Copy and customise Programme Outline
- [ ] Add to `dashboard.html` (DEFAULT_CLIENTS)
- [ ] Add to `client-portal.html` (CLIENTS)
- [ ] Send welcome email with portal link
- [ ] Git commit and push

### After Each Session
- [ ] Advance client status if moving to next week
- [ ] Add personalised prompt for their current/next week
- [ ] Update blueprintProgress percentage
- [ ] Create/update any documents (Insights Report, Blueprint sections)
- [ ] Git commit and push

### Programme Completion
- [ ] Set status to `complete`
- [ ] Set blueprintProgress to 100
- [ ] Ensure all documents are created and linked
- [ ] Final prompt congratulating them
- [ ] Git commit and push

---

## 8. File Locations

```
/spark-your-potential/
├── dashboard.html           # Coach view - manage clients
├── client-portal.html       # Client view - their toolkit
├── COACH_GUIDE.md          # This guide
├── CLAUDE.md               # Claude memory file
│
├── templates/              # Reusable templates
│   ├── coaching_agreement.html
│   ├── programme_outline.html
│   └── CV_Builder_Template.html
│
├── Donald/                 # Donald's files (complete)
│   ├── Donald_Interactive_CV_Builder.html
│   ├── Donald_Pirie_Career_Blueprint_LIVE.html
│   ├── Donald_Pirie_Career_Insights_Report.html
│   └── ...
│
├── Raj_Samuel/             # Raj's files (in progress)
│   ├── Raj_Samuel_Coaching_Agreement.html
│   ├── Raj_Samuel_Discovery_Questionnaire.html
│   └── ...
│
└── sarah_mitchell_demo_client/  # Demo client
    └── ...
```

---

## 9. URLs

| Page | URL |
|------|-----|
| **Coach Dashboard** | https://potential.harnessthespark.com/dashboard.html |
| **Client Portal** | https://potential.harnessthespark.com/client-portal.html |
| **Local Dev** | Open files directly in browser |

---

## 10. Deploying Changes

After making any changes:

```bash
cd /Users/lisagills/spark-your-potential
git add -A
git commit -m "Brief description of changes"
git push origin main
```

Changes go live in ~1-2 minutes via DigitalOcean auto-deploy.

---

## Need Help?

- Check `CLAUDE.md` for technical details
- Review existing client setups (Donald, Sarah) as examples
- Ask Claude to help with specific tasks
