import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, CloudRain, Coffee, Library, Flame, X, Play, Pause, Music2 } from 'lucide-react';

const AMBIENT_SOUNDS = [
    { id: 'rain', name: 'Rain', icon: CloudRain, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', color: 'text-blue-400' },
    { id: 'cafe', name: 'Cafe', icon: Coffee, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', color: 'text-amber-500' },
    { id: 'library', name: 'Library', icon: Library, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', color: 'text-emerald-500' },
    { id: 'fire', name: 'Fire', icon: Flame, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', color: 'text-orange-500' },
];

const AmbientPlayer = ({ onClose }) => {
    const [activeSound, setActiveSound] = useState(null);
    const [volume, setVolume] = useState(0.5);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showVolume, setShowVolume] = useState(false);
    const audioRef = useRef(new Audio());

    useEffect(() => {
        audioRef.current.volume = volume;
    }, [volume]);

    const toggleSound = (sound) => {
        if (activeSound?.id === sound.id) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play();
                setIsPlaying(true);
            }
        } else {
            audioRef.current.src = sound.url;
            audioRef.current.loop = true;
            audioRef.current.play();
            setActiveSound(sound);
            setIsPlaying(true);
        }
    };

    return (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-8 fade-in duration-700">
            <div className="flex items-center gap-2 bg-charcoal/90 backdrop-blur-2xl px-3 py-3 rounded-[2.5rem] soft-shadow border border-white/10 relative group">
                
                {/* Header/Status & Master Toggle */}
                <div className="pl-4 pr-3 border-r border-white/10 flex items-center gap-3">
                    <button 
                        onClick={() => {
                            if (activeSound) {
                                if (isPlaying) audioRef.current.pause();
                                else audioRef.current.play();
                                setIsPlaying(!isPlaying);
                            }
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            activeSound 
                                ? 'bg-accent text-white hover:scale-110 active:scale-95' 
                                : 'bg-white/5 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    </button>
                    <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-white uppercase tracking-[0.2em]">Atmosphere</span>
                        </div>
                        {activeSound && (
                            <span className="text-[8px] font-medium text-accent uppercase tracking-widest animate-pulse">
                                {isPlaying ? 'Playing' : 'Paused'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Sounds Dock */}
                <div className="flex items-center gap-1 px-2">
                    {AMBIENT_SOUNDS.map((sound) => {
                        const isActive = activeSound?.id === sound.id;
                        const Icon = sound.icon;
                        return (
                            <button
                                key={sound.id}
                                onClick={() => toggleSound(sound)}
                                className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 group/icon ${
                                    isActive 
                                        ? 'bg-white text-charcoal scale-110 shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                                title={sound.name}
                            >
                                <Icon className={`w-5 h-5 transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover/icon:scale-110'}`} />
                                
                                {isActive && isPlaying && (
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full animate-ping"></div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Controls Section */}
                <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                    {/* Volume Trigger */}
                    <div className="relative" onMouseEnter={() => setShowVolume(true)} onMouseLeave={() => setShowVolume(false)}>
                        <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                            {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>

                        {/* Popover Volume Slider */}
                        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 pb-6 transition-all duration-300 ${showVolume ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                            <div className="bg-charcoal/95 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl">
                                <input 
                                    type="range" 
                                    min="0" max="1" step="0.01" 
                                    value={volume}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    className="h-24 w-1 bg-white/10 rounded-full appearance-none accent-accent cursor-pointer vertical-slider"
                                    style={{ WebkitAppearance: 'slider-vertical' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Close Button */}
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-red-500/20 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Subtle Glow Background */}
                {activeSound && isPlaying && (
                    <div className={`absolute inset-0 -z-10 blur-2xl opacity-20 transition-all duration-1000 rounded-full ${activeSound.color.replace('text-', 'bg-')}`}></div>
                )}
            </div>
        </div>
    );
};

export default AmbientPlayer;
