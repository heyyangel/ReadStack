import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Instagram, Twitter, Facebook } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="pt-20 pb-10 border-t border-[#E8DFD3]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div className="md:col-span-1">
                    <Link to="/" className="text-2xl font-serif font-extrabold text-charcoal mb-6 block">
                        READSTACK
                    </Link>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                        A premium reading experience for modern book lovers. Join our community of readers today.
                    </p>
                    <div className="flex gap-4">
                        <Facebook className="w-5 h-5 text-gray-400 hover:text-accent cursor-pointer transition-colors" />
                        <Twitter className="w-5 h-5 text-gray-400 hover:text-accent cursor-pointer transition-colors" />
                        <Instagram className="w-5 h-5 text-gray-400 hover:text-accent cursor-pointer transition-colors" />
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-6">Navigation</h4>
                    <ul className="space-y-4">
                        <li><Link to="/" className="text-sm font-medium hover:text-accent transition-colors">Home</Link></li>
                        <li><Link to="/categories" className="text-sm font-medium hover:text-accent transition-colors">Categories</Link></li>
                        <li><Link to="/my-books" className="text-sm font-medium hover:text-accent transition-colors">Library</Link></li>
                        <li><Link to="/dashboard" className="text-sm font-medium hover:text-accent transition-colors">Profile</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-6">Support</h4>
                    <ul className="space-y-4">
                        <li><a href="#" className="text-sm font-medium hover:text-accent transition-colors">Help Center</a></li>
                        <li><a href="#" className="text-sm font-medium hover:text-accent transition-colors">Privacy Policy</a></li>
                        <li><a href="#" className="text-sm font-medium hover:text-accent transition-colors">Terms of Service</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-6">Contact</h4>
                    <ul className="space-y-4">
                        <li className="flex items-center gap-3 text-sm text-gray-500">
                            <Mail className="w-4 h-4" /> support@readstack.com
                        </li>
                        <li className="flex items-center gap-3 text-sm text-gray-500">
                            <Phone className="w-4 h-4" /> +1 (555) 123-4567
                        </li>
                        <li className="flex items-center gap-3 text-sm text-gray-500">
                            <MapPin className="w-4 h-4" /> 123 Book St, Digital City
                        </li>
                    </ul>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-[#E8DFD3] gap-4">
                <p className="text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} READSTACK. Built with love for readers.
                </p>
                <div className="flex gap-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <span className="hover:text-accent cursor-pointer">Instagram</span>
                    <span className="hover:text-accent cursor-pointer">Twitter</span>
                    <span className="hover:text-accent cursor-pointer">LinkedIn</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
