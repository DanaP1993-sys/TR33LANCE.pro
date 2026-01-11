# Tree-Lance Platform

Full-stack marketplace connecting homeowners with tree service contractors.

## Overview
- **Purpose**: Connect homeowners with verified tree service contractors
- **Stack**: React + TypeScript (frontend), Express.js + PostgreSQL (backend)
- **Design**: Dark Industrial aesthetic with Rajdhani/Inter fonts, neon green accents
- **Copyright**: © 2024 Dana A. Palmer. All rights reserved. Unauthorized copying, distribution, or use is strictly prohibited.

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

### IoT & Drone Integration (Phase 3 - LIVE)
- Drone Surveys: /api/drones CRUD
  - GET /api/drones - List all drone surveys
  - GET /api/drones/:id - Get survey details
  - POST /api/drones - Schedule new survey
  - PATCH /api/drones/:id - Update survey status/findings
- Tree Sensors: /api/sensors CRUD
  - GET /api/sensors - List all IoT sensors
  - GET /api/sensors/:id - Get sensor details
  - POST /api/sensors - Deploy new sensor
  - PATCH /api/sensors/:id - Update sensor data
- Sensor Readings: /api/sensors/:id/readings
  - GET - Historical readings for a sensor
  - POST - Record new sensor reading
- Seed Demo Data: POST /api/seed-iot

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

## Vision 2030 Master Feature Map

### User Layer
- Contractor AR Glasses with holographic overlays, voice/gesture commands
- Homeowner App with live video feed, AR previews, environmental metrics

### AI & Intelligence Layer
- Computer vision for tree species, disease, pest detection
- Predictive analytics for risk scoring and maintenance schedules
- Natural language AI for voice commands and instructions
- AI Safety Assistant for hazard and fatigue detection

### IoT & Sensing Layer
- Tree sensors (soil moisture, structural health, leaf health)
- Wearable sensors (contractor fatigue, heart rate, exposure alerts)
- Drone mapping with autonomous aerial surveys and 3D mapping

### Collaboration Layer
- Live AR collaboration with remote expert annotations
- Real-time AI suggestions and hazard highlighting

### Compliance & Safety Layer
- Automated license and insurance verification
- AI compliance checks against local regulations
- Safety alerts from wearables and environmental sensors

### Sustainability & Analytics Layer
- Carbon sequestration and growth tracking
- Before/after comparisons with AI insights
- Ecosystem health monitoring

## Recent Changes
- 2026-01-07: Added IoT Command Center with drone surveys and smart tree sensors (Phase 3 LIVE)
- 2026-01-07: Added /api/drones, /api/sensors, /api/sensors/:id/readings endpoints
- 2026-01-07: Added IoT Dashboard frontend page with real-time sensor monitoring
- 2026-01-07: Added Direct Messaging feature (user-to-user chat with job context)
- 2026-01-07: Added Messages page to frontend navigation
- 2026-01-07: Added AI Integration (OpenAI via Replit AI Integrations)
- 2026-01-07: Added /api/ai/chat endpoint for Flutter compatibility
- 2026-01-07: Added /api/ai/analyze-job for pricing AI
