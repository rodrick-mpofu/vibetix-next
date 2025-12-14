/**
 * Flowglad SDK Client
 *
 * This is a custom SDK wrapper for Flowglad API.
 * Replace with official @flowglad/sdk when available.
 */

import axios, { AxiosInstance } from 'axios';

interface FlowgladConfig {
  apiKey: string;
  apiUrl?: string;
}

interface Subscription {
  id: string;
  customerId: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  features: {
    maxEvents: number;
    maxAIGenerations: number;
    platformFeeRate: number;
    customBranding: boolean;
    dynamicPricing: boolean;
    apiAccess: boolean;
  };
}

interface UsageMetric {
  customerId: string;
  metric: string;
  quantity: number;
  limit: number;
  period: 'current_billing_cycle' | 'all_time';
}

interface TrackUsageParams {
  customerId: string;
  metric: string;
  quantity: number;
  metadata?: Record<string, any>;
}

interface GetUsageParams {
  customerId: string;
  metric: string;
  period?: 'current_billing_cycle' | 'all_time';
}

interface GetSubscriptionParams {
  customerId: string;
}

interface CreateTransactionParams {
  customerId: string;
  amount: number;
  type: 'platform_fee' | 'subscription' | 'usage';
  metadata?: Record<string, any>;
}

interface CheckoutRedirectParams {
  customerId: string;
  plan: 'pro' | 'enterprise';
  successUrl: string;
  cancelUrl?: string;
}

class FlowgladClient {
  private client: AxiosInstance;

  constructor(config: FlowgladConfig) {
    this.client = axios.create({
      baseURL: config.apiUrl || process.env.FLOWGLAD_API_URL || 'https://api.flowglad.com',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Subscriptions API
   */
  subscriptions = {
    /**
     * Get a customer's subscription details
     */
    get: async (params: GetSubscriptionParams): Promise<Subscription> => {
      try {
        const response = await this.client.get(`/v1/subscriptions/${params.customerId}`);
        return response.data;
      } catch (error) {
        // If customer doesn't exist or has no subscription, return free plan
        return this.getDefaultFreePlan(params.customerId);
      }
    },

    /**
     * Create or update a subscription
     */
    update: async (customerId: string, plan: 'free' | 'pro' | 'enterprise'): Promise<Subscription> => {
      const response = await this.client.post(`/v1/subscriptions/${customerId}`, { plan });
      return response.data;
    },
  };

  /**
   * Usage Tracking API
   */
  usage = {
    /**
     * Track usage for a customer
     */
    track: async (params: TrackUsageParams): Promise<void> => {
      await this.client.post('/v1/usage/track', params);
    },

    /**
     * Get usage metrics for a customer
     */
    get: async (params: GetUsageParams): Promise<UsageMetric> => {
      const response = await this.client.get('/v1/usage', {
        params: {
          customerId: params.customerId,
          metric: params.metric,
          period: params.period || 'current_billing_cycle',
        },
      });
      return response.data;
    },
  };

  /**
   * Transactions API
   */
  transactions = {
    /**
     * Create a transaction record
     */
    create: async (params: CreateTransactionParams): Promise<void> => {
      await this.client.post('/v1/transactions', params);
    },
  };

  /**
   * Checkout API
   */
  checkout = {
    /**
     * Redirect to checkout for plan upgrade
     */
    redirect: async (params: CheckoutRedirectParams): Promise<string> => {
      const response = await this.client.post('/v1/checkout/sessions', params);
      return response.data.url;
    },
  };

  /**
   * Helper method to get default free plan
   */
  private getDefaultFreePlan(customerId: string): Subscription {
    return {
      id: 'free-default',
      customerId,
      plan: 'free',
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      features: {
        maxEvents: 2,
        maxAIGenerations: 5,
        platformFeeRate: 0.05, // 5%
        customBranding: false,
        dynamicPricing: false,
        apiAccess: false,
      },
    };
  }
}

/**
 * Initialize Flowglad client
 */
export function createFlowgladClient(config?: FlowgladConfig): FlowgladClient {
  const apiKey = config?.apiKey || process.env.FLOWGLAD_API_KEY;

  if (!apiKey) {
    throw new Error('Flowglad API key is required');
  }

  return new FlowgladClient({
    apiKey,
    apiUrl: config?.apiUrl,
  });
}

/**
 * Default Flowglad client instance
 */
export const flowglad = createFlowgladClient();

/**
 * Export types
 */
export type {
  Subscription,
  UsageMetric,
  TrackUsageParams,
  GetUsageParams,
  GetSubscriptionParams,
  CreateTransactionParams,
  CheckoutRedirectParams,
};
