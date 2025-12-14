import type { NextApiRequest, NextApiResponse } from 'next';
import { getUpgradeUrl } from '@/lib/billing/host-plans';

interface CreateUpgradeSessionBody {
  userId: string;
  plan: 'pro' | 'enterprise';
  successUrl: string;
  cancelUrl?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, plan, successUrl, cancelUrl } = req.body as CreateUpgradeSessionBody;

    // Validate required fields
    if (!userId || !plan || !successUrl) {
      return res.status(400).json({
        error: 'userId, plan, and successUrl are required',
      });
    }

    // Validate plan
    if (!['pro', 'enterprise'].includes(plan)) {
      return res.status(400).json({
        error: 'plan must be either "pro" or "enterprise"',
      });
    }

    // Create Flowglad checkout session
    const url = await getUpgradeUrl(userId, plan, successUrl, cancelUrl);

    return res.status(200).json({ url });
  } catch (error) {
    console.error('Error creating upgrade session:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create upgrade session',
    });
  }
}
