import { Link, Outlet, useLocation } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { AIChat } from './AIChat';

export const Layout = () => {
    const location = useLocation();
    const isDashboard = location.pathname === '/';

    return (
        <div className="min-h-screen flex flex-col relative">
            <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500 group-hover:bg-teal-500/20 transition-colors shadow-[0_0_10px_rgba(0,240,255,0.1)]">
                            <Activity size={20} />
                        </div>
                        <span className="text-xl font-medium tracking-tight text-slate-50">Pulse</span>
                    </Link>

                    <nav>
                        <div className="text-sm font-medium text-slate-400">
                            {isDashboard ? 'Dashboard' : 'Asset Detail'}
                        </div>
                    </nav>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>

            <footer className="border-t border-slate-800 py-6 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center text-sm text-slate-500">
                    <p>Portfolio Pulse &copy; {new Date().getFullYear()}</p>
                </div>
            </footer>

            {/* AI Assistant Chat Component embedded globally */}
            <AIChat />
        </div>
    );
};
