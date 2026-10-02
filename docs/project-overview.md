# DAYVAULT Project Overview

## Problem Statement

People often forget what they did on previous days and have no simple private place to combine daily activity records, photographs, and future plans.

## Proposed Solution

DAYVAULT provides a centralized private digital journal and planning system.

## Objectives
- record daily activities
- store memories
- organize photographs
- search historical activity
- manage future plans
- improve personal organization
- provide a secure authenticated architecture

## Major Modules (Implemented)

| Module | Status | Description |
|--------|--------|-------------|
| **Authentication** | ✅ Complete | Email/password via Supabase Auth, middleware protection, password reset |
| **Dashboard** | ✅ Complete | Stats cards, today's plans, recent entries |
| **Journal** | ✅ Complete | List, create, edit, view entries with photos |
| **Photo Management** | ✅ Complete | Client upload to Supabase Storage, display in entries |
| **Calendar** | ✅ Complete | Month view with entry/plan indicators, date selection |
| **Search** | ✅ Complete | Debounced global search across entries & plans via API |
| **Timeline** | ✅ Complete | Chronological view grouped by year/month |
| **Planning** | ✅ Complete | Future plans with priority, category, completion toggle, delete |
| **Theme System** | ✅ Complete | Light/dark/system via next-themes, persisted in profile |
| **Settings** | ✅ Complete | Profile name, theme, accent color, JSON data export |
| **Data Export** | ✅ Complete | Downloads all user data (profile, entries, plans, tags) as JSON |

## Not Yet Implemented (from original spec)
- **Tags System**: DB tables exist (`tags`, `entry_tags`) but no UI, API, or actions
- **OAuth Providers**: Only email/password (Google, GitHub planned)
- **Rich Text Editor**: Plain text only currently
- **AI Summaries**: Not started
- **Mobile App**: Not started