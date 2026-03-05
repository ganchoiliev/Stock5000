import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { SUPPORTED_TICKERS } from '../services/data';
import type { BenchmarkType } from '../services/data';

export const Settings = () => {
    // Basic settings state
    const [tickers, setTickers] = useState<string[]>(['AAPL', 'MSFT', 'NVDA', 'AMZN', 'BTC']);
    const [benchmark, setBenchmark] = useState<BenchmarkType>('SPY');
    const [useCustomWeights, setUseCustomWeights] = useState(false);
    const [weights, setWeights] = useState<Record<string, number>>({});

    // For MVp, we'll just allow editing a comma separated list
    const [tickerInput, setTickerInput] = useState(tickers.join(', '));
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Load from local storage if available
        const savedTickers = localStorage.getItem('portfolio-tickers');
        const savedBench = localStorage.getItem('portfolio-benchmark');
        const savedUseWeights = localStorage.getItem('portfolio-use-weights');
        const savedWeightsData = localStorage.getItem('portfolio-weights');

        if (savedTickers) {
            setTickers(JSON.parse(savedTickers));
            setTickerInput(JSON.parse(savedTickers).join(', '));
        }
        if (savedBench) {
            setBenchmark(savedBench as BenchmarkType);
        }
        if (savedUseWeights) {
            setUseCustomWeights(savedUseWeights === 'true');
        }
        if (savedWeightsData) {
            setWeights(JSON.parse(savedWeightsData));
        }
    }, []);

    const handleSave = () => {
        setError('');
        // Clean and validate input
        const newTickers = tickerInput.split(',')
            .map(t => t.trim().toUpperCase())
            .filter(t => t.length > 0);

        // Basic validation for MVP
        if (newTickers.length > 5) {
            setError('Please select a maximum of 5 top assets for clarity.');
            return;
        }

        const invalidTickers = newTickers.filter(t => !SUPPORTED_TICKERS.includes(t));
        if (invalidTickers.length > 0) {
            setError(`Unsupported tickers for MVP: ${invalidTickers.join(', ')}. Try AAPL, MSFT, NVDA, AMZN, TSLA, META, GOOGL, BTC.`);
            return;
        }

        setTickers(newTickers);
        localStorage.setItem('portfolio-tickers', JSON.stringify(newTickers));
        localStorage.setItem('portfolio-benchmark', benchmark);
        localStorage.setItem('portfolio-use-weights', String(useCustomWeights));
        localStorage.setItem('has-onboarded', 'true');

        // Ensure weights are balanced/saved
        const finalWeights: Record<string, number> = {};
        if (useCustomWeights) {
            let total = 0;
            newTickers.forEach(t => total += (weights[t] || 0));
            if (total === 0) {
                // fallback to equal
                newTickers.forEach(t => finalWeights[t] = 1 / newTickers.length);
            } else {
                newTickers.forEach(t => finalWeights[t] = (weights[t] || 0) / total);
            }
        }
        localStorage.setItem('portfolio-weights', JSON.stringify(finalWeights));

        setSaved(true);
        setTimeout(() => setSaved(false), 2000);

        // Force a reload to refresh data across app
        setTimeout(() => window.location.reload(), 500);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            <div>
                <h1 className="text-3xl font-light text-slate-100 mb-2">Settings</h1>
                <p className="text-slate-400 text-sm">Configure your portfolio tracker.</p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl space-y-8">

                {/* Tracked Assets */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-300">Tracked Assets (Max 5)</label>
                    <p className="text-xs text-slate-400 mb-2">Enter a comma-separated list of symbols.</p>
                    <input
                        type="text"
                        value={tickerInput}
                        onChange={(e) => setTickerInput(e.target.value)}
                        placeholder="e.g., AAPL, NVDA, BTC"
                        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                    />
                    {error && <p className="text-rose-400 text-xs flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
                </div>

                {/* Benchmark */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-300">Benchmark</label>
                    <select
                        value={benchmark}
                        onChange={(e) => setBenchmark(e.target.value as BenchmarkType)}
                        className="w-full md:w-1/2 bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-teal-500 appearance-none"
                    >
                        <option value="SPY">S&P 500 (SPY)</option>
                        <option value="QQQ">Nasdaq 100 (QQQ)</option>
                        <option value="DIA">Dow Jones (DIA)</option>
                        <option value="ARKK">Innovation (ARKK)</option>
                        <option value="GLD">Gold (GLD)</option>
                    </select>
                </div>

                {/* Weights Toggle */}
                <div className="space-y-4 pt-4 border-t border-slate-700/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="block text-sm font-medium text-slate-300">Custom Weighting</label>
                            <p className="text-xs text-slate-400 mt-1">Manually assign percentage weights to each asset.</p>
                        </div>
                        <button
                            onClick={() => setUseCustomWeights(!useCustomWeights)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useCustomWeights ? 'bg-teal-500' : 'bg-slate-600'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useCustomWeights ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {useCustomWeights && (
                        <div className="space-y-3 mt-4 animate-in slide-in-from-top-2 duration-300">
                            {tickers.map(ticker => (
                                <div key={ticker} className="flex items-center gap-4">
                                    <label className="w-16 text-sm text-slate-300 font-medium">{ticker}</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={((weights[ticker] || 0) * 100).toFixed(0)}
                                        onChange={(e) => setWeights({ ...weights, [ticker]: Number(e.target.value) / 100 })}
                                        className="flex-1 accent-teal-500"
                                    />
                                    <span className="w-12 text-sm text-slate-400 text-right">
                                        {((weights[ticker] || 0) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            ))}
                            <p className="text-xs text-amber-400/80 italic">Weights will be automatically normalized to 100% on save.</p>
                        </div>
                    )}
                </div>

                {/* Save Button */}
                <div className="pt-6 flex justify-end">
                    <button
                        onClick={handleSave}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${saved
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-teal-500 text-slate-900 hover:bg-teal-400 border border-transparent'
                            }`}
                    >
                        {saved ? 'Saved!' : 'Save & Reload'}
                    </button>
                </div>
            </div>

            {/* Scaffolding placeholders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50">
                <div className="bg-slate-800/20 border border-slate-700/30 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[160px]">
                    <span className="text-slate-500 mb-2">Cloud Sync</span>
                    <span className="text-xs text-slate-600 px-3 py-1 bg-slate-800 rounded-full">Coming Soon</span>
                </div>
                <div className="bg-slate-800/20 border border-slate-700/30 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[160px]">
                    <span className="text-slate-500 mb-2">Account & Billing</span>
                    <span className="text-xs text-slate-600 px-3 py-1 bg-slate-800 rounded-full">Pro Feature</span>
                </div>
            </div>
        </div>
    );
};
