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
- Direct Messaging: /api/messages (user-to-user messaging)
  - GET /api/messages/conversations - List all conversations
  - GET /api/messages/:userId - Get messages with a specific user
  - POST /api/messages - Send a message
  - PATCH /api/messages/:id/read - Mark message as read

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

## Future Roadmap: AR Smart Glasses Mode

Phase 1 - Prototype: Mobile AR simulation, WebSocket live updates, basic AI detection
Phase 2 - Glasses Integration: Unity/WebXR for HoloLens/Magic Leap, voice/gesture commands
Phase 3 - Full AI: Pruning guidance, hazard spatial mapping, autonomous overlays
Phase 4 - Beta: Field testing with contractors

Hardware targets: Microsoft HoloLens 2, Magic Leap 2, Nreal Air
Backend ready: JWT auth, real-time API, AI integration, GPS coordinates

## High-Tech Feature Expansion Roadmap

### Phase 1 - AI + Smart Scheduling
- Computer vision for tree species/disease detection
- AI-powered smart scheduling based on location, skill, risk
- AR-enabled mobile previews

### Phase 2 - AR Glasses + Live Streaming
- Smart glasses with holographic overlays
- Live video streaming from contractor to homeowner
- AI-assisted annotations in feed

### Phase 3 - IoT + Drones
- Smart tree sensors for health monitoring
- Drone integration for aerial mapping
- 3D site map generation

### Phase 4 - Smart Contracts + Full AR
- Blockchain-inspired milestone payments
- Full AR collaboration between all parties
- Gamification with badges and leaderboards

## Recent Changes
- 2026-01-07: Added Direct Messaging feature (user-to-user chat with job context)
- 2026-01-07: Added Messages page to frontend navigation
- 2026-01-07: Added AI Integration (OpenAI via Replit AI Integrations)
- 2026-01-07: Added /api/ai/chat endpoint for Flutter compatibility
- 2026-01-07: Added /api/ai/analyze-job for pricing AI
