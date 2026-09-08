# MailPilot — AI-Powered Mail Workspace

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-State-amber?style=flat-square)](https://github.com/pmndrs/zustand)
[![Gmail API](https://img.shields.io/badge/Gmail-OAuth2_API-red?style=flat-square&logo=gmail)](https://developers.google.com/gmail/api)

> **Core Philosophy**: *"AI controls the application UI — not a generic text chatbot."*

MailPilot is a web-based mail client connected to a real mail provider (Gmail API / Google OAuth 2.0). It features an AI Assistant capable of operating the application UI through natural language commands — dynamically navigating folders, executing structured searches, updating visible filter chips, populating compose forms, and managing context-aware replies with strict user send confirmation.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Problem Being Solved](#2-problem-being-solved)
3. [Key Features](#3-key-features)
4. [Architecture](#4-architecture)
5. [AI Agent & Tool Architecture](#5-ai-agent--tool-architecture)
6. [Mail Provider Integration](#6-mail-provider-integration)
7. [Authentication Setup](#7-authentication-setup)
8. [Environment Variables](#8-environment-variables)
9. [Local Setup & How to Run](#9-local-setup--how-to-run)
10. [Real-Time Push Sync](#10-real-time-push-sync)
11. [AI UI-Control Flow](#11-ai-ui-control-flow)
12. [Step-by-Step Evaluator Demo Guide](#12-step-by-step-evaluator-demo-guide)
13. [Design Decisions & Tradeoffs](#13-design-decisions--tradeoffs)
14. [Known Limitations & Future Scope](#14-known-limitations--future-scope)

---

## 1. Project Overview
Unlike traditional AI integrations that render responses inside a isolated text chatbox, MailPilot turns the AI into an **action-oriented copilot**. When a user types a prompt like *"Find unread emails from IBM and open the latest one"*, the AI invokes typed function tools that manipulate the central application state store, immediately reflecting visible changes on screen.

## 2. Problem Being Solved
Traditional webmail clients require users to manually navigate menus, configure multi-clause filters, construct search syntax, and manually copy context between emails. MailPilot bridge natural language intent with programmatic UI manipulation, automating workflow actions while preserving total user control through explicit confirmation gates.

## 3. Key Features
- **Real Mail Provider Integration**: Gmail API via OAuth 2.0 PKCE with secure server-side token management.
- **Natural Language Search & Filtering**: Filters visible emails by sender, unread status, date range (e.g. last 7 days), and keywords.
- **Context-Aware Replies**: Understands relative terms like *"Reply to this saying I'll review it tomorrow"* by examining the active `selectedEmail` context.
- **Send Confirmation Gate**: AI-filled compose or reply forms present a mandatory `[Confirm & Send]` banner; emails are **never** silently dispatched.
- **Real-Time Push Sync**: Server-Sent Events (SSE) channel paired with a Google Cloud Pub/Sub Webhook endpoint for live inbox updates.
- **Modern 3-Column UI**: Sleek dark mode design inspired by Superhuman/Outlook with quick filter pills and tool action execution logs.

---

## 4. Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                                 USER                                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Natural Language Input
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        AI COMMAND INTERFACE                            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Prompt + Live Context Snapshot
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   AI AGENT & TOOL EXECUTION LAYER                      │
│      (Structured Function Calling & Fallback Intent Engine)            │
└──────┬──────────────┬──────────────┬──────────────┬──────────────┬─────┘
       │              │              │              │              │
       ▼              ▼              ▼              ▼              ▼
 searchEmails()  openEmail()   applyFilters() openCompose() replyToEmail()
       │              │              │              │              │
       └──────────────┴──────────────┼──────────────┴──────────────┘
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   CENTRAL ZUSTAND APPLICATION STORE                    │
│   (currentView, currentFolder, selectedEmail, searchQuery, filters)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Reactive State Re-render
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                             VISIBLE UI                                 │
│      (Inbox List, Filter Chips, Email Detail, Compose Modal)           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST / Server-Sent Events
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  BACKEND SERVICE & GMAIL API LAYER                     │
│         (Next.js Route Handlers + OAuth Tokens + Webhooks)             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. AI Agent & Tool Architecture

The AI layer operates on typed function definitions (`src/tools/definitions.ts`) and dispatches changes directly to the state store (`src/tools/executor.ts`):

```ts
export type ToolName =
  | 'searchEmails'
  | 'openEmail'
  | 'navigateToFolder'
  | 'openCompose'
  | 'replyToEmail'
  | 'applyFilters'
  | 'resetFilters'
  | 'sendEmail';
```

Business logic remains isolated outside prompts, and UI components react purely to store mutations.

---

## 6. Mail Provider Integration
- **OAuth 2.0 Flow**: Users log in via `/api/auth/google`, exchanging codes for tokens stored in HTTP-only session cookies.
- **Gmail REST Endpoints**: `src/services/gmail.ts` leverages `googleapis` to fetch inbox/sent messages, execute raw Gmail query strings (`from:`, `is:unread`), and dispatch MIME-encoded emails.
- **Fallback Data Store**: If OAuth credentials are not provided during evaluation, MailPilot dynamically uses a pre-populated assessment seed store (`src/services/mockMail.ts`) ensuring all demo scenarios function immediately out of the box!

---

## 7. Authentication Setup
Google OAuth 2.0 configuration requires creating credentials in Google Cloud Console:
1. Enable **Gmail API**.
2. Add Authorized Redirect URI: `http://localhost:3000/api/auth/callback/google`.
3. Set Scopes: `gmail.readonly`, `gmail.send`, `userinfo.email`.

---

## 8. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/callback/google"

# Optional AI API Key (Gemini / OpenAI)
GEMINI_API_KEY="your-gemini-api-key"
```

---

## 9. Local Setup & How to Run

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open browser at http://localhost:3000
```

To validate production build:
```bash
npm run build
npm start
```

---

## 10. Real-Time Push Sync
- **Webhook Endpoint**: `POST /api/webhooks/gmail` processes incoming push events from Google Cloud Pub/Sub.
- **SSE Stream**: `GET /api/mail/stream` maintains a persistent EventSource connection to the browser, pushing `new_mail` notifications live to trigger an instant UI refresh without timers.

---

## 11. AI UI-Control Flow

```
User Prompt: "Reply to this saying I'll complete the assessment tomorrow"
   │
   ├── Context Snapshot: { selectedEmail: { sender: "recruitment@ibm.com", subject: "IBM Software Developer Assessment" } }
   ├── AI Tool Action: replyToEmail({ body: "Hi,\n\nI will complete the assessment tomorrow.\n\nBest regards," })
   ├── Store Action: openCompose({ to: "recruitment@ibm.com", subject: "Re: IBM Software Developer Assessment", pendingConfirmation: true })
   └── Visible UI: Compose modal opens on screen with Send Confirmation Banner [Confirm & Send]
```

---

## 12. Step-by-Step Evaluator Demo Guide

Execute these prompts in the top AI Command Bar to test all evaluation criteria:

### Demo 1: Natural Language Search & Filter
- **Prompt**: `"Find emails from TechCorp"`
- **Expected Outcome**: Main Inbox updates live to display the TechCorp Technical Assessment email. Filter chip `From: TechCorp` appears.

### Demo 2: Relative Date & Unread Filtering
- **Prompt**: `"Show unread emails from the last 7 days"`
- **Expected Outcome**: Filter chips `Unread Only` and `Last 7 days` render; list filters down to 2 unread emails.

### Demo 3: Natural Language Navigation & Open
- **Prompt**: `"Open the latest email from TechCorp"`
- **Expected Outcome**: Interface smoothly transitions to Email Detail View displaying TechCorp assessment instructions.

### Demo 4: Context-Aware Reply
- **Prompt**: `"Reply to this saying I'll complete the assessment tomorrow"`
- **Expected Outcome**: Compose Modal opens with `To: recruitment@techcorp.com`, `Subject: Re: TechCorp...`, pre-filled body text, and **Yellow Send Confirmation Banner** requiring explicit user click.

### Demo 5: AI Compose UI
- **Prompt**: `"Compose an email to Rahul saying the project is ready for review"`
- **Expected Outcome**: Compose UI opens with `To: rahul.sharma@techcorp.com`, `Subject: Project Ready for Review`, and body filled.

### Demo 6: Navigation Folder Switch
- **Prompt**: `"Go to Sent"`
- **Expected Outcome**: Application navigates to Sent items folder.

---

## 13. Design Decisions & Tradeoffs
- **Next.js App Router**: Chosen for unified client/server architecture, keeping OAuth client secrets completely isolated on the server.
- **Zustand vs Redux**: Zustand provides lightweight, zero-boilerplate atomic state updates perfectly suited for reactive tool execution.
- **Confirmation Gate**: Sacrificed fully automatic email sending in favor of safety and user verification, strictly preventing accidental automated dispatches.

---

## 14. Known Limitations & Future Scope
- **Rich Text / HTML Body Editor**: Current implementation displays text email bodies cleanly; future iterations would include a full WYSIWYG rich text editor.
- **Multi-account Switching**: Currently optimized for single active OAuth user session per browser; can be expanded to multi-account inboxing.
