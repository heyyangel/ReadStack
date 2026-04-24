import { useState, useEffect } from 'react';
import { Search, Bell, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const TopBar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            if (searchQuery.length > 1) {
                setIsSearching(true);
                let localBooks = [];
                let globalBooks = [];

                try {
                    // 1. Search Local Library
                    const localRes = await api.get(`/api/books/search?q=${searchQuery}`);
                    localBooks = localRes.data.map(b => ({ ...b, source: 'Library' }));
                } catch (error) {
                    console.warn('Local search failed:', error.message);
                }

                try {
                    // 2. Search Global Library (Open Library)
                    const globalRes = await api.get(`/api/external-books/search?q=${encodeURIComponent(searchQuery)}`);
                    globalBooks = globalRes.data.map(b => ({ ...b, source: 'Global', isExternal: true }));
                } catch (error) {
                    console.error('Global search failed:', error);
                    toast.error('Global search currently unavailable');
                }

                const combined = [...localBooks, ...globalBooks];
                setSearchResults(combined);
                setShowDropdown(true);
                setIsSearching(false);
            } else {
                setSearchResults([]);
                setShowDropdown(false);
            }
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    return (
        <header className="h-24 flex items-center justify-between px-10 bg-cream/80 backdrop-blur-md sticky top-0 z-40 border-b border-accent/5">
            <div className="mr-10 hidden lg:block">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-charcoal text-white flex items-center justify-center rounded-xl soft-shadow group-hover:bg-accent transition-colors duration-500">
                        <span className="font-serif font-bold text-xl">R</span>
                    </div>
                    <span className="text-xl font-serif font-extrabold tracking-tighter text-charcoal">READSTACK</span>
                </Link>
            </div>
            
            <div className="flex-1 max-w-2xl relative">
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-accent transition-colors" />
                    <input
                        type="text"
                        placeholder="Search for titles, authors, or literary gems..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/50 border-none rounded-2xl py-3.5 pl-14 pr-4 text-sm font-medium text-charcoal soft-shadow focus:ring-2 focus:ring-accent/20 transition-all outline-none placeholder:text-gray-400"
                    />
                    {isSearching && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="animate-spin h-3 w-3 border-2 border-accent border-t-transparent rounded-full"></div>
                        </div>
                    )}
                </div>

                {/* Search Results Dropdown */}
                {showDropdown && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl soft-shadow overflow-hidden z-50 border border-[#E8DFD3] animate-in fade-in slide-in-from-top-2 duration-300">
                            {searchResults.length > 0 ? (
                                <div className="max-h-[480px] overflow-y-auto no-scrollbar py-3 px-2">
                                    <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Search Results</p>
                                    {searchResults.map((book) => (
                                        <div
                                            key={`${book.source}-${book.id}`}
                                            onClick={() => {
                                                if (book.isExternal) {
                                                    navigate(`/book/${book.id}?externalId=${book.id}&olid=${book.olid}&title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.author)}&cover=${encodeURIComponent(book.cover_url)}`);
                                                } else {
                                                    navigate(`/book/${book.id}`);
                                                }
                                                setShowDropdown(false);
                                                setSearchQuery('');
                                            }}
                                            className="flex items-center gap-5 p-3 hover:bg-cream/50 rounded-2xl cursor-pointer transition-all group"
                                        >
                                            <div className="w-12 h-16 bg-cream rounded-lg overflow-hidden soft-shadow flex-shrink-0 relative">
                                                <img src={book.cover_url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                {book.isExternal && (
                                                    <div className="absolute top-0 right-0 bg-accent text-[8px] text-white px-1 font-bold uppercase">Web</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-serif font-bold text-charcoal group-hover:text-accent transition-colors truncate">{book.title}</p>
                                                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter ${book.source === 'Library' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                                        {book.source}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 font-medium">by {book.author}</p>
                                            </div>
                                            <Sparkles className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity mr-2" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-10 text-center">
                                    <p className="text-sm text-gray-400 font-medium italic">No matches found in the library.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <div className="flex items-center gap-8">
                <button className="relative p-2.5 text-gray-400 hover:text-accent hover:bg-white rounded-xl transition-all soft-shadow-hover">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-accent rounded-full border-2 border-cream"></span>
                </button>
                
                <div className="flex items-center gap-4 pl-8 border-l border-[#E8DFD3]">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-serif font-bold text-charcoal leading-none mb-1">{user?.name || 'Guest'}</p>
                        <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Balance: ₹{user?.wallet_balance || 0}</p>
                    </div>
                    <Link to="/dashboard" className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-accent overflow-hidden border border-[#E8DFD3] soft-shadow hover:scale-105 transition-transform cursor-pointer">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-6 h-6" />
                        )}
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default TopBar;
