import React, { useState } from 'react';
import { Sparkles, Search, CloudRain, Star, Coffee, Ghost, Flame, Moon, Compass } from 'lucide-react';

const VIBES = [
    { id: 'gloomy', label: 'Gloomy', icon: CloudRain, color: 'hover:bg-blue-50 hover:text-blue-600 border-blue-100', bg: 'bg-blue-50/50' },
    { id: 'whimsical', label: 'Whimsical', icon: Sparkles, color: 'hover:bg-purple-50 hover:text-purple-600 border-purple-100', bg: 'bg-purple-50/50' },
    { id: 'academic', label: 'Dark Academia', icon: Moon, color: 'hover:bg-stone-100 hover:text-stone-800 border-stone-200', bg: 'bg-stone-100/50' },
    { id: 'serene', label: 'Serene', icon: Coffee, color: 'hover:bg-emerald-50 hover:text-emerald-600 border-emerald-100', bg: 'bg-emerald-50/50' },
    { id: 'intense', label: 'Intense', icon: Flame, color: 'hover:bg-orange-50 hover:text-orange-600 border-orange-100', bg: 'bg-orange-50/50' },
];

const MoodDiscovery = ({ onFilter }) => {
    const [prompt, setPrompt] = useState('');
    const [activeVibe, setActiveVibe] = useState(null);

    const handlePromptChange = (e) => {
        setPrompt(e.target.value);
        setActiveVibe(null);
        onFilter({ type: 'prompt', value: e.target.value });
    };

    const handleVibeClick = (vibe) => {
        const newValue = activeVibe === vibe.id ? null : vibe.id;
        setActiveVibe(newValue);
        setPrompt('');
        onFilter({ type: 'vibe', value: newValue });
    };

    return (
        <section className="py-20 max-w-6xl mx-auto w-full">
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full mb-6">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">AI Mood Discovery</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal mb-6">
                    How do you want to <span className="italic text-accent">feel</span> today?
                </h2>
                
                {/* Conversational Search */}
                <div className="relative group max-w-2xl mx-auto">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-gray-400 group-focus-within:text-accent transition-colors" />
                    </div>
                    <input 
                        type="text"
                        value={prompt}
                        onChange={handlePromptChange}
                        placeholder="I want to feel like I'm in a rainy cafe in Paris..."
                        className="w-full bg-white border-2 border-cream rounded-[2.5rem] py-6 pl-16 pr-8 text-lg font-medium text-charcoal soft-shadow focus:border-accent/30 outline-none transition-all placeholder:text-gray-300"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <button className="bg-charcoal text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-accent transition-all shadow-lg active:scale-95">
                            Curate
                        </button>
                    </div>
                </div>
            </div>

            {/* Vibe Selection */}
            <div className="flex flex-wrap justify-center gap-4 px-4">
                {VIBES.map((vibe) => {
                    const Icon = vibe.icon;
                    const isActive = activeVibe === vibe.id;
                    return (
                        <button
                            key={vibe.id}
                            onClick={() => handleVibeClick(vibe)}
                            className={`flex items-center gap-3 px-8 py-4 rounded-2xl border-2 transition-all duration-500 ${
                                isActive 
                                    ? `bg-charcoal border-charcoal text-white shadow-xl scale-105` 
                                    : `bg-white ${vibe.color} text-gray-500`
                            }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                            <span className="text-sm font-bold tracking-tight uppercase tracking-widest">{vibe.label}</span>
                        </button>
                    );
                })}
                
                <button className="flex items-center gap-3 px-8 py-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-accent hover:text-accent transition-all">
                    <Compass className="w-5 h-5" />
                    <span className="text-sm font-bold tracking-widest uppercase">Surprise Me</span>
                </button>
            </div>
        </section>
    );
};

export default MoodDiscovery;
