/**
 * Host Subscription Plan Management
 *
 * Manages host subscription plans using Flowglad as the source of truth.
 * No database queries needed - Flowglad handles all billing state.
 */

import { flowglad, Subscription } from '@/lib/flowglad/client';

export type HostPlan = 'free' | 'pro' | 'enterprise';

export interface HostPlanDetails {
  plan: HostPlan;
  eventsLimit: number;
  aiGenerationsLimit: number;
  platformFeeRate: number;
  customBranding: boolean;
  dynamicPricing: boolean;
  apiAccess: boolean;
}

/**
 * Get host's current subscription plan
 * Flowglad is the source of truth - no DB query needed
 */
export async function getHostPlan(userId: string): Promise<HostPlanDetails> {
  try {
    const subscription = await flowglad.subscriptions.get({
      customerId: userId,
    });

    return {
      plan: subscription.plan,
      eventsLimit: subscription.features.maxEvents,
      aiGenerationsLimit: subscription.features.maxAIGenerations,
      platformFeeRate: subscription.features.platformFeeRate,
      customBranding: subscription.features.customBranding,
      dynamicPricing: subscription.features.dynamicPricing,
      apiAccess: subscription.features.apiAccess,
    };
  } catch (error) {
    console.error('Error fetching host plan from Flowglad:', error);
    // Return default free plan on error
    return getDefaultFreePlan();
  }
}

/**
 * Check if host can create a new event based on their plan limits
 */
export async function canCreateEvent(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  currentCount?: number;
  limit?: number;
}> {
  try {
    const plan = await getHostPlan(userId);

    // Pro and Enterprise have unlimited events
    if (plan.plan === 'pro' || plan.plan === 'enterprise') {
      return { allowed: true };
    }

    // For free plan, check current usage
    const usage = await flowglad.usage.get({
      customerId: userId,
      metric: 'events_created',
      period: 'current_billing_cycle',
    });

    const currentCount = usage.quantity;
    const limit = plan.eventsLimit;

    if (currentCount >= limit) {
      return {
        allowed: false,
        reason: `You've reached your event limit (${limit} events). Upgrade to Pro for unlimited events.`,
        currentCount,
        limit,
      };
    }

    return {
      allowed: true,
      currentCount,
      limit,
    };
  } catch (error) {
    console.error('Error checking event creation eligibility:', error);
    // Default to allowing creation on error to avoid blocking users
    return { allowed: true };
  }
}

/**
 * Check if host can use AI generation based on their plan limits
 */
export async function canUseAIGeneration(
  userId: string,
  generationType: 'event_parse' | 'ui_generation' | 'pricing_optimization'
): Promise<{
  allowed: boolean;
  reason?: string;
  currentCount?: number;
  limit?: number;
}> {
  try {
    const plan = await getHostPlan(userId);

    // Enterprise has unlimited AI generations
    if (plan.plan === 'enterprise') {
      return { allowed: true };
    }

    // Check current usage
    const usage = await flowglad.usage.get({
      customerId: userId,
      metric: 'ai_generations',
      period: 'current_billing_cycle',
    });

    const currentCount = usage.quantity;
    const limit = plan.aiGenerationsLimit;

    if (currentCount >= limit) {
      return {
        allowed: false,
        reason: `You've reached your AI generation limit (${limit} generations). Upgrade to ${
          plan.plan === 'free' ? 'Pro' : 'Enterprise'
        } for more.`,
        currentCount,
        limit,
      };
    }

    return {
      allowed: true,
      currentCount,
      limit,
    };
  } catch (error) {
    console.error('Error checking AI generation eligibility:', error);
    // Default to allowing on error
    return { allowed: true };
  }
}

/**
 * Get plan comparison details for upgrade prompts
 */
export function getPlanComparison(): Array<{
  plan: HostPlan;
  name: string;
  price: string;
  features: string[];
  platformFee: string;
}> {
  return [
    {
      plan: 'free',
      name: 'Free',
      price: '$0/month',
      features: [
        '2 events max',
        '5 AI generations per event',
        'Standard support',
      ],
      platformFee: '5% platform fee',
    },
    {
      plan: 'pro',
      name: 'Pro',
      price: '$29/month',
      features: [
        'Unlimited events',
        '50 AI generations per event',
        'Custom branding',
        'Dynamic pricing AI',
        'Priority support',
      ],
      platformFee: '3% platform fee',
    },
    {
      plan: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      features: [
        'White-label solution',
        'Unlimited AI generations',
        'API access',
        'Dedicated support',
        'Custom integrations',
      ],
      platformFee: '2% platform fee',
    },
  ];
}

/**
 * Helper to get default free plan details
 */
function getDefaultFreePlan(): HostPlanDetails {
  return {
    plan: 'free',
    eventsLimit: 2,
    aiGenerationsLimit: 5,
    platformFeeRate: 0.05,
    customBranding: false,
    dynamicPricing: false,
    apiAccess: false,
  };
}

/**
 * Get upgrade URL for a specific plan
 */
export async function getUpgradeUrl(
  userId: string,
  targetPlan: 'pro' | 'enterprise',
  successUrl: string,
  cancelUrl?: string
): Promise<string> {
  try {
    const url = await flowglad.checkout.redirect({
      customerId: userId,
      plan: targetPlan,
      successUrl,
      cancelUrl: cancelUrl || successUrl,
    });

    return url;
  } catch (error) {
    console.error('Error creating upgrade checkout session:', error);
    throw new Error('Failed to create upgrade session. Please try again.');
  }
}
