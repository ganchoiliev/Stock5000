import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { getAssetBySymbol } from '../services/data';

interface PriceAlert {
    symbol: string;
    type: 'above' | 'below';
    price: number;
}

export const AlertBanner = () => {
    const [triggeredAlerts, setTriggeredAlerts] = useState<PriceAlert[]>([]);

    useEffect(() => {
        const checkAlerts = () => {
            const savedAlerts = localStorage.getItem('price-alerts');
            if (!savedAlerts) return;

            try {
                const alerts: PriceAlert[] = JSON.parse(savedAlerts);
                const triggered = alerts.filter(alert => {
                    const asset = getAssetBySymbol(alert.symbol);
                    if (!asset) return false;

                    if (alert.type === 'above' && asset.currentPrice >= alert.price) return true;
                    if (alert.type === 'below' && asset.currentPrice <= alert.price) return true;
                    return false;
                });

                setTriggeredAlerts(triggered);
            } catch (e) {
                console.error("Failed to parse price alerts");
            }
        };

        checkAlerts();
        const interval = setInterval(checkAlerts, 60000);
        return () => clearInterval(interval);
    }, []);

    const dismissAlert = (indexToRemove: number) => {
        const alertToRemove = triggeredAlerts[indexToRemove];
        setTriggeredAlerts(prev => prev.filter((_, idx) => idx !== indexToRemove));

        const savedAlerts = localStorage.getItem('price-alerts');
        if (savedAlerts) {
            try {
                const alerts: PriceAlert[] = JSON.parse(savedAlerts);
                const updated = alerts.filter(a => !(a.symbol === alertToRemove.symbol && a.type === alertToRemove.type && a.price === alertToRemove.price));
                localStorage.setItem('price-alerts', JSON.stringify(updated));
            } catch (e) { }
        }
    };

    if (triggeredAlerts.length === 0) return null;

    return (
        <div className="bg-teal-500/20 border-b border-teal-500/30 backdrop-blur-md relative z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex flex-col gap-2">
                    {triggeredAlerts.map((alert, idx) => (
                        <div key={idx} className="flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-2 text-teal-400 text-sm font-medium">
                                <Bell size={16} />
                                <span>
                                    Price Alert: {alert.symbol} has went {alert.type} ${alert.price.toFixed(2)}
                                </span>
                            </div>
                            <button
                                onClick={() => dismissAlert(idx)}
                                className="text-teal-400 hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
