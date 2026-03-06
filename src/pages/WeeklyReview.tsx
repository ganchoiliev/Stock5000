import { useMemo, useRef, useState } from 'react';
import { getActiveAssets, getActiveBenchmark } from '../services/data';
import { computeIntelligence } from '../lib/intelligence';
import type { IntelligenceInput } from '../lib/intelligence';
import { IntelligenceCard } from '../components/IntelligenceCard';
import { AICoachCard } from '../components/AICoachCard';
import { ReviewNoteInput } from '../components/ReviewNoteInput';
import { ReviewHistory } from '../components/ReviewHistory';
import { ArrowLeft, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';

export const WeeklyReview = () => {
    // For the weekly review, we lock the timeframe to 1M to represent recent performance
    const timeframe = '1M';
    const reviewRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    const intel = useMemo(() => {
        const input: IntelligenceInput = {
            assets: getActiveAssets(),
            benchmark: getActiveBenchmark(),
            timeframe
        };
        return computeIntelligence(input);
    }, []);

    const exportToPDF = useReactToPrint({
        contentRef: reviewRef,
        documentTitle: `Weekly-Review-${new Date().toISOString().split('T')[0]}`,
        onAfterPrint: () => {
            setIsExporting(false);
        },
        onPrintError: (error) => {
            console.error('Print failed', error);
            setIsExporting(false);
            alert('Failed to open print dialog. Please try again.');
        }
    });

    const handleExport = () => {
        setIsExporting(true);
        // Small timeout to allow state to settle
        setTimeout(() => {
            exportToPDF();
        }, 100);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-12" ref={reviewRef}>

            {/* Header */}
            <div className="flex flex-col gap-4 mb-8">
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors w-fit print:hidden">
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </Link>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-light text-slate-100 mb-2">Weekly Review</h1>
                        <p className="text-slate-400 text-sm">Synthesize the last 30 days of performance, digest AI insights, and plan your next move.</p>
                    </div>

                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700/50 text-sm disabled:opacity-50 disabled:cursor-not-allowed print:hidden"
                    >
                        <Download size={16} />
                        {isExporting ? 'Generating...' : 'Export PDF'}
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* 1. Summary & Drivers Wrapper */}
                <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden print:border-none print:shadow-none print:break-inside-avoid">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none print:hidden" />

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
                <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden print:border-none print:shadow-none print:break-inside-avoid print:mt-8">
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none print:hidden" />

                    <h2 className="text-xl font-medium text-slate-200 mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-fuchsia-500 rounded-full" />
                        Coach's Insight
                    </h2>

                    <AICoachCard intel={intel} timeframe={timeframe} />
                </div>

                {/* 3. Action / Note Input */}
                <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-6 shadow-2xl print:border-none print:shadow-none print:break-inside-avoid print:mt-8">
                    <h2 className="text-xl font-medium text-slate-200 mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                        Synthesis
                    </h2>

                    <ReviewNoteInput />
                </div>


                {/* 4. Past Reviews */}
                <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-6 shadow-2xl print:border-none print:shadow-none print:break-inside-avoid print:mt-8">
                    <h2 className="text-xl font-medium text-slate-200 mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
                        Past Reviews
                    </h2>
                    <p className="text-xs text-slate-500 mb-6">A record of your weekly synthesis notes — newest first.</p>
                    <ReviewHistory />
                </div>
            </div>


            <div className="mt-12 text-center">
                <p className="text-xs text-slate-500">"The investor's chief problem—and even his worst enemy—is likely to be himself."</p>
                <p className="text-xs text-slate-600 mt-1">— Benjamin Graham</p>
            </div>
        </div>
    );
};
