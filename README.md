# First-Year Exam Intelligence Platform

## Description
A web application designed for first-year engineering students to prepare more effectively for exams using past exam paper intelligence.  
Faculty upload exam papers, the system extracts and analyzes questions, and students receive optimized study plans and high-yield survival guides.

## Key Features
- **Faculty-authenticated exam paper upload**
- **Automatic question extraction** using Google Gemini Vision
- **Support for Internal and End Semester exams**
- **Intelligent question clustering and frequency analysis**
- **Student study optimizer and exam survival mode**
- **Transparent data coverage and confidence indicators**

## Tech Stack
- **Frontend**: Next.js / React
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **AI**: Google Gemini (Vision + embeddings)

## Prerequisites
- Node.js (v18 or higher)
- npm

## Running the Project Locally

1. **Configure Environment Variables:**
   Copy the example environment file and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and add your:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_GEMINI_API_KEY`

2. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**  
   The application will run at [http://localhost:3000](http://localhost:3000)

## Usage Flow

### Faculty
1. Navigate to `/faculty/login`
2. Log in using a verified faculty email
3. Upload exam papers at `/faculty/upload`
4. View extraction results (subject, exam type, questions, marks)

### Student
1. Navigate to `/student`
2. Select subject, exam type, and exam date
3. View the generated study optimizer
4. Use **Exam Survival Mode** for high-yield preparation

## Security & Access Control
- Faculty upload routes are protected using **Supabase Authentication**
- Only authenticated faculty users can upload exam papers
- Students have **read-only access** to exam data
- **Row Level Security (RLS)** is enabled on all database tables

## Notes
- This project is built as a **hackathon MVP**
- The system optimizes preparation based on historical exam patterns
- It does not guarantee exam results, but reduces preparation uncertainty
