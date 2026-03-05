import { useState, useMemo } from 'react';
import type { Timeframe } from '../services/data';
import { MainChart } from '../components/MainChart';
import { AssetList } from '../components/AssetList';
import { ContributionView } from '../components/ContributionView';
import { IntelligenceCard } from '../components/IntelligenceCard';
import { AICoachCard } from '../components/AICoachCard';
import { RiskMeter } from '../components/RiskMeter';
import { AttributionChart } from '../components/AttributionChart';
import { PerformanceHeatmap } from '../components/PerformanceHeatmap';
import { computeIntelligence } from '../lib/intelligence';
import type { IntelligenceInput } from '../lib/intelligence';
import { MOCK_ASSETS } from '../services/data';

export const Dashboard = () => {
    const [timeframe, setTimeframe] = useState<Timeframe>('1M');
    // Default selected assets to show on the chart
    const [selectedAssets, setSelectedAssets] = useState<string[]>(['AAPL', 'NVDA']);

    // Track which asset is currently hovered
    const [hoveredAsset, setHoveredAsset] = useState<string | null>(null);

    const intel = useMemo(() => {
        const input: IntelligenceInput = {
            assets: MOCK_ASSETS.filter(a => a.type !== 'benchmark'),
            benchmark: MOCK_ASSETS.find(a => a.symbol === 'SPY')!,
            timeframe
        };
        return computeIntelligence(input);
    }, [timeframe]);

    const toggleAsset = (symbol: string) => {
        setSelectedAssets(prev =>
            prev.includes(symbol)
                ? prev.filter(s => s !== symbol)
                : [...prev, symbol]
        );
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div className="flex bg-slate-800/80 p-1 rounded-lg border border-slate-700/50 w-full sm:w-max overflow-x-auto backdrop-blur-sm sm:ml-auto">
                    {(['1M', '12M'] as Timeframe[]).map((t) => (
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
