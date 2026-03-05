import { useMemo } from 'react';
import { getActiveAssets, getActiveBenchmark } from '../services/data';
import { computeIntelligence } from '../lib/intelligence';
import type { IntelligenceInput } from '../lib/intelligence';
import { IntelligenceCard } from '../components/IntelligenceCard';
import { AICoachCard } from '../components/AICoachCard';
import { ReviewNoteInput } from '../components/ReviewNoteInput';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WeeklyReview = () => {
    // For the weekly review, we lock the timeframe to 1M to represent recent performance
    const timeframe = '1M';

    const intel = useMemo(() => {
        const input: IntelligenceInput = {
            assets: getActiveAssets(),
            benchmark: getActiveBenchmark(),
            timeframe
        };
        return computeIntelligence(input);
    }, []);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-12">

            {/* Header */}
            <div className="flex flex-col gap-4 mb-8">
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors w-fit">
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </Link>

                <div>
                    <h1 className="text-3xl font-light text-slate-100 mb-2">Weekly Review</h1>
                    <p className="text-slate-400 text-sm">Synthesize the last 30 days of performance, digest AI insights, and plan your next move.</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* 1. Summary & Drivers Wrapper */}
                <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <h2 className="text-xl font-medium text-slate-200 mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-teal-500 rounded-full" />
                        Performance & Drivers
                    </h2>

                    {/* Reusing IntelligenceCard but it fits perfectly here */}
                    <IntelligenceCard
                        intel={intel}
                        timeframe={timeframe}
                    />
                </div>

                {/* 2. AI Coach Wrapper */}
                <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                    <h2 className="text-xl font-medium text-slate-200 mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-fuchsia-500 rounded-full" />
                        Coach's Insight
                    </h2>

                    <AICoachCard intel={intel} timeframe={timeframe} />
                </div>

                {/* 3. Action / Note Input */}
                <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-6 shadow-2xl">
                    <h2 className="text-xl font-medium text-slate-200 mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                        Synthesis
                    </h2>

                    <ReviewNoteInput />
                </div>
            </div>

            <div className="mt-12 text-center">
                <p className="text-xs text-slate-500">"The investor's chief problem—and even his worst enemy—is likely to be himself."</p>
                <p className="text-xs text-slate-600 mt-1">— Benjamin Graham</p>
            </div>
        </div>
    );
};
