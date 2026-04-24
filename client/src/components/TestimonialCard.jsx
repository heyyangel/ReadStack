import { Quote } from 'lucide-react';

const TestimonialCard = ({ name, role, content, avatar }) => {
    return (
        <div className="premium-card p-6 min-w-[300px] max-w-[350px] flex-shrink-0 snap-center relative overflow-hidden group">
            <Quote className="absolute -top-4 -right-4 w-24 h-24 text-accent/5 -rotate-12 transition-transform group-hover:scale-110" />
            
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden soft-shadow border-2 border-white">
                    <img src={avatar} alt={name} className="w-full h-full object-cover" />
                </div>
                <div>
                    <h4 className="font-serif font-bold text-charcoal">{name}</h4>
                    <p className="text-xs text-accent font-medium">{role}</p>
                </div>
            </div>
            
            <p className="text-sm text-gray-600 leading-relaxed italic">
                "{content}"
            </p>
        </div>
    );
};

export default TestimonialCard;
