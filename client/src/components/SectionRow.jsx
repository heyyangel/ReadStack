import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SectionRow = ({ title, subtitle, children, viewAllPath }) => {
    return (
        <section className="max-w-6xl mx-auto w-full">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-serif font-bold text-charcoal mb-3">{title}</h2>
                {subtitle && <p className="text-gray-500 text-sm font-medium italic">{subtitle}</p>}
                <div className="w-12 h-1 bg-accent/20 mx-auto mt-4 rounded-full"></div>
            </div>
            
            <div className="flex items-start gap-8 overflow-x-auto no-scrollbar -mx-2 px-2 snap-x min-h-0 pb-4">
                {children}
            </div>
            {viewAllPath && (
                <div className="mt-8 text-center">
                    <Link 
                        to={viewAllPath} 
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-[#E8DFD3] rounded-full text-[10px] font-bold text-accent uppercase tracking-[0.2em] hover:bg-accent hover:text-white transition-all soft-shadow"
                    >
                        See all <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            )}
        </section>
    );
};

export default SectionRow;
