/**
 * AI Generation Usage Tracking
 *
 * Tracks and enforces AI generation limits using Flowglad.
 */

import { flowglad } from '@/lib/flowglad/client';
import { getHostPlan } from '@/lib/billing/host-plans';

export type AIGenerationType = 'event_parse' | 'ui_generation' | 'pricing_optimization';

/**
 * Track AI generation usage for a user
 * Call this BEFORE making the AI API call to enforce limits
 */
export async function trackAIGeneration(
  userId: string,
  generationType: AIGenerationType
): Promise<void> {
  try {
    // Check if user has reached their limit
    const usage = await flowglad.usage.get({
      customerId: userId,
      metric: 'ai_generations',
      period: 'current_billing_cycle',
    });

    const plan = await getHostPlan(userId);

    // Enterprise has unlimited, so skip limit check
    if (plan.plan === 'enterprise') {
      await recordUsage(userId, generationType);
      return;
    }

    // Check if limit exceeded
    if (usage.quantity >= plan.aiGenerationsLimit) {
      const upgradePlan = plan.plan === 'free' ? 'Pro' : 'Enterprise';
      throw new Error(
        `AI generation limit reached (${plan.aiGenerationsLimit}/${plan.aiGenerationsLimit}). ` +
        `Upgrade to ${upgradePlan} for ${plan.plan === 'free' ? 'more' : 'unlimited'} AI generations.`
      );
    }

    // Track the usage
    await recordUsage(userId, generationType);
  } catch (error) {
    // If it's our limit error, re-throw it
    if (error instanceof Error && error.message.includes('limit reached')) {
      throw error;
    }

    // For other errors, log but don't block the user
    console.error('Error tracking AI generation:', error);
  }
}

/**
 * Record AI usage in Flowglad
 */
async function recordUsage(userId: string, generationType: AIGenerationType): Promise<void> {
  await flowglad.usage.track({
    customerId: userId,
    metric: 'ai_generations',
    quantity: 1,
    metadata: {
      type: generationType,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Get current AI usage stats for a user
 */
export async function getAIUsageStats(userId: string): Promise<{
  current: number;
  limit: number;
  percentage: number;
  remaining: number;
}> {
  try {
    const [usage, plan] = await Promise.all([
      flowglad.usage.get({
        customerId: userId,
        metric: 'ai_generations',
        period: 'current_billing_cycle',
      }),
      getHostPlan(userId),
    ]);

    const current = usage.quantity;
    const limit = plan.aiGenerationsLimit;
    const remaining = Math.max(0, limit - current);
    const percentage = limit > 0 ? (current / limit) * 100 : 0;

    return {
      current,
      limit,
      percentage,
      remaining,
    };
  } catch (error) {
    console.error('Error fetching AI usage stats:', error);
    return {
      current: 0,
      limit: 5,
      percentage: 0,
      remaining: 5,
    };
  }
}

/**
 * Check if user should see upgrade prompt based on usage
 * Show at 80% threshold
 */
export async function shouldShowUpgradePrompt(userId: string): Promise<boolean> {
  try {
    const stats = await getAIUsageStats(userId);
    const plan = await getHostPlan(userId);

    // Don't show for Enterprise (already at top tier)
    if (plan.plan === 'enterprise') {
      return false;
    }

    // Show if at or above 80% usage
    return stats.percentage >= 80;
  } catch (error) {
    console.error('Error checking upgrade prompt eligibility:', error);
    return false;
  }
}
