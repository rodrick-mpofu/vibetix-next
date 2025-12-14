# Flowglad Integration - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Environment Variables

Add to `.env.local`:

```bash
FLOWGLAD_API_KEY=your_flowglad_api_key
FLOWGLAD_API_URL=https://api.flowglad.com
NEXT_PUBLIC_FLOWGLAD_PUBLISHABLE_KEY=your_flowglad_publishable_key
```

### 2. Run Database Migration

In Supabase SQL Editor, run:

```sql
-- File: supabase/migrations/001_add_users_table.sql
-- This adds users table and updates events table
```

### 3. Test the Integration

```bash
npm run dev
```

That's it! Flowglad is now integrated.

---

## 📚 Key Concepts

### Subscription Plans

| Plan | Price | Events | AI Gens | Platform Fee |
|------|-------|--------|---------|--------------|
| Free | $0 | 2 | 5 | 5% |
| Pro | $29/mo | ∞ | 50 | 3% |
| Enterprise | Custom | ∞ | ∞ | 2% |

### Usage Tracking

Flowglad automatically tracks:
- ✅ Number of events created
- ✅ AI API calls (event parsing, refinement)
- ✅ Platform fees on ticket sales

### Feature Gates

Premium features by plan:
- **Pro:** Custom branding, dynamic pricing, analytics
- **Enterprise:** API access, white-label, dedicated support

---

## 🔧 Common Use Cases

### Check if User Can Create Event

```typescript
import { canCreateEvent } from '@/lib/billing/host-plans';

const { allowed, reason } = await canCreateEvent(userId);
if (!allowed) {
  alert(reason); // "You've reached your event limit..."
}
```

### Track AI Usage (Auto-enforced)

```typescript
// In your API route
import { trackAIGeneration } from '@/lib/ai/usage-tracking';

// This throws if limit is reached
await trackAIGeneration(userId, 'event_parse');

// Then make AI call
const response = await claude.messages.create({...});
```

### Calculate Platform Fees

```typescript
import { calculatePlatformFee } from '@/lib/payment/platform-fees';

const { platformFee, hostReceives } = await calculatePlatformFee(
  hostId,
  10000 // $100.00 in cents
);

// platformFee: 300 ($3.00 for Pro plan with 3% fee)
// hostReceives: 9700 ($97.00)
```

### Show Upgrade Prompt

```tsx
import { UpgradePrompt } from '@/components/UpgradePrompt';

<UpgradePrompt
  userId={userId}
  variant="full"
  reason="ai_limit"
/>
```

---

## 🛠️ File Structure

New files added:

```
lib/
├── flowglad/
│   └── client.ts                    # Flowglad SDK wrapper
├── billing/
│   └── host-plans.ts                # Subscription plan logic
├── payment/
│   └── platform-fees.ts             # Fee calculation
├── features/
│   └── feature-gates.ts             # Premium feature access
└── ai/
    └── usage-tracking.ts            # AI usage tracking

pages/api/
└── billing/
    ├── usage.ts                     # GET user's AI usage
    ├── plan.ts                      # GET user's plan
    └── create-upgrade-session.ts   # POST upgrade checkout

components/
└── UpgradePrompt.tsx                # Upgrade UI component

supabase/migrations/
└── 001_add_users_table.sql          # Users table migration
```

---

## 📍 Integration Points

### Updated APIs

**`/api/events/parse`** - Now accepts `userId` for usage tracking
**`/api/events/refine`** - Now accepts `userId` for usage tracking

### Updated Services

**`eventParserService.parseEventDescription()`** - Tracks AI usage
**`eventParserService.refineEvent()`** - Tracks AI usage

---

## 🧪 Testing Checklist

- [ ] Create event as Free user (should work for first 2 events)
- [ ] Try creating 3rd event (should show upgrade prompt)
- [ ] Use AI parsing 5 times (should work)
- [ ] Try 6th AI call (should show limit error)
- [ ] Upgrade to Pro plan (via `/api/billing/create-upgrade-session`)
- [ ] Verify unlimited events and higher AI limit
- [ ] Check platform fee calculation (should be 3% instead of 5%)

---

## 🐛 Troubleshooting

**Error: "Flowglad API key is required"**
→ Add `FLOWGLAD_API_KEY` to `.env.local`

**AI limit not enforced**
→ Pass `userId` when calling `/api/events/parse`

**Platform fees wrong**
→ Check user's subscription in Flowglad dashboard

**Upgrade not working**
→ Check Flowglad webhook configuration

---

## 📖 Full Documentation

See [FLOWGLAD_INTEGRATION.md](./FLOWGLAD_INTEGRATION.md) for complete documentation.

---

## 🎯 Next Steps

1. **Add Authentication** - Replace hardcoded `demo@vibetix.com` with real auth
2. **Enable RLS** - Secure database with Row Level Security
3. **Add Webhooks** - Listen to Flowglad subscription events
4. **Customize Plans** - Adjust limits and pricing in Flowglad dashboard
5. **Add Analytics** - Track usage patterns and conversion rates

---

**Questions?** Check the full integration guide or contact support.
