import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Mail, Lock, Book } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(formData.email, formData.password);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="flex min-h-screen bg-cream">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex w-1/2 bg-[#FFF9F2] relative items-center justify-center p-20">
                <div className="max-w-md text-center relative z-10">
                    <div className="w-16 h-16 bg-accent text-white rounded-2xl flex items-center justify-center mx-auto mb-8 soft-shadow">
                        <Book className="w-8 h-8" />
                    </div>
                    <h2 className="text-4xl font-serif font-extrabold text-charcoal mb-6 leading-tight">
                        Your library of <br /> endless knowledge.
                    </h2>
                    <p className="text-gray-500 font-medium leading-relaxed">
                        Access thousands of premium titles and join a community of readers who love to learn and grow.
                    </p>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-accent rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-20 w-64 h-64 bg-accent rounded-full blur-3xl"></div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="max-w-md w-full">
                    <div className="mb-10">
                        <h2 className="text-3xl font-serif font-bold text-charcoal mb-2">Sign In</h2>
                        <p className="text-gray-500 font-medium">
                            Don't have an account? <Link to="/register" className="text-accent hover:underline">Create one for free</Link>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-accent text-gray-400">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="block w-full pl-11 pr-4 py-3.5 bg-white border-none rounded-2xl text-charcoal placeholder-gray-400 soft-shadow focus:ring-2 focus:ring-accent/20 transition-all outline-none"
                                    placeholder="you@example.com"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
                                <a href="#" className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline">Forgot?</a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-accent text-gray-400">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    className="block w-full pl-11 pr-4 py-3.5 bg-white border-none rounded-2xl text-charcoal placeholder-gray-400 soft-shadow focus:ring-2 focus:ring-accent/20 transition-all outline-none"
                                    placeholder="••••••••"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-500 font-medium cursor-pointer">
                                Keep me signed in
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex justify-center items-center py-4 bg-charcoal text-white rounded-2xl font-bold text-base soft-shadow hover:bg-accent transition-all group"
                        >
                            Sign In <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
