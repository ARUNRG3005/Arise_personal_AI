<img width="1472" height="1240" alt="image" src="https://github.com/user-attachments/assets/e9cef590-296f-4df2-9901-6bc219b70ad3" />

# ARISE — Personal AI Operating System

ARISE is a premium personal AI companion and operating system designed to help you manage tasks, calendar events, habits, daily journals, notes, spending tracking, and personal knowledge layers.

---

## 🛠️ Tech Stack
- **Frontend**: React (v19) + Vite + Tailwind CSS (v4) + Zustand + Socket.IO-client
- **Backend**: Node.js + Express + Prisma ORM + PostgreSQL + Socket.IO + node-cron
- **AI Engine**: Groq SDK (Llama 3.3) & OpenAI API (for real semantic embeddings)

---

## 📦 Prerequisites
- **Node.js**: `v18.x` or higher (v20+ recommended)
- **Database**: PostgreSQL with `pgvector` extension enabled (Supabase or Docker Compose pgvector image)
- **AI Keys**:
  - A [Groq API Key](https://console.groq.com) (Required)
  - An [OpenAI API Key](https://platform.openai.com) (Optional - for high-quality semantic memory searches)

---

## 🚀 Local Development Setup

### 1. Database (PostgreSQL + pgvector)
You can run a local PostgreSQL database with `pgvector` pre-installed using the provided Docker Compose config:
```bash
docker-compose up -d
```

### 2. Backend Configuration
Create a `.env` file in the `backend/` folder:
```bash
cd backend
cp .env.example .env
```
Fill in the credentials:
- `DATABASE_URL`: `"postgresql://postgres:password@localhost:5432/arise?schema=public"`
- `DIRECT_URL`: `"postgresql://postgres:password@localhost:5432/arise?schema=public"`
- `GROQ_API_KEY`: `"gsk_..."`
- `OPENAI_API_KEY`: `"sk-..."` (Optional)

Install dependencies and synchronize schema:
```bash
npm install
npx prisma db push
```

### 3. Frontend Configuration
Install dependencies:
```bash
cd ../frontend
npm install
```

### 4. Running the Servers
- **Start Backend**: `npm run dev` inside `backend/` (starts on port `3001`)
- **Start Frontend**: `npm run dev` inside `frontend/` (starts on port `5173`)

Go to `http://localhost:5173` in your browser.
