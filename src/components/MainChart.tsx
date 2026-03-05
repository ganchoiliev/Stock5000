import type { Timeframe } from '../services/data';
import { getNormalizedChartData, MOCK_ASSETS } from '../services/data';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface MainChartProps {
    timeframe: Timeframe;
    selectedAssets: string[];
}

const COLORS = {
    SPY: '#64748b',   // muted slate for benchmark
    AAPL: '#00f0ff',  // neon cyan
    AMZN: '#818cf8',  // neon indigo
    NVDA: '#00ff9d',  // neon green
    MSFT: '#3b82f6',  // blue
    BTC: '#f59e0b',   // amber
};

export const MainChart: React.FC<MainChartProps> = ({ timeframe, selectedAssets }) => {
    const data = getNormalizedChartData(timeframe);
    const benchmark = MOCK_ASSETS.find(a => a.symbol === 'SPY');
    const portfolioAssets = MOCK_ASSETS.filter(a => a.symbol !== 'SPY' && selectedAssets.includes(a.symbol));

    return (
        <div className="h-[300px] sm:h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Poppins, sans-serif' }}
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
                        tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Poppins, sans-serif' }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f8fafc', backdropFilter: 'blur(8px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                        itemStyle={{ fontSize: '14px', fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontFamily: 'Poppins, sans-serif' }}
                        formatter={(value: any, name: any) => [value, name]}
                    />
                    <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '14px', color: '#cbd5e1', fontFamily: 'Poppins, sans-serif' }}
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
                            activeDot={{ r: 6, fill: COLORS[benchmark.symbol as keyof typeof COLORS], stroke: '#0a0a0f', strokeWidth: 2 }}
                        />
                    )}

                    {/* Portfolio Asset Lines */}
                    {portfolioAssets.map((asset) => (
                        <Line
                            key={asset.symbol}
                            type="monotone"
                            dataKey={asset.symbol}
                            stroke={COLORS[asset.symbol as keyof typeof COLORS]}
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: COLORS[asset.symbol as keyof typeof COLORS], stroke: '#0a0a0f', strokeWidth: 2 }}
                            style={{ filter: `drop-shadow(0px 0px 8px ${COLORS[asset.symbol as keyof typeof COLORS]}80)` }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
