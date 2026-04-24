const axios = require('axios');

const searchOpenLibrary = async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Query is required" });

    try {
        // 1. Search for books
        const searchRes = await axios.get(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&fields=title,key,ia,availability,author_name&limit=12`);
        
        const books = await Promise.all(searchRes.data.docs.map(async (doc) => {
            const olid = doc.availability?.openlibrary_edition || (doc.ia && doc.ia[0]);
            
            return {
                id: doc.key.replace('/works/', ''),
                title: doc.title,
                author: doc.author_name ? doc.author_name[0] : 'Unknown Author',
                cover_url: `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`,
                olid: olid,
                isExternal: true,
                source: 'Open Library'
            };
        }));

        res.json(books);
    } catch (error) {
        console.error("Open Library Search Error:", error);
        res.status(500).json({ message: "Failed to fetch from Open Library" });
    }
};

const getExternalBookDetails = async (req, res) => {
    const { id } = req.params; // Work ID
    const { olid } = req.query; // Edition ID for PDF

    try {
        // 1. Get Description from Works API
        const workRes = await axios.get(`https://openlibrary.org/works/${id}.json`);
        let description = workRes.data.description;
        if (typeof description === 'object') description = description.value;

        // 2. Get PDF Link from Availability API
        let pdfUrl = null;
        if (olid) {
            const availRes = await axios.get(`https://openlibrary.org/api/volumes/brief/json/olid:${olid}`);
            const record = availRes.data.records[`/books/${olid}`];
            if (record && record.data.ebooks && record.data.ebooks[0]) {
                pdfUrl = record.data.ebooks[0].formats?.pdf?.url || record.data.ebooks[0].read_url;
            }
        }

        res.json({
            description: description || "No description available for this volume.",
            pdf_url: pdfUrl
        });
    } catch (error) {
        console.error("Open Library Details Error:", error);
        res.status(500).json({ message: "Failed to fetch book details" });
    }
};

module.exports = { searchOpenLibrary, getExternalBookDetails };
