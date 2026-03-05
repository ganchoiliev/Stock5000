import React from 'react';
import type { IntelligenceOutput } from '../lib/intelligence';
import { AlertTriangle, Activity } from 'lucide-react';
import { DefinitionTooltip } from './DefinitionTooltip';

interface RiskMeterProps {
    intel: IntelligenceOutput;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ intel }) => {
    // Volatility thresholds (annualized approximations if daily)
    // Assuming vol here is daily. Annualized = daily * sqrt(252).
    // Let's use daily for simplicity in UI, scaling it for display.
    const volPercent = intel.vol * 100;

    let volStatus = 'Low';
    let volColor = 'bg-emerald-500';
    let volWidth = Math.min((volPercent / 2) * 100, 100); // Max out at 2% daily vol for the bar

    if (volPercent > 1.5) {
        volStatus = 'High';
        volColor = 'bg-rose-500';
    } else if (volPercent > 1.0) {
        volStatus = 'Medium';
        volColor = 'bg-amber-500';
    }

    // Drawdown thresholds
    const ddPercent = Math.abs(intel.maxDrawdown * 100);
    let ddStatus = 'Normal';
    let ddColor = 'bg-emerald-500';
    let ddWidth = Math.min((ddPercent / 20) * 100, 100); // Max out at 20% drawdown for the bar

    if (ddPercent > 15) {
        ddStatus = 'Extreme';
        ddColor = 'bg-rose-500';
    } else if (ddPercent > 8) {
        ddStatus = 'Elevated';
        ddColor = 'bg-amber-500';
    }

    return (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-slate-600/50">
            <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                <AlertTriangle size={16} className="text-slate-400" />
                Risk Profile
            </h3>

            <div className="space-y-5">
                {/* Volatility Meter */}
                <div>
                    <div className="flex justify-between items-end mb-1.5">
                        <span className="text-xs text-slate-400 font-medium flex items-center">
                            Volatility <DefinitionTooltip term="Volatility" />
                        </span>
                        <div className="text-right">
                            <span className="text-sm font-medium text-slate-200">{volPercent.toFixed(1)}%</span>
                            <span className={`text-[10px] ml-2 px-1.5 py-0.5 rounded border ${volStatus === 'High' ? 'text-rose-400 border-rose-500/30 bg-rose-500/10' : volStatus === 'Medium' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'}`}>
                                {volStatus}
                            </span>
                        </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${volColor} rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${volWidth}%` }}
                        />
                    </div>
                </div>

                {/* Drawdown Meter */}
                <div>
                    <div className="flex justify-between items-end mb-1.5">
                        <span className="text-xs text-slate-400 font-medium flex items-center">
                            Max Drawdown <DefinitionTooltip term="Max Drawdown" />
                        </span>
                        <div className="text-right">
                            <span className="text-sm font-medium text-slate-200">-{ddPercent.toFixed(1)}%</span>
                            <span className={`text-[10px] ml-2 px-1.5 py-0.5 rounded border ${ddStatus === 'Extreme' ? 'text-rose-400 border-rose-500/30 bg-rose-500/10' : ddStatus === 'Elevated' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'}`}>
                                {ddStatus}
                            </span>
                        </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${ddColor} rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${ddWidth}%` }}
                        />
                    </div>
                </div>

                {/* Beta Meter */}
                <div>
                    <div className="flex justify-between items-end mb-1.5">
                        <span className="text-xs text-slate-400 font-medium flex items-center">
                            Beta <DefinitionTooltip term="Beta" />
                        </span>
                        <div className="text-right">
                            <span className="text-sm font-medium text-slate-200">{intel.beta.toFixed(2)}</span>
                            <span className={`text-[10px] ml-2 px-1.5 py-0.5 rounded border ${
                                intel.beta > 1.5 ? 'text-rose-400 border-rose-500/30 bg-rose-500/10' :
                                intel.beta > 1.0 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                                intel.beta > 0.7 ? 'text-sky-400 border-sky-500/30 bg-sky-500/10' :
                                'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                            }`}>
                                {intel.beta > 1.5 ? 'Aggressive' : intel.beta > 1.0 ? 'Active' : intel.beta > 0.7 ? 'Moderate' : 'Defensive'}
                            </span>
                        </div>
                    </div>
                    {/* Bar: scale 0–2.0. A marker at 50% (=1.0) shows the "neutral" point. */}
                    <div className="h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden relative">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                intel.beta > 1.5 ? 'bg-rose-500' : intel.beta > 1.0 ? 'bg-amber-500' : 'bg-sky-500'
                            }`}
                            style={{ width: `${Math.min((intel.beta / 2) * 100, 100)}%` }}
                        />
                        {/* Midpoint marker at beta = 1.0 */}
                        <div className="absolute top-0 bottom-0 w-px bg-slate-500/60" style={{ left: '50%' }} />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-600 mt-0.5">
                        <span>0</span>
                        <span className="text-slate-500">1.0 neutral</span>
                        <span>2.0+</span>
                    </div>
                </div>

                {/* Market Regime */}
                <div className="pt-2 border-t border-slate-700/50">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Activity size={12} /> Market Regime
                            <DefinitionTooltip term="Market Regime" />
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${intel.marketRegime === 'Bullish' ? 'text-emerald-400 bg-emerald-500/10' : intel.marketRegime === 'Bearish' ? 'text-rose-400 bg-rose-500/10' : 'text-slate-300 bg-slate-700/30'}`}>
                            {intel.marketRegime}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
