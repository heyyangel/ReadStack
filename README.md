# 📚 ReadStack

**ReadStack** is a premium, boutique full-stack bookstore application designed for an editorial reading experience. It combines a minimalist aesthetic with powerful AI features to help readers discover and enjoy their next favorite book.

![ReadStack Hero](client/src/assets/heroimg.png)

## ✨ Features

-   **AI Mood Discovery**: Describe your current vibe or a specific scene, and our Google Gemini-powered AI will curate the perfect reading list for you.
-   **Global Library Integration**: Access millions of free public domain classics and modern editions via direct integration with the Open Library API.
-   **Community Sparks**: Share and discover inspiring highlights and "sparks" from other readers within the community.
-   **Premium Reader Experience**: A distraction-free, minimalist reading interface designed for focus.
-   **Secure Wallet System**: Integrated wallet for purchasing premium titles and managing credits.
-   **Ambient Soundscapes**: Built-in lofi, rain, and forest soundscapes to enhance your reading immersion.

## 🛠️ Tech Stack

-   **Frontend**: React 19, Vite, Tailwind CSS (for modern, responsive UI)
-   **Backend**: Node.js, Express
-   **Database**: PostgreSQL with Prisma ORM
-   **AI**: Google Gemini API
-   **Icons**: Lucide React
-   **State Management**: React Context API
-   **Payments**: Razorpay Integration

## 🚀 Getting Started

### Prerequisites

-   Node.js (v18+)
-   PostgreSQL database
-   Google Gemini API Key

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/readstack.git
    cd readstack
    ```

2.  **Setup Backend**:
    ```bash
    cd server
    npm install
    cp .env.example .env # Add your DATABASE_URL and API keys
    npx prisma generate
    npx prisma db push
    npm run dev
    ```

3.  **Setup Frontend**:
    ```bash
    cd ../client
    npm install
    npm run dev
    ```

## 🌐 Deployment

This project is configured for seamless deployment on **Vercel** using a monorepo setup.

1.  Push your code to GitHub.
2.  Import the project into Vercel.
3.  Ensure the root directory is set to the project base.
4.  Configure Environment Variables in the Vercel Dashboard.

---

Built with ❤️ by the ReadStack.
