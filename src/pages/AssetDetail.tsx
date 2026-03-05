
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Activity, AlertTriangle, ShieldCheck, ActivitySquare, Bell } from 'lucide-react';
import { getAssetBySymbol, getActiveBenchmark } from '../services/data';
import { computeStdDev, computeMaxDrawdown, computeCorrelation, getReturns } from '../lib/intelligence';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const AssetDetail = () => {
    const { symbol } = useParams<{ symbol: string }>();
    const navigate = useNavigate();

    const [showAlertForm, setShowAlertForm] = useState(false);
    const [alertPrice, setAlertPrice] = useState('');
    const [alertType, setAlertType] = useState<'above' | 'below'>('below');

    const asset = getAssetBySymbol(symbol?.toUpperCase() || '');

    if (!asset) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <h2 className="text-2xl font-semibold mb-4 text-slate-300">Asset not found</h2>
                <button
                    onClick={() => navigate('/')}
                    className="text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-2"
                >
                    <ArrowLeft size={16} /> Return to Dashboard
                </button>
            </div>
        );
    }

    const isPositive1M = asset.change1M >= 0;
    const isPositive12M = asset.change12M >= 0;

    const benchmark = getActiveBenchmark();

    // Compute deeper metrics over 12M
    let volDaily = 0;
    let maxDD = 0;
    let corr = 0;

    if (asset.history12M.length > 5) {
        const assetRets = getReturns(asset.history12M);
        volDaily = computeStdDev(assetRets);

        const cumulative = [1];
        let currentCum = 1;
        assetRets.forEach(r => {
            currentCum *= (1 + r);
            cumulative.push(currentCum);
        });
        maxDD = computeMaxDrawdown(cumulative);

        if (benchmark.history12M.length > 5) {
            const benchRets = getReturns(benchmark.history12M);
            const numPoints = Math.min(assetRets.length, benchRets.length);
            const a1 = assetRets.slice(-numPoints);
            const a2 = benchRets.slice(-numPoints);
            corr = computeCorrelation(a1, a2);
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
                onClick={() => navigate('/')}
                className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-2 text-sm font-medium w-max"
            >
                <ArrowLeft size={16} /> Portfolio
            </button>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-slate-800">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700">
                            <Activity size={20} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{asset.symbol}</h1>
                            <p className="text-slate-400">{asset.name}</p>
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <div className="flex items-center justify-end gap-3 mb-1">
                        <button
                            onClick={() => {
                                setShowAlertForm(!showAlertForm);
                                if (!alertPrice) setAlertPrice(asset.currentPrice.toString());
                            }}
                            className="text-slate-400 hover:text-teal-400 transition-colors"
                            title="Set Price Alert"
                        >
                            <Bell size={18} />
                        </button>
                        <div className="text-3xl font-bold tracking-tight">
                            ${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div className="flex gap-4 items-center justify-end text-sm">
                        <div className={`flex items-center gap-1 ${isPositive1M ? 'text-emerald-400' : 'text-rose-400'}`}>
                            <span className="text-slate-500 mr-1">1M</span>
                            {isPositive1M ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {Math.abs(asset.change1M).toFixed(2)}%
                        </div>
                        <div className={`flex items-center gap-1 ${isPositive12M ? 'text-emerald-400' : 'text-rose-400'}`}>
                            <span className="text-slate-500 mr-1">1Y</span>
                            {isPositive12M ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {Math.abs(asset.change12M).toFixed(2)}%
                        </div>
                    </div>

                    {showAlertForm && (
                        <div className="mt-4 p-4 bg-slate-800 border border-slate-700 rounded-lg text-left animate-in fade-in slide-in-from-top-2 w-max ml-auto shadow-xl">
                            <h3 className="text-sm font-medium mb-3 text-slate-200">Set Price Alert</h3>
                            <div className="flex items-center gap-2 mb-3">
                                <select
                                    value={alertType}
                                    onChange={(e: any) => setAlertType(e.target.value)}
                                    className="bg-slate-900 border border-slate-700 rounded p-1.5 text-sm outline-none focus:border-teal-500 text-slate-300"
                                >
                                    <option value="below">Drops below</option>
                                    <option value="above">Rises above</option>
                                </select>
                                <span className="text-slate-400">$</span>
                                <input
                                    type="number"
                                    value={alertPrice}
                                    onChange={(e) => setAlertPrice(e.target.value)}
                                    className="bg-slate-900 border border-slate-700 rounded p-1.5 text-sm w-24 outline-none focus:border-teal-500 text-slate-100"
                                    step="0.01"
                                />
                            </div>
                            <div className="flex gap-3 justify-end items-center mt-4 border-t border-slate-700/50 pt-3">
                                <button onClick={() => setShowAlertForm(false)} className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors">Cancel</button>
                                <button onClick={() => {
                                    const saved = localStorage.getItem('price-alerts');
                                    const alerts = saved ? JSON.parse(saved) : [];
                                    alerts.push({
                                        symbol: asset.symbol,
                                        type: alertType,
                                        price: Number(alertPrice)
                                    });
                                    localStorage.setItem('price-alerts', JSON.stringify(alerts));
                                    setShowAlertForm(false);
                                }} className="text-xs bg-teal-500 hover:bg-teal-400 text-slate-900 px-4 py-1.5 rounded-md font-semibold transition-colors">Save Alert</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <ActivitySquare size={18} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-400">Daily Volatility</p>
                        <p className="text-xl font-semibold">{(volDaily * 100).toFixed(1)}%</p>
                    </div>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                        <AlertTriangle size={18} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-400">Max Drawdown (1Y)</p>
                        <p className="text-xl font-semibold">{(maxDD * 100).toFixed(1)}%</p>
                    </div>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center">
                        <ShieldCheck size={18} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-400">vs Benchmark ({benchmark.symbol})</p>
                        <p className="text-xl font-semibold">
                            {corr > 0.7 ? 'High' : corr < 0.3 ? 'Low' : 'Moderate'} Corr ({corr.toFixed(2)})
                        </p>
                    </div>
                </div>
            </div >

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 mt-8">
                <h2 className="text-lg font-medium mb-6">12 Month Price History</h2>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={asset.history12M} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                tickFormatter={(val) => {
                                    const d = new Date(val);
                                    return `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
                                }}
                                minTickGap={30}
                            />
                            <YAxis
                                domain={['auto', 'auto']}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                tickFormatter={(val) => `$${val}`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                                itemStyle={{ color: '#14b8a6' }}
                                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                                formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Price']}
                            />
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke="#14b8a6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorPrice)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div >
    );
};
