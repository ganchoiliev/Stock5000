import { describe, it, expect } from 'vitest';
import { computeIntelligence } from './intelligence';
import type { AssetData } from '../services/data';

describe('intelligence engine', () => {
    it('properly computes equal weighted portfolio performance and handles missing data gracefully', () => {
        // Mock simple 2-asset universe over 6 days (to pass length check > 5)
        const mockAssets: AssetData[] = [
            {
                symbol: 'A', name: 'Asset A', type: 'stock',
                history1M: [
                    { date: '2024-01-01', price: 100 },
                    { date: '2024-01-02', price: 105 },
                    { date: '2024-01-03', price: 110 },
                    { date: '2024-01-04', price: 112 },
                    { date: '2024-01-05', price: 114 },
                    { date: '2024-01-06', price: 115 }
                ],
                currentPrice: 115, change1M: 15,
                history3M: [], history6M: [], historyYTD: [], history12M: [],
                change3M: 0, change6M: 0, changeYTD: 0, change12M: 0
            },
            {
                symbol: 'B', name: 'Asset B', type: 'crypto',
                history1M: [
                    { date: '2024-01-01', price: 200 },
                    { date: '2024-01-02', price: 190 },
                    { date: '2024-01-03', price: 180 },
                    { date: '2024-01-04', price: 175 },
                    { date: '2024-01-05', price: 170 },
                    { date: '2024-01-06', price: 160 }
                ],
                currentPrice: 160, change1M: -20,
                history3M: [], history6M: [], historyYTD: [], history12M: [],
                change3M: 0, change6M: 0, changeYTD: 0, change12M: 0
            }
        ];

        const mockBenchmark: AssetData = {
            symbol: 'BENCH', name: 'Benchmark', type: 'benchmark',
            history1M: [
                { date: '2024-01-01', price: 50 },
                { date: '2024-01-02', price: 51 },
                { date: '2024-01-03', price: 52 },
                { date: '2024-01-04', price: 53 },
                { date: '2024-01-05', price: 54 },
                { date: '2024-01-06', price: 55 }
            ],
            currentPrice: 55, change1M: 10,
            history3M: [], history6M: [], historyYTD: [], history12M: [],
            change3M: 0, change6M: 0, changeYTD: 0, change12M: 0
        };

        const result = computeIntelligence({
            assets: mockAssets,
            benchmark: mockBenchmark,
            timeframe: '1M'
        });

        // Portfolio weights should be [0.5, 0.5]
        // A increases monotonically, B decreases monotonically. Overall, portfolio drops slightly because B drops faster than A grows.
        expect(result.portfolioReturn).toBeLessThan(0);

        // Bench ret: 4% => Alpha: -4%
        expect(result.alpha).toBeLessThan(0);

        // Best should be A, Worst B
        expect(result.topContributors[0].symbol).toBe('A');
        expect(result.bottomContributors[0].symbol).toBe('B');

        // Risk regime calculation should process without error
        expect(['Bullish', 'Neutral', 'Bearish']).toContain(result.marketRegime);
    });

    it('returns zeroes when arrays are empty', () => {
        const result = computeIntelligence({
            assets: [],
            benchmark: { symbol: 'SPY', name: 'SPY', type: 'benchmark', history1M: [], history12M: [], history3M: [], history6M: [], historyYTD: [], currentPrice: 0, change1M: 0, change12M: 0, change3M: 0, change6M: 0, changeYTD: 0 },
            timeframe: '1M'
        });

        expect(result.portfolioReturn).toBe(0);
        expect(result.pulseScore).toBe(0); // The empty helper sets it to 0
        expect(result.marketRegime).toBe('Neutral');
    });
});
