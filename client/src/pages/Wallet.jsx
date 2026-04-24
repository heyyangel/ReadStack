import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Wallet as WalletIcon, PlusCircle, CreditCard, History, ArrowUpRight, ShieldCheck } from 'lucide-react';

const Wallet = () => {
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleTopUp = async (value) => {
        setLoading(true);
        try {
            const { data } = await api.post('/api/wallet/topup', { amount: value });
            toast.success(`Successfully added ₹${value}`);
            window.location.reload();
        } catch (error) {
            toast.error('Failed to top up wallet');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-20">
            <header className="mb-12">
                <h1 className="text-4xl font-serif font-bold text-charcoal mb-2">My Wallet</h1>
                <p className="text-gray-500 font-medium">Securely manage your funds and reading credits.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Balance Card */}
                <div className="lg:col-span-5">
                    <div className="bg-charcoal rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden h-full flex flex-col justify-between group">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <WalletIcon className="h-48 w-48" />
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-12">
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60">ReadStack Reserve</span>
                                <div className="w-12 h-8 bg-white/10 rounded-md backdrop-blur-sm border border-white/10 flex items-center justify-center">
                                    <div className="w-6 h-4 bg-yellow-500/80 rounded-sm"></div>
                                </div>
                            </div>
                            
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Available Balance</p>
                            <h2 className="text-6xl font-serif font-extrabold tracking-tight">₹{user?.wallet_balance || 0}</h2>
                        </div>

                        <div className="relative z-10 mt-16 pt-8 border-t border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <ShieldCheck className="w-5 h-5 text-accent" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest opacity-60">Verified Account</span>
                            </div>
                            <span className="text-xl font-serif font-bold italic opacity-30">READSTACK</span>
                        </div>
                    </div>
                </div>

                {/* Top Up Section */}
                <div className="lg:col-span-7 flex flex-col gap-8">
                    <div className="premium-card p-8 h-full">
                        <h3 className="text-lg font-serif font-bold text-charcoal mb-8 flex items-center gap-3">
                            <PlusCircle className="w-5 h-5 text-accent" /> Add Funds Instantly
                        </h3>
                        
                        <div className="grid grid-cols-3 gap-6 mb-10">
                            {[100, 200, 500].map((val) => (
                                <button
                                    key={val}
                                    onClick={() => handleTopUp(val)}
                                    disabled={loading}
                                    className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-[#E8DFD3] bg-white hover:border-accent hover:bg-cream transition-all group"
                                >
                                    <span className="text-2xl font-serif font-extrabold text-charcoal group-hover:text-accent transition-colors">₹{val}</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Quick Top-up</span>
                                </button>
                            ))}
                        </div>

                        <div className="p-6 bg-[#FFF9F2] rounded-2xl border border-accent/10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-charcoal text-sm">Secure Payment Gateway</h4>
                                    <p className="text-xs text-gray-500">Payments are processed securely via Razorpay.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                                {/* Simulated payment partner icons */}
                                <div className="h-4 w-12 bg-gray-400 rounded"></div>
                                <div className="h-4 w-12 bg-gray-400 rounded"></div>
                                <div className="h-4 w-12 bg-gray-400 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="mt-16">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-serif font-bold text-charcoal flex items-center gap-3">
                        <History className="w-6 h-6 text-gray-400" /> Transaction History
                    </h3>
                </div>
                
                <div className="premium-card overflow-hidden">
                    <div className="p-20 text-center">
                        <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <History className="w-10 h-10" />
                        </div>
                        <h4 className="text-xl font-serif font-bold text-charcoal mb-2">No activity yet</h4>
                        <p className="text-gray-500 font-medium max-w-xs mx-auto">Your reading-related transactions will appear here as you explore ReadStack.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Wallet;
