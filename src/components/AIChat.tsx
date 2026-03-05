import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Loader2, MessageSquare } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export const AIChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 'initial', role: 'assistant', content: 'Hello! I am your portfolio AI assistant. You can ask me about stock trends, diversification, or specific tech companies.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

        if (!apiKey) {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: 'Error: API key not found. Please ensure VITE_OPENAI_API_KEY is set in your environment variables.'
                }]);
                setIsLoading(false);
            }, 1000);
            return;
        }

        try {
            // Standard OpenAI Chat Completions API format
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo', // or gpt-4o depending on availability
                    messages: [
                        { role: 'system', content: 'You are a helpful financial assistant inside a stock tracking dashboard called Portfolio Pulse. Give concise, insightful answers about stocks, tech companies, and investing.' },
                        // Map our message history into the API format
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        { role: 'user', content: userMessage.content }
                    ],
                    max_tokens: 300
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Failed to fetch response');
            }

            const aiMessage: Message = {
                id: data.id || Date.now().toString(),
                role: 'assistant',
                content: data.choices[0].message.content
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error: any) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: `Sorry, I encountered an error: ${error.message}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 p-4 rounded-full bg-teal-500 text-slate-900 shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:scale-105 transition-all duration-300 z-40 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
                aria-label="Open AI Chat"
            >
                <MessageSquare size={24} />
            </button>

            {/* Chat Window Panel */}
            <div
                className={`fixed bottom-6 right-6 w-full max-w-[380px] h-[550px] max-h-[calc(100vh-100px)] bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/30 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
                            <Bot size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-100 text-sm">Pulse AI</h3>
                            <p className="text-xs text-teal-400/80 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                                Online
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 border border-slate-700 text-teal-400'}`}>
                                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>
                            <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${msg.role === 'user'
                                    ? 'bg-indigo-500 text-white rounded-tr-sm'
                                    : 'bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-tl-sm'
                                }`}>
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-3 flex-row">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-slate-800 border border-slate-700 text-teal-400">
                                <Bot size={16} />
                            </div>
                            <div className="max-w-[80%] rounded-2xl p-4 bg-slate-800/50 border border-slate-700/30 rounded-tl-sm flex items-center gap-2">
                                <Loader2 size={16} className="text-teal-500 animate-spin" />
                                <span className="text-sm text-slate-400 italic">Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-700/50 bg-slate-800/30 rounded-b-2xl">
                    <form onSubmit={handleSubmit} className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about your portfolio..."
                            className="w-full bg-slate-900 border border-slate-700/50 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all font-sans"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 p-2 text-teal-500 hover:bg-teal-500/10 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};
