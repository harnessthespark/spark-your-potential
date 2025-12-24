# Claude Assistant Memory - Spark Your Potential

This document contains important context for Claude to remember across sessions for the Spark Your Potential coaching platform.

## IMPORTANT
- Always use UK English spelling
- This is Lisa Gills' coaching practice platform
- Connected to SparkHub backend for PostgreSQL data storage

## Project Overview
**Spark Your Potential (SYP)** - Lisa Gills' career coaching platform featuring the Career Booster Programme. Provides career transformation services for clients seeking clarity, positioning, and practical career tools.

## Production URLs
- **Dashboard:** https://stingray-app-7kg9p.ondigitalocean.app/dashboard
- **Backend API:** https://sparkhub-be-qtmmb.ondigitalocean.app (SparkHub Django backend)

## Coach Details
- **Name:** Lisa Gills
- **Email:** lisa@harnessthespark.com
- **Website:** www.harnessthespark.com
- **Business:** Harness the Spark

## Programme Offerings

### 4-Week Career Booster Programme (Phase 1)
- **Price:** £400 ex VAT (£480 inc VAT)
- **Sessions:** 4 x 1-hour sessions over 4 weeks
- **Deliverables:**
  - Career Blueprint (source of truth document)
  - Interactive CV Builder
  - Blueprint to CV/LinkedIn Mapping Guide
  - Decision Framework
  - AI Prompt Library
- **Email support:** Response within 48 hours on working days
- **Platform:** Zoom sessions

### 8-Week Full Programme (Phase 1 + Phase 2)
- **Price:** £800 ex VAT (£960 inc VAT)
- **Sessions:** 8 x 1-hour sessions over 8 weeks
- **Additional deliverables:**
  - LinkedIn Profile Review
  - Networking Strategy
  - Interview Framework
  - Job Search Plan
  - 90-Day Action Plan

## Current Clients

### Donald Pirie
- **Email:** donaldpirie111@hotmail.co.uk
- **Status:** Complete
- **Programme:** 4-Week Career Booster
- **Enrolled:** October 2024
- **Completed:** November 2024
- **Folder:** `/Donald/`
- **Progress:** All deliverables complete

### Raj Samuel (December 2025)
- **Email:** rs@rajsamuel.net
- **Status:** Week 2 (Questionnaire complete)
- **Programme:** 4-Week Career Booster
- **Enrolled:** December 2025
- **Folder:** `/Raj_Samuel/`
- **Files created:**
  - `Raj_Samuel_Coaching_Agreement.html` - Signed
  - `Raj_Samuel_Programme_Outline.html` - Programme overview
  - `Raj_Samuel_Questionnaire_Responses.html` - Completed responses
  - `Raj_Samuel_Discovery_Questionnaire.html` - Original form
- **Progress:** Questionnaire complete, ready for Week 2 sessions

## Folder Structure
```
/spark-your-potential/
├── dashboard.html          # Main coach dashboard
├── CLAUDE.md              # This file (Claude memory)
├── templates/             # Reusable templates
│   ├── coaching_agreement.html
│   └── programme_outline.html
├── Donald/                # Donald Pirie's files
│   └── [completed deliverables]
└── Raj_Samuel/            # Raj Samuel's files
    ├── Raj_Samuel_Coaching_Agreement.html
    └── Raj_Samuel_Programme_Outline.html
```

## Authentication
- Dashboard requires login via SparkHub backend
- Coach access: Lisa logs in with admin credentials
- Client data protected - only visible when authenticated as staff

## API Integration
- **Backend:** SparkHub Django REST Framework
- **Endpoint:** `/api/crm/syp/coach/clients/`
- **Auth:** JWT tokens stored in localStorage
- **CORS:** Configured for stingray-app domain

## Key Files

### dashboard.html
- Main coach interface
- Client list with progress tracking
- Links to client folders and documents
- Data source indicator (Live/Cached)
- DEFAULT_CLIENTS fallback for offline mode

### coaching_agreement.html (template)
- Digital signature capability (typed or drawn)
- Programme details and pricing
- Terms and conditions
- Confidentiality clause
- ICF Code of Ethics reference

### programme_outline.html (template)
- Week-by-week journey breakdown
- Complete toolkit description
- Outcomes and benefits
- CTA section with pricing

## Week Journey Structure
1. **Pre-Programme** - Welcome & Questionnaire
2. **Week 1: Foundation** - Patterns & Evidence
3. **Week 2: Career Direction** - Insights & Decisions
4. **Week 3: Positioning** - Brand & Headlines
5. **Week 4: Implementation** - CV & LinkedIn
6. **Complete** - Programme Finished

## Questionnaire Links
- AI questionnaire tool hosted separately
- Generates insights report for coaching sessions
- Proprietary methodology - IP protected

## Development Notes
- CORS configured in SparkHub backend settings.py
- SYP domain added: "https://stingray-app-7kg9p.ondigitalocean.app"
- Uses same PostgreSQL database as SparkHub
- JWT authentication shared with SparkHub platform

## Production URLs
- **Dashboard (Coach):** https://stingray-app-7kg9p.ondigitalocean.app/dashboard.html
- **Client Portal:** https://stingray-app-7kg9p.ondigitalocean.app/client-portal.html
- **Backend API:** https://sparkhub-be-qtmmb.ondigitalocean.app

## Session History

### 1 December 2025 - Raj Samuel Onboarding & Client Portal

**Raj Samuel Setup:**
- Created Raj_Samuel folder with all onboarding documents
- 
 - Digital signature ready
- `Raj_Samuel_Programme_Outline.html` - 4-week journey overview
- `Raj_Samuel_Welcome_Email.html` - 4-step onboarding flow
- Added to DEFAULT_CLIENTS in dashboard
- Email: rs@rajsamuel.net
- Programme: 4-Week Career Booster

**Client Portal Created:**
- `client-portal.html` - Client self-service access
- Email-based login (no password)
- Career Toolkit design matching screenshot
- 6 tool cards with locked/unlocked states based on programme stage
- Progressive document unlocking

**Dashboard Fixes:**
- Fixed Donald's email: donaldpirie111@hotmail.co.uk
- Fixed DEFAULT_CLIENTS rendering bug - was only showing Sarah
- All 3 clients now in DEFAULT_CLIENTS: Sarah (demo), Donald, Raj
- Cache merge logic fixed to always preserve DEFAULT_CLIENTS

**Files Reorganised:**
- Donald's files moved into `/Donald/` folder
- Social assets moved into `/social asset/` folder
- Templates added to `/templates/` folder

**To Test Tomorrow:**
1. Clear browser cache: `localStorage.clear(); location.reload();`
2. Login to dashboard.html
3. Verify all 3 clients show (Sarah, Donald, Raj)
4. Test client portal login with donaldpirie111@hotmail.co.uk

### 2 December 2025 - CV Builder Update & Client Portal Fixes

**Backend Fix:**
- Fixed `/api/accounts/login/` endpoint to return `is_staff` field
- Without this, coach mode wasn't activating (only demo client showed)
- Commit: `8efd095b` on neurospark-be

**Client Portal File Path Fixes:**
- Fixed "Cannot GET" errors when clients accessed their tools
- Added explicit `files` object to each client in CLIENTS constant
- Maps tool types to actual file names (e.g., `cvBuilder: 'Donald/Donald_Interactive_CV_Builder.html'`)
- Commit: `1dd5909` on spark-your-potential

**Donald's CV Builder Major Update:**
- Complete redesign with modern two-column layout
- **Left column (dark):** Profile, Career Highlights, Skills, Sectors
- **Right column (light):** Career History, Education, Testimonials, Case Studies
- **Case Studies with Hero Images:** UBS, UPS, AMD each have branded gradient hero banners
- **Print-Ready:** Full `@media print` styling with A4 sizing, colour preservation, page breaks
- **Updated styling:** Gold (#FFD700) and Purple (#7B2CBF) accent colours, Inter font, pill-style skill tags
- Commit: `032997b` on spark-your-potential

**Raj Samuel Questionnaire:**
- Created `Raj_Samuel/Raj_Samuel_Discovery_Questionnaire.html`
- Based on Donald's ability-recognition-visual.html template
- Personalised header for Raj

**Files Modified:**
- `/neurospark-be/accounts/api_views.py` - Added is_staff to login response
- `/spark-your-potential/client-portal.html` - Fixed file path mappings
- `/spark-your-potential/Donald/Donald_Interactive_CV_Builder.html` - Complete redesign
- `/spark-your-potential/Raj_Samuel/Raj_Samuel_Discovery_Questionnaire.html` - Created

**Database Updates:**
- Fixed Donald's email to `donaldpirie111@hotmail.co.uk`
- Updated Raj Samuel's status from `discovery` to `enrolled`

### 16 December 2025 - Unified Portal & Coach Hub

**Unified Client Portal:**
- `client-portal.html` now serves ALL clients (Career + AuDHD)
- Dynamic title based on programmeType: "Your Career Toolkit" or "Your AuDHD Toolkit"
- AuDHD clients see different tools: Brain Dump, Energy Tracker, AuDHD Foundations, Session Notes, Decision Framework
- PostgreSQL-first authentication - checks API before hardcoded list

**Coach Hub Updates (dashboard.html):**
- Programme type badges on client cards (Career, AuDHD, Life, Executive)
- AuDHD clients show purple left border for visual distinction
- Programme-specific stage labels (Sessions 1-4 for AuDHD vs Weeks 1-4 for Career)
- AuDHD-specific coach actions for each session stage
- Filter buttons: All Clients, Career Booster, ND Coaching
- addAuDHDClient() now saves to PostgreSQL API

**Constants Added:**
- `AUDHD_STAGE_INFO` - Session 1-4 stage descriptions for AuDHD clients
- `PROGRAMME_TYPES` - Labels and colours for all programme types
- `getStageInfo()` - Returns correct stage info based on programme type

**Raj Samuel Data Import:**
- Imported questionnaire responses from Google Sheets to PostgreSQL
- Created `Raj_Samuel_Questionnaire_Responses.html` with formatted answers
- Updated Simon's questionnaire to use PostgreSQL API

**Files Modified:**
- `/spark-your-potential/client-portal.html` - Unified portal with AuDHD support
- `/spark-your-potential/dashboard.html` - Coach hub with programme type awareness
- `/spark-your-potential/Raj_Samuel/Raj_Samuel_Questionnaire_Responses.html` - Created
- `/spark-your-potential/Simon_Booth_Lucking/Simon_Booth_Lucking_Discovery_Questionnaire.html` - PostgreSQL

**Key Architecture:**
- Single client portal for all programme types
- Single coach hub showing all clients
- PostgreSQL backend for all client data
- Programme type determines tools and stage labels shown

### 17 December 2025 - Raj Status Update & Git Push

**Client Status Updates:**
- Raj Samuel updated to `week-2` (questionnaire complete)
- Step 1 Discovery now shows as complete with checkmark
- "View Responses" button instead of "Start Questionnaire"

**Git Commit:** `3d28d13`
- feat: unified client portal and coach hub for all programme types

**Production URLs:**
- Client Portal: https://stingray-app-7kg9p.ondigitalocean.app/client-portal.html
- Coach Dashboard: https://stingray-app-7kg9p.ondigitalocean.app/dashboard.html

### 19 December 2025 - PostgreSQL-First Architecture & Raj Week 2 Homework

**Major Architecture Change: PostgreSQL-First**
- All client data now loads from PostgreSQL first, with fallbacks only if API fails
- Coach Hub tries SYP API → SparkHub API → DEFAULT_CLIENTS (in that order)
- Client Portal tries PostgreSQL API first → CLIENTS fallback

**New API Endpoints Added (server.js):**
- `GET /api/clients` - Get all clients from PostgreSQL
- `GET /api/clients/:email` - Get single client with blueprint & homework
- `PATCH /api/clients/:email` - Update client status
- `POST /api/homework` - Save homework to PostgreSQL
- `GET /api/homework/:email/:type` - Get specific homework
- `GET /api/homework/:email` - Get all homework for client

**Database Changes (db.js):**
- New `homework` table with JSONB responses
- `saveHomework()`, `getHomework()`, `getAllHomework()` functions

**Raj Samuel Week 2:**
- Created `Raj_Samuel_Week2_Homework.html` - Interactive homework sheet
- 4 key questions + 4 homework tasks with editable text areas
- Auto-saves to PostgreSQL with localStorage fallback
- Progress bar tracking completion percentage
- Updated Career Insights Report: "cultural and organisational transformation"

**Coach Hub Fixes:**
- Fixed onclick handlers for client cards (was broken due to unquoted string IDs)
- Added `SYP_API` constant for SYP Express backend
- Badge now shows "PostgreSQL (SYP)" when data from database

**Files Modified:**
- `server.js` - Added 6 new API endpoints
- `db.js` - Added homework table and functions
- `coach-hub.html` - PostgreSQL-first loading, fixed onclick
- `client-portal.html` - PostgreSQL-first client data
- `Raj_Samuel/Raj_Samuel_Week2_Homework.html` - New file
- `Raj_Samuel/Raj_Samuel_Career_Insights_Report.html` - Text update

**Git Commits:** `8416ea2`, `ccfef59`, `6e97c94`

**Data Flow:**
```
Client/Coach → SYP Express API → PostgreSQL Database
                    ↓
              (fallback only)
           → CLIENTS/DEFAULT_CLIENTS
```

### 22 December 2025 - Coach Hub Fix & AuDHD Client Login Setup

**Coach Hub Client Click Fix:**
- Fixed client card clicks not opening details panel
- Root cause: Type mismatch between API IDs (numbers) and onclick handlers (strings)
- Changed `===` to `==` for type-flexible comparison in `openClientPanel()` and related functions
- Added debug logging for easier troubleshooting
- Commit: `fc42f5a`

**Files Modified:**
- `coach-hub.html` - Fixed 4 instances of strict equality comparison

**AuDHD Client Login Accounts Created:**
- Created Django User accounts + SYPClient records for AuDHD clients
- Both linked with `programme_type='audhd'` for correct portal routing

| Client | Email | Username | Password | Programme |
|--------|-------|----------|----------|-----------|
| Chloe Cal | chloe@thisiscal.com | chloe | potential25! | audhd |
| Deb Briggs | deborah_armstrong@hotmail.com | deb | potential25! | audhd |

**Backend Changes (neurospark-be):**
- Created `crm/management/commands/setup_audhd_clients.py` - Management command to create AuDHD clients
- Applied missing database migrations (total_sessions, current_session, etc.)
- Commits: `fa5833ae`, `fdd0c5d2`

**Login Flow:**
- **Login URL:** https://career.harnessthespark.com/login.html
- AuDHD clients (`programme_type='audhd'`) → Redirect to `audhd-dashboard.html`
- Career clients (`programme_type='career'`) → Redirect to `client-portal.html`
- Staff users → Redirect to `dashboard.html` (Coach Hub)

**Current SYP Clients in PostgreSQL:**
```
🧠 Chloe Cal      | chloe@thisiscal.com           | audhd  | User: ✅
🧠 Deb Briggs     | deborah_armstrong@hotmail.com | audhd  | User: ✅
💼 Donald Pirie   | donald@example.com            | career | User: ✅
```

**To Add More AuDHD Clients:**
```bash
python manage.py setup_audhd_clients --list  # View current clients
python manage.py setup_audhd_clients         # Run setup
```

**Production URLs:**
- **Login:** https://career.harnessthespark.com/login.html
- **AuDHD Dashboard:** https://career.harnessthespark.com/audhd-dashboard.html
- **Client Portal:** https://career.harnessthespark.com/client-portal.html
- **Coach Hub:** https://career.harnessthespark.com/coach-hub.html

### 24 December 2025 - Unified Login System & PostgreSQL-First Architecture

**Single Login for All Programmes:**
- **One login URL:** https://career.harnessthespark.com/login.html
- Smart routing based on `programme_type` from PostgreSQL SYPClient record
- No separate login pages per programme - cleaner user experience

**Login Routing Table:**
| Programme Type | After Login Redirect |
|----------------|---------------------|
| `audhd` | `audhd-dashboard.html` |
| `career` | `client-portal.html` |
| Staff/Coach | `dashboard.html` (Coach Hub) |

**100% PostgreSQL Architecture:**
```
User Login Request
       ↓
PostgreSQL: django.contrib.auth.models.User (authentication)
       ↓
PostgreSQL: crm.syp_models.SYPClient (get programme_type)
       ↓
Frontend: Smart redirect based on programme_type
```

**No localStorage for Auth:**
- All authentication through PostgreSQL
- All client data from PostgreSQL
- All programme routing from PostgreSQL
- localStorage only used for:
  - JWT token storage (after successful auth)
  - UI preferences (theme, settings)
  - Offline cache (backup only)

**Test Account Setup:**
- Lisa's test account: `lisa.gills@icloud.com`
- Can be set to any `programme_type` for testing different portals
- Command to set up test account as AuDHD client:
```bash
python manage.py shell -c "
from django.contrib.auth.models import User
from crm.syp_models import SYPClient
from django.utils import timezone

user = User.objects.get(email='lisa.gills@icloud.com')
client, created = SYPClient.objects.update_or_create(
    user=user,
    defaults={
        'full_name': 'Lisa Gills (Test)',
        'email': 'lisa.gills@icloud.com',
        'programme_type': 'audhd',
        'programme_status': 'enrolled',
        'enrolled_date': timezone.now().date(),
    }
)
print(f'Done: {client.full_name} → {client.programme_type}')
"
```

**Production Setup Commands (run via DigitalOcean Console):**
```bash
# Create AuDHD client accounts
python manage.py setup_audhd_clients

# Set up Lisa's test account
python manage.py shell -c "[command above]"
```

**All SYP Clients (PostgreSQL):**
| Name | Email | Programme | Has Login |
|------|-------|-----------|-----------|
| Chloe Cal | chloe@thisiscal.com | audhd | ✅ |
| Deb Briggs | deborah_armstrong@hotmail.com | audhd | ✅ |
| Donald Pirie | donaldpirie111@hotmail.co.uk | career | ✅ |
| Raj Samuel | rs@rajsamuel.net | career | ✅ |
| Lisa Gills (Test) | lisa.gills@icloud.com | audhd | ✅ |
