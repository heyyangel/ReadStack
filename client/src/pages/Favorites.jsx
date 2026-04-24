import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Heart, Search, ChevronRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import BookCard from '../components/BookCard';

const Favorites = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            const { data } = await api.get('/api/users/favorites');
            setBooks(data || []);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFavoriteToggle = async (bookId) => {
        try {
            await api.post('/api/users/favorites/toggle', { bookId });
            fetchFavorites();
        } catch (error) {
            console.error('Toggle favorite failed:', error);
        }
    };

    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(filter.toLowerCase()) || 
        book.author.toLowerCase().includes(filter.toLowerCase())
    );

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
    );

    return (
        <div className="pb-20">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-charcoal mb-2">My Wishlist</h1>
                    <p className="text-gray-500 font-medium">You have {books.length} books saved for later.</p>
                </div>

                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search favorites..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-white border-none rounded-2xl pl-11 pr-4 py-3.5 text-charcoal placeholder-gray-400 soft-shadow focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                    />
                </div>
            </header>

            {filteredBooks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {filteredBooks.map((book) => (
                        <div key={book.id} className="relative group">
                            <BookCard book={book} fullWidth={true} />
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleFavoriteToggle(book.id);
                                }}
                                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-md text-pink-500 shadow-sm border border-white hover:bg-pink-500 hover:text-white transition-all z-10"
                            >
                                <Heart className="h-4 w-4 fill-current" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="premium-card p-24 text-center bg-[#F9F7F4] border-2 border-dashed border-[#E8DFD3]">
                    <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-8 text-pink-500">
                        <Heart className="w-10 h-10 fill-current" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-charcoal mb-4">
                        {filter ? "No matches in your wishlist" : "Your wishlist is empty"}
                    </h2>
                    <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium">
                        {filter ? "Try a broader search or explore other titles." : "Save books you're interested in and they'll appear here for easy access later."}
                    </p>
                    <Link to="/" className="inline-flex items-center gap-2 bg-charcoal text-white px-10 py-4 rounded-2xl font-bold soft-shadow hover:bg-accent transition-all">
                        Discover More <ChevronRight className="w-5 h-5" />
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Favorites;
