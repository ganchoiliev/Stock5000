import { format, subDays, subWeeks } from 'date-fns';

export type Timeframe = '1M' | '12M';

export interface DataPoint {
    date: string;
    price: number;
}

export interface AssetData {
    symbol: string;
    name: string;
    type: 'stock' | 'crypto' | 'benchmark';
    history1M: DataPoint[];
    history12M: DataPoint[];
    currentPrice: number;
    change1M: number;
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

export const MOCK_ASSETS: AssetData[] = [
    {
        symbol: 'SPY',
        name: 'S&P 500',
        type: 'benchmark',
        history1M: [],
        history12M: [],
        currentPrice: 0,
        change1M: 0,
        change12M: 0,
    },
    {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        type: 'stock',
        history1M: [],
        history12M: [],
        currentPrice: 0,
        change1M: 0,
        change12M: 0,
    },
    {
        symbol: 'AMZN',
        name: 'Amazon.com Inc.',
        type: 'stock',
        history1M: [],
        history12M: [],
        currentPrice: 0,
        change1M: 0,
        change12M: 0,
    },
    {
        symbol: 'NVDA',
        name: 'NVIDIA Corp.',
        type: 'stock',
        history1M: [],
        history12M: [],
        currentPrice: 0,
        change1M: 0,
        change12M: 0,
    },
    {
        symbol: 'MSFT',
        name: 'Microsoft Corp.',
        type: 'stock',
        history1M: [],
        history12M: [],
        currentPrice: 0,
        change1M: 0,
        change12M: 0,
    },
    {
        symbol: 'BTC',
        name: 'Bitcoin',
        type: 'crypto',
        history1M: [],
        history12M: [],
        currentPrice: 0,
        change1M: 0,
        change12M: 0,
    },
];

// Initialize mock data
const initMockData = () => {
    const configs: Record<string, { price: number, vol: number, trend: number }> = {
        'SPY': { price: 500, vol: 0.01, trend: 0.0005 },
        'AAPL': { price: 175, vol: 0.015, trend: 0.001 },
        'AMZN': { price: 170, vol: 0.02, trend: 0.0015 },
        'NVDA': { price: 850, vol: 0.03, trend: 0.003 },
        'MSFT': { price: 400, vol: 0.012, trend: 0.001 },
        'BTC': { price: 65000, vol: 0.04, trend: 0.002 },
    };

    MOCK_ASSETS.forEach(asset => {
        const config = configs[asset.symbol];
        // 1M = 30 days
        asset.history1M = generateHistory(config.price, config.vol, 30, 'day', config.trend);
        // 12M = 52 weeks (we need the 1M end to match 12M end structurally, but for mock let's just use weeks)
        asset.history12M = generateHistory(config.price * 0.8, config.vol * 2, 52, 'week', config.trend * 3);

        asset.currentPrice = asset.history1M[asset.history1M.length - 1].price;

        const start1MPrice = asset.history1M[0].price;
        asset.change1M = ((asset.currentPrice - start1MPrice) / start1MPrice) * 100;

        const start12MPrice = asset.history12M[0].price;
        asset.change12M = ((asset.currentPrice - start12MPrice) / start12MPrice) * 100;
    });
};

initMockData();

// Get normalized data for chart (base 100)
export const getNormalizedChartData = (timeframe: Timeframe): NormalizedDataPoint[] => {
    const points = timeframe === '1M' ? 31 : 53; // 30+1 or 52+1 points
    const result: NormalizedDataPoint[] = [];

    for (let i = 0; i < points; i++) {
        const dataPoint: NormalizedDataPoint = { date: '' };

        MOCK_ASSETS.forEach(asset => {
            const history = timeframe === '1M' ? asset.history1M : asset.history12M;
            if (history[i]) {
                dataPoint.date = history[i].date;
                const initialPrice = history[0].price;
                dataPoint[asset.symbol] = Number(((history[i].price / initialPrice) * 100).toFixed(2));
            }
        });

        if (dataPoint.date) {
            result.push(dataPoint);
        }
    }

    return result;
};

export const getAssetBySymbol = (symbol: string): AssetData | undefined => {
    return MOCK_ASSETS.find(a => a.symbol === symbol);
};
