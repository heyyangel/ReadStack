
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetails from './pages/ProductDetails';
import Reader from './pages/Reader';
import Wallet from './pages/Wallet';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import ProfileSettings from './pages/ProfileSettings';
import MyBooks from './pages/MyBooks';
import Favorites from './pages/Favorites';
import Categories from './pages/Categories';
import ScrollToTop from './components/ScrollToTop';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <Router>
        <ScrollToTop />
        <div className="flex bg-cream min-h-screen">
          <Sidebar />
          <div className="flex-1 ml-20">
            <TopBar />
            <main className="px-8 py-4 max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/book/:id" element={<ProductDetails />} />
                <Route path="/read/:id" element={<Reader />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/settings" element={<ProfileSettings />} />
                <Route path="/my-books" element={<MyBooks />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/categories" element={<Categories />} />
              </Routes>
              <Footer />
            </main>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
