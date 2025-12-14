# Flowglad Integration Guide for VibeTix

This document provides a comprehensive guide to the Flowglad integration in VibeTix, including setup instructions, architecture overview, and usage examples.

## Table of Contents

1. [Overview](#overview)
2. [Setup Instructions](#setup-instructions)
3. [Architecture](#architecture)
4. [Subscription Plans](#subscription-plans)
5. [Usage Examples](#usage-examples)
6. [API Reference](#api-reference)
7. [Database Schema](#database-schema)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Overview

Flowglad is integrated into VibeTix to handle:

- **Subscription Management** - Host plan tiers (Free, Pro, Enterprise)
- **Usage Tracking** - AI generation limits and tracking
- **Platform Fees** - Dynamic fee rates based on subscription
- **Feature Gating** - Premium feature access control
- **Billing** - Automated subscription billing and upgrades

### Benefits

✅ **No billing state in database** - Flowglad is the single source of truth
✅ **Automatic limit enforcement** - AI usage limits enforced before API calls
✅ **Dynamic pricing** - Platform fees adjust based on host's plan
✅ **Seamless upgrades** - One-click upgrade flows with Flowglad checkout

---

## Setup Instructions

### 1. Environment Variables

Add these to your `.env.local` file:

```bash
# Flowglad
FLOWGLAD_API_KEY=your_flowglad_api_key
FLOWGLAD_API_URL=https://api.flowglad.com
NEXT_PUBLIC_FLOWGLAD_PUBLISHABLE_KEY=your_flowglad_publishable_key
```

### 2. Install Dependencies

```bash
npm install axios --legacy-peer-deps
```

### 3. Run Database Migration

Run the user table migration in your Supabase SQL Editor:

```bash
# File: supabase/migrations/001_add_users_table.sql
```

This adds:
- `users` table with `flowglad_customer_id` field
- `user_id` foreign key to `events` table
- Updated RLS policies

### 4. Configure Flowglad

In your Flowglad dashboard:

1. **Create subscription plans:**
   - Free: $0/month, 2 events, 5 AI generations, 5% platform fee
   - Pro: $29/month, unlimited events, 50 AI generations, 3% platform fee
   - Enterprise: Custom pricing, unlimited everything, 2% platform fee

2. **Set up webhooks** (optional):
   - Subscription created
   - Subscription updated
   - Subscription cancelled
   - Usage limit reached

3. **Configure metrics:**
   - `events_created` - Track number of events per billing cycle
   - `ai_generations` - Track AI API calls per billing cycle

---

## Architecture

### Flowglad as Source of Truth

```
┌─────────────────────────────────────────────────────────────┐
│                      VibeTix Backend                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Event      │  │ AI         │  │ Payment    │            │
│  │ Management │  │ Generation │  │ Processing │            │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘            │
│        │               │               │                    │
│        └───────────────┴───────────────┘                    │
│                        │                                     │
└────────────────────────┼─────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │      Flowglad        │
              │  ┌────────────────┐  │
              │  │ Subscriptions  │  │
              │  │ Usage Tracking │  │
              │  │ Transactions   │  │
              │  │ Feature Gates  │  │
              │  └────────────────┘  │
              └──────────────────────┘
```

### Key Components

1. **Flowglad SDK Client** (`lib/flowglad/client.ts`)
   - Wrapper around Flowglad API
   - Handles authentication and requests

2. **Host Plans** (`lib/billing/host-plans.ts`)
   - Get user's subscription plan
   - Check event creation limits
   - Check AI generation limits

3. **Usage Tracking** (`lib/ai/usage-tracking.ts`)
   - Track AI API calls
   - Enforce usage limits
   - Calculate usage statistics

4. **Platform Fees** (`lib/payment/platform-fees.ts`)
   - Calculate fees based on subscription
   - Record transactions in Flowglad
   - Calculate upgrade savings

5. **Feature Gates** (`lib/features/feature-gates.ts`)
   - Control premium feature access
   - Dynamic pricing
   - Custom branding
   - API access

---

## Subscription Plans

### Free Plan

**Price:** $0/month

**Limits:**
- 2 events maximum
- 5 AI generations per event
- 5% platform fee on ticket sales

**Features:**
- Basic event creation
- AI-powered event parsing
- Standard support

### Pro Plan

**Price:** $29/month

**Limits:**
- Unlimited events
- 50 AI generations per event
- 3% platform fee on ticket sales

**Features:**
- Everything in Free
- Custom branding
- Dynamic pricing AI
- Analytics dashboard
- Priority support

### Enterprise Plan

**Price:** Custom

**Limits:**
- Unlimited events
- Unlimited AI generations
- 2% platform fee on ticket sales

**Features:**
- Everything in Pro
- White-label solution
- API access
- Dedicated support
- Custom integrations

---

## Usage Examples

### Check if User Can Create Event

```typescript
import { canCreateEvent } from '@/lib/billing/host-plans';

const result = await canCreateEvent(userId);

if (!result.allowed) {
  console.log(result.reason); // "You've reached your event limit..."
  // Show upgrade prompt
}
```

### Track AI Generation

```typescript
import { trackAIGeneration } from '@/lib/ai/usage-tracking';

try {
  // This will throw an error if limit is reached
  await trackAIGeneration(userId, 'event_parse');

  // Proceed with AI API call
  const response = await claude.messages.create({...});
} catch (error) {
  // Handle limit reached error
  console.error(error.message); // "AI generation limit reached..."
}
```

### Calculate Platform Fee

```typescript
import { calculatePlatformFee } from '@/lib/payment/platform-fees';

const breakdown = await calculatePlatformFee(hostId, ticketSaleAmount);

console.log(breakdown);
// {
//   ticketSaleAmount: 10000, // $100.00
//   platformFee: 300,        // $3.00 (3% for Pro plan)
//   hostReceives: 9700,      // $97.00
//   feeRate: 0.03
// }
```

### Check Feature Access

```typescript
import { canUseDynamicPricing } from '@/lib/features/feature-gates';

const hasAccess = await canUseDynamicPricing(userId);

if (!hasAccess) {
  // Show upgrade prompt or disable feature
}
```

### Create Upgrade Session

```typescript
const response = await fetch('/api/billing/create-upgrade-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-123',
    plan: 'pro',
    successUrl: 'https://vibetix.com/dashboard?upgraded=true',
    cancelUrl: 'https://vibetix.com/pricing',
  }),
});

const { url } = await response.json();
window.location.href = url; // Redirect to Flowglad checkout
```

---

## API Reference

### REST Endpoints

#### GET `/api/billing/plan`

Get user's subscription plan details.

**Query Parameters:**
- `userId` (string, required) - User ID

**Response:**
```json
{
  "plan": "pro",
  "eventsLimit": -1,
  "aiGenerationsLimit": 50,
  "platformFeeRate": 0.03,
  "customBranding": true,
  "dynamicPricing": true,
  "apiAccess": false
}
```

#### GET `/api/billing/usage`

Get user's AI usage statistics.

**Query Parameters:**
- `userId` (string, required) - User ID

**Response:**
```json
{
  "current": 23,
  "limit": 50,
  "percentage": 46,
  "remaining": 27
}
```

#### POST `/api/billing/create-upgrade-session`

Create a Flowglad checkout session for plan upgrade.

**Request Body:**
```json
{
  "userId": "user-123",
  "plan": "pro",
  "successUrl": "https://vibetix.com/dashboard",
  "cancelUrl": "https://vibetix.com/pricing"
}
```

**Response:**
```json
{
  "url": "https://checkout.flowglad.com/session/abc123"
}
```

### Updated Event APIs

#### POST `/api/events/parse`

Parse event description with AI (now tracks usage).

**Request Body:**
```json
{
  "description": "Tech conference next week...",
  "conversationHistory": [],
  "userId": "user-123"  // NEW: Optional, for usage tracking
}
```

#### POST `/api/events/refine`

Refine event based on feedback (now tracks usage).

**Request Body:**
```json
{
  "currentEventSpec": {...},
  "feedback": "Make it cheaper",
  "conversationHistory": [],
  "userId": "user-123"  // NEW: Optional, for usage tracking
}
```

---

## Database Schema

### Users Table

```sql
create table public.users (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,

  email text unique not null,
  name text,

  -- Flowglad integration (optional, for caching)
  flowglad_customer_id text,

  metadata jsonb default '{}'::jsonb
);
```

**Note:** The `flowglad_customer_id` is optional and only used for caching. Always use `user.id` as the `customerId` when calling Flowglad APIs.

### Updated Events Table

The `events` table now has:
- `user_id` (UUID, FK to users) - Required
- `host_email` (text) - Kept for backwards compatibility, nullable

---

## React Components

### UpgradePrompt Component

Display upgrade prompts when users approach limits.

```tsx
import { UpgradePrompt } from '@/components/UpgradePrompt';

<UpgradePrompt
  userId={userId}
  variant="full"  // or "compact"
  reason="ai_limit"  // or "event_limit" or "feature_locked"
  feature="Dynamic Pricing"
/>
```

**Variants:**

1. **Compact** - Small card with progress bar
2. **Full** - Detailed card with feature list and CTA

**Props:**

- `userId` (string, required) - User ID
- `variant` ('compact' | 'full', default: 'compact')
- `reason` ('ai_limit' | 'event_limit' | 'feature_locked')
- `feature` (string, optional) - Feature name for locked features

---

## Testing

### Test Plan Creation Flow

```typescript
// 1. Check if user can create event
const canCreate = await canCreateEvent('test-user-free');
console.log(canCreate); // { allowed: true, currentCount: 0, limit: 2 }

// 2. Create first event - should succeed

// 3. Create second event - should succeed

// 4. Try to create third event - should fail
const canCreateThird = await canCreateEvent('test-user-free');
console.log(canCreateThird.allowed); // false
console.log(canCreateThird.reason); // "You've reached your event limit..."
```

### Test AI Generation Limits

```typescript
// Free plan user - 5 AI generation limit
for (let i = 0; i < 6; i++) {
  try {
    await trackAIGeneration('test-user-free', 'event_parse');
    console.log(`Generation ${i + 1} succeeded`);
  } catch (error) {
    console.log(`Generation ${i + 1} failed:`, error.message);
    // Should fail on 6th attempt
  }
}
```

### Test Platform Fee Calculation

```typescript
// Free plan - 5% fee
const freeBreakdown = await calculatePlatformFee('user-free', 10000);
console.log(freeBreakdown.platformFee); // 500 ($5.00)

// Pro plan - 3% fee
const proBreakdown = await calculatePlatformFee('user-pro', 10000);
console.log(proBreakdown.platformFee); // 300 ($3.00)

// Enterprise plan - 2% fee
const entBreakdown = await calculatePlatformFee('user-ent', 10000);
console.log(entBreakdown.platformFee); // 200 ($2.00)
```

---

## Troubleshooting

### Common Issues

#### 1. "Flowglad API key is required"

**Cause:** Missing `FLOWGLAD_API_KEY` in `.env.local`

**Solution:**
```bash
# Add to .env.local
FLOWGLAD_API_KEY=your_actual_api_key
```

#### 2. AI generation limit not enforced

**Cause:** `userId` not passed to API endpoints

**Solution:**
```typescript
// Make sure to pass userId when calling parse/refine APIs
await fetch('/api/events/parse', {
  method: 'POST',
  body: JSON.stringify({
    description: '...',
    userId: currentUser.id  // Don't forget this!
  })
});
```

#### 3. Platform fee calculation fails

**Cause:** Flowglad API error or network issue

**Solution:** The system falls back to Free plan rate (5%) on errors. Check logs:
```typescript
// Check server logs for:
console.error('Error calculating platform fee:', error);
```

#### 4. User stuck on Free plan after upgrading

**Cause:** Flowglad webhook not received or processed

**Solution:**
1. Check Flowglad dashboard for subscription status
2. Manually sync by calling:
```typescript
const plan = await flowglad.subscriptions.get({ customerId: userId });
console.log(plan.plan); // Should show 'pro' or 'enterprise'
```

### Debug Mode

Enable debug logging by adding to `.env.local`:

```bash
DEBUG=flowglad:*
```

### Health Check

Create a health check endpoint to verify Flowglad connection:

```typescript
// pages/api/health/flowglad.ts
import { flowglad } from '@/lib/flowglad/client';

export default async function handler(req, res) {
  try {
    // Try to fetch a plan
    const plan = await flowglad.subscriptions.get({
      customerId: 'test-user'
    });

    res.status(200).json({ status: 'ok', flowglad: 'connected' });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
}
```

---

## Migration Path

### Existing Users

For users created before Flowglad integration:

1. Run the database migration to add `users` table
2. Existing `host_email` values are migrated to `users.email`
3. Events are linked to users via `user_id`
4. All existing users start on Free plan by default
5. Flowglad will create subscriptions on first API call

### Gradual Rollout

1. **Phase 1:** Add Flowglad integration (current state)
2. **Phase 2:** Add authentication (replace hardcoded emails)
3. **Phase 3:** Enable RLS policies for security
4. **Phase 4:** Remove `host_email` column (after full migration)

---

## Best Practices

### 1. Always Check Limits Before Operations

```typescript
// ✅ Good
const canCreate = await canCreateEvent(userId);
if (canCreate.allowed) {
  // Proceed with event creation
} else {
  // Show upgrade prompt
}

// ❌ Bad - Creating event without checking
await createEvent({...}); // Might exceed limits
```

### 2. Track Usage Before AI Calls

```typescript
// ✅ Good - Track first, then call AI
await trackAIGeneration(userId, 'event_parse');
const response = await claude.messages.create({...});

// ❌ Bad - Calling AI without tracking
const response = await claude.messages.create({...});
```

### 3. Handle Errors Gracefully

```typescript
// ✅ Good - Show helpful error messages
try {
  await trackAIGeneration(userId, 'event_parse');
} catch (error) {
  if (error.message.includes('limit reached')) {
    // Show upgrade prompt
    showUpgradeModal();
  } else {
    // Log error but don't block user
    console.error(error);
  }
}
```

### 4. Cache Plan Data Appropriately

```typescript
// ✅ Good - Cache for short periods
const plan = await redis.get(`plan:${userId}`);
if (!plan) {
  const freshPlan = await getHostPlan(userId);
  await redis.set(`plan:${userId}`, freshPlan, 'EX', 300); // 5 min cache
}

// ❌ Bad - Caching too long
// Users won't see upgrades immediately
```

---

## Support

For issues with:

- **Flowglad integration:** Check this documentation
- **Flowglad API:** Contact Flowglad support
- **VibeTix application:** Open an issue on GitHub

---

## Changelog

### v1.0.0 - Initial Integration

- ✅ Flowglad SDK client
- ✅ Host subscription plans (Free, Pro, Enterprise)
- ✅ AI usage tracking and limits
- ✅ Platform fee calculation
- ✅ Feature gating system
- ✅ Upgrade prompt components
- ✅ API endpoints for billing
- ✅ Database migration for users table
- ✅ Updated event parser with usage tracking

---

**Last Updated:** 2024-12-14
**Integration Version:** 1.0.0
**Flowglad API Version:** v1
