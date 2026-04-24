import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Book, CreditCard, ChevronRight, Layout, Heart, User, LogOut, Flame, Compass, Settings } from 'lucide-react';
import StreakCard from '../components/StreakCard';

const Dashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
            return;
        }

        const fetchStats = async () => {
            try {
                const { data } = await api.get('/api/users/dashboard');
                setStats(data);
            } catch (error) {
                console.error('Error fetching dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user, authLoading, navigate]);

    if (authLoading || loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
    );

    return (
        <div className="pb-20">
            <header className="mb-12">
                <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-2 italic">Reader Dashboard</p>
                <h1 className="text-4xl font-serif font-bold text-charcoal mb-2 leading-tight">Welcome back, {user?.name}</h1>
                <p className="text-gray-500 font-medium">Your personal literary sanctuary and reading history.</p>
            </header>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="premium-card p-8 flex items-center justify-between group cursor-default">
                    <div>
                        <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-2">Volumes Owned</p>
                        <p className="text-4xl font-serif font-extrabold text-charcoal">{stats?.books_owned || 0}</p>
                    </div>
                    <div className="w-14 h-14 bg-accent/5 rounded-2xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-500 soft-shadow">
                        <Book className="h-6 w-6" />
                    </div>
                </div>

                <StreakCard streak={stats?.streak} />

                <div className="premium-card p-8 flex items-center justify-between group cursor-default">
                    <div>
                        <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-2">Wallet Credit</p>
                        <p className="text-4xl font-serif font-extrabold text-charcoal">₹{user?.wallet_balance || 0}</p>
                    </div>
                    <div className="w-14 h-14 bg-[#E8F3F1] rounded-2xl flex items-center justify-center text-[#2D6A4F] group-hover:bg-[#2D6A4F] group-hover:text-white transition-all duration-500 soft-shadow">
                        <CreditCard className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Continue Reading Section */}
            <section className="mb-16">
                <div className="flex justify-between items-center mb-8 px-2">
                    <h2 className="text-2xl font-serif font-bold text-charcoal flex items-center gap-3">
                        Reading Progress <ChevronRight className="w-5 h-5 text-accent" />
                    </h2>
                </div>

                {stats?.library?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {stats.library.slice(0, 3).map((book) => (
                            <div key={book.id} className="premium-card p-5 flex gap-5 group hover:border-accent/10 border-2 border-transparent transition-all duration-300">
                                <div className="w-24 h-32 flex-shrink-0 rounded-xl overflow-hidden soft-shadow relative bg-cream">
                                    <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
                                    <h3 className="text-lg font-serif font-bold text-charcoal line-clamp-1 group-hover:text-accent transition-colors leading-tight mb-1">
                                        {book.title}
                                    </h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">by {book.author}</p>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                            <span>Progress</span>
                                            <span className="text-accent">45%</span>
                                        </div>
                                        <div className="w-full bg-cream rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-accent h-1.5 rounded-full" style={{ width: '45%' }}></div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/read/${book.id}`)}
                                        className="w-full py-2.5 bg-charcoal text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-accent transition-all soft-shadow active:scale-95"
                                    >
                                        Resume Reading
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="premium-card p-20 text-center bg-[#F9F7F4] border-2 border-dashed border-[#E8DFD3]">
                        <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-8 text-accent">
                            <Book className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-charcoal mb-3">Your library is waiting</h3>
                        <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium">Curate your collection of premium books and start your journey today.</p>
                        <Link to="/categories" className="inline-flex items-center gap-3 bg-charcoal text-white px-10 py-4 rounded-2xl font-bold soft-shadow hover:bg-accent transition-all group">
                            Explore Catalog <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                )}
            </section>

            {/* Quick Actions */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'My Library', icon: Book, path: '/my-books', color: 'bg-cream text-accent' },
                    { label: 'Favorites', icon: Heart, path: '/favorites', color: 'bg-pink-50 text-pink-500' },
                    { label: 'Add Funds', icon: CreditCard, path: '/wallet', color: 'bg-blue-50 text-blue-500' },
                    { label: 'Settings', icon: Settings, path: '/settings', color: 'bg-gray-100 text-gray-500' },
                ].map((action) => (
                    <Link key={action.label} to={action.path} className="premium-card p-8 flex flex-col items-center gap-5 text-center group hover:bg-charcoal hover:text-white transition-all duration-500">
                        <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center transition-all group-hover:bg-white/10 group-hover:text-white soft-shadow`}>
                            <action.icon className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-xs uppercase tracking-widest">{action.label}</span>
                    </Link>
                ))}
            </section>
        </div>
    );
};

export default Dashboard;
