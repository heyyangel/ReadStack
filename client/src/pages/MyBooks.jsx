import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Book, Search, ChevronRight, BookOpen, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const MyBooks = () => {
    const { user } = useAuth();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyBooks = async () => {
            try {
                const { data } = await api.get('/api/users/dashboard');
                setBooks(data.library || []);
            } catch (error) {
                console.error('Error fetching library:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyBooks();
    }, []);

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
                    <h1 className="text-4xl font-serif font-bold text-charcoal mb-2">My Library</h1>
                    <p className="text-gray-500 font-medium">You have {books.length} books in your private collection.</p>
                </div>

                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search your library..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-white border-none rounded-2xl pl-11 pr-4 py-3.5 text-charcoal placeholder-gray-400 soft-shadow focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                    />
                </div>
            </header>

            {filteredBooks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {filteredBooks.map((book) => (
                        <div key={book.id} className="group cursor-pointer" onClick={() => navigate(`/book/${book.id}`)}>
                            <div className="aspect-[3/4.5] rounded-2xl overflow-hidden soft-shadow relative mb-4">
                                <img 
                                    src={book.cover_url} 
                                    alt={book.title} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                />
                                <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/read/${book.id}`);
                                        }}
                                        className="bg-white text-charcoal w-12 h-12 rounded-full flex items-center justify-center shadow-2xl hover:bg-accent hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                                    >
                                        <BookOpen className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-sm font-serif font-bold text-charcoal group-hover:text-accent transition-colors line-clamp-1 mb-1">{book.title}</h3>
                            <p className="text-xs text-gray-500 font-medium">{book.author}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="premium-card p-20 text-center bg-[#F9F7F4] border-2 border-dashed border-[#E8DFD3]">
                    <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Book className="w-10 h-10 text-accent" />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-charcoal mb-2">
                        {filter ? "No books match your search" : "Your library is empty"}
                    </h3>
                    <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                        {filter ? "Try a different search term or clear the filter." : "Discover books you love and start your reading journey today."}
                    </p>
                    <Link to="/" className="inline-flex items-center gap-2 bg-charcoal text-white px-8 py-3 rounded-xl font-bold soft-shadow hover:bg-accent transition-all">
                        Browse Books <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            )}
        </div>
    );
};

export default MyBooks;
