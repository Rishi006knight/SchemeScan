# 🇮🇳 SchemeScan — Find Government Benefits You Deserve

<div align="center">

![SchemeScan](https://img.shields.io/badge/SchemeScan-AI%20Powered-7c3aed?style=for-the-badge)
![Django](https://img.shields.io/badge/Django-5.0-092E20?style=for-the-badge&logo=django)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=for-the-badge&logo=supabase)

**Live Demo → [https://scheme-scan.vercel.app/](https://scheme-scan.vercel.app/)**

</div>

---

## 📌 What is SchemeScan?

SchemeScan is an AI-powered web application that helps Indian citizens instantly discover government welfare schemes they are eligible for — without paperwork, confusion, or bureaucracy.

Users fill in a simple profile (age, income, occupation, state, etc.) and the app automatically evaluates eligibility against **51 real Indian government schemes** using rule-based logic, with AI explanations powered by Google Gemini.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Browse Schemes** | Explore 51+ central & state government schemes with search & filters |
| ✅ **Eligibility Check** | Instant eligibility evaluation based on your citizen profile |
| 🤖 **AI Assistant** | Gemini-powered chatbot to explain schemes in plain language |
| 📄 **OCR Profile Fill** | Upload Aadhaar/documents to auto-fill your profile via OCR |
| 🔖 **Bookmarks** | Save schemes you're interested in |
| 📊 **Dashboard** | View your eligibility history and saved schemes |
| 🔐 **JWT Auth** | Secure login/register with access + refresh token rotation |

---

## 🗂️ Project Structure

```
SchemeScan/
├── backend/                  # Django REST API
│   ├── users/                # Custom user model + JWT auth
│   ├── profiles/             # CitizenProfile model + OCR upload
│   ├── schemes/              # Scheme models, eligibility engine, seeder
│   │   └── management/commands/seed_schemes.py  # 51 real schemes
│   ├── ai_assistant/         # Gemini AI chat + profile extraction
│   ├── backend/              # Django settings, URLs, WSGI
│   ├── Dockerfile
│   └── entrypoint.sh         # migrate + seed + gunicorn
│
└── frontend/                 # React + TypeScript + Vite
    ├── src/
    │   ├── pages/            # Landing, Schemes, Eligibility, Dashboard, etc.
    │   ├── components/       # Navbar, ChatbotWidget, etc.
    │   ├── lib/api.ts        # Axios API client
    │   └── store/            # Zustand auth store
    └── netlify.toml
```

---

## 🛠️ Tech Stack

### Backend
- **Django 5** + **Django REST Framework** — API
- **PostgreSQL** (Supabase) — Database
- **JWT** (djangorestframework-simplejwt) — Authentication
- **Redis** (optional) — Caching eligibility results
- **Pytesseract + Pillow** — OCR for document scanning
- **Google Generative AI (Gemini)** — AI assistant
- **JSON Logic** — Rule-based eligibility evaluation
- **Gunicorn** — Production WSGI server
- **WhiteNoise** — Static file serving

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **TanStack Query** — Server state management
- **Zustand** — Client auth state
- **Axios** — HTTP client
- **Lucide React** — Icons
- **React Hot Toast** — Notifications
- **TailwindCSS** — Styling

### Infrastructure
- **Netlify** — Frontend hosting
- **Render** — Backend hosting (Docker)
- **Supabase** — PostgreSQL database (Tokyo region)

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (or Supabase account)
- Tesseract OCR installed

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env  # Fill in your values

# Run migrations
python manage.py migrate

# Seed 51 government schemes
python manage.py seed_schemes

# Start development server
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Start development server
npm run dev
```

### Docker (Production)

```bash
cd backend
docker build -t schemescan-backend .
docker run -p 8000:8000 --env-file .env schemescan-backend
```

---

## 🔑 Environment Variables

### Backend (`.env`)

| Variable | Description |
|---|---|
| `DJANGO_SECRET_KEY` | Django secret key |
| `DEBUG` | `True` for dev, `False` for prod |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts |
| `DB_HOST` | PostgreSQL host (Supabase pooler) |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `DB_PORT` | Database port (default: `5432`) |
| `DATABASE_URL` | Full DB URL (alternative to individual vars) |
| `GEMINI_API_KEY` | Google Gemini API key |
| `CORS_ALLOWED_ORIGINS` | Frontend origin (no trailing slash) |
| `REDIS_URL` | Redis URL (optional, falls back to memory cache) |

### Frontend (`.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (e.g. `https://your-api.onrender.com/api`) |

---

## 📋 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/schemes/` | Public | List all active schemes |
| `GET` | `/api/schemes/:id/` | Public | Get scheme details |
| `POST` | `/api/schemes/check/` | JWT | Run eligibility check |
| `GET` | `/api/schemes/bookmarks/` | JWT | Get saved schemes |
| `POST` | `/api/schemes/:id/bookmark/` | JWT | Bookmark a scheme |
| `DELETE` | `/api/schemes/:id/bookmark/` | JWT | Remove bookmark |
| `GET` | `/api/schemes/history/` | JWT | Eligibility history |
| `POST` | `/api/auth/register/` | Public | Register user |
| `POST` | `/api/auth/token/` | Public | Login (get JWT) |
| `POST` | `/api/auth/token/refresh/` | Public | Refresh access token |
| `GET` | `/api/profiles/me/` | JWT | Get citizen profile |
| `PATCH` | `/api/profiles/me/` | JWT | Update profile |
| `POST` | `/api/profiles/ocr-upload/` | JWT | OCR document scan |
| `POST` | `/api/ai/chat/` | JWT | AI assistant chat |
| `POST` | `/api/ai/explain/` | JWT | Explain a scheme |

---

## 🗳️ Schemes Covered

**Central Government (All India)**
- PM-KISAN, PMFBY, PMKSY, PM Awas Yojana (Urban + Rural)
- Ayushman Bharat (PM-JAY), PMJJBY, PMSBY
- Atal Pension Yojana, PM-SYM, IGNOAPS, IGNDPS
- Sukanya Samriddhi, PMJDY, PPF, Sovereign Gold Bond
- PMUY, MGNREGA, Mahila Samman Saving Certificate
- PM Yasasvi Scholarship, Babu Jagjivan Ram Chhatrawas Yojna
- NSP Scholarship, Stand Up India, MUDRA, and more

**State Government**
- Tamil Nadu: Pudhumai Penn, Kalaignar Magalir Urimai, OAP, CMCHIS
- Maharashtra: Majhi Ladki Bahin, MJPJAY, Sanjay Gandhi Niradhar, Shravanbal
- Karnataka: Gruha Lakshmi, Yuva Nidhi

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

<div align="center">
Built with ❤️ to make government benefits accessible to every Indian citizen.
</div>
