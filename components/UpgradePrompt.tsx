'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Progress } from '@/components/progress';
import { Sparkles, Zap, Crown } from 'lucide-react';

interface UpgradePromptProps {
  userId: string;
  variant?: 'compact' | 'full';
  reason?: 'ai_limit' | 'event_limit' | 'feature_locked';
  feature?: string;
}

interface UsageStats {
  current: number;
  limit: number;
  percentage: number;
  remaining: number;
}

export function UpgradePrompt({
  userId,
  variant = 'compact',
  reason = 'ai_limit',
  feature
}: UpgradePromptProps) {
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const response = await fetch(`/api/billing/usage?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setUsage(data);
        }
      } catch (error) {
        console.error('Error fetching usage:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsage();
  }, [userId]);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const response = await fetch('/api/billing/create-upgrade-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          plan: 'pro',
          successUrl: `${window.location.origin}/dashboard?upgraded=true`,
          cancelUrl: window.location.href,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating upgrade session:', error);
      setUpgrading(false);
    }
  };

  if (loading || !usage) {
    return null;
  }

  // Don't show prompt if not approaching limit and no specific reason
  if (!reason && usage.percentage < 80) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Approaching AI Limit</CardTitle>
            </div>
            <Button
              onClick={handleUpgrade}
              disabled={upgrading}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {upgrading ? 'Redirecting...' : 'Upgrade to Pro'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                AI Generations Used
              </span>
              <span className="font-medium">
                {usage.current} / {usage.limit}
              </span>
            </div>
            <Progress value={usage.percentage} className="h-2" />
          </div>
          <p className="text-sm text-muted-foreground">
            You've used {usage.current} of {usage.limit} AI generations.
            Upgrade to Pro for 50 generations per event.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Full variant with detailed features
  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-3">
          <Crown className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl">
          {reason === 'ai_limit' && "You're Running Low on AI Generations"}
          {reason === 'event_limit' && "Event Limit Reached"}
          {reason === 'feature_locked' && `Unlock ${feature}`}
        </CardTitle>
        <CardDescription className="text-base">
          Upgrade to Pro and unlock powerful features for your events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {reason === 'ai_limit' && usage && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>AI Generations This Month</span>
              <span>{usage.current} / {usage.limit}</span>
            </div>
            <Progress value={usage.percentage} className="h-3" />
            <p className="text-sm text-muted-foreground text-center">
              Only {usage.remaining} generations remaining
            </p>
          </div>
        )}

        <div className="grid gap-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50">
            <Zap className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <p className="font-medium">Unlimited Events</p>
              <p className="text-sm text-muted-foreground">
                Create as many events as you need
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50">
            <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <p className="font-medium">50 AI Generations per Event</p>
              <p className="text-sm text-muted-foreground">
                10x more AI power for your events
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50">
            <Crown className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <p className="font-medium">Lower Platform Fees</p>
              <p className="text-sm text-muted-foreground">
                Only 3% platform fee (vs 5% on Free)
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <Button
            onClick={handleUpgrade}
            disabled={upgrading}
            size="lg"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
          >
            {upgrading ? 'Redirecting to Checkout...' : 'Upgrade to Pro - $29/month'}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Cancel anytime. No long-term commitment.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact inline upgrade prompt for use in forms/dialogs
 */
export function InlineUpgradePrompt({
  message,
  onUpgrade
}: {
  message: string;
  onUpgrade: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200">
      <div className="flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <p className="text-sm font-medium text-purple-900">{message}</p>
      </div>
      <Button
        onClick={onUpgrade}
        size="sm"
        className="bg-purple-600 hover:bg-purple-700"
      >
        Upgrade
      </Button>
    </div>
  );
}
