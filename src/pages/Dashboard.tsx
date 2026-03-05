import { useState } from 'react';
import type { Timeframe } from '../services/data';
import { MainChart } from '../components/MainChart';
import { AssetList } from '../components/AssetList';
import { ContributionView } from '../components/ContributionView';

export const Dashboard = () => {
    const [timeframe, setTimeframe] = useState<Timeframe>('1M');

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Portfolio Pulse</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Visualizing your top assets against the market.
                    </p>
                </div>

                <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700/50 w-max">
                    {(['1M', '12M'] as Timeframe[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTimeframe(t)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${timeframe === t
                                ? 'bg-teal-500/20 text-teal-400 shadow-sm'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                        <h2 className="text-lg font-medium mb-6">Performance vs Benchmark (Base 100)</h2>
                        <MainChart timeframe={timeframe} />
                    </div>

                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                        <ContributionView />
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 h-full">
                        <h2 className="text-lg font-medium mb-6">Your Assets</h2>
                        <AssetList />
                    </div>
                </div>
            </div>
        </div>
    );
};
