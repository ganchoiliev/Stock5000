// Vercel Serverless Function — proxies Yahoo Finance to avoid CORS issues
// Deployed at /api/market?symbol=AAPL&range=1mo&interval=1d

const ALLOWED_SYMBOLS = [
    'AAPL', 'MSFT', 'NVDA', 'AMZN', 'BTC', 'TSLA', 'META', 'GOOGL',
    'SPY', 'QQQ', 'DIA', 'ARKK', 'GLD'
];

// Yahoo Finance uses different tickers for some assets
const YF_SYMBOL_MAP: Record<string, string> = {
    'BTC': 'BTC-USD',
};

export default async function handler(req: any, res: any) {
    // Only allow GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { symbol, range, interval } = req.query || {};

    if (!symbol || !range || !interval) {
        return res.status(400).json({ error: 'Missing required params: symbol, range, interval' });
    }

    const sym = String(symbol).toUpperCase();

    if (!ALLOWED_SYMBOLS.includes(sym)) {
        return res.status(400).json({ error: `Symbol not supported: ${sym}` });
    }

    const yfSymbol = YF_SYMBOL_MAP[sym] || sym;
    const yahooUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${yfSymbol}?range=${range}&interval=${interval}`;

    try {
        const response = await fetch(yahooUrl, {
            headers: {
                // Yahoo Finance requires a user-agent to avoid 429s
                'User-Agent': 'Mozilla/5.0 (compatible; portfolio-pulse/1.0)',
            },
        });

        if (!response.ok) {
            return res.status(response.status).json({
                error: `Yahoo Finance returned ${response.status} for ${sym}`,
            });
        }

        const data = await response.json();

        // Cache at Vercel's edge CDN for 1 hour, serve stale for 10 mins while revalidating
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600');
        return res.status(200).json(data);
    } catch (err) {
        console.error(`[market proxy] Failed to fetch ${sym}:`, err);
        return res.status(500).json({ error: 'Failed to fetch market data from Yahoo Finance' });
    }
}
