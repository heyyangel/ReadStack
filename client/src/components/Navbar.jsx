import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Menu, X, ShoppingBag, Search, Settings, Heart, Compass } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            if (searchQuery.length > 1) {
                setIsSearching(true);
                try {
                    const { data } = await api.get(`/api/books/search?q=${searchQuery}`);
                    setSearchResults(data);
                    setShowDropdown(true);
                } catch (error) {
                    console.error('Search failed', error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setShowDropdown(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    const handleResultClick = (bookId) => {
        setSearchQuery('');
        setShowDropdown(false);
        navigate(`/book/${bookId}`);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E8DFD3]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo Section */}
                    <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
                        <div className="bg-charcoal text-white p-2 rounded-xl group-hover:bg-accent transition-colors soft-shadow">
                            <ShoppingBag className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-serif font-black tracking-tighter text-charcoal">
                            READSTACK
                        </span>
                    </Link>

                    {/* Global Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
                        <div className="relative w-full group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-accent text-gray-400">
                                <Search className="h-4 w-4" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery.length > 1 && setShowDropdown(true)}
                                className="block w-full bg-cream/50 border-none rounded-2xl py-3 pl-11 pr-4 text-sm text-charcoal placeholder-gray-400 focus:ring-2 focus:ring-accent/20 transition-all outline-none"
                                placeholder="Search our collection..."
                            />
                            {isSearching && (
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                    <div className="animate-spin h-3 w-3 border-2 border-accent border-t-transparent rounded-full"></div>
                                </div>
                            )}
                        </div>

                        {/* Search Dropdown */}
                        {showDropdown && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                                <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-[#E8DFD3] rounded-3xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                                    {searchResults.length > 0 ? (
                                        <div className="max-h-96 overflow-y-auto no-scrollbar py-2">
                                            {searchResults.map((book) => (
                                                <button
                                                    key={book.id}
                                                    onClick={() => handleResultClick(book.id)}
                                                    className="w-full flex items-center px-4 py-3 hover:bg-cream/50 transition-colors text-left border-b border-[#F5EFE6] last:border-0"
                                                >
                                                    <div className="h-14 w-10 flex-shrink-0 rounded-lg bg-cream overflow-hidden mr-4 soft-shadow">
                                                        <img src={book.cover_url} alt="" className="h-full w-full object-cover" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-serif font-bold text-charcoal truncate">{book.title}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{book.author} • {book.category}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center">
                                            <p className="text-sm text-gray-400 font-medium italic">No volumes found for "{searchQuery}"</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden lg:block">
                        <div className="flex items-center space-x-10">
                            {[
                                { label: 'Explore', path: '/categories', icon: Compass },
                                { label: 'Wishlist', path: '/favorites', icon: Heart },
                                { label: 'My Library', path: '/my-books', icon: ShoppingBag },
                            ].map((item) => (
                                <Link 
                                    key={item.path}
                                    to={item.path} 
                                    className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all ${
                                        isActive(item.path) ? 'text-accent' : 'text-gray-400 hover:text-charcoal'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Auth/Profile Section */}
                    <div className="hidden md:flex items-center space-x-6 ml-10 pl-6 border-l border-[#E8DFD3]">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link to="/wallet" className="flex items-center bg-cream/50 rounded-full pl-1.5 pr-4 py-1.5 border border-[#E8DFD3] hover:bg-cream transition-colors group">
                                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-accent text-[10px] font-bold mr-2 soft-shadow group-hover:bg-accent group-hover:text-white transition-all">₹</div>
                                    <span className="text-charcoal font-serif font-black text-sm">{user.wallet_balance}</span>
                                </Link>

                                <Link to="/dashboard" className="w-10 h-10 rounded-full bg-cream flex items-center justify-center text-gray-400 hover:text-charcoal hover:bg-white transition-all soft-shadow overflow-hidden">
                                    <User className="h-5 w-5" />
                                </Link>

                                <button onClick={logout} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-charcoal">Log in</Link>
                                <Link to="/register" className="bg-charcoal hover:bg-accent text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all soft-shadow">Join Free</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-charcoal transition-colors">
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-[#E8DFD3] py-6 px-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex flex-col gap-4">
                        <Link to="/categories" onClick={() => setIsOpen(false)} className="text-sm font-bold uppercase tracking-widest text-charcoal p-2">Explore</Link>
                        <Link to="/my-books" onClick={() => setIsOpen(false)} className="text-sm font-bold uppercase tracking-widest text-charcoal p-2">Library</Link>
                        {user ? (
                            <>
                                <Link to="/wallet" onClick={() => setIsOpen(false)} className="flex items-center justify-between p-2">
                                    <span className="text-sm font-bold uppercase tracking-widest text-charcoal">Wallet</span>
                                    <span className="font-serif font-black text-accent">₹{user.wallet_balance}</span>
                                </Link>
                                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-sm font-bold uppercase tracking-widest text-charcoal p-2">Dashboard</Link>
                                <button onClick={logout} className="text-left text-sm font-bold uppercase tracking-widest text-red-500 p-2">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setIsOpen(false)} className="text-sm font-bold uppercase tracking-widest text-charcoal p-2">Log in</Link>
                                <Link to="/register" onClick={() => setIsOpen(false)} className="bg-charcoal text-white text-center py-3 rounded-2xl text-sm font-bold uppercase tracking-widest">Join Free</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
