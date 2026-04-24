const axios = require('axios');
const prisma = require('../src/lib/prisma');
require('dotenv').config();

// 1. Configuration & Sources
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
const PAGES_TO_FETCH = 3; 
const RESULTS_PER_PAGE = 20;
const SAMPLE_PDF_URL = "/sample.pdf";

const GENRES = [
    { name: 'Technology', q: 'programming software engineering' },
    { name: 'Business', q: 'startup business management' },
    { name: 'Finance', q: 'investing personal finance' },
    { name: 'Self-Help', q: 'psychology personal growth' },
    { name: 'Fiction', q: 'classic literature' },
    { name: 'Mystery', q: 'crime investigation' },
    { name: 'Science', q: 'astronomy physics biology' },
    { name: 'Biography', q: 'biography autobiography' }
];

/**
 * Instant Internal Catalog (Guarantees Results immediately)
 */
const INTERNAL_CATALOG = [
    { title: "Clean Code", author: "Robert C. Martin", category: "Technology", description: "A Handbook of Agile Software Craftsmanship." },
    { title: "The Pragmatic Programmer", author: "Andrew Hunt", category: "Technology", description: "Essential tips for developers." },
    { title: "Zero to One", author: "Peter Thiel", category: "Business", description: "Notes on Startups, or How to Build the Future." },
    { title: "The Lean Startup", author: "Eric Ries", category: "Business", description: "Build, measure, learn loop." },
    { title: "Psychology of Money", author: "Morgan Housel", category: "Finance", description: "Timeless lessons on wealth and greed." },
    { title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", category: "Finance", description: "Financial education for all." },
    { title: "Atomic Habits", author: "James Clear", category: "Self-Help", description: "Transform your life with tiny changes." },
    { title: "Blink", author: "Malcolm Gladwell", category: "Self-Help", description: "The power of thinking without thinking." },
    { title: "The Intelligent Investor", author: "Benjamin Graham", category: "Finance", description: "The definitive book on value investing." },
    { title: "Deep Work", author: "Cal Newport", category: "Self-Help", description: "Rules for focused success." },
    { title: "Sapiens", author: "Yuval Noah Harari", category: "Science", description: "A Brief History of Humankind." },
    { title: "Steve Jobs", author: "Walter Isaacson", category: "Biography", description: "The exclusive biography." }
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Universal Fetcher with Failover Logic
 */
async function fetchBooksFromAPI(genre, startIndex) {
    // Attempt 1: Google Books (Keyed)
    try {
        const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
            params: { q: genre.q, maxResults: RESULTS_PER_PAGE, startIndex, key: API_KEY },
            timeout: 5000
        });
        if (response.data.items) return response.data.items.map(item => ({
            title: item.volumeInfo.title,
            author: item.volumeInfo.authors?.join(', ') || 'Unknown Author',
            description: item.volumeInfo.description?.substring(0, 500) || 'Premium content.',
            cover_url: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
            category: genre.name
        }));
    } catch (e) {
        console.warn(`   ⚠️  Google API Unavailable (${e.status || 'Error'}). Falling back to Open Library...`);
    }

    // Attempt 2: Open Library (Public Cluster)
    try {
        const response = await axios.get('https://openlibrary.org/search.json', {
            params: { q: genre.name.toLowerCase(), limit: RESULTS_PER_PAGE, offset: startIndex },
            timeout: 8000
        });
        return response.data.docs.map(doc => ({
            title: doc.title,
            author: doc.author_name?.join(', ') || 'Unknown Author',
            description: doc.first_sentence?.[0] || `A classic ${genre.name} work.`,
            cover_url: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : null,
            category: genre.name
        }));
    } catch (e) {
        console.error(`   ❌ All APIs failed for ${genre.name}.`);
        return [];
    }
}

async function runUltimateSeeder() {
    console.log('🚀 INITIALIZING ULTIMATE GUARANTEED SEEDER...');
    
    try {
        // Step 1: CLEAR
        console.log('🧹 Preparing database...');
        await prisma.order.deleteMany({});
        await prisma.favorite.deleteMany({});
        await prisma.readingProgress.deleteMany({});
        await prisma.book.deleteMany({});

        // Step 2: INSTANT SEED (Local Baseline)
        console.log('📚 Seeding Internal Catalog...');
        for (const book of INTERNAL_CATALOG) {
            await prisma.book.upsert({
                where: { book_title_author: { title: book.title, author: book.author } },
                update: {},
                create: {
                    ...book, 
                    price: 50.0, 
                    tags: [book.category],
                    preview_pdf_url: SAMPLE_PDF_URL,
                    full_pdf_url: SAMPLE_PDF_URL,
                    cover_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop'
                }
            });
        }

        // Step 3: HYBRID API SYNC
        for (let page = 0; page < PAGES_TO_FETCH; page++) {
            console.log(`\n📄 [SYNCING PAGE ${page + 1}]`);
            for (const genre of GENRES) {
                const books = await fetchBooksFromAPI(genre, page * RESULTS_PER_PAGE);
                
                let count = 0;
                for (const b of books) {
                    if (!b.title || !b.author) continue;
                    await prisma.book.upsert({
                        where: { book_title_author: { title: b.title, author: b.author } },
                        update: {},
                        create: { 
                            ...b, 
                            price: 50.0, 
                            tags: [genre.name],
                            preview_pdf_url: SAMPLE_PDF_URL,
                            full_pdf_url: SAMPLE_PDF_URL,
                            cover_url: b.cover_url || 'https://images.unsplash.com/photo-1543005127-d020d536780c?q=80&w=800&auto=format'
                        }
                    });
                    count++;
                }
                console.log(`   ✅ Synced ${count} books for ${genre.name}`);
                await sleep(1000); 
            }
        }

        const total = await prisma.book.count();
        console.log(`\n🎉 SUCCESS! Total database size: ${total} professional books.`);

    } catch (e) {
        console.error('❌ FATAL:', e.message);
    } finally {
        await prisma.$disconnect();
        process.exit();
    }
}

runUltimateSeeder();
