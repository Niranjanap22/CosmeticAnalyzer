# Getting Started with Cosmetic Analyzer

Welcome! This guide will help you set up the project on your local machine.

## Prerequisites

- [Node.js](https://nodejs.org/) (Version 16 or higher recommended)
- [Git](https://git-scm.com/)

## 1. Clone the Repository

Open your terminal or command prompt and run the following command to download the code.

```bash
git clone https://github.com/YOUR_USERNAME/CosmeticAnalyzer.git
cd CosmeticAnalyzer
```
*(Replace `YOUR_USERNAME` with the actual username or repository URL)*

## 2. Install Dependencies

Install the necessary libraries and packages using npm:

```bash
npm install
```

## 3. Set Up Environment Variables

You need a Google Gemini API key for the AI analysis to work.

1.  Get a free API key from Google AI Studio.
2.  Create a new file named `.env` in the root folder of the project (next to `package.json`).
3.  Add your API key to the file like this:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

## 4. Run the App

Start the development server:

```bash
npm run dev
```

Check your terminal output for the local URL (usually `http://localhost:3000` or `http://localhost:5173`) and open it in your browser.
