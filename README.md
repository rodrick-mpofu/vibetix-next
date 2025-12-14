# VibeTix - AI-Powered Event Ticketing Platform

**Built with Next.js, Supabase, Anthropic Claude, and Stripe**

VibeTix is a dynamic event ticketing platform where AI generates custom interfaces, pricing strategies, and checkout experiences on-the-fly. Describe your event in plain English and watch VibeTix build it for you.

## 🚀 Features

- ✨ **AI-Generated Event Pages** - Each event gets a unique, custom-designed interface
- 💬 **Conversational Creation** - Describe your event in plain English
- 💰 **Real Stripe Payments** - Integrated checkout with instant payouts
- 📊 **Smart Pricing** - AI suggests optimal ticket tiers and pricing
- ⚡ **Real-Time Updates** - Live ticket counts via polling (no WebSockets needed)
- 🎫 **QR Code Tickets** - Automatic ticket generation with QR codes

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (Pages Router), TypeScript, Tailwind CSS
- **AI**: Anthropic Claude API (Sonnet 4)
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe Checkout
- **State**: React Hooks
- **Styling**: Tailwind CSS + shadcn/ui components

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Anthropic API key
- Stripe account (test mode works)

## 🔧 Installation

### 1. Clone the Repository

\`\`\`bash
cd vibetix-next
npm install
\`\`\`

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from \`supabase/schema.sql\`
3. Get your project URL and anon key from Settings > API

### 3. Set Up Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your test mode keys from Developers > API keys
3. Set up a webhook endpoint:
   - Go to Developers > Webhooks
   - Add endpoint: \`http://localhost:3000/api/checkout/webhook\`
   - Select events: \`checkout.session.completed\`, \`payment_intent.succeeded\`
   - Copy the webhook signing secret

### 4. Get Anthropic API Key

1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Create an API key

### 5. Configure Environment Variables

Create a \`.env.local\` file:

\`\`\`env
# Anthropic AI
ANTHROPIC_API_KEY=your_anthropic_api_key

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 6. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see VibeTix!

## 📁 Project Structure

\`\`\`
vibetix-next/
├── components/
│   ├── EventChat.tsx           # Conversational event creation
│   ├── TicketPreview.tsx       # AI-generated event display
│   ├── CheckoutFlow.tsx        # Stripe checkout integration
│   ├── PostPurchase.tsx        # Order confirmation
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── ai/
│   │   └── event-parser.ts     # Claude AI integration
│   ├── services/
│   │   └── event-service.ts    # Database operations
│   ├── stripe/
│   │   └── client.ts           # Stripe SDK
│   ├── supabase/
│   │   ├── client.ts           # Supabase client
│   │   └── admin.ts            # Admin client
│   └── utils/
│       ├── validators.ts       # Zod schemas
│       └── qr-generator.ts     # QR code generation
├── pages/
│   ├── api/
│   │   ├── events/
│   │   │   ├── parse.ts        # Parse event description
│   │   │   ├── refine.ts       # Refine event
│   │   │   ├── create.ts       # Create event
│   │   │   └── [id].ts         # Get event
│   │   └── checkout/
│   │       ├── create-session.ts  # Create Stripe session
│   │       └── webhook.ts         # Handle Stripe webhooks
│   ├── index.tsx               # Landing page
│   ├── create.tsx              # Event creation
│   ├── events/[id].tsx         # Event detail page
│   └── checkout/success.tsx    # Success page
├── supabase/
│   └── schema.sql              # Database schema
└── types/
    ├── index.ts                # TypeScript types
    └── supabase.ts             # Supabase types
\`\`\`

## 🎯 How It Works

### 1. Create an Event

1. Go to `/create`
2. Describe your event: "Jazz concert for 200 people next Friday"
3. AI generates:
   - Event details
   - 2-4 pricing tiers with features
   - Custom UI color scheme and layout
   - Pricing strategy

### 2. Review & Publish

1. Preview the AI-generated event page
2. Optionally refine with more instructions
3. Click "Publish Event" to create it

### 3. Share & Sell

1. Get a unique URL: `/events/[id]`
2. Share with your audience
3. Real-time ticket updates via polling

### 4. Checkout

1. Customers select a tier
2. Redirected to Stripe Checkout
3. Payment processed securely
4. QR code tickets emailed automatically

## 🔄 Real-Time Updates (Polling)

Instead of WebSockets (Pusher), VibeTix uses simple polling:

- Event pages poll `/api/events/[id]` every 5 seconds
- Updates ticket counts automatically
- No external services required
- Works everywhere

## 🧪 Testing

### Test Event Descriptions

\`\`\`
✅ "Tech conference for 500 people with workshops"
✅ "Jazz concert for 200 people next Friday night"
✅ "Kids birthday party with magic show, 30 children"
✅ "Corporate team building event for 50 employees"
\`\`\`

### Stripe Test Cards

\`\`\`
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
\`\`\`

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

### Important Notes

- Update \`NEXT_PUBLIC_APP_URL\` to your production URL
- Update Stripe webhook URL to \`https://your-domain.vercel.app/api/checkout/webhook\`
- Ensure Supabase RLS policies are configured correctly

## 🔒 Security

- **API Keys**: Never commit \`.env.local\` to git
- **Stripe Webhooks**: Signature verification enabled
- **Supabase RLS**: Row-level security policies active
- **Input Validation**: Zod schemas on all inputs
- **AI Safety**: Response validation and sanitization

## 🐛 Common Issues

### "Failed to parse event"
- Check ANTHROPIC_API_KEY is set correctly
- Ensure you have API credits

### "Failed to create checkout session"
- Verify STRIPE_SECRET_KEY is correct
- Check event has available tickets

### "Event not found"
- Verify event was created in Supabase
- Check SUPABASE_URL and keys

### Webhook not working
- Use Stripe CLI for local testing: \`stripe listen --forward-to localhost:3000/api/checkout/webhook\`
- Verify STRIPE_WEBHOOK_SECRET matches

## 📈 Next Steps

- [ ] Add user authentication (Supabase Auth)
- [ ] Host dashboard to manage events
- [ ] Email tickets with SendGrid/Resend
- [ ] Analytics dashboard
- [ ] Multiple events browsing
- [ ] Search and filters
- [ ] Event categories

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - feel free to use this for your own projects!

## 🙏 Built With

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Anthropic Claude](https://anthropic.com/)
- [Stripe](https://stripe.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

## 📧 Contact

Questions? Issues? Reach out:
- Email: rodrickmpofu@gmail.com
- LinkedIn: [rodrick-mpofu](https://www.linkedin.com/in/rodrick-mpofu/)

---

**Built for the Vibe Coding Hackathon** 🎉
