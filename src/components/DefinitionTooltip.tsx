import React from 'react';
import { Info } from 'lucide-react';

interface DefinitionTooltipProps {
    term: string;
}

const definitions: Record<string, string> = {
    'Pulse Score': 'A proprietary 0-100 metric aggregating relative performance (Alpha), Volatility, Maximum Drawdown, and Asset Concentration to provide a single health indicator for the portfolio.',
    'Alpha': 'The excess return of the portfolio relative to the benchmark index (e.g., S&P 500). Positive alpha indicates outperformance.',
    'Volatility': 'The degree of variation in trading prices over time. Measured here as the annualized standard deviation of daily returns. Higher volatility means higher short-term risk.',
    'Max Drawdown': 'The maximum observed loss from a peak to a trough, before a new peak is attained. It is a primary measure of downside risk.',
    'Market Regime': 'An algorithmic classification of the broader market environment (e.g., Bullish, Bearish, or Neutral) based on the trend and volatility of the underlying benchmark.',
    'Contribution': 'How much a specific asset added to or subtracted from the total portfolio return over the selected timeframe. Calculated based on its price change and portfolio weight.',
};

export const DefinitionTooltip: React.FC<DefinitionTooltipProps> = ({ term }) => {
    const definition = definitions[term] || 'Definition not found.';

    return (
        <div className="group relative ml-1 inline-flex items-center justify-center">
            <Info size={14} className="text-slate-500 cursor-help transition-colors group-hover:text-teal-400 focus:outline-none" aria-label={`Information about ${term}`} />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-slate-300 text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-slate-700 pointer-events-none text-left leading-relaxed">
                <strong className="block text-teal-400 font-medium mb-1">{term}</strong>
                {definition}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 border-b border-r border-slate-700 rotate-45" />
            </div>
        </div>
    );
};
