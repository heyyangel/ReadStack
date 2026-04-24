import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, Save, ShieldCheck, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfileSettings = () => {
    const { user, setUser } = useAuth();
    const [email, setEmail] = useState(user?.email || '');
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [loading, setLoading] = useState(false);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.put('/api/users/profile', { email });
            setUser({ ...user, ...data });
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            return toast.error('New passwords do not match');
        }
        setLoading(true);
        try {
            await api.put('/api/users/password', {
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            toast.success('Password updated successfully');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Password update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-20">
            <header className="mb-12">
                <h1 className="text-4xl font-serif font-bold text-charcoal mb-2">Account Settings</h1>
                <p className="text-gray-500 font-medium">Manage your personal information and security preferences.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Profile Overview */}
                <div className="lg:col-span-4">
                    <div className="premium-card p-8 text-center sticky top-24">
                        <div className="relative inline-block mb-6">
                            <div className="w-32 h-32 bg-cream rounded-full border-4 border-white soft-shadow flex items-center justify-center text-accent overflow-hidden">
                                <User className="w-16 h-16" />
                            </div>
                            <button className="absolute bottom-1 right-1 w-10 h-10 bg-charcoal text-white rounded-full flex items-center justify-center border-4 border-white hover:bg-accent transition-colors">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-charcoal mb-1">{user?.name}</h2>
                        <p className="text-gray-400 font-medium text-sm mb-6 uppercase tracking-widest">{user?.role || 'Reader'}</p>
                        
                        <div className="pt-6 border-t border-[#E8DFD3] flex justify-center gap-8">
                            <div className="text-center">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Library</p>
                                <p className="text-xl font-serif font-extrabold text-charcoal">{user?.library?.length || 0}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Wallet</p>
                                <p className="text-xl font-serif font-extrabold text-charcoal">₹{user?.wallet_balance || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Forms */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Basic Info */}
                    <div className="premium-card p-10">
                        <h3 className="text-xl font-serif font-bold text-charcoal mb-8 flex items-center gap-3">
                            <Mail className="w-5 h-5 text-accent" /> Account Details
                        </h3>
                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={user?.name}
                                        disabled
                                        className="w-full bg-[#F9F7F4] border-none rounded-2xl px-5 py-3.5 text-gray-400 font-medium cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-cream/50 border-none rounded-2xl px-5 py-3.5 text-charcoal font-medium soft-shadow focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center gap-2 bg-charcoal text-white px-8 py-3.5 rounded-2xl font-bold soft-shadow hover:bg-accent transition-all disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" /> Save Changes
                            </button>
                        </form>
                    </div>

                    {/* Security */}
                    <div className="premium-card p-10">
                        <h3 className="text-xl font-serif font-bold text-charcoal mb-8 flex items-center gap-3">
                            <Lock className="w-5 h-5 text-accent" /> Security & Password
                        </h3>
                        <form onSubmit={handlePasswordUpdate} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Current Password</label>
                                <input
                                    type="password"
                                    value={passwords.current}
                                    onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                                    className="w-full bg-cream/50 border-none rounded-2xl px-5 py-3.5 text-charcoal font-medium soft-shadow focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={passwords.new}
                                        onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                                        className="w-full bg-cream/50 border-none rounded-2xl px-5 py-3.5 text-charcoal font-medium soft-shadow focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={passwords.confirm}
                                        onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                                        className="w-full bg-cream/50 border-none rounded-2xl px-5 py-3.5 text-charcoal font-medium soft-shadow focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center gap-2 bg-charcoal text-white px-8 py-3.5 rounded-2xl font-bold soft-shadow hover:bg-accent transition-all disabled:opacity-50"
                            >
                                <ShieldCheck className="w-4 h-4" /> Update Password
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
