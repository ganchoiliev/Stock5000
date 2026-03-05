import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { loadLiveMarketData } from '../services/data';
import type { Timeframe } from '../services/data';
import { MainChart } from '../components/MainChart';
import { AssetList } from '../components/AssetList';
import { ContributionView } from '../components/ContributionView';
import { IntelligenceCard } from '../components/IntelligenceCard';
import { AICoachCard } from '../components/AICoachCard';
import { RiskMeter } from '../components/RiskMeter';
import { AttributionChart } from '../components/AttributionChart';
import { PerformanceHeatmap } from '../components/PerformanceHeatmap';
import { CorrelationMatrix } from '../components/CorrelationMatrix';
import { computeIntelligence } from '../lib/intelligence';
import type { IntelligenceInput } from '../lib/intelligence';
import { getActiveAssets, getActiveBenchmark } from '../services/data';

export const Dashboard = () => {
    const [timeframe, setTimeframe] = useState<Timeframe>('1M');
    const [selectedAssets, setSelectedAssets] = useState<string[]>(
        getActiveAssets().map(a => a.symbol)
    );
    const [hoveredAsset, setHoveredAsset] = useState<string | null>(null);
    const [lastSync, setLastSync] = useState<number>(Date.now());
    const navigate = useNavigate();

    // Check if user needs onboarding
    const hasTickers = localStorage.getItem('portfolio-tickers');
    const hasOnboarded = localStorage.getItem('has-onboarded');
    const needsOnboarding = !hasTickers && !hasOnboarded;

    useEffect(() => {
        if (needsOnboarding) return;

        loadLiveMarketData().then((success) => {
            if (success) setLastSync(Date.now());
        });
    }, [needsOnboarding]);

    const intel = useMemo(() => {
        if (needsOnboarding) return null;
        const savedUseCustom = localStorage.getItem('portfolio-use-weights') === 'true';
        const savedWeightsStr = localStorage.getItem('portfolio-weights');
        let weights: Record<string, number> | undefined = undefined;

        if (savedUseCustom && savedWeightsStr) {
            try {
                weights = JSON.parse(savedWeightsStr);
            } catch (e) {
                // Ignore parse errors safely
            }
        }

        const input: IntelligenceInput = {
            assets: getActiveAssets(),
            benchmark: getActiveBenchmark(),
            timeframe,
            weights
        };
        return computeIntelligence(input);
    }, [timeframe, lastSync]);

    const toggleAsset = (symbol: string) => {
        setSelectedAssets(prev =>
            prev.includes(symbol)
                ? prev.filter(s => s !== symbol)
                : [...prev, symbol]
        );
    };

    if (needsOnboarding) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20 shadow-lg shadow-teal-500/10">
                    <Activity size={48} />
                </div>
                <div className="space-y-4 max-w-lg mx-auto">
                    <h1 className="text-4xl font-bold tracking-tight text-white">Welcome to Pulse</h1>
                    <p className="text-lg text-slate-400 leading-relaxed">
                        Your calm, visual portfolio tracker. Set up your custom assets, benchmarks, and target weights to begin analyzing your performance.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/settings')}
                    className="mt-8 bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold px-8 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(20,184,166,0.2)] hover:shadow-[0_0_30px_rgba(20,184,166,0.4)]"
                >
                    Set up your portfolio
                </button>
            </div>
        );
    }

    if (!intel) return null;

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div className="flex bg-slate-800/80 p-1 rounded-lg border border-slate-700/50 w-full sm:w-max overflow-x-auto backdrop-blur-sm sm:ml-auto">
                    {(['1M', '3M', '6M', 'YTD', '12M'] as Timeframe[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTimeframe(t)}
                            className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-300 ${timeframe === t
                                ? 'bg-teal-500/20 text-teal-400 shadow-sm border border-teal-500/30'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <IntelligenceCard
                        intel={intel}
                        timeframe={timeframe}
                        hoveredAsset={hoveredAsset}
                        onHighlightSymbol={setHoveredAsset}
                    />
                </div>
                <div className="lg:col-span-1">
                    <AICoachCard intel={intel} timeframe={timeframe} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-slate-600/50">
                        <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.6)]"></span>
                            Performance vs Benchmark
                        </h2>
                        <MainChart timeframe={timeframe} selectedAssets={selectedAssets} hoveredAsset={hoveredAsset} />
                    </div>

                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-slate-600/50">
                        <ContributionView hoveredAsset={hoveredAsset} setHoveredAsset={setHoveredAsset} />
                    </div>

                    <PerformanceHeatmap />

                    <CorrelationMatrix timeframe={timeframe} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <RiskMeter intel={intel} />
                        <AttributionChart
                            intel={intel}
                            hoveredAsset={hoveredAsset}
                            onHighlightSymbol={setHoveredAsset}
                        />
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 h-full backdrop-blur-md shadow-xl transition-all duration-300 hover:border-slate-600/50">
                        <h2 className="text-lg font-medium mb-6">Your Assets</h2>
                        <p className="text-xs text-slate-400 mb-4">Click to toggle line visibility</p>
                        <AssetList
                            selectedAssets={selectedAssets}
                            onToggleAsset={toggleAsset}
                            hoveredAsset={hoveredAsset}
                            setHoveredAsset={setHoveredAsset}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
