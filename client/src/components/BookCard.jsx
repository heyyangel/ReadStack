import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag } from 'lucide-react';
import bookCover from '../assets/bookcover.jpg';

const BookCard = ({ book, compact = false, fullWidth = false }) => {
    if (compact) {
        return (
            <Link to={`/book/${book.id}`} className={`flex items-center gap-5 p-4 premium-card group ${fullWidth ? 'w-full' : 'min-w-[320px]'} bg-white hover:bg-white border-2 border-transparent hover:border-accent/10 transition-all duration-500 self-start`}>
                <div className="w-20 h-28 flex-shrink-0 overflow-hidden rounded-2xl soft-shadow bg-cream relative">
                    <img
                        src={book.cover_url || bookCover}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-accent/5 group-hover:bg-transparent transition-colors"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-accent text-white text-[8px] font-bold uppercase tracking-widest rounded-full">New</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Added Today</span>
                    </div>
                    <h4 className="font-serif font-bold text-lg text-charcoal truncate group-hover:text-accent transition-colors leading-tight mb-1">
                        {book.title}
                    </h4>
                    <p className="text-xs font-medium text-gray-500 italic">by {book.author}</p>
                    
                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm font-bold text-charcoal">₹{book.price}</span>
                        <div className="w-8 h-8 rounded-full bg-cream group-hover:bg-charcoal group-hover:text-white flex items-center justify-center transition-all">
                            <ShoppingBag className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <div className={`group flex-shrink-0 ${fullWidth ? 'w-full' : 'w-48 sm:w-56 lg:w-64'}`}>
            <Link to={`/book/${book.id}`} className="block relative aspect-[3/4] rounded-[2rem] overflow-hidden soft-shadow bg-white mb-3">
                <img
                    src={book.cover_url || bookCover}
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-4 z-10">
                    <div className="w-12 h-12 rounded-full bg-white text-charcoal flex items-center justify-center soft-shadow transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                        <ShoppingBag className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                        View Details
                    </span>
                </div>

                {/* Price Tag */}
                <div className="absolute top-4 right-4 z-20">
                    <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-bold text-charcoal soft-shadow border border-white/50">
                        ₹{book.price}
                    </div>
                </div>

                {/* Wishlist Shortcut */}
                <button 
                    onClick={(e) => { e.preventDefault(); /* Logic would go here */ }}
                    className="absolute bottom-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-400 hover:text-pink-500 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 soft-shadow"
                >
                    <Heart className="w-4 h-4" />
                </button>
            </Link>
            
            <div className="px-2">
                <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-0.5 text-yellow-500">
                        <Star className="w-3 h-3 fill-current" />
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">4.8 • Best Seller</span>
                </div>
                
                <Link to={`/book/${book.id}`}>
                    <h3 className="font-serif font-bold text-xl text-charcoal line-clamp-1 group-hover:text-accent transition-colors leading-tight mb-1">
                        {book.title}
                    </h3>
                </Link>
                <p className="text-xs font-medium text-gray-500 italic">by {book.author}</p>
            </div>
        </div>
    );
};

export default BookCard;
