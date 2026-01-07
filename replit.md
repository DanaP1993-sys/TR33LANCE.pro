# Tree-Lance Platform

Full-stack marketplace connecting homeowners with tree service contractors.

## Overview
- **Purpose**: Connect homeowners with verified tree service contractors
- **Stack**: React + TypeScript (frontend), Express.js + PostgreSQL (backend)
- **Design**: Dark Industrial aesthetic with Rajdhani/Inter fonts, neon green accents
- **Copyright**: © 2025 Dana Palmer. All Rights Reserved. TREE-LANCE™ Platform

## Architecture Modules

### Homeowner App
- Job Request: POST /api/jobs
- Live Tracking: GET /api/jobs/:id

### Contractor App  
- Job Alerts: GET /api/notifications
- Job Updates: PATCH /api/jobs/:id/status

### AI Intelligence
- Job Analysis: POST /api/ai/analyze-job (pricing, risk detection)
- Chat AI: POST /api/ai/chat (OpenAI-compatible format for Flutter)
- Conversation Storage: /api/conversations (persistent chat history)

### Job Management
- Dispatch Engine: POST /api/dispatch (Haversine + rating scoring)
- Job Database: /api/jobs CRUD

### Profile & Trust
- Verified Contractors: POST /api/users/:id/verify
- Ratings & Reviews: POST /api/users/:id/ratings

### Payment & Escrow
- Escrow System: Stripe checkout with 20% platform fee
- Instant Payouts: POST /api/stripe/checkout
- Webhook: /api/stripe/webhook

### Maps & Tracking
- Live GPS: Coordinates stored in jobs table (lat, lng)
- Nearby Contractors: GET /api/contractors/nearby

### Dispute & Support
- Dispute Resolution: /api/disputes CRUD
- Status: open, resolved, rejected

### Notifications & Chat
- Push Alerts: /api/notifications
- Live Messaging: WebSocket ready

## API Response Format (Flutter Compatible)

The `/api/ai/chat` endpoint returns OpenAI-standard format:
```json
{
  "choices": [
    {
      "message": {
        "content": "AI response"
      }
    }
  ]
}
```

## Job Status Flow
requested → accepted → in_progress → completed/cancelled

## Payment Split
- Platform Fee: 20%
- Contractor Payout: 80%

## Recent Changes
- 2026-01-07: Added AI Integration (OpenAI via Replit AI Integrations)
- 2026-01-07: Added /api/ai/chat endpoint for Flutter compatibility
- 2026-01-07: Added /api/ai/analyze-job for pricing AI
