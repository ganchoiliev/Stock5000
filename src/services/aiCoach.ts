import type { IntelligenceOutput } from '../lib/intelligence';
import { OPENAI_PROXY_URL, SUPABASE_ANON_KEY } from '../lib/supabaseConfig';

export const generateAIInsight = async (intel: IntelligenceOutput, timeframe: string): Promise<string> => {
    // Construct a concise prompt with the exact data needed
    const prompt = `
You are a calm, senior financial advisor providing a quick, personalized insight on a user's portfolio.
Do not use generic financial jargon. Be extremely brief (2-3 sentences max).
Use the data provided to highlight strengths, warn about risks, or suggest diversification.

PORTFOLIO DATA (${timeframe} Timeframe):
- Market Regime: ${intel.marketRegime}
- Pulse Score: ${intel.pulseScore}/100
- Portfolio Return: ${(intel.portfolioReturn * 100).toFixed(1)}%
- S&P Benchmark Return: ${(intel.benchmarkReturn * 100).toFixed(1)}%
- Alpha: ${(intel.alpha * 100).toFixed(1)}%
- Top Driver: ${intel.topContributors[0]?.symbol || 'N/A'} (Contribution: ${intel.topContributors.length > 0 ? (intel.topContributors[0].contribution * 100).toFixed(1) : 0}%)
- Main Drag: ${intel.bottomContributors[0]?.symbol || 'None'} (Contribution: ${intel.bottomContributors.length > 0 ? (intel.bottomContributors[0].contribution * 100).toFixed(1) : 0}%)
- Active Flags: ${intel.flags.length > 0 ? intel.flags.map(f => f.label).join(', ') : 'None'}

Provide a single, insightful paragraph.
`;

    try {
        const response = await fetch(OPENAI_PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
                type: 'insight',
                systemPrompt: 'You are a concise, reassuring, and expert portfolio analyst.',
                userPrompt: prompt,
                model: 'gpt-4o-mini',
                max_tokens: 150,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            if (error.error?.includes?.('quota') || error.error?.includes?.('insufficient_quota')) {
                return "The AI Coach is currently unavailable due to API quota limits. Please check your OpenAI billing details.";
            }
            throw new Error(error.error || 'Failed to fetch AI insight');
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error: any) {
        console.error("AI Coach Error:", error);
        return "Sorry, the AI Coach is temporarily offline. Please try again later.";
    }
};
