const { GoogleGenerativeAI } = require("@google/generative-ai");
const prisma = require("../lib/prisma");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const summarizeBook = async (req, res) => {
    const { bookId, cost } = req.body;
    const userId = req.user.id;

    try {
        // 1. Check wallet balance
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.wallet_balance < cost) {
            return res.status(400).json({ success: false, message: "Insufficient balance" });
        }

        // 2. Get book details for context
        const book = await prisma.book.findUnique({ where: { id: parseInt(bookId) } });
        if (!book) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }

        // 3. Call Gemini AI
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `You are a premium literary critic for a high-end bookstore called ReadStack. 
        Provide a deep, sophisticated analysis of the book "${book.title}" by ${book.author}. 
        Description: ${book.description}
        Focus on hidden themes, character archetypes, and a key takeaway. Keep the tone elegant and professional. 
        Format the response in 3 short, punchy paragraphs.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 4. Deduct wallet balance
        await prisma.user.update({
            where: { id: userId },
            data: { wallet_balance: { decrement: cost } }
        });

        // 5. Store the spark/insight if needed (optional)
        // You could save this to a new model called 'PurchasedInsights'

        // Artificial delay to make it feel like AI is "thinking"
        await new Promise(resolve => setTimeout(resolve, 2000));

        res.json({ success: true, analysis: text });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ success: false, message: "AI Analysis failed" });
    }
};

module.exports = { summarizeBook };
