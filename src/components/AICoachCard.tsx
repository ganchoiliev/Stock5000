import React, { useState, useEffect } from 'react';
import type { IntelligenceOutput } from '../lib/intelligence';
import type { Timeframe } from '../services/data';
import { generateAIInsight } from '../services/aiCoach';
import { Sparkles, Loader2 } from 'lucide-react';

interface AICoachCardProps {
    intel: IntelligenceOutput;
    timeframe: Timeframe;
}

export const AICoachCard: React.FC<AICoachCardProps> = ({ intel, timeframe }) => {
    const [insight, setInsight] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        let isMounted = true;

        const fetchInsight = async () => {
            setIsLoading(true);
            setInsight(null); // Clear previous insight while loading

            const newInsight = await generateAIInsight(intel, timeframe);

            if (isMounted) {
                setInsight(newInsight);
                setIsLoading(false);
            }
        };

        fetchInsight();

        return () => {
            isMounted = false;
        };
    }, [intel, timeframe]);

    return (
        <div className="relative bg-slate-800/40 rounded-xl p-6 backdrop-blur-md shadow-xl transition-all duration-300 overflow-hidden group">
            {/* Animated gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 via-fuchsia-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-gradient-x pointer-events-none" />
            <div className="absolute inset-[1px] bg-slate-800/90 rounded-[11px] pointer-events-none" />

            <div className="relative z-10">
                <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                    <Sparkles size={16} className="text-fuchsia-400" />
                    AI Portfolio Coach
                </h3>

                <div className="min-h-[80px] flex items-center">
                    {isLoading ? (
                        <div className="flex items-center gap-3 text-slate-400">
                            <Loader2 size={16} className="animate-spin" />
                            <span className="text-sm italic">Analyzing portfolio dynamics...</span>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-200 leading-relaxed font-medium">
                            {insight}
                        </p>
                    )}
                </div>

                {!isLoading && (
                    <div className="mt-4 flex justify-end">
                        <span className="text-[10px] text-slate-500 tracking-wider uppercase">Powered by OpenAI</span>
                    </div>
                )}
            </div>
        </div>
    );
};
