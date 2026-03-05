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
    sharpeRatio: number;
    sortinoRatio: number;
    maxDrawdown: number;
    beta: number;
    flags: { type: "RISK" | "DRAWDOWN" | "CONCENTRATION" | "DIVERGENCE" | "HIGH_BETA"; level: "ok" | "warn" | "risk"; label: string }[];
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

export const getReturns = (history: DataPoint[]) => {
    const returns: number[] = [];
    for (let i = 1; i < history.length; i++) {
        returns.push(history[i].price / history[i - 1].price - 1);
    }
    return returns;
};

export const computeStdDev = (arr: number[]) => {
    if (arr.length === 0) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
    return Math.sqrt(variance);
};

// Simple correlation logic
export const computeCorrelation = (arr1: number[], arr2: number[]) => {
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

export const computeMaxDrawdown = (cumulativeReturns: number[]) => {
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

    // --- DATA QUALITY CHECKS ---
    if (!assets || assets.length === 0) {
        return createEmptyIntelligenceOutput('No assets tracked.');
    }
    if (!benchmark || !benchmark.history1M || !benchmark.history12M) {
        return createEmptyIntelligenceOutput('Benchmark data unavailable.');
    }

    const getHist = (a: AssetData): import('../services/data').DataPoint[] => {
        switch (timeframe) {
            case '1M':  return a.history1M;
            case '3M':  return a.history3M;
            case '6M':  return a.history6M;
            case 'YTD': return a.historyYTD;
            case '12M': return a.history12M;
        }
    };

    // Filter out assets with no data for the timeframe
    const validAssets = assets.filter(a => getHist(a) && getHist(a).length > 0);
    if (validAssets.length === 0) {
        return createEmptyIntelligenceOutput(`No asset data available for ${timeframe}.`);
    }

    // Equal weights by default across VALID assets
    const n = validAssets.length;
    const w = weights || Object.fromEntries(validAssets.map(a => [a.symbol, 1 / n]));

    // Daily/Weekly Returns
    const benchmarkReturns = getReturns(getHist(benchmark));

    const assetReturnsMap: Record<string, number[]> = {};
    validAssets.forEach(a => {
        assetReturnsMap[a.symbol] = getReturns(getHist(a));
    });

    // Handle mismatched data lengths by aligning to the shortest available history
    const lengths = [benchmarkReturns.length, ...validAssets.map(a => assetReturnsMap[a.symbol].length)];
    const numPoints = Math.min(...lengths);

    if (numPoints < 5) {
        return createEmptyIntelligenceOutput('Insufficient data for period. Wait for more market days.');
    }

    // Slice all returns to align to the last `numPoints`
    const alignedBenchmarkReturns = benchmarkReturns.slice(-numPoints);

    const portfolioDailyReturns: number[] = [];
    const portfolioCumulative: number[] = [1];
    let currentCum = 1;

    for (let i = 0; i < numPoints; i++) {
        let dailyRet = 0;
        validAssets.forEach(a => {
            const rList = assetReturnsMap[a.symbol];
            // Get the corresponding aligned index
            const alignedIndex = rList.length - numPoints + i;
            const r = rList[alignedIndex] || 0;
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
    const contributions = validAssets.map(a => {
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
    const benchVol = computeStdDev(alignedBenchmarkReturns);
    const maxDrawdown = computeMaxDrawdown(portfolioCumulative);

    // Annualized Sharpe/Sortino — 6M and 12M use weekly data (52 periods/yr), others daily (252).
    const annualRFR = 0.04;
    const periodsPerYear = (timeframe === '6M' || timeframe === '12M') ? 52 : 252;
    const annualizedReturn = Math.pow(1 + portfolioReturn, periodsPerYear / numPoints) - 1;
    const annualizedVol = vol * Math.sqrt(periodsPerYear);
    const sharpeRatio = annualizedVol === 0 ? 0 : (annualizedReturn - annualRFR) / annualizedVol;

    // Sortino Ratio — like Sharpe but only penalizes downside volatility.
    // Better metric for portfolios with crypto (upside swings shouldn't count as risk).
    // MAR (minimum acceptable return) = 0 per day.
    const downsideVariance = portfolioDailyReturns.reduce((sum, r) => sum + (r < 0 ? r * r : 0), 0) / portfolioDailyReturns.length;
    const annualizedDownsideVol = Math.sqrt(downsideVariance) * Math.sqrt(periodsPerYear);
    const sortinoRatio = annualizedDownsideVol === 0 ? 0 : (annualizedReturn - annualRFR) / annualizedDownsideVol;

    // Beta: cov(portfolio, benchmark) / var(benchmark)
    // Tells how much the portfolio amplifies benchmark swings.
    // Beta 1.0 = lockstep. Beta 1.5 = 50% more sensitive.
    const meanPort = portfolioDailyReturns.reduce((a, b) => a + b, 0) / portfolioDailyReturns.length;
    const meanBnch = alignedBenchmarkReturns.reduce((a, b) => a + b, 0) / alignedBenchmarkReturns.length;
    let covSum = 0;
    let varBnchSum = 0;
    for (let i = 0; i < portfolioDailyReturns.length; i++) {
        const dp = portfolioDailyReturns[i] - meanPort;
        const db = alignedBenchmarkReturns[i] - meanBnch;
        covSum += dp * db;
        varBnchSum += db * db;
    }
    const beta = varBnchSum === 0 ? 1 : covSum / varBnchSum;

    // Flags
    const flags: IntelligenceOutput['flags'] = [];

    if (vol > benchVol * 1.3) {
        flags.push({ type: 'RISK', level: 'warn', label: `Vol > SPY x1.3` });
    }

    // Drawdown thresholds scale with the timeframe window
    const ddThreshold = timeframe === '1M' ? -0.08 : ['3M', 'YTD'].includes(timeframe) ? -0.12 : -0.18;
    if (maxDrawdown < ddThreshold) {
        flags.push({ type: 'DRAWDOWN', level: 'risk', label: `Max DD ${Math.abs(maxDrawdown * 100).toFixed(1)}%` });
    }

    const totalAbsContrib = contributions.reduce((sum, c) => sum + Math.abs(c.contribution), 0);
    const maxContribRatio = totalAbsContrib > 0 ? Math.abs(contributions[0].contribution) / totalAbsContrib : 0;

    if (maxContribRatio > 0.45) {
        flags.push({ type: 'CONCENTRATION', level: 'warn', label: `${contributions[0]?.symbol || 'Asset'} >45% influence` });
    }

    const corr = computeCorrelation(portfolioDailyReturns, alignedBenchmarkReturns);
    if (corr < 0.2) {
        flags.push({ type: 'DIVERGENCE', level: 'warn', label: `Low SPY correlation` });
    }

    if (beta > 1.5) {
        flags.push({ type: 'HIGH_BETA', level: 'warn', label: `Beta ${beta.toFixed(2)} — high market sensitivity` });
    }

    // Market Regime Detection
    let marketRegime: IntelligenceOutput['marketRegime'] = "Neutral";
    if (benchmarkReturn > 0.01) marketRegime = "Bullish";
    else if (benchmarkReturn < -0.01) marketRegime = "Bearish";

    // Pulse Score Calculation
    let pulseScore = 50;
    pulseScore += Math.max(-40, Math.min(40, alpha * 400));
    pulseScore -= Math.abs(maxDrawdown) * 200;
    if (sharpeRatio > 1.5) pulseScore += 10;
    if (sortinoRatio > 2.0) pulseScore += 5;
    if (maxContribRatio > 0.45) pulseScore -= 10;
    if (beta > 1.5) pulseScore -= 5;

    pulseScore = Math.max(0, Math.min(100, Math.round(pulseScore)));

    // Summary Generation
    const ptRetFmt = (portfolioReturn * 100).toFixed(1);
    const benchRetFmt = (benchmarkReturn * 100).toFixed(1);
    const alphaFmt = Math.abs(alpha * 100).toFixed(1);

    let summary = `Portfolio ${portfolioReturn >= 0 ? '+' : ''}${ptRetFmt}% vs benchmark ${benchmarkReturn >= 0 ? '+' : ''}${benchRetFmt}% → `;
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
        sharpeRatio,
        sortinoRatio,
        beta,
        flags,
        marketRegime,
        pulseScore,
        summary
    };
};

// Helper for empty states
const createEmptyIntelligenceOutput = (reason: string): IntelligenceOutput => ({
    portfolioReturn: 0,
    benchmarkReturn: 0,
    alpha: 0,
    topContributors: [],
    bottomContributors: [],
    vol: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
    sortinoRatio: 0,
    beta: 0,
    flags: [],
    marketRegime: "Neutral",
    pulseScore: 0,
    summary: reason
});
