import React from 'react';
import { Quote, BookOpen, User } from 'lucide-react';

const SparkCard = ({ content, author, bookTitle, pageNumber }) => {
    return (
        <div className="premium-card p-6 min-w-[300px] max-w-[350px] bg-white border border-[#E8DFD3] hover:border-accent/20 transition-all duration-500 group relative">
            {/* Decorative Quote Icon */}
            <div className="absolute top-4 right-4 text-accent/10 group-hover:text-accent/20 transition-colors">
                <Quote className="w-12 h-12 rotate-180" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-cream flex items-center justify-center">
                        <User className="w-3 h-3 text-gray-400" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{author} shared</span>
                </div>

                <p className="font-serif italic text-lg text-charcoal leading-relaxed mb-6 line-clamp-4 group-hover:text-accent transition-colors">
                    "{content}"
                </p>

                <div className="pt-4 border-t border-dashed border-[#E8DFD3] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-3 h-3 text-accent" />
                        <span className="text-[10px] font-bold text-charcoal uppercase tracking-widest truncate max-w-[120px]">
                            {bookTitle}
                        </span>
                    </div>
                    {pageNumber && (
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                            Page {pageNumber}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SparkCard;
