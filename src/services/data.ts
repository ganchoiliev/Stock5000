import { format, subDays, subWeeks } from 'date-fns';

export type Timeframe = '1M' | '3M' | '6M' | 'YTD' | '12M';
export type BenchmarkType = 'SPY' | 'QQQ' | 'DIA' | 'ARKK' | 'GLD';

const ALL_BENCHMARKS: BenchmarkType[] = ['SPY', 'QQQ', 'DIA', 'ARKK', 'GLD'];

export const SUPPORTED_TICKERS = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'BTC', 'TSLA', 'META', 'GOOGL'];

export interface DataPoint {
    date: string;
    price: number;
}

export interface AssetData {
    symbol: string;
    name: string;
    type: 'stock' | 'crypto' | 'benchmark';
    history1M: DataPoint[];
    history3M: DataPoint[];
    history6M: DataPoint[];
    historyYTD: DataPoint[];
    history12M: DataPoint[];
    currentPrice: number;
    change1M: number;
    change3M: number;
    change6M: number;
    changeYTD: number;
    change12M: number;
}

export interface NormalizedDataPoint {
    date: string;
    [symbol: string]: number | string; // e.g., 'AAPL': 105.2, 'date': '2023-01-01'
}

// Seeded random for consistent mock data
let seed = 12345;
const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

const generateHistory = (
    startPrice: number,
    volatility: number,
    points: number,
    interval: 'day' | 'week',
    trend: number = 0.001
): DataPoint[] => {
    const history: DataPoint[] = [];
    let currentPrice = startPrice;
    const now = new Date();

    for (let i = points; i >= 0; i--) {
        const date = interval === 'day' ? subDays(now, i) : subWeeks(now, i);

        // Add random walk with drift
        const change = (random() - 0.45) * volatility + trend;
        currentPrice = currentPrice * (1 + change);

        history.push({
            date: format(date, 'yyyy-MM-dd'),
            price: Number(currentPrice.toFixed(2)),
        });
    }

    return history;
};

export const MOCK_ASSETS: AssetData[] = [];

// Initialize mock data synchronously so initial render doesn't break
export const initMockData = () => {
    const configs: Record<string, { price: number, vol: number, trend: number }> = {
        'SPY':  { price: 500,   vol: 0.01,  trend: 0.0005 },
        'DIA':  { price: 380,   vol: 0.009, trend: 0.0004 },
        'ARKK': { price: 45,    vol: 0.035, trend: 0.0008 },
        'GLD':  { price: 185,   vol: 0.008, trend: 0.0003 },
        'QQQ': { price: 440, vol: 0.012, trend: 0.0006 },
        'AAPL': { price: 175, vol: 0.015, trend: 0.001 },
        'AMZN': { price: 170, vol: 0.02, trend: 0.0015 },
        'NVDA': { price: 850, vol: 0.03, trend: 0.003 },
        'MSFT': { price: 400, vol: 0.012, trend: 0.001 },
        'BTC': { price: 65000, vol: 0.04, trend: 0.002 },
        'TSLA': { price: 180, vol: 0.035, trend: 0.0005 },
        'META': { price: 500, vol: 0.025, trend: 0.002 },
        'GOOGL': { price: 170, vol: 0.015, trend: 0.001 },
    };

    const allTickersToGen = Array.from(new Set([...SUPPORTED_TICKERS, ...ALL_BENCHMARKS]));

    // Clear and rebuild
    MOCK_ASSETS.length = 0;

    allTickersToGen.forEach(symbol => {
        const config = configs[symbol] || { price: 100, vol: 0.02, trend: 0.001 };
        const type = (ALL_BENCHMARKS as string[]).includes(symbol) ? 'benchmark' : symbol === 'BTC' ? 'crypto' : 'stock';
        const nameMap: Record<string, string> = { 'SPY': 'S&P 500', 'QQQ': 'Nasdaq 100', 'DIA': 'Dow Jones', 'ARKK': 'Innovation', 'GLD': 'Gold' };
        const name = nameMap[symbol] || symbol;

        const asset: AssetData = {
            symbol, name, type,
            history1M: [], history3M: [], history6M: [], historyYTD: [], history12M: [],
            currentPrice: 0,
            change1M: 0, change3M: 0, change6M: 0, changeYTD: 0, change12M: 0
        };

        asset.history1M = generateHistory(config.price, config.vol, 30, 'day', config.trend);
        asset.history3M = generateHistory(config.price * 0.95, config.vol, 90, 'day', config.trend);
        asset.history6M = generateHistory(config.price * 0.9, config.vol * 1.5, 26, 'week', config.trend * 2);
        // Approximation for YTD
        asset.historyYTD = generateHistory(config.price * 0.92, config.vol * 1.2, 50, 'day', config.trend * 1.5);
        asset.history12M = generateHistory(config.price * 0.8, config.vol * 2, 52, 'week', config.trend * 3);

        asset.currentPrice = asset.history1M[asset.history1M.length - 1].price;

        asset.change1M = ((asset.currentPrice - asset.history1M[0].price) / asset.history1M[0].price) * 100;
        asset.change3M = ((asset.currentPrice - asset.history3M[0].price) / asset.history3M[0].price) * 100;
        asset.change6M = ((asset.currentPrice - asset.history6M[0].price) / asset.history6M[0].price) * 100;
        asset.changeYTD = ((asset.currentPrice - asset.historyYTD[0].price) / asset.historyYTD[0].price) * 100;
        asset.change12M = ((asset.currentPrice - asset.history12M[0].price) / asset.history12M[0].price) * 100;

        MOCK_ASSETS.push(asset);
    });
};

initMockData();

// Fetch live data from proxy
export const loadLiveMarketData = async () => {
    try {
        const tickersToFetch = Array.from(new Set([...SUPPORTED_TICKERS, ...ALL_BENCHMARKS]));
        const today = format(new Date(), 'yyyy-MM-dd');
        const cacheKey = `portfolio-data-cache-${today}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
            const parsed = JSON.parse(cached);
            MOCK_ASSETS.length = 0;
            parsed.forEach((a: AssetData) => MOCK_ASSETS.push(a));
            return true;
        }

        const promises = tickersToFetch.map(async (symbol) => {
            const ranges = ['1mo', '3mo', '6mo', 'ytd', '1y'];
            const historyMap: Record<string, DataPoint[]> = {};

            for (const range of ranges) {
                const interval = (range === '1y' || range === '6mo') ? '1wk' : '1d';
                // Use our Vercel serverless proxy — avoids CORS and allorigins rate limits
                const res = await fetch(`/api/market?symbol=${symbol}&range=${range}&interval=${interval}`);
                if (!res.ok) throw new Error(`Failed to fetch ${symbol}`);
                const data = await res.json();

                const result = data.chart.result[0];
                const timestamps: number[] = result.timestamp;
                const closePrices: number[] = result.indicators.quote[0].close;

                const points: DataPoint[] = [];
                for (let i = 0; i < timestamps.length; i++) {
                    if (closePrices[i] !== null && closePrices[i] !== undefined) {
                        points.push({
                            date: format(new Date(timestamps[i] * 1000), 'yyyy-MM-dd'),
                            price: Number(closePrices[i].toFixed(2))
                        });
                    }
                }
                historyMap[range] = points;
            }

            const type = (ALL_BENCHMARKS as string[]).includes(symbol) ? 'benchmark' : symbol === 'BTC' ? 'crypto' : 'stock';
            const nameMap: Record<string, string> = { 'SPY': 'S&P 500', 'QQQ': 'Nasdaq 100', 'DIA': 'Dow Jones', 'ARKK': 'Innovation', 'GLD': 'Gold' };
            const name = nameMap[symbol] || symbol;

            const currentPrice = historyMap['1mo'][historyMap['1mo'].length - 1].price;

            const calcChange = (pts: DataPoint[]) => pts.length > 0 ? ((currentPrice - pts[0].price) / pts[0].price) * 100 : 0;

            return {
                symbol, name, type,
                history1M: historyMap['1mo'],
                history3M: historyMap['3mo'],
                history6M: historyMap['6mo'],
                historyYTD: historyMap['ytd'],
                history12M: historyMap['1y'],
                currentPrice,
                change1M: calcChange(historyMap['1mo']),
                change3M: calcChange(historyMap['3mo']),
                change6M: calcChange(historyMap['6mo']),
                changeYTD: calcChange(historyMap['ytd']),
                change12M: calcChange(historyMap['1y'])
            } as AssetData;
        });

        const liveAssets = await Promise.all(promises);

        MOCK_ASSETS.length = 0;
        liveAssets.forEach(a => MOCK_ASSETS.push(a));

        localStorage.setItem(cacheKey, JSON.stringify(liveAssets));
        return true;
    } catch (error) {
        console.error("Live data fetch failed, falling back to initialized mock data:", error);
        return false;
    }
};

// Get normalized data for chart (base 100)
// Correctly handles all 5 timeframes — previously was hardcoded to 1M vs 12M only.
export const getNormalizedChartData = (timeframe: Timeframe): NormalizedDataPoint[] => {
    const savedTickers = localStorage.getItem('portfolio-tickers');
    const activeTickers: string[] = savedTickers ? JSON.parse(savedTickers) : ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'BTC'];

    const savedBench = localStorage.getItem('portfolio-benchmark');
    const activeBenchmark = savedBench || 'SPY';

    const filteredAssets = MOCK_ASSETS.filter(
        a => activeTickers.includes(a.symbol) || a.symbol === activeBenchmark
    );
    if (filteredAssets.length === 0) return [];

    const getHistForTimeframe = (asset: AssetData): DataPoint[] => {
        switch (timeframe) {
            case '1M':  return asset.history1M;
            case '3M':  return asset.history3M;
            case '6M':  return asset.history6M;
            case 'YTD': return asset.historyYTD;
            case '12M': return asset.history12M;
        }
    };

    const histories = filteredAssets.map(a => getHistForTimeframe(a));
    const minLen = Math.min(...histories.map(h => h.length));
    if (minLen === 0) return [];

    const result: NormalizedDataPoint[] = [];
    for (let i = 0; i < minLen; i++) {
        const dataPoint: NormalizedDataPoint = { date: '' };

        filteredAssets.forEach((asset, idx) => {
            const history = histories[idx];
            const alignedIndex = history.length - minLen + i;
            if (alignedIndex >= 0 && history[alignedIndex]) {
                dataPoint.date = history[alignedIndex].date;
                const initialPrice = history[history.length - minLen].price;
                dataPoint[asset.symbol] = Number(
                    ((history[alignedIndex].price / initialPrice) * 100).toFixed(2)
                );
            }
        });

        if (dataPoint.date) result.push(dataPoint);
    }

    return result;
};

export const getAssetBySymbol = (symbol: string): AssetData | undefined => {
    return MOCK_ASSETS.find(a => a.symbol === symbol);
};

export const getActiveAssets = (): AssetData[] => {
    const savedTickers = localStorage.getItem('portfolio-tickers');
    const activeTickers = savedTickers ? JSON.parse(savedTickers) : ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'BTC'];
    return MOCK_ASSETS.filter(a => activeTickers.includes(a.symbol) && a.type !== 'benchmark');
};

export const getActiveBenchmark = (): AssetData => {
    const savedBench = localStorage.getItem('portfolio-benchmark');
    const activeBenchmark = savedBench || 'SPY';
    return MOCK_ASSETS.find(a => a.symbol === activeBenchmark) || MOCK_ASSETS[0];
};
