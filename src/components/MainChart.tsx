import type { Timeframe } from '../services/data';
import { getNormalizedChartData, MOCK_ASSETS } from '../services/data';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface MainChartProps {
    timeframe: Timeframe;
}

const COLORS = {
    SPY: '#64748b',   // muted slate for benchmark
    AAPL: '#14b8a6',  // teal
    AMZN: '#8b5cf6',  // violet
    NVDA: '#34d399',  // emerald
    MSFT: '#3b82f6',  // blue
    BTC: '#f59e0b',   // amber
};

export const MainChart: React.FC<MainChartProps> = ({ timeframe }) => {
    const data = getNormalizedChartData(timeframe);
    const benchmark = MOCK_ASSETS.find(a => a.symbol === 'SPY');
    const portfolioAssets = MOCK_ASSETS.filter(a => a.symbol !== 'SPY');

    return (
        <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickFormatter={(val) => {
                            const d = new Date(val);
                            if (timeframe === '1M') {
                                return `${d.getMonth() + 1}/${d.getDate()}`;
                            }
                            return `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
                        }}
                        minTickGap={timeframe === '1M' ? 5 : 30}
                    />
                    <YAxis
                        domain={['auto', 'auto']}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                        itemStyle={{ fontSize: '14px' }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '8px' }}
                        formatter={(value: any, name: any) => [value, name]}
                    />
                    <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '14px', color: '#cbd5e1' }}
                    />

                    {/* Benchmark Line */}
                    {benchmark && (
                        <Line
                            key={benchmark.symbol}
                            type="monotone"
                            dataKey={benchmark.symbol}
                            stroke={COLORS[benchmark.symbol as keyof typeof COLORS]}
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            activeDot={{ r: 6, fill: COLORS[benchmark.symbol as keyof typeof COLORS], stroke: '#1e293b', strokeWidth: 2 }}
                        />
                    )}

                    {/* Portfolio Asset Lines */}
                    {portfolioAssets.map((asset) => (
                        <Line
                            key={asset.symbol}
                            type="monotone"
                            dataKey={asset.symbol}
                            stroke={COLORS[asset.symbol as keyof typeof COLORS]}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6, fill: COLORS[asset.symbol as keyof typeof COLORS], stroke: '#1e293b', strokeWidth: 2 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
