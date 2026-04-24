import React from 'react';
import { Flame, Trophy, Calendar } from 'lucide-react';

const StreakCard = ({ streak = 0 }) => {
    const milestone = 7;
    const daysToGo = milestone - (streak % milestone);
    const progress = (streak % milestone) / milestone * 100;

    return (
        <div className="premium-card p-8 relative overflow-hidden group cursor-default">
            {/* Background Glow */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-all"></div>
            
            <div className="flex items-start justify-between relative z-10">
                <div className="flex-1">
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Reading Streak</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-5xl font-serif font-extrabold text-charcoal">{streak}</p>
                        <p className="text-sm font-bold text-accent uppercase tracking-tighter">Days</p>
                    </div>
                </div>
                
                <div className="relative">
                    <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent shadow-sm group-hover:scale-110 transition-transform duration-500">
                        <Flame className="h-8 w-8 fill-current" />
                    </div>
                    {streak > 0 && (
                        <div className="absolute -bottom-2 -right-2 bg-white border border-accent/20 rounded-full p-1.5 shadow-md">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                        </div>
                    )}
                </div>
            </div>

            {/* Progress to Milestone */}
            <div className="mt-8 relative z-10">
                <div className="flex justify-between items-end mb-2.5">
                    <p className="text-[10px] font-bold text-gray-400 flex items-center uppercase tracking-widest">
                        <Calendar className="h-3 w-3 mr-1.5" /> Next Milestone
                    </p>
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest">{daysToGo} days to go</p>
                </div>
                
                <div className="w-full bg-cream rounded-full h-2">
                    <div 
                        className="bg-accent h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                        style={{ width: `${Math.max(5, progress)}%` }}
                    ></div>
                </div>
                
                <p className="mt-4 text-xs text-gray-500 font-medium leading-relaxed italic border-l-2 border-accent/20 pl-3">
                    {streak === 0 
                        ? "The journey of a thousand pages begins with a single word." 
                        : streak < milestone 
                            ? `You're building a powerful habit. Keep going!` 
                            : `Incredible! You've unlocked the ${milestone}-day master status.`}
                </p>
            </div>
        </div>
    );
};

export default StreakCard;
