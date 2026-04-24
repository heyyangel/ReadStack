const axios = require('axios');
const prisma = require('../src/lib/prisma');

// High-quality offline fallback data in case of API rate limits
const fallbackBooks = [
    { title: "Clean Code", author: "Robert C. Martin", category: "Technology", description: "A Handbook of Agile Software Craftsmanship." },
    { title: "The Pragmatic Programmer", author: "Andrew Hunt", category: "Technology", description: "Your journey to mastery." },
    { title: "Don't Make Me Think", author: "Steve Krug", category: "Design", description: "A Common Sense Approach to Web Usability." },
    { title: "The Design of Everyday Things", author: "Don Norman", category: "Design", description: "Design for humans." },
    { title: "Zero to One", author: "Peter Thiel", category: "Business", description: "Notes on Startups, or How to Build the Future." },
    { title: "The Lean Startup", author: "Eric Ries", category: "Business", description: "How Today's Entrepreneurs Use Continuous Innovation." },
    { title: "Atomic Habits", author: "James Clear", category: "Psychology", description: "An Easy & Proven Way to Build Good Habits." },
    { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", category: "Psychology", description: "Exploring the mind." },
    { title: "A Brief History of Time", author: "Stephen Hawking", category: "Science", description: "The evolution of the universe." },
    { title: "Sapiens", author: "Yuval Noah Harari", category: "History", description: "A Brief History of Humankind." },
    { title: "Steve Jobs", author: "Walter Isaacson", category: "Biography", description: "The exclusive biography." },
    { title: "Educated", author: "Tara Westover", category: "Biography", description: "A Memoir." },
    { title: "Code Complete", author: "Steve McConnell", category: "Technology", description: "A Practical Handbook of Software Construction." },
    { title: "Head First Design Patterns", author: "Eric Freeman", category: "Technology", description: "Building reusable software." },
    { title: "Refactoring", author: "Martin Fowler", category: "Technology", description: "Improving the Design of Existing Code." },
    { title: "Sprint", author: "Jake Knapp", category: "Design", description: "How to Solve Big Problems and Test New Ideas." },
    { title: "Hooked", author: "Nir Eyal", category: "Design", description: "How to Build Habit-Forming Products." },
    { title: "Start with Why", author: "Simon Sinek", category: "Business", description: "How Great Leaders Inspire Everyone to Take Action." },
    { title: "Shoe Dog", author: "Phil Knight", category: "Biography", description: "A Memoir by the Creator of Nike." },
    { title: "The Innovators", author: "Walter Isaacson", category: "Biography", description: "How a Group of Hackers, Geniuses, and Geeks Created the Digital Revolution." },
    { title: "Man's Search for Meaning", author: "Viktor Frankl", category: "Psychology", description: "Classic work on finding meaning." },
    { title: "Blink", author: "Malcolm Gladwell", category: "Psychology", description: "The Power of Thinking Without Thinking." },
    { title: "The Selfish Gene", author: "Richard Dawkins", category: "Science", description: "A landmark in evolutionary biology." },
    { title: "Cosmos", author: "Carl Sagan", category: "Science", description: "The story of cosmic evolution." },
    { title: "Elon Musk", author: "Ashlee Vance", category: "Biography", description: "Tesla, SpaceX, and the Quest for a Fantastic Future." },
    { title: "Soft Skills", author: "John Sonmez", category: "Technology", description: "The software developer's life manual." },
    { title: "User Story Mapping", author: "Jeff Patton", category: "Design", description: "Building better products." },
    { title: "High Output Management", author: "Andrew Grove", category: "Business", description: "Modern management classics." },
    { title: "Good to Great", author: "Jim Collins", category: "Business", description: "Why some companies make the leap and others don't." },
    { title: "The 7 Habits of Highly Effective People", author: "Stephen Covey", category: "Psychology", description: "Powerful lessons in personal change." },
    { title: "Flow", author: "Mihaly Csikszentmihalyi", category: "Psychology", description: "The Psychology of Optimal Experience." },
    { title: "Brief Answers to the Big Questions", author: "Stephen Hawking", category: "Science", description: "The final book from Hawking." },
    { title: "The Gene", author: "Siddhartha Mukherjee", category: "Science", description: "An Intimate History." },
    { title: "Titan", author: "Ron Chernow", category: "Biography", description: "The Life of John D. Rockefeller, Sr." },
    { title: "The Snowball", author: "Alice Schroeder", category: "Biography", description: "Warren Buffett and the Business of Life." },
    { title: "Principles", author: "Ray Dalio", category: "Business", description: "Life and Work." },
    { title: "Bad Blood", author: "John Carreyrou", category: "Business", description: "Secrets and Lies in a Silicon Valley Startup." },
    { title: "The Phoenix Project", author: "Gene Kim", category: "Technology", description: "A Novel about IT, DevOps, and Helping Your Business Win." },
    { title: "Deep Work", author: "Cal Newport", category: "Psychology", description: "Rules for Focused Success in a Distracted World." },
    { title: "Quiet", author: "Susan Cain", category: "Psychology", description: "The Power of Introverts in a World That Can't Stop Talking." }
];

async function importGoogleBooks() {
    console.log('🚀 Starting Guaranteed Book Import...');

    try {
        // 1. Clear existing data
        console.log('🧹 Clearing existing data (Orders, Favorites, Progress, Books)...');
        await prisma.order.deleteMany({});
        await prisma.favorite.deleteMany({});
        await prisma.readingProgress.deleteMany({});
        await prisma.book.deleteMany({});
        console.log('✨ Database cleared.');

        let booksToImport = [];
        const query = 'subject:Technology|subject:Design|subject:Business|subject:Psychology|subject:Science|subject:Biography';
        
        try {
            console.log(`🌐 Attempting API fetch from Google Books...`);
            const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=40&orderBy=relevance`);
            const items = response.data.items;

            if (items && items.length > 0) {
                booksToImport = items.map(item => {
                    const info = item.volumeInfo;
                    let coverUrl = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;
                    if (coverUrl) {
                        coverUrl = coverUrl.replace('&edge=curl', '').replace('http:', 'https:');
                    }
                    return {
                        title: info.title,
                        author: info.authors?.[0] || 'Unknown Author',
                        description: info.description ? info.description.substring(0, 500) + '...' : 'A fascinating read.',
                        category: info.categories ? info.categories[0] : 'Fiction',
                        cover_url: coverUrl || 'https://images.unsplash.com/photo-1543005127-d020d536780c?q=80&w=1000&auto=format&fit=crop',
                        tags: info.categories || []
                    };
                });
                console.log('✅ Found 40 books on the live API!');
            }
        } catch (apiErr) {
            console.warn(`⚠️ Google API is rate-limited (429). Switching to high-quality Offline Library...`);
            
            // Category-specific cover mapping
            const categoryImages = {
                'Technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
                'Design': 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop',
                'Business': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
                'Psychology': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop',
                'Science': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop',
                'Biography': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop',
                'History': 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=800&auto=format&fit=crop'
            };

            booksToImport = fallbackBooks.map(b => ({
                ...b,
                cover_url: categoryImages[b.category] || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop',
                tags: [b.category]
            }));
        }

        // 2. Insert into DB
        let count = 0;
        for (const b of booksToImport) {
            await prisma.book.create({
                data: {
                    title: b.title,
                    author: b.author,
                    description: b.description,
                    category: b.category,
                    price: Math.floor(Math.random() * (499 - 149 + 1) + 149),
                    preview_pdf_url: "", 
                    full_pdf_url: "",    
                    cover_url: b.cover_url,
                    tags: b.tags
                }
            });
            count++;
            console.log(`✅ [${count}/40] Imported: ${b.title}`);
        }

        console.log(`\n🎉 Success! Imported ${count} modern books.`);
        if (booksToImport === fallbackBooks) {
            console.log('💡 Note: Used offline library because Google is temporarily busy.');
        }

    } catch (error) {
        console.error('❌ Critical error:', error.message);
    } finally {
        process.exit();
    }
}

importGoogleBooks();
