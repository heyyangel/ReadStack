import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Trash2, Edit, Plus, X, Search, Book, Image as ImageIcon, FileText, ChevronRight, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPanel = () => {
    const { user } = useAuth();
    const [books, setBooks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        price: '',
        category: 'Technology',
        description: '',
        cover_url: '',
        preview_pdf_url: '',
        full_pdf_url: '',
        tags: ''
    });

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const { data } = await api.get('/api/books');
            setBooks(data);
        } catch (error) {
            toast.error('Failed to load books');
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                tags: formData.tags.split(',').map(tag => tag.trim())
            };

            if (editingBook) {
                await api.put(`/api/books/${editingBook.id}`, payload);
                toast.success('Volume updated successfully');
            } else {
                await api.post('/api/books', payload);
                toast.success('New volume added to catalog');
            }

            closeModal();
            fetchBooks();
        } catch (error) {
            console.error(error);
            toast.error('Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this volume?')) return;
        try {
            await api.delete(`/api/books/${id}`);
            toast.success('Volume removed');
            fetchBooks();
        } catch (error) {
            toast.error('Failed to delete volume');
        }
    };

    const openModal = (book = null) => {
        if (book) {
            setEditingBook(book);
            setFormData({
                title: book.title,
                author: book.author,
                price: book.price,
                category: book.category,
                description: book.description,
                cover_url: book.cover_url || '',
                preview_pdf_url: book.preview_pdf_url || '',
                full_pdf_url: book.full_pdf_url || '',
                tags: book.tags.join(', ')
            });
        } else {
            setEditingBook(null);
            setFormData({
                title: '',
                author: '',
                price: '',
                category: 'Technology',
                description: '',
                cover_url: '',
                preview_pdf_url: '',
                full_pdf_url: '',
                tags: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBook(null);
    };

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="pb-20">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-charcoal mb-2">Curator's Panel</h1>
                    <p className="text-gray-500 font-medium">Manage the ReadStack literary catalog and digital assets.</p>
                </div>

                <div className="flex w-full md:w-auto gap-4">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search catalog..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border-none rounded-2xl pl-11 pr-4 py-3.5 text-charcoal placeholder-gray-400 soft-shadow focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                        />
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="inline-flex items-center gap-2 bg-charcoal text-white px-6 py-3.5 rounded-2xl font-bold soft-shadow hover:bg-accent transition-all"
                    >
                        <Plus className="w-5 h-5" /> Add Volume
                    </button>
                </div>
            </header>

            {/* Books List */}
            <div className="premium-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-[#F9F7F4] border-b border-[#E8DFD3]">
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Volume Details</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8DFD3]">
                            {filteredBooks.map((book) => (
                                <tr key={book.id} className="hover:bg-cream/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-16 rounded-lg overflow-hidden soft-shadow bg-cream flex-shrink-0">
                                                <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-serif font-bold text-charcoal group-hover:text-accent transition-colors">{book.title}</p>
                                                <p className="text-xs text-gray-500 font-medium">by {book.author}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-accent/5 text-accent text-[10px] font-bold uppercase tracking-widest rounded-full">
                                            {book.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-serif font-extrabold text-charcoal">₹{book.price}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => openModal(book)} 
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-accent/10 hover:text-accent transition-all"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(book.id)} 
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-white transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredBooks.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="text-gray-400 font-medium">No results found in the archives.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={closeModal}></div>
                    
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden soft-shadow relative z-10 animate-in fade-in zoom-in duration-300">
                        <form onSubmit={handleSubmit}>
                            <div className="p-8 border-b border-[#E8DFD3] flex justify-between items-center bg-[#F9F7F4]">
                                <h3 className="text-2xl font-serif font-bold text-charcoal">
                                    {editingBook ? 'Edit Volume' : 'New Volume'}
                                </h3>
                                <button type="button" onClick={closeModal} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-charcoal transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Volume Title</label>
                                        <input name="title" value={formData.title} onChange={handleInputChange} required className="w-full bg-cream/50 border-none rounded-2xl px-5 py-3.5 text-charcoal font-medium soft-shadow focus:ring-2 focus:ring-accent/20 outline-none transition-all" placeholder="Enter book title" />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Author</label>
                                            <input name="author" value={formData.author} onChange={handleInputChange} required className="w-full bg-cream/50 border-none rounded-2xl px-5 py-3.5 text-charcoal font-medium soft-shadow focus:ring-2 focus:ring-accent/20 outline-none transition-all" placeholder="Author name" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Price (₹)</label>
                                            <input name="price" type="number" value={formData.price} onChange={handleInputChange} required className="w-full bg-cream/50 border-none rounded-2xl px-5 py-3.5 text-charcoal font-medium soft-shadow focus:ring-2 focus:ring-accent/20 outline-none transition-all" placeholder="99" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
                                        <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-cream/50 border-none rounded-2xl px-5 py-3.5 text-charcoal font-medium soft-shadow focus:ring-2 focus:ring-accent/20 outline-none appearance-none transition-all">
                                            <option>Technology</option>
                                            <option>Business</option>
                                            <option>Finance</option>
                                            <option>Self-Help</option>
                                            <option>Fiction</option>
                                            <option>Mystery</option>
                                            <option>Science</option>
                                            <option>Biography</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Synopsis</label>
                                        <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" className="w-full bg-cream/50 border-none rounded-2xl px-5 py-3.5 text-charcoal font-medium soft-shadow focus:ring-2 focus:ring-accent/20 outline-none transition-all" placeholder="Brief summary of the book..."></textarea>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <ImageIcon className="absolute top-4 left-4 h-4 w-4 text-gray-400 group-focus-within:text-accent transition-colors" />
                                            <input name="cover_url" value={formData.cover_url} onChange={handleInputChange} placeholder="Cover Image URL" className="w-full bg-cream/50 border-none rounded-2xl pl-11 pr-5 py-3.5 text-charcoal font-medium soft-shadow focus:ring-2 focus:ring-accent/20 outline-none transition-all placeholder:text-gray-300" />
                                        </div>
                                        <div className="relative group">
                                            <FileText className="absolute top-4 left-4 h-4 w-4 text-gray-400 group-focus-within:text-accent transition-colors" />
                                            <input name="preview_pdf_url" value={formData.preview_pdf_url} onChange={handleInputChange} placeholder="Preview PDF URL" className="w-full bg-cream/50 border-none rounded-2xl pl-11 pr-5 py-3.5 text-charcoal font-medium soft-shadow focus:ring-2 focus:ring-accent/20 outline-none transition-all placeholder:text-gray-300" />
                                        </div>
                                        <div className="relative group">
                                            <Book className="absolute top-4 left-4 h-4 w-4 text-gray-400 group-focus-within:text-accent transition-colors" />
                                            <input name="full_pdf_url" value={formData.full_pdf_url} onChange={handleInputChange} placeholder="Full PDF URL" className="w-full bg-cream/50 border-none rounded-2xl pl-11 pr-5 py-3.5 text-charcoal font-medium soft-shadow focus:ring-2 focus:ring-accent/20 outline-none transition-all placeholder:text-gray-300" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Metadata Tags (comma separated)</label>
                                        <input name="tags" value={formData.tags} onChange={handleInputChange} className="w-full bg-cream/50 border-none rounded-2xl px-5 py-3.5 text-charcoal font-medium soft-shadow focus:ring-2 focus:ring-accent/20 outline-none transition-all" placeholder="classic, literature, drama" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-[#E8DFD3] flex justify-end gap-4 bg-[#F9F7F4]">
                                <button type="button" onClick={closeModal} className="px-8 py-3.5 rounded-2xl border-2 border-charcoal/5 font-bold text-gray-400 hover:text-charcoal hover:bg-cream transition-all">
                                    Cancel
                                </button>
                                <button type="submit" className="px-8 py-3.5 rounded-2xl bg-charcoal text-white font-bold soft-shadow hover:bg-accent transition-all">
                                    {editingBook ? 'Update Volume' : 'Add to Catalog'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
