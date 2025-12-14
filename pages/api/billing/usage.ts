import type { NextApiRequest, NextApiResponse } from 'next';
import { getAIUsageStats } from '@/lib/ai/usage-tracking';

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

    const usage = await getAIUsageStats(userId);

    return res.status(200).json(usage);
  } catch (error) {
    console.error('Error fetching usage:', error);
    return res.status(500).json({
      error: 'Failed to fetch usage statistics',
    });
  }
}
