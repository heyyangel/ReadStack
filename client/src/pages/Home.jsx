import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, BookOpen, Star, Users, Heart, Instagram, Twitter, Linkedin, Zap, Sparkles, Wind, MessageSquare, Layout } from 'lucide-react';

import BookCard from '../components/BookCard';
import SectionRow from '../components/SectionRow';
import TestimonialCard from '../components/TestimonialCard';
import SparkCard from '../components/SparkCard';
import MoodDiscovery from '../components/MoodDiscovery';


import heroImg from '../assets/heroimg.png';
import bannerImg from '../assets/banner.png';

const Home = () => {
    const { user } = useAuth();
    const [books, setBooks] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [externalBooks, setExternalBooks] = useState([]);
    const [activeMood, setActiveMood] = useState(null);
    const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);



    const categories = [
        { label: 'Art', icon: '🎨' },
        { label: 'Mystery', icon: '🔍' },
        { label: 'Sci-Fi', icon: '🚀' },
        { label: 'Romance', icon: '💖' },
        { label: 'Fantasy', icon: '🧙' },
        { label: 'Thriller', icon: '🔪' },
        { label: 'History', icon: '📜' },
        { label: 'Biography', icon: '👤' },
    ];

    const testimonials = [
        { name: 'Sarah Jenkins', role: 'Avid Reader', content: 'The curated selection here is unmatched. I found books I never knew I needed.', avatar: 'https://i.pravatar.cc/150?u=sarah' },
        { name: 'David Chen', role: 'Student', content: 'Affordable and high quality. The reading experience is smooth on all my devices.', avatar: 'https://i.pravatar.cc/150?u=david' },
        { name: 'Elena Rodriguez', role: 'Book Club Host', content: 'Finally a bookstore that feels like a community rather than just a shop.', avatar: 'https://i.pravatar.cc/150?u=elena' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await api.get('/api/books');
                setBooks(res.data);

                if (user) {
                    const favRes = await api.get('/api/users/favorites');
                    setFavorites(favRes.data || []);
                }
            } catch (error) {
                console.error('Error fetching books:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleMoodFilter = ({ type, value }) => {
        if (!value || value.trim() === '') {
            setActiveMood(null);
            setFilteredBooks([]);
            return;
        }

        let results = [];
        let displayMood = value;

        if (type === 'vibe') {
            const mappings = {
                gloomy: ['Mystery', 'Thriller', 'Noir'],
                whimsical: ['Fantasy', 'Sci-Fi'],
                academic: ['History', 'Biography', 'Mystery'],
                serene: ['Romance', 'Art', 'Biography'],
                intense: ['Thriller', 'Mystery', 'Action']
            };
            const targetCategories = mappings[value] || [];
            results = books.filter(book => targetCategories.includes(book.category));
            displayMood = value.charAt(0).toUpperCase() + value.slice(1);
        } else if (type === 'prompt') {
            const val = value.toLowerCase();
            const keywords = val.split(' ').filter(w => w.length > 2); // Split into words

            // Mood mapping for keywords
            const moodKeywords = {
                intense: ['Thriller', 'Mystery', 'Action'],
                rainy: ['Mystery', 'Noir', 'Thriller'],
                scary: ['Thriller', 'Horror', 'Mystery'],
                magic: ['Fantasy', 'Sci-Fi'],
                happy: ['Romance', 'Art'],
                sad: ['Biography', 'History', 'Mystery'],
                peaceful: ['Art', 'Romance', 'Biography']
            };

            // Find if any keyword matches a mood or a category directly
            const matchedCategories = new Set();
            keywords.forEach(word => {
                // Check if word is a mood keyword
                Object.keys(moodKeywords).forEach(mood => {
                    if (word.includes(mood) || mood.includes(word)) {
                        moodKeywords[mood].forEach(cat => matchedCategories.add(cat));
                    }
                });
                // Check if word is a category directly
                books.forEach(book => {
                    if (book.category.toLowerCase().includes(word)) {
                        matchedCategories.add(book.category);
                    }
                });
            });

            if (matchedCategories.size > 0) {
                results = books.filter(book => matchedCategories.has(book.category));
            } else {
                // Fallback to basic string match if no mood keywords found
                results = books.filter(book =>
                    book.title.toLowerCase().includes(val) ||
                    book.category.toLowerCase().includes(val) ||
                    (book.description && book.description.toLowerCase().includes(val))
                );
            }

            // Clean up display mood: take the most significant word or capitalize first
            displayMood = keywords.find(w => moodKeywords[w]) || keywords[0] || value;
            displayMood = displayMood.charAt(0).toUpperCase() + displayMood.slice(1);
        }

        setActiveMood(displayMood);
        setFilteredBooks(results);

        // Global Search from Open Library
        if (type === 'prompt' && value.length > 3) {
            fetchGlobalBooks(value);
        } else {
            setExternalBooks([]);
        }
    };

    const fetchGlobalBooks = async (query) => {
        setIsSearchingGlobal(true);
        try {
            const res = await api.get(`/api/external-books/search?q=${encodeURIComponent(query)}`);
            setExternalBooks(res.data);
        } catch (error) {
            console.error("Global Search Error:", error);
        } finally {
            setIsSearchingGlobal(false);
        }
    };



    return (
        <div className="space-y-24 pb-20">
            {/* Hero Section */}
            <section className="text-center py-20 max-w-5xl mx-auto">
                <h1 className="text-5xl md:text-8xl font-serif font-extrabold text-charcoal mb-8 tracking-tighter leading-tight">
                    Read <span className="text-accent italic">better</span>. <br />
                    Discover <span className="inline-flex items-center gap-2">📖 books</span> you'll love.
                </h1>
                <p className="text-gray-500 text-xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                    Your perfect read is just a click away. Explore our curated collection of premium titles and join a community of passionate readers.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button className="bg-charcoal text-white px-10 py-5 rounded-2xl font-bold soft-shadow hover:bg-accent transition-all flex items-center gap-2 group">
                        Explore Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button className="bg-white text-charcoal border border-[#E8DFD3] px-10 py-5 rounded-2xl font-bold hover:bg-cream transition-all">
                        Join Community
                    </button>
                </div>

                {/* Hero Image Integration */}
                <div className="mt-14 relative max-w-6xl mx-auto overflow-hidden group rounded-[1rem]">
                    <div className="absolute inset-0 bg-gradient-to-t from-cream/40 via-transparent to-transparent z-10"></div>
                    <img
                        src={heroImg}
                        alt="ReadStack Library"
                        className="w-full h-[500px] object-cover"
                    />
                </div>
            </section>

            <MoodDiscovery onFilter={handleMoodFilter} />


{
    activeMood && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 py-10 border-y border-cream/50 bg-cream/10">
            <SectionRow
                title={`Curated for your ${activeMood} vibe`}
                subtitle={`Handpicked selections from our library`}
            >
                {filteredBooks.length > 0 ? (
                    filteredBooks.map(book => (
                        <BookCard key={book.id} book={book} />
                    ))
                ) : (
                    <div className="w-full py-20 text-center bg-white/50 rounded-3xl border-2 border-dashed border-cream mx-2">
                        <p className="text-gray-400 font-serif italic text-lg">Our library is still growing. Try another vibe or a different prompt?</p>
                    </div>
                )}
            </SectionRow>
        </div>
    )
}

{/* Popular Now */ }
<SectionRow
    title="Popular Now"
    subtitle="Most read books this month"
    viewAllPath="/categories"
>
    {books.map(book => (
        <BookCard key={book.id} book={book} />
    ))}
</SectionRow>

{/* Favorites Section (Conditional) */ }
{
    user && favorites.length > 0 && (
        <SectionRow
            title="Your Favorites"
            subtitle="Books you've saved to your wishlist"
            viewAllPath="/favorites"
        >
            {favorites.map(book => (
                <div key={book.id} className="relative group">
                    <BookCard book={book} />
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-md text-pink-500 shadow-sm border border-white z-10">
                        <Heart className="h-4 w-4 fill-current" />
                    </div>
                </div>
            ))}
        </SectionRow>
    )
}

{/* Global Library Discovery (Open Library) */ }
{
    externalBooks.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pt-10 border-t border-cream/50 bg-accent/[0.02]">
            <SectionRow
                title="Global Library Discovery"
                subtitle={`Free editions found via Open Library matching "${activeMood}"`}
            >
                {externalBooks.map(book => (
                    <Link
                        key={book.id}
                        to={`/book/${book.id}?externalId=${book.id}&olid=${book.olid}&title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.author)}&cover=${encodeURIComponent(book.cover_url)}`}
                    >
                        <div className="group cursor-pointer">
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-4 soft-shadow relative bg-white border border-cream transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl">
                                <img
                                    src={book.cover_url}
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1543003968-a393be5bb8fe?q=80&w=1000'}
                                />
                                <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                    <span className="bg-white text-charcoal px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                        External Source
                                    </span>
                                </div>
                            </div>
                            <h3 className="font-serif font-bold text-charcoal line-clamp-1 group-hover:text-accent transition-colors">{book.title}</h3>
                            <p className="text-xs text-gray-400 font-medium">{book.author}</p>
                        </div>
                    </Link>
                ))}
            </SectionRow>
        </div>
    )
}

            {/* Categories Section */}
            <section className="max-w-6xl mx-auto w-full">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-serif font-bold text-charcoal mb-3">Browse by Mood</h2>
                    <p className="text-gray-500 text-sm font-medium italic">Explore collections curated by atmospheric genres</p>
                    <div className="w-12 h-1 bg-accent/20 mx-auto mt-4 rounded-full"></div>
                </div>
                <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6 -mx-2 px-2 justify-center">
                    {categories.map((cat) => (
                        <button
                            key={cat.label}
                            className="premium-card px-10 py-8 flex flex-col items-center gap-4 min-w-[160px] hover:bg-charcoal hover:text-white group transition-all duration-500 border border-[#E8DFD3]/50 bg-white/50"
                        >
                            <span className="text-4xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                            <span className="font-bold text-[10px] uppercase tracking-widest text-gray-500 group-hover:text-white/80">{cat.label}</span>
                        </button>
                    ))}
                </div>
                <div className="mt-8 text-center">
                    <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-[#E8DFD3] rounded-full text-[10px] font-bold text-accent uppercase tracking-[0.2em] hover:bg-accent hover:text-white transition-all soft-shadow">
                        View All Categories
                    </button>
                </div>
            </section>

{/* Recently Added */ }
<SectionRow
    title="Recently Added"
    subtitle="Fresh arrivals in our library"
>
    {books.slice().reverse().map(book => (
        <BookCard key={book.id} book={book} compact={true} />
    ))}
</SectionRow>

{/* Community Sparks */ }
<SectionRow
    title="Community Sparks"
    subtitle="Most inspiring highlights shared by readers"
>
    {[
        { content: "The stars were indifferent to his grief, burning with the same cold intensity as they had for a thousand years.", author: "Nimish S.", bookTitle: "Echoes of Silence", pageNumber: 42 },
        { content: "Freedom is not the absence of responsibilities, but the ability to choose them.", author: "Jiaa S.", bookTitle: "The Choice", pageNumber: 156 },
        { content: "We are all stories in the end, make it a good one.", author: "Elena R.", bookTitle: "Final Chapter", pageNumber: 201 },
        { content: "Every shadow is a proof that light is somewhere nearby.", author: "David C.", bookTitle: "Shadow Play", pageNumber: 88 },
    ].map((spark, i) => (
        <SparkCard key={i} {...spark} />
    ))}
</SectionRow>

{/* Community Section */ }
            {/* Refined Compact Features */}
            <section className="py-20 px-12 bg-charcoal rounded-[3rem] text-white relative overflow-hidden max-w-6xl mx-auto">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-accent text-[10px] font-bold uppercase tracking-[0.4em] mb-3 block">Elevated Experience</span>
                        <h2 className="text-5xl font-serif font-bold">Why ReadStack?</h2>
                        <div className="w-24 h-1 bg-accent/30 mx-auto mt-6 rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Sparkles, title: 'AI Mood Discovery', desc: 'Describe your vibe or a scene, and our AI will cross-reference millions of pages to find your perfect literary match.', color: 'bg-accent/20 text-accent' },
                            { icon: BookOpen, title: 'Global Library', desc: 'Direct integration with Open Library API. Access millions of free editions and public domain classics instantly.', color: 'bg-emerald-500/10 text-emerald-500' },
                            { icon: Zap, title: 'Gemini Analysis', desc: 'Unlock deep-dive summaries and theme studies powered by Google AI for any volume in our collection.', color: 'bg-amber-500/10 text-amber-500' },
                            { icon: Wind, title: 'Ambient Audio', desc: 'Immerse yourself with built-in lofi, rain, and forest soundscapes designed to boost focus and immersion.', color: 'bg-blue-500/10 text-blue-400' },
                            { icon: MessageSquare, title: 'Community Sparks', desc: 'Shared highlights that spark conversation. See what moved other readers directly from the reader.', color: 'bg-pink-500/10 text-pink-500' },
                            { icon: Layout, title: 'Editorial Experience', desc: 'A boutique, minimalist interface designed for focus. We treat every pixel like a master printer treats a page.', color: 'bg-white/10 text-white' }
                        ].map((feature, i) => (
                            <div key={i} className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/5 p-6 hover:bg-white/10 transition-all duration-500">
                                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-500 shadow-lg`}>
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-serif font-bold mb-3">{feature.title}</h3>
                                <p className="text-gray-400 text-xs leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="premium-card bg-[#FFF9F2] p-16 text-center relative overflow-hidden rounded-[3.5rem] max-w-6xl mx-auto border border-[#E8DFD3]/30">
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/5 rounded-full mb-8">
                        <Users className="w-3.5 h-3.5 text-accent" />
                        <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">ReadStack Community</span>
                    </div>
                    <h2 className="text-4xl md:text-7xl font-serif font-bold text-charcoal mb-8 leading-[1.1] tracking-tighter">
                        Find your tribe. <br /> 
                        <span className="text-accent italic font-medium">Build your library.</span>
                    </h2>
                    <p className="text-gray-500 mb-12 max-w-xl mx-auto font-medium text-lg leading-relaxed">
                        Join thousands of readers sharing their journey, reviews, and literary insights. Your next great conversation starts here.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button className="bg-charcoal text-white px-12 py-5 rounded-2xl font-bold soft-shadow hover:bg-accent transition-all flex items-center gap-3 group">
                            Explore Community <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="bg-white text-charcoal px-12 py-5 rounded-2xl font-bold border border-[#E8DFD3] hover:bg-cream transition-all">
                            View Member Highlights
                        </button>
                    </div>
                </div>
                <div className="mt-20 max-w-5xl mx-auto relative z-10 px-4">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        <img
                            src={bannerImg}
                            alt="Reading community"
                            className="w-full h-auto rounded-3xl soft-shadow border-4 border-white transform hover:scale-[1.01] transition-all duration-700"
                        />
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-accent/10 rounded-full blur-[100px]"></div>
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-[100px]"></div>
            </section>

            {/* Testimonials */}
            <section className="max-w-6xl mx-auto w-full">
                <div className="text-center mb-20">
                    <p className="text-[10px] font-bold text-accent uppercase tracking-[0.3em] mb-4">Reader Stories</p>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal mb-4 tracking-tight">What Our Readers Say</h2>
                    <div className="w-16 h-1 bg-accent/20 mx-auto rounded-full mb-6"></div>
                    <p className="text-gray-500 font-medium italic text-lg">Moments that made them turn the page</p>
                </div>
                <div className="flex gap-8 overflow-x-auto no-scrollbar pb-10 snap-x -mx-2 px-2 justify-center">
                    {testimonials.map((t, i) => (
                        <TestimonialCard key={i} {...t} />
                    ))}
                </div>
            </section>

            {/* Footer Connect */}
            <section className="grid grid-cols-1 md:grid-cols-12 gap-16 pt-20 border-t border-[#E8DFD3] max-w-6xl mx-auto w-full">
                <div className="md:col-span-7">
                    <h3 className="text-5xl font-serif font-bold text-charcoal mb-8 leading-tight tracking-tighter">Let's connect ↗</h3>
                    <p className="text-gray-500 max-w-md font-medium text-lg leading-relaxed mb-10">
                        Stay informed on new releases, curated collections, and exclusive literary events.
                    </p>
                    <div className="flex gap-5">
                        {[
                            { icon: Instagram, label: 'Instagram' },
                            { icon: Twitter, label: 'Twitter' },
                            { icon: Linkedin, label: 'LinkedIn' }
                        ].map((social, i) => (
                            <a
                                key={i}
                                href="#"
                                className="w-14 h-14 rounded-2xl bg-white border border-[#E8DFD3] flex items-center justify-center text-charcoal hover:bg-accent hover:text-white hover:border-accent hover:-translate-y-2 transition-all duration-500 soft-shadow"
                                aria-label={social.label}
                            >
                                <social.icon className="w-6 h-6" />
                            </a>
                        ))}
                    </div>
                </div>
                <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-12 self-start pt-4">
                    <div>
                        <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-8">Website</h4>
                        <p className="font-serif font-bold text-charcoal text-2xl hover:text-accent transition-colors cursor-pointer">readstack.com</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-8">Email Us</h4>
                        <p className="font-serif font-bold text-accent text-2xl hover:text-charcoal transition-colors cursor-pointer">hello@readstack.com</p>
                    </div>
                </div>
            </section>
        </div >
    );
};

export default Home;