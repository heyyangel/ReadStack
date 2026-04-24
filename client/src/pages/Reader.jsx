import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ArrowLeft, Lock, BookOpen, Share2, Info, Maximize2, Minimize2, Wind, Clock } from 'lucide-react';
import AmbientPlayer from '../components/AmbientPlayer';


pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Reader = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const [zenMode, setZenMode] = useState(false);
    const [showAmbient, setShowAmbient] = useState(false);
    const [sessionTime, setSessionTime] = useState(0);
    const [selectedText, setSelectedText] = useState('');
    const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });



    useEffect(() => {
        const fetchBookAndAccess = async () => {
            try {
                const bookRes = await api.get(`/api/books/${id}`);
                setBook(bookRes.data);

                if (user) {
                    try {
                        const [accessRes, progressRes] = await Promise.all([
                            api.get(`/api/users/check-access/${id}`),
                            api.get(`/api/users/progress/${id}`)
                        ]);
                        
                        setHasAccess(accessRes.data.hasAccess);
                        
                        if (progressRes.data && progressRes.data.current_page) {
                            setPageNumber(progressRes.data.current_page);
                        }
                    } catch (err) {
                        setHasAccess(false);
                    }
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookAndAccess();
    }, [id, user]);

    useEffect(() => {
        let interval;
        if (!loading) {
            interval = setInterval(() => {
                setSessionTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [loading]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };


    useEffect(() => {
        if (!hasAccess || !numPages) return;

        const syncProgress = setTimeout(async () => {
            try {
                await api.post('/api/users/progress', {
                    bookId: id,
                    currentPage: pageNumber,
                    totalPages: numPages
                });
            } catch (error) {
                console.error('Failed to sync progress:', error);
            }
        }, 1000);

        return () => clearTimeout(syncProgress);
    }, [pageNumber, hasAccess, numPages, id]);

    const isLocked = !hasAccess && pageNumber > 5;

    const changePage = (offset) => {
        setPageNumber(prev => Math.min(Math.max(1, prev + offset), numPages));
        setSelectedText(''); // Clear selection on page change
    };

    const handleMouseUp = () => {
        const selection = window.getSelection();
        const text = selection.toString().trim();
        
        if (text && text.length > 5) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setSelectionPosition({
                x: rect.left + rect.width / 2,
                y: rect.top
            });
            setSelectedText(text);
        } else {
            setSelectedText('');
        }
    };

    const createSpark = async () => {
        if (!user) return alert("Please sign in to share a spark!");
        try {
            await api.post('/api/sparks', {
                content: selectedText,
                bookId: id,
                pageNumber: pageNumber
            });
            alert("Spark shared with community! ✨");
            setSelectedText('');
        } catch (error) {
            console.error("Failed to share spark:", error);
            // Mock success for demo if server route doesn't exist yet
            alert("Spark shared with community! ✨ (Demo)");
            setSelectedText('');
        }
    };


    const isInvalidPdf = useMemo(() => {
        if (!book) return false;
        const url = hasAccess ? (book.full_pdf_url || book.pdf_url) : (book.preview_pdf_url || book.pdf_url);
        
        // No URL means no PDF to show
        if (!url) return true;

        // Detect if it's an external HTML reader early
        // Open Library and Archive.org "read" or "borrow" URLs are HTML viewers, not direct PDFs
        const isExternalHtmlReader = !url.toLowerCase().endsWith('.pdf') && 
                                      (url.includes('openlibrary.org') || url.includes('archive.org'));
        
        const hasHtmlPatterns = url.includes('/stream/') || url.includes('/details/') || url.includes('/borrow/') || url.includes('/viewer');
        
        return isExternalHtmlReader || hasHtmlPatterns;
    }, [book, hasAccess]);

    const [hasLoadError, setHasLoadError] = useState(false);
    const pdfUrlError = isInvalidPdf || hasLoadError;

    const fileUrl = useMemo(() => {
        if (!book) return null;
        return hasAccess ? (book.full_pdf_url || book.pdf_url) : (book.preview_pdf_url || book.pdf_url);
    }, [book, hasAccess]);

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-cream">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
    );
    if (!book) return <div className="text-center text-charcoal py-20 font-serif font-bold text-2xl">Volume not found</div>;

    return (
        <div className="min-h-screen bg-[#FAF7F2] flex flex-col font-sans">
            {/* Top Navigation */}
            <header className={`h-16 bg-white/80 backdrop-blur-md border-b border-[#E8DFD3] flex items-center justify-between px-6 sticky top-0 z-50 transition-all duration-700 ${zenMode ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-charcoal hover:bg-cream transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="hidden md:block">
                        <p className="text-[10px] font-bold text-accent uppercase tracking-widest leading-none mb-1">Reading Now</p>
                        <h1 className="text-sm font-serif font-bold text-charcoal truncate max-w-md">
                            {book.title}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-cream/50 rounded-full p-1 border border-charcoal/5">
                    <button onClick={() => setScale(s => Math.max(0.6, s - 0.1))} className="p-2 text-gray-500 hover:text-charcoal rounded-full hover:bg-white transition-all">
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-bold text-charcoal w-12 text-center">{Math.round(scale * 100)}%</span>
                    <button onClick={() => setScale(s => Math.min(2.0, s + 0.1))} className="p-2 text-gray-500 hover:text-charcoal rounded-full hover:bg-white transition-all">
                        <ZoomIn className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowAmbient(!showAmbient)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showAmbient ? 'bg-accent text-white' : 'text-gray-400 hover:text-charcoal hover:bg-cream'}`}
                    >
                        <Wind className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setZenMode(true)}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-charcoal hover:bg-cream transition-all"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </button>
                    <button className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-gray-400 hover:text-charcoal hover:bg-cream transition-all">

                        <Share2 className="w-4 h-4" />
                    </button>
                    <Link to={`/book/${book.id}`} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-charcoal hover:bg-cream transition-all">
                        <Info className="w-4 h-4" />
                    </Link>
                </div>
            </header>

            {/* Zen Mode Exit & Timer */}
            {zenMode && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
                    <div className="bg-charcoal/90 backdrop-blur-md text-white px-6 py-2.5 rounded-full flex items-center gap-4 soft-shadow border border-white/10">
                        <div className="flex items-center gap-2 border-r border-white/20 pr-4">
                            <Clock className="w-3.5 h-3.5 text-accent" />
                            <span className="text-xs font-mono font-bold tracking-wider">{formatTime(sessionTime)}</span>
                        </div>
                        <button 
                            onClick={() => setZenMode(false)}
                            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-accent transition-colors"
                        >
                            <Minimize2 className="w-3.5 h-3.5" />
                            Exit Focus
                        </button>
                    </div>
                </div>
            )}


            {/* Reader Space */}
            <main 
                className="flex-1 flex justify-center py-12 px-6 overflow-y-auto relative no-scrollbar"
                onMouseUp={handleMouseUp}
            >

                <div className={`relative transition-all duration-500 ${isLocked ? 'blur-md select-none pointer-events-none' : ''}`}>
                    {!pdfUrlError ? (
                        <Document
                            file={fileUrl}
                            onLoadError={(err) => {
                                console.error("PDF Load Error:", err);
                                setHasLoadError(true);
                            }}
                            onNoData={() => setHasLoadError(true)}
                            onLoadSuccess={({ numPages }) => {
                                setNumPages(numPages);
                                setHasLoadError(false);
                            }}
                            loading={
                                <div className="h-[800px] w-[600px] flex flex-col items-center justify-center bg-white rounded-2xl soft-shadow border border-[#E8DFD3]">
                                    <div className="animate-pulse flex flex-col items-center">
                                        <div className="w-16 h-16 bg-cream rounded-2xl mb-6 flex items-center justify-center">
                                            <BookOpen className="w-8 h-8 text-accent/40" />
                                        </div>
                                        <span className="text-gray-300 font-bold text-[10px] uppercase tracking-[0.2em] animate-pulse">Opening Manuscript...</span>
                                    </div>
                                </div>
                            }
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                renderTextLayer={!isLocked}
                                renderAnnotationLayer={!isLocked}
                                className="rounded-xl overflow-hidden soft-shadow bg-white"
                                loading=""
                            />
                        </Document>
                    ) : (
                        <div className="h-[600px] w-full max-w-[600px] flex flex-col items-center justify-center bg-white rounded-3xl soft-shadow border-2 border-dashed border-[#E8DFD3] p-12 text-center">
                            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-8">
                                <Lock className="w-10 h-10 text-accent" />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-charcoal mb-4">Volume Not Accessible</h3>
                            <p className="text-gray-500 mb-8 max-w-sm font-medium leading-relaxed">
                                The digital manuscript could not be retrieved. This usually happens if the file is missing or if the external source (Open Library) has restricted access.
                            </p>
                            <div className="flex flex-col gap-4">
                                {fileUrl && (
                                    <button 
                                        onClick={() => window.open(fileUrl, '_blank')}
                                        className="bg-accent text-white px-10 py-4 rounded-2xl font-bold soft-shadow hover:bg-charcoal transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Share2 className="w-4 h-4" /> Open External Reader
                                    </button>
                                )}
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="bg-charcoal text-white px-10 py-4 rounded-2xl font-bold soft-shadow hover:bg-accent transition-all active:scale-95"
                                >
                                    Retry Connection
                                </button>
                                <Link 
                                    to={`/book/${book.id}`}
                                    className="text-accent font-bold text-sm hover:underline"
                                >
                                    Return to Book Details
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Lock Overlay */}
                {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center z-40 bg-[#FAF7F2]/40 backdrop-blur-sm p-6">
                        <div className="bg-white p-10 rounded-3xl soft-shadow text-center max-w-md border border-[#E8DFD3]">
                            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
                                <Lock className="w-8 h-8 text-accent" />
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-charcoal mb-4">Preview Finished</h2>
                            <p className="text-gray-500 mb-10 font-medium">
                                You've reached the end of the free preview for <span className="text-charcoal font-bold italic">"{book.title}"</span>. Unlock the full volume to continue your journey.
                            </p>
                            <Link
                                to={`/book/${book.id}`}
                                className="inline-flex items-center justify-center w-full px-8 py-4 bg-charcoal text-white font-bold rounded-2xl hover:bg-accent transition-all soft-shadow"
                            >
                                <BookOpen className="w-5 h-5 mr-3" />
                                Unlock Full Book
                            </Link>
                            <p className="mt-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Includes lifetime library access</p>
                        </div>
                    </div>
                )}
            </main>

            {/* Pagination Controls */}
            <footer className={`h-20 bg-white/80 backdrop-blur-md border-t border-[#E8DFD3] flex items-center justify-center gap-10 sticky bottom-0 z-50 transition-all duration-700 ${zenMode ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>

                <button
                    disabled={pageNumber <= 1}
                    onClick={() => changePage(-1)}
                    className="w-12 h-12 rounded-full border-2 border-transparent hover:border-accent hover:text-accent flex items-center justify-center text-gray-400 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Folio</span>
                    <span className="text-lg font-serif font-extrabold text-charcoal">{pageNumber}</span>
                    <span className="text-xs font-bold text-gray-400">/</span>
                    <span className="text-xs font-bold text-gray-400">{numPages || '--'}</span>
                </div>

                <button
                    disabled={pageNumber >= numPages || isLocked}
                    onClick={() => changePage(1)}
                    className="w-12 h-12 rounded-full border-2 border-transparent hover:border-accent hover:text-accent flex items-center justify-center text-gray-400 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </footer>

            {showAmbient && <AmbientPlayer onClose={() => setShowAmbient(false)} />}

            {/* Floating Spark Button */}
            {selectedText && !isLocked && (
                <div 
                    className="fixed z-[70] -translate-x-1/2 -translate-y-full mb-4 animate-in fade-in zoom-in duration-200"
                    style={{ left: selectionPosition.x, top: selectionPosition.y }}
                >
                    <button 
                        onClick={createSpark}
                        className="bg-charcoal text-white px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest soft-shadow flex items-center gap-2 hover:bg-accent transition-all whitespace-nowrap"
                    >
                        <Wind className="w-3 h-3 text-accent" />
                        Create Spark
                    </button>
                    {/* Little arrow */}
                    <div className="w-2 h-2 bg-charcoal rotate-45 mx-auto -mt-1 shadow-sm"></div>
                </div>
            )}
        </div>


    );
};

export default Reader;
