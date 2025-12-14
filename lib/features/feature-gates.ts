/**
 * Feature Gating System
 *
 * Controls access to premium features based on Flowglad subscription plans.
 */

import { flowglad } from '@/lib/flowglad/client';
import { getHostPlan, HostPlan } from '@/lib/billing/host-plans';

export type Feature =
  | 'dynamic_pricing'
  | 'custom_branding'
  | 'api_access'
  | 'white_label'
  | 'dedicated_support'
  | 'analytics_dashboard'
  | 'priority_support'
  | 'unlimited_events'
  | 'advanced_ai';

/**
 * Feature access matrix by plan
 */
const FEATURE_ACCESS: Record<Feature, HostPlan[]> = {
  dynamic_pricing: ['pro', 'enterprise'],
  custom_branding: ['pro', 'enterprise'],
  api_access: ['enterprise'],
  white_label: ['enterprise'],
  dedicated_support: ['enterprise'],
  analytics_dashboard: ['pro', 'enterprise'],
  priority_support: ['pro', 'enterprise'],
  unlimited_events: ['pro', 'enterprise'],
  advanced_ai: ['enterprise'],
};

/**
 * Check if user has access to a specific feature
 */
export async function hasFeatureAccess(
  userId: string,
  feature: Feature
): Promise<boolean> {
  try {
    const plan = await getHostPlan(userId);
    const allowedPlans = FEATURE_ACCESS[feature];

    return allowedPlans.includes(plan.plan);
  } catch (error) {
    console.error(`Error checking feature access for ${feature}:`, error);
    return false; // Deny access on error
  }
}

/**
 * Check if user can use dynamic pricing AI
 */
export async function canUseDynamicPricing(userId: string): Promise<boolean> {
  return hasFeatureAccess(userId, 'dynamic_pricing');
}

/**
 * Check if user can use custom branding
 */
export async function canUseCustomBranding(userId: string): Promise<boolean> {
  return hasFeatureAccess(userId, 'custom_branding');
}

/**
 * Check if user has API access
 */
export async function hasAPIAccess(userId: string): Promise<boolean> {
  return hasFeatureAccess(userId, 'api_access');
}

/**
 * Check if user can use white-label features
 */
export async function canUseWhiteLabel(userId: string): Promise<boolean> {
  return hasFeatureAccess(userId, 'white_label');
}

/**
 * Get all features available to a user based on their plan
 */
export async function getAvailableFeatures(userId: string): Promise<Feature[]> {
  try {
    const plan = await getHostPlan(userId);
    const features: Feature[] = [];

    for (const [feature, allowedPlans] of Object.entries(FEATURE_ACCESS)) {
      if (allowedPlans.includes(plan.plan)) {
        features.push(feature as Feature);
      }
    }

    return features;
  } catch (error) {
    console.error('Error fetching available features:', error);
    return [];
  }
}

/**
 * Get features that would be unlocked by upgrading to a specific plan
 */
export async function getUpgradeFeatures(
  userId: string,
  targetPlan: 'pro' | 'enterprise'
): Promise<Feature[]> {
  try {
    const currentPlan = await getHostPlan(userId);
    const newFeatures: Feature[] = [];

    for (const [feature, allowedPlans] of Object.entries(FEATURE_ACCESS)) {
      const hasCurrently = allowedPlans.includes(currentPlan.plan);
      const wouldHave = allowedPlans.includes(targetPlan);

      // Feature they would gain by upgrading
      if (!hasCurrently && wouldHave) {
        newFeatures.push(feature as Feature);
      }
    }

    return newFeatures;
  } catch (error) {
    console.error('Error calculating upgrade features:', error);
    return [];
  }
}

/**
 * Require feature access - throws error if user doesn't have access
 */
export async function requireFeatureAccess(
  userId: string,
  feature: Feature
): Promise<void> {
  const hasAccess = await hasFeatureAccess(userId, feature);

  if (!hasAccess) {
    const plan = await getHostPlan(userId);
    const requiredPlan = getMinimumPlanForFeature(feature);

    throw new Error(
      `This feature requires ${requiredPlan} plan. You're currently on the ${plan.plan} plan. ` +
      `Upgrade to unlock ${feature.replace('_', ' ')}.`
    );
  }
}

/**
 * Get the minimum plan required for a feature
 */
export function getMinimumPlanForFeature(feature: Feature): HostPlan {
  const allowedPlans = FEATURE_ACCESS[feature];

  if (allowedPlans.includes('free')) return 'free';
  if (allowedPlans.includes('pro')) return 'pro';
  return 'enterprise';
}

/**
 * Get human-readable feature names
 */
export function getFeatureName(feature: Feature): string {
  const names: Record<Feature, string> = {
    dynamic_pricing: 'Dynamic Pricing AI',
    custom_branding: 'Custom Branding',
    api_access: 'API Access',
    white_label: 'White Label',
    dedicated_support: 'Dedicated Support',
    analytics_dashboard: 'Analytics Dashboard',
    priority_support: 'Priority Support',
    unlimited_events: 'Unlimited Events',
    advanced_ai: 'Advanced AI Features',
  };

  return names[feature];
}

/**
 * Get feature description
 */
export function getFeatureDescription(feature: Feature): string {
  const descriptions: Record<Feature, string> = {
    dynamic_pricing: 'AI-powered pricing optimization based on demand and market trends',
    custom_branding: 'Customize event pages with your own colors, logos, and styling',
    api_access: 'Full REST API access for custom integrations',
    white_label: 'Remove VibeTix branding and use your own domain',
    dedicated_support: 'Direct access to our support team with priority response',
    analytics_dashboard: 'Advanced analytics and reporting for your events',
    priority_support: 'Get help faster with priority support queue',
    unlimited_events: 'Create unlimited events without restrictions',
    advanced_ai: 'Access to latest AI models and unlimited generations',
  };

  return descriptions[feature];
}
