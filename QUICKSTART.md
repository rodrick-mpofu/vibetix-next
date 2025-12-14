# VibeTix Quick Start Guide

Get VibeTix running in under 10 minutes!

## ⚡ Quick Setup

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (takes ~2 minutes)
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the entire contents of \`supabase/schema.sql\`
6. Click **Run** (bottom right)
7. Go to **Settings** > **API**
8. Copy your **Project URL** and **anon public** key

### 3. Get API Keys

**Anthropic (Claude AI)**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign in or create account
3. Go to **API Keys**
4. Create new key, copy it

**Stripe (Payments)**
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Create account or sign in
3. Click **Developers** (top right)
4. Go to **API keys**
5. Copy **Publishable key** and **Secret key** (test mode)
6. Go to **Webhooks** > **Add endpoint**
   - URL: \`http://localhost:3000/api/checkout/webhook\`
   - Events: Select \`checkout.session.completed\` and \`payment_intent.succeeded\`
   - Copy the **Signing secret**

### 4. Create .env.local

Create a file named \`.env.local\` in the project root:

\`\`\`env
# Anthropic
ANTHROPIC_API_KEY=sk-ant-api03-xxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

**Important**: Replace all \`xxx\` with your actual keys!

### 5. Run the App

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## 🎯 Try It Out

### Create Your First Event

1. Click **"Create Event"**
2. Type: \`"Tech meetup for 50 developers tomorrow at 6pm"\`
3. Press Enter
4. Wait ~10 seconds for AI to generate
5. Click **"View Event"**
6. Click **"Publish Event"**
7. You now have a live event page!

### Test a Purchase

1. On the event page, click any ticket tier
2. Fill in:
   - Name: Test User
   - Email: test@example.com
3. Click **"Proceed to Payment"**
4. Use Stripe test card: \`4242 4242 4242 4242\`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
5. Complete payment
6. See success page!

## 🧪 Testing Webhooks Locally

Stripe webhooks won't work on localhost without this:

### Install Stripe CLI

\`\`\`bash
# Windows (with Scoop)
scoop install stripe

# Mac
brew install stripe/stripe-cli/stripe

# Or download from https://stripe.com/docs/stripe-cli
\`\`\`

### Forward Webhooks

\`\`\`bash
stripe login
stripe listen --forward-to localhost:3000/api/checkout/webhook
\`\`\`

Copy the webhook signing secret (starts with \`whsec_\`) and update it in your \`.env.local\`.

## 🐛 Troubleshooting

### "Failed to parse event"
- ✅ Check ANTHROPIC_API_KEY is correct
- ✅ Make sure you have API credits ($5 free trial)

### "Failed to create event"
- ✅ Verify Supabase schema was run successfully
- ✅ Check NEXT_PUBLIC_SUPABASE_URL and keys are correct
- ✅ Check Supabase logs (Logs & Reports in dashboard)

### "Invalid API key" (Stripe)
- ✅ Make sure you're using **test mode** keys (start with sk_test_)
- ✅ Check you copied the full key without spaces

### Webhook not triggering
- ✅ Use Stripe CLI for local testing (see above)
- ✅ In production, verify webhook URL is correct
- ✅ Check Stripe Dashboard > Developers > Webhooks for errors

### Build errors
- ✅ Delete \`.next\` folder and \`node_modules\`
- ✅ Run \`npm install\` again
- ✅ Run \`npm run dev\`

## 📚 What's Next?

1. **Customize AI prompts** - Edit \`lib/ai/event-parser.ts\`
2. **Add more ticket features** - Modify the schema
3. **Change UI colors** - Edit Tailwind config
4. **Add authentication** - Use Supabase Auth
5. **Deploy** - Push to Vercel (see README.md)

## 🎨 Example Events to Try

\`\`\`
"Jazz concert for 200 people next Friday at Blue Note"
"3-day tech conference with 5 workshops, 500 attendees"
"Kids birthday party with magic show, 30 children"
"Yoga workshop series, 8 weeks, 20 people per session"
"Corporate team building, 50 employees, escape room"
\`\`\`

## 💡 Pro Tips

1. **Save money**: Use Claude Haiku instead of Sonnet for cheaper API calls
2. **Speed up**: Cache AI responses in database for similar events
3. **Better UX**: Add loading skeletons during AI generation
4. **More features**: Check out the full README.md for advanced setup

## 🆘 Still Stuck?

- Check the logs in your terminal
- Look at browser console (F12) for errors
- Verify all environment variables are set
- Make sure ports 3000 is not in use

---

**You're all set!** Start creating amazing AI-generated events 🎉
