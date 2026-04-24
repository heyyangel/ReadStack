const prisma = require('./src/lib/prisma');

async function main() {
    const books = [
        {
            title: 'Python for Beginners',
            description: 'A comprehensive guide to learning Python from scratch.',
            author: 'John Doe',
            price: 50.0,
            preview_pdf_url: 'https://example.com/preview-python.pdf',
            full_pdf_url: 'https://example.com/full-python.pdf',
            category: 'Programming',
            tags: ['Python', 'Coding', 'Beginner'],
            cover_url: 'https://pub-8ba3473187214e66aea8c6b7573d826a.r2.dev/book1.jpg',
        },
        {
            title: 'Advanced React Patterns',
            description: 'Master React with advanced design patterns and best practices.',
            author: 'Jane Smith',
            price: 50.0,
            preview_pdf_url: 'https://example.com/preview-react.pdf',
            full_pdf_url: 'https://example.com/full-react.pdf',
            category: 'Web Development',
            tags: ['React', 'Frontend', 'JavaScript'],
            cover_url: 'https://pub-8ba3473187214e66aea8c6b7573d826a.r2.dev/book2.jpg',
        },
        {
            title: 'Data Science Essentials',
            description: 'Introduction to data analysis and machine learning.',
            author: 'Alice Johnson',
            price: 50.0,
            preview_pdf_url: 'https://example.com/preview-ds.pdf',
            full_pdf_url: 'https://example.com/full-ds.pdf',
            category: 'Data Science',
            tags: ['Data', 'Machine Learning', 'AI'],
            cover_url: 'https://pub-8ba3473187214e66aea8c6b7573d826a.r2.dev/book3.jpg',
        },
        {
            title: 'UI/UX Design Fundamentals',
            description: 'Learn the principles of effective user interface design.',
            author: 'Bob Brown',
            price: 50.0,
            preview_pdf_url: 'https://example.com/preview-uiux.pdf',
            full_pdf_url: 'https://example.com/full-uiux.pdf',
            category: 'Design',
            tags: ['UI', 'UX', 'Design'],
            cover_url: 'https://pub-8ba3473187214e66aea8c6b7573d826a.r2.dev/book4.jpg',
        },
    ];

    for (const book of books) {
        await prisma.book.create({
            data: book,
        });
    }

    console.log('Seed data inserted');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
