import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, Filter, BookOpen, ChevronRight } from 'lucide-react';
import BookCard from '../components/BookCard';

const Categories = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const categories = ['All', 'Technology', 'Business', 'Finance', 'Self-Help', 'Fiction', 'Mystery', 'Science', 'Biography'];

    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            try {
                const url = selectedCategory === 'All' 
                    ? '/api/books' 
                    : `/api/books?category=${selectedCategory}`;
                const { data } = await api.get(url);
                setBooks(data);
            } catch (error) {
                console.error('Error fetching books:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, [selectedCategory]);

    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="pb-20">
            {/* Header Section */}
            <header className="mb-12">
                <h1 className="text-4xl font-serif font-bold text-charcoal mb-2">Browse Library</h1>
                <p className="text-gray-500 font-medium">Explore curated collections of the world's most influential books.</p>
            </header>

            {/* Sticky Filters & Search */}
            <div className="mb-12 bg-white/80 backdrop-blur-md p-4 rounded-3xl soft-shadow sticky top-24 z-40 border border-white flex flex-col lg:flex-row items-center justify-between gap-6">
                {/* Category Tags */}
                <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide no-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 border-2 ${
                                selectedCategory === cat
                                    ? 'bg-charcoal text-white border-charcoal shadow-lg'
                                    : 'bg-white text-gray-400 border-transparent hover:border-accent/20 hover:text-charcoal'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="relative w-full lg:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search books..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-cream/50 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm text-charcoal placeholder:text-gray-400 focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Results Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mb-6"></div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Curating your library...</p>
                </div>
            ) : filteredBooks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {filteredBooks.map((book) => (
                        <BookCard key={book.id} book={book} fullWidth={true} />
                    ))}
                </div>
            ) : (
                <div className="premium-card p-24 text-center bg-[#F9F7F4] border-2 border-dashed border-[#E8DFD3]">
                    <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-8 text-accent">
                        <BookOpen className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-charcoal mb-4">No volumes found</h2>
                    <p className="text-gray-500 font-medium max-w-sm mx-auto mb-8">
                        We couldn't find any books matching your current search. Try exploring another category or clearing your search.
                    </p>
                    <button 
                        onClick={() => { setSelectedCategory('All'); setSearchTerm(''); }}
                        className="inline-flex items-center gap-2 bg-charcoal text-white px-8 py-3 rounded-xl font-bold soft-shadow hover:bg-accent transition-all"
                    >
                        Reset All Filters <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Categories;
