# hanasu 🎧

A modern web application that converts manga and web content into engaging audiobooks using AI-powered summarization.

## ✨ Features

- **Web Content Scraping**: Extract and process content from various web sources
- **AI Summarization**: Transform content into podcast-style summaries using local AI models
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- **No API Keys Required**: Runs entirely with local AI models
- **Real-time Processing**: Fast content transformation and audio generation

## 🛠️ Tech Stack

### Backend

- **Express.js** - Web server framework
- **Cheerio** - Web scraping and HTML parsing
- **Local AI Models** - Content summarization
- **Axios** - HTTP client for web requests

### Frontend

- **React 19** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/hanasu.git
   cd hanasu
   ```

2. **Setup Backend**

   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run dev
   ```

3. **Setup Frontend**

   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: <http://localhost:5173>
   - Backend API: <http://localhost:3000>

## 🎯 How It Works

1. **Content Input**: Users provide URLs or manga content
2. **Web Scraping**: Backend extracts and processes the content
3. **AI Processing**: Local AI models summarize content into audio-friendly format
4. **Audio Generation**: Transform processed content into audiobook format
5. **User Experience**: Clean interface for managing and listening to audiobooks

