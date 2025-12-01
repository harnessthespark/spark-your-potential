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

### Raj Samuel (NEW - December 2025)
- **Email:** rs@rajsamuel.net
- **Status:** Pre-Programme (agreement pending signature)
- **Programme:** 4-Week Career Booster
- **Enrolled:** December 2025
- **Folder:** `/Raj_Samuel/`
- **Files created:**
  - `Raj_Samuel_Coaching_Agreement.html` - Digital signature ready
  - `Raj_Samuel_Programme_Outline.html` - What he'll receive
- **Progress:** Awaiting agreement signature and questionnaire

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
- `Raj_Samuel_Coaching_Agreement.html` - Digital signature ready
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
