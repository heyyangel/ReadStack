import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { BookOpen, ShoppingBag, CheckCircle, Star, Heart, ArrowLeft, ChevronRight, CreditCard, Sparkles, Lock, Zap } from 'lucide-react';

import toast from 'react-hot-toast';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorited, setIsFavorited] = useState(false);
    const [hasAccess, setHasAccess] = useState(false);
    const [isExternal, setIsExternal] = useState(false);

    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Dynamic Razorpay Script Loader
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };


    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                // Check if we are dealing with an external book (from Open Library)
                const params = new URLSearchParams(window.location.search);
                const externalId = params.get('externalId');
                const olid = params.get('olid');

                if (externalId) {
                    setIsExternal(true);
                    setHasAccess(true); // Open Library books are usually free/borrowable
                    const res = await api.get(`/api/external-books/details/${externalId}?olid=${olid}`);
                    
                    // Construct a mock book object from state or URL params
                    const searchParams = new URLSearchParams(window.location.search);
                    setBook({
                        id: externalId,
                        title: searchParams.get('title'),
                        author: searchParams.get('author'),
                        cover_url: searchParams.get('cover'),
                        category: 'Global Library',
                        price: 0,
                        description: res.data.description,
                        pdf_url: res.data.pdf_url,
                        source: 'Open Library'
                    });
                } else {
                    const bookRes = await api.get(`/api/books/${id}`);
                    setBook(bookRes.data);

                    if (user) {
                        const [favoriteRes, accessRes] = await Promise.all([
                            api.get(`/api/users/favorites/check/${id}`),
                            api.get(`/api/users/check-access/${id}`)
                        ]);
                        setIsFavorited(favoriteRes.data.favorited);
                        setHasAccess(accessRes.data.hasAccess);
                    }
                }
            } catch (err) {
                setError('Book not found');
            } finally {
                setLoading(false);
            }
        };

        fetchBookDetails();
    }, [id, user]);

    const toggleFavorite = async () => {
        if (!user) {
            toast.error('Please login to wishlist books');
            navigate('/login');
            return;
        }
        try {
            const { data } = await api.post('/api/users/favorites/toggle', { bookId: id });
            setIsFavorited(data.favorited);
            toast.success(data.favorited ? 'Added to Wishlist' : 'Removed from Wishlist');
        } catch (error) {
            toast.error('Failed to update wishlist');
        }
    };

    const handleBuyNow = async (paymentMethod = 'razorpay') => {
        if (!user) {
            toast.error('Please login to purchase');
            navigate('/login');
            return;
        }

        try {
            if (paymentMethod === 'wallet') {
                const { data } = await api.post('/api/orders', {
                    bookId: book.id,
                    paymentMethod: 'wallet'
                });
                if (data.status === 'success') {
                    toast.success('Purchase Successful!');
                    setHasAccess(true);
                    return;
                }
                return;
            }

            // Razorpay Flow
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                toast.error('Failed to load payment gateway. Please check your internet connection.');
                return;
            }

            const { data: order } = await api.post('/api/orders', {
                bookId: book.id,
                paymentMethod: 'razorpay'
            });

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_1234567890",
                amount: order.amount,
                currency: order.currency,
                name: "READSTACK",
                description: `Purchase ${book.title}`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        await api.post('/api/orders/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            order_db_id: order.order_db_id
                        });
                        toast.success('Payment Successful!');
                        setHasAccess(true);
                    } catch (error) {
                        toast.error('Payment Verification Failed');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: "9999999999"
                },
                theme: { color: "#8B5E3C" }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();
        } catch (error) {
            console.error('Payment Error:', error);
            toast.error('Something went wrong during payment.');
        }
    };

    const handleUnlockAI = async () => {
        if (!user) {
            toast.error('Please login to unlock AI insights');
            navigate('/login');
            return;
        }

        if (user.wallet_balance < 5) {
            toast.error('Insufficient wallet balance (Requires ₹5)');
            return;
        }

        setIsAnalyzing(true);
        try {
            const { data } = await api.post(`/api/ai/summarize`, {
                bookId: id,
                cost: 5
            });

            if (data.success) {
                setAiAnalysis(data.analysis);
                toast.success('AI Insights Unlocked!');
            }
        } catch (error) {
            console.error('AI Error:', error);
            toast.error('AI Analysis failed. Check your API key.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
    );

    if (error || !book) return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-serif font-bold text-charcoal mb-4">Book not found</h2>
            <Link to="/" className="text-accent font-bold hover:underline">Back to library</Link>
        </div>
    );

    return (
        <div className="pb-20">
            {/* Breadcrumbs / Back button */}
            <nav className="mb-8 flex items-center justify-between">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-charcoal transition-colors font-bold text-xs uppercase tracking-widest"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to library
                </button>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <Link to="/" className="hover:text-accent">Library</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-gray-300">{book.category}</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-charcoal">{book.title}</span>
                </div>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                {/* Book Cover */}
                <div className="lg:col-span-5 xl:col-span-4">
                    <div className="premium-card p-4 sticky top-8">
                        <div className="aspect-[3/4.5] rounded-xl overflow-hidden soft-shadow relative">
                            <img
                                src={book.cover_url}
                                alt={book.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 right-4">
                                <button 
                                    onClick={toggleFavorite}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
                                        isFavorited 
                                        ? 'bg-pink-500 border-pink-400 text-white shadow-lg' 
                                        : 'bg-white/80 border-white text-gray-400 hover:text-pink-500'
                                    }`}
                                >
                                    <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="bg-cream/50 rounded-xl p-4 text-center">
                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Language</span>
                                <span className="font-bold text-charcoal">English</span>
                            </div>
                            <div className="bg-cream/50 rounded-xl p-4 text-center">
                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Format</span>
                                <span className="font-bold text-charcoal">Digital / PDF</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Book Details */}
                <div className="lg:col-span-7 xl:col-span-8">
                    <header className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest rounded-full">
                                {book.category}
                            </span>
                            <div className="flex items-center gap-1 text-yellow-500">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-xs font-bold text-charcoal">4.8 (2.4k reviews)</span>
                            </div>
                        </div>
                        <h1 className="text-5xl font-serif font-extrabold text-charcoal mb-4 leading-tight">{book.title}</h1>
                        <p className="text-xl text-gray-500 font-medium italic">by {book.author}</p>
                    </header>

                    {/* Pricing/Action Card */}
                    <div className="premium-card p-8 bg-[#FFF9F2] mb-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        {hasAccess ? (
                            <>
                                <div>
                                    <h3 className="text-2xl font-serif font-bold text-charcoal mb-2">You own this volume</h3>
                                    <p className="text-sm text-gray-500 font-medium">Enjoy lifetime access to this masterpiece.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        if (isExternal && book.pdf_url) {
                                            window.open(book.pdf_url, '_blank');
                                        } else {
                                            navigate(`/read/${book.id}`);
                                        }
                                    }}
                                    className="flex items-center justify-center gap-3 bg-charcoal text-white px-10 py-4 rounded-2xl font-bold soft-shadow hover:bg-accent transition-all group"
                                >
                                    <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                                    {isExternal ? 'Read on Open Library' : 'Start Reading'}
                                </button>
                            </>
                        ) : (
                            <>
                                <div>
                                    <div className="flex items-baseline gap-3 mb-2">
                                        <span className="text-4xl font-serif font-extrabold text-charcoal">₹{book.price}</span>
                                        <span className="text-lg text-gray-400 line-through">₹299</span>
                                        <span className="text-sm font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded">83% OFF</span>
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">One-time purchase • Lifetime access</p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                    <button
                                        onClick={() => handleBuyNow('razorpay')}
                                        className="flex items-center justify-center gap-3 bg-charcoal text-white px-8 py-4 rounded-2xl font-bold soft-shadow hover:bg-accent transition-all group"
                                    >
                                        <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" /> Buy Now
                                    </button>
                                    
                                    {user && user.wallet_balance >= book.price && (
                                        <button
                                            onClick={() => handleBuyNow('wallet')}
                                            className="flex items-center justify-center gap-3 bg-white text-charcoal border-2 border-charcoal/5 px-8 py-4 rounded-2xl font-bold hover:bg-cream transition-all"
                                        >
                                            <CreditCard className="w-5 h-5" /> Pay with Wallet
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex flex-wrap gap-4 mb-12">
                        <button 
                            onClick={toggleFavorite}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                                isFavorited 
                                ? 'bg-pink-50 text-pink-500 border border-pink-100' 
                                : 'bg-white text-gray-400 border border-[#E8DFD3] hover:border-pink-500 hover:text-pink-500'
                            }`}
                        >
                            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                            {isFavorited ? 'Saved to Wishlist' : 'Add to Wishlist'}
                        </button>
                    </div>

                    {/* Description */}
                    <section className="mb-12">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Synopsis</h3>
                        <div className="prose prose-lg text-gray-600 font-medium leading-relaxed max-w-none">
                            <p>{book.description}</p>
                            <p className="mt-4">
                                This masterpiece offers profound insights and a unique perspective that will challenge your thinking and inspire your journey. 
                                Whether you're a seasoned reader or just starting, this book is a must-have addition to your digital library.
                            </p>
                        </div>
                    </section>

                    {/* AI Premium Analysis */}
                    <section className="mb-12">
                        <div className="flex items-center gap-2 mb-6">
                            <Sparkles className="w-4 h-4 text-accent" />
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">AI Premium Insights</h3>
                        </div>

                        {!aiAnalysis ? (
                            <div className="premium-card p-10 bg-charcoal text-white relative overflow-hidden group">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                                            <Lock className="w-6 h-6 text-accent" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-serif font-bold">Unlock Deep Analysis</h4>
                                            <p className="text-xs text-gray-400 font-medium">Themes • Key Takeaways • Character Study</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-300 mb-8 leading-relaxed max-w-md">
                                        Get a personalized, AI-generated deep dive into this volume's hidden meanings and core philosophy.
                                    </p>
                                    <button 
                                        onClick={handleUnlockAI}
                                        disabled={isAnalyzing}
                                        className="bg-accent text-white px-8 py-3.5 rounded-xl font-bold soft-shadow hover:bg-white hover:text-charcoal transition-all flex items-center gap-3 group/btn"
                                    >
                                        {isAnalyzing ? (
                                            <Zap className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                                        )}
                                        {isAnalyzing ? 'Analyzing...' : 'Unlock for ₹5'}
                                    </button>
                                </div>
                                <div className="absolute -right-20 -top-20 w-60 h-60 bg-accent/20 rounded-full blur-[80px]"></div>
                                <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px]"></div>
                            </div>
                        ) : (
                            <div className="premium-card p-10 bg-white border-2 border-accent/20 animate-in fade-in zoom-in duration-500">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-accent" />
                                    </div>
                                    <h4 className="text-lg font-serif font-bold text-charcoal">AI Generated Insights</h4>
                                </div>
                                <div className="prose prose-sm text-gray-600 font-medium leading-relaxed whitespace-pre-wrap italic">
                                    {aiAnalysis}
                                </div>
                                <div className="mt-8 pt-6 border-t border-dashed border-gray-100 flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Analysis complete • Model v4.0</span>
                                    <div className="flex items-center gap-1 text-accent">
                                        <Star className="w-3 h-3 fill-current" />
                                        <span className="text-[9px] font-bold uppercase tracking-widest">Premium Content</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Features */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        <div className="flex items-start gap-4 p-6 rounded-2xl bg-white soft-shadow">
                            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-charcoal mb-1">Instant Access</h4>
                                <p className="text-xs text-gray-500">Download and start reading immediately after purchase.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-6 rounded-2xl bg-white soft-shadow">
                            <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-charcoal mb-1">Multi-Device</h4>
                                <p className="text-xs text-gray-500">Read on your laptop, tablet, or mobile phone seamlessly.</p>
                            </div>
                        </div>
                    </section>

                    {/* Tags */}
                    {book.tags && book.tags.length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Themes</h3>
                            <div className="flex flex-wrap gap-2">
                                {book.tags.map((tag, index) => (
                                    <span key={index} className="px-4 py-2 bg-white border border-[#E8DFD3] text-gray-500 text-xs font-bold rounded-xl hover:border-accent hover:text-accent transition-all cursor-default">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
