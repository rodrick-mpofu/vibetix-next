/**
 * Platform Fee Calculation
 *
 * Calculates platform fees based on host's subscription plan.
 * Fee rates are managed by Flowglad as the source of truth.
 */

import { flowglad } from '@/lib/flowglad/client';
import { getHostPlan } from '@/lib/billing/host-plans';

export interface PlatformFeeBreakdown {
  ticketSaleAmount: number;
  platformFee: number;
  hostReceives: number;
  feeRate: number;
}

/**
 * Calculate platform fee based on host's subscription plan
 *
 * Fee rates by plan:
 * - Free: 5%
 * - Pro: 3%
 * - Enterprise: 2%
 */
export async function calculatePlatformFee(
  hostId: string,
  ticketSaleAmount: number
): Promise<PlatformFeeBreakdown> {
  try {
    // Get host's subscription to determine fee rate
    const subscription = await flowglad.subscriptions.get({
      customerId: hostId,
    });

    const feeRate = subscription.features.platformFeeRate;
    const platformFee = Math.round(ticketSaleAmount * feeRate);
    const hostReceives = ticketSaleAmount - platformFee;

    // Record the transaction in Flowglad for analytics
    await flowglad.transactions.create({
      customerId: hostId,
      amount: platformFee,
      type: 'platform_fee',
      metadata: {
        ticketSaleAmount,
        feeRate,
        hostReceives,
        timestamp: new Date().toISOString(),
      },
    });

    return {
      ticketSaleAmount,
      platformFee,
      hostReceives,
      feeRate,
    };
  } catch (error) {
    console.error('Error calculating platform fee:', error);

    // Fallback to default free plan rate (5%)
    const feeRate = 0.05;
    const platformFee = Math.round(ticketSaleAmount * feeRate);
    const hostReceives = ticketSaleAmount - platformFee;

    return {
      ticketSaleAmount,
      platformFee,
      hostReceives,
      feeRate,
    };
  }
}

/**
 * Get platform fee rate for a host without calculating actual fee
 */
export async function getPlatformFeeRate(hostId: string): Promise<number> {
  try {
    const plan = await getHostPlan(hostId);
    return plan.platformFeeRate;
  } catch (error) {
    console.error('Error fetching platform fee rate:', error);
    return 0.05; // Default to 5%
  }
}

/**
 * Calculate potential savings if host upgrades their plan
 */
export async function calculateUpgradeSavings(
  hostId: string,
  estimatedMonthlyRevenue: number
): Promise<{
  currentPlan: string;
  currentFeeRate: number;
  currentMonthlyFee: number;
  proFeeRate: number;
  proMonthlyFee: number;
  proMonthlySavings: number;
  proAnnualSavings: number;
  breakEvenRevenue: number;
}> {
  try {
    const plan = await getHostPlan(hostId);

    const currentFeeRate = plan.platformFeeRate;
    const currentMonthlyFee = Math.round(estimatedMonthlyRevenue * currentFeeRate);

    const proFeeRate = 0.03; // Pro plan: 3%
    const proMonthlyFee = Math.round(estimatedMonthlyRevenue * proFeeRate);
    const proSubscriptionCost = 29; // $29/month for Pro

    const proMonthlySavings = currentMonthlyFee - (proMonthlyFee + proSubscriptionCost);
    const proAnnualSavings = proMonthlySavings * 12;

    // Calculate break-even: when does Pro become cheaper?
    // currentFeeRate * revenue = proFeeRate * revenue + 29
    // (currentFeeRate - proFeeRate) * revenue = 29
    const breakEvenRevenue = Math.ceil(29 / (currentFeeRate - proFeeRate));

    return {
      currentPlan: plan.plan,
      currentFeeRate,
      currentMonthlyFee,
      proFeeRate,
      proMonthlyFee: proMonthlyFee + proSubscriptionCost,
      proMonthlySavings,
      proAnnualSavings,
      breakEvenRevenue,
    };
  } catch (error) {
    console.error('Error calculating upgrade savings:', error);
    throw new Error('Failed to calculate upgrade savings');
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amountInCents: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amountInCents / 100);
}

/**
 * Format percentage for display
 */
export function formatPercentage(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}
