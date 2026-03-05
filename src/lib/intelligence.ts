import type { AssetData, DataPoint, Timeframe } from '../services/data';

export type IntelligenceInput = {
    assets: AssetData[];
    benchmark: AssetData;
    timeframe: Timeframe;
    weights?: Record<string, number>;
};

export type IntelligenceOutput = {
    portfolioReturn: number;
    benchmarkReturn: number;
    alpha: number;
    topContributors: { symbol: string; contribution: number; color: string }[];
    bottomContributors: { symbol: string; contribution: number; color: string }[];
    vol: number;
    maxDrawdown: number;
    flags: { type: "RISK" | "DRAWDOWN" | "CONCENTRATION" | "DIVERGENCE"; level: "ok" | "warn" | "risk"; label: string }[];
    marketRegime: "Bullish" | "Neutral" | "Bearish";
    pulseScore: number;
    summary: string;
};

// Colors mapping
const COLORS: Record<string, string> = {
    SPY: '#94a3b8',
    AAPL: '#00f0ff',
    AMZN: '#818cf8',
    NVDA: '#00ff9d',
    MSFT: '#3b82f6',
    BTC: '#f59e0b'
};

const getReturns = (history: DataPoint[]) => {
    const returns: number[] = [];
    for (let i = 1; i < history.length; i++) {
        returns.push(history[i].price / history[i - 1].price - 1);
    }
    return returns;
};

const computeStdDev = (arr: number[]) => {
    if (arr.length === 0) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
    return Math.sqrt(variance);
};

// Simple correlation logic
const computeCorrelation = (arr1: number[], arr2: number[]) => {
    if (arr1.length === 0 || arr2.length === 0 || arr1.length !== arr2.length) return 0;
    const mean1 = arr1.reduce((a, b) => a + b, 0) / arr1.length;
    const mean2 = arr2.reduce((a, b) => a + b, 0) / arr2.length;

    let num = 0, den1 = 0, den2 = 0;
    for (let i = 0; i < arr1.length; i++) {
        const d1 = arr1[i] - mean1;
        const d2 = arr2[i] - mean2;
        num += d1 * d2;
        den1 += d1 * d1;
        den2 += d2 * d2;
    }
    if (den1 === 0 || den2 === 0) return 0;
    return num / Math.sqrt(den1 * den2);
};

const computeMaxDrawdown = (cumulativeReturns: number[]) => {
    let maxDD = 0;
    let peak = cumulativeReturns[0] || 1;
    for (const val of cumulativeReturns) {
        if (val > peak) peak = val;
        const dd = (val - peak) / peak;
        if (dd < maxDD) maxDD = dd;
    }
    return maxDD;
};

export const computeIntelligence = (input: IntelligenceInput): IntelligenceOutput => {
    const { assets, benchmark, timeframe, weights } = input;

    // Equal weights by default
    const n = assets.length;
    const w = weights || Object.fromEntries(assets.map(a => [a.symbol, 1 / n]));

    const getHist = (a: AssetData) => timeframe === '1M' ? a.history1M : a.history12M;

    // Daily/Weekly Returns
    const benchmarkReturns = getReturns(getHist(benchmark));

    const assetReturnsMap: Record<string, number[]> = {};
    assets.forEach(a => {
        assetReturnsMap[a.symbol] = getReturns(getHist(a));
    });

    const numPoints = benchmarkReturns.length;
    const portfolioDailyReturns: number[] = [];
    const portfolioCumulative: number[] = [1];
    let currentCum = 1;

    for (let i = 0; i < numPoints; i++) {
        let dailyRet = 0;
        assets.forEach(a => {
            const r = assetReturnsMap[a.symbol][i] || 0;
            dailyRet += (w[a.symbol] || 0) * r;
        });
        portfolioDailyReturns.push(dailyRet);
        currentCum *= (1 + dailyRet);
        portfolioCumulative.push(currentCum);
    }

    const startBench = getHist(benchmark)[0].price;
    const endBench = getHist(benchmark)[getHist(benchmark).length - 1].price;
    const benchmarkReturn = (endBench / startBench) - 1;

    const portfolioReturn = currentCum - 1;
    const alpha = portfolioReturn - benchmarkReturn;

    // Contributions
    const contributions = assets.map(a => {
        const start = getHist(a)[0].price;
        const end = getHist(a)[getHist(a).length - 1].price;
        const totalRet = (end / start) - 1;
        const symbolW = w[a.symbol] || 0;
        return {
            symbol: a.symbol,
            contribution: symbolW * totalRet,
            color: COLORS[a.symbol] || '#ffffff'
        };
    }).sort((a, b) => b.contribution - a.contribution);

    const topContributors = contributions.filter(c => c.contribution > 0).slice(0, 2);
    const bottomContributors = contributions.filter(c => c.contribution < 0).reverse().slice(0, 2);

    // Risk
    const vol = computeStdDev(portfolioDailyReturns);
    const benchVol = computeStdDev(benchmarkReturns);
    const maxDrawdown = computeMaxDrawdown(portfolioCumulative);

    // Flags
    const flags: IntelligenceOutput['flags'] = [];

    if (vol > benchVol * 1.3) {
        flags.push({ type: 'RISK', level: 'warn', label: `Vol > SPY x1.3` });
    }

    if ((timeframe === '1M' && maxDrawdown < -0.08) || (timeframe === '12M' && maxDrawdown < -0.18)) {
        flags.push({ type: 'DRAWDOWN', level: 'risk', label: `Max DD ${Math.abs(maxDrawdown * 100).toFixed(1)}%` });
    }

    const totalAbsContrib = contributions.reduce((sum, c) => sum + Math.abs(c.contribution), 0);
    const maxContribRatio = totalAbsContrib > 0 ? Math.abs(contributions[0].contribution) / totalAbsContrib : 0;

    if (maxContribRatio > 0.45) {
        flags.push({ type: 'CONCENTRATION', level: 'warn', label: `${contributions[0].symbol} >45% influence` });
    }

    const corr = computeCorrelation(portfolioDailyReturns, benchmarkReturns);
    if (corr < 0.2) {
        flags.push({ type: 'DIVERGENCE', level: 'warn', label: `Low SPY correlation` });
    }

    // Market Regime Detection
    // Simple heuristic: SPY positive by >1% -> Bullish, SPY negative < -1% -> Bearish, else Neutral
    // Can enhance later with moving averages if data supports it.
    let marketRegime: IntelligenceOutput['marketRegime'] = "Neutral";
    if (benchmarkReturn > 0.01) marketRegime = "Bullish";
    else if (benchmarkReturn < -0.01) marketRegime = "Bearish";

    // Pulse Score Calculation
    let pulseScore = 50;
    // Cap alpha contribution to ±40 points
    pulseScore += Math.max(-40, Math.min(40, alpha * 400));
    pulseScore -= Math.abs(maxDrawdown) * 200;
    if (maxContribRatio > 0.45) pulseScore -= 10;

    pulseScore = Math.max(0, Math.min(100, Math.round(pulseScore)));

    // Summary Generation
    const ptRetFmt = (portfolioReturn * 100).toFixed(1);
    const benchRetFmt = (benchmarkReturn * 100).toFixed(1);
    const alphaFmt = Math.abs(alpha * 100).toFixed(1);

    let summary = `Portfolio ${portfolioReturn >= 0 ? '+' : ''}${ptRetFmt}% vs SPY ${benchmarkReturn >= 0 ? '+' : ''}${benchRetFmt}% → `;
    summary += `${alpha >= 0 ? '+' : '-'}${alphaFmt}% ${alpha >= 0 ? 'alpha' : 'underperformance'}. `;

    if (topContributors.length > 0) {
        const topSymbols = topContributors.map(c => `${c.symbol} (+${(c.contribution * 100).toFixed(1)}%)`).join(' and ');
        summary += `Led by ${topSymbols}. `;
    } else if (bottomContributors.length > 0) {
        summary += `Losses driven by ${bottomContributors[0].symbol}. `;
    }

    return {
        portfolioReturn,
        benchmarkReturn,
        alpha,
        topContributors,
        bottomContributors,
        vol,
        maxDrawdown,
        flags,
        marketRegime,
        pulseScore,
        summary
    };
};
