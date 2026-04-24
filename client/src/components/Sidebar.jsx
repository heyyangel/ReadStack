import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, Library, User, Settings, Wallet, Heart } from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();
    
    const menuItems = [
        { icon: Home, path: '/', label: 'Home' },
        { icon: Grid, path: '/categories', label: 'Explore' },
        { icon: Library, path: '/my-books', label: 'Library' },
        { icon: Heart, path: '/favorites', label: 'Favorites' },
        { icon: Wallet, path: '/wallet', label: 'Wallet' },
        { icon: User, path: '/dashboard', label: 'Dashboard' },
        { icon: Settings, path: '/settings', label: 'Settings' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="fixed left-0 top-0 h-screen w-20 flex flex-col items-center py-8 bg-cream border-r border-[#E8DFD3] z-50">
            <div className="mb-12">
                <Link to="/">
                    <div className="w-10 h-10 bg-accent text-white flex items-center justify-center rounded-xl soft-shadow">
                        <span className="font-serif font-bold text-xl">R</span>
                    </div>
                </Link>
            </div>
            
            <nav className="flex-1 flex flex-col gap-8">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`group relative p-3 rounded-2xl transition-all duration-300 ${
                            isActive(item.path)
                                ? 'bg-white text-accent soft-shadow'
                                : 'text-gray-400 hover:text-accent'
                        }`}
                    >
                        <item.icon className="w-6 h-6" />
                        
                        {/* Tooltip */}
                        <span className="absolute left-full ml-4 px-2 py-1 bg-charcoal text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            {item.label}
                        </span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
