import type { NextApiRequest, NextApiResponse } from 'next';
import { getHostPlan } from '@/lib/billing/host-plans';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    const plan = await getHostPlan(userId);

    return res.status(200).json(plan);
  } catch (error) {
    console.error('Error fetching plan:', error);
    return res.status(500).json({
      error: 'Failed to fetch subscription plan',
    });
  }
}
