# RailAssist AI – Railway Passenger Help Desk Frontend

[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live-brightgreen?logo=vercel&logoColor=white)](https://railway-passenger-help-desk-website-five.vercel.app/)
[![Render Backend](https://img.shields.io/badge/Render-Backend%20Connected-46E3B7?logo=render&logoColor=black)](https://railway-passenger-help-desk-website.onrender.com)

Production Next.js 16 frontend for the Indian Railway Passenger Help Desk system.

## 🌐 Live URLs

* **Frontend Web Application (Vercel):** [https://railway-passenger-help-desk-website-five.vercel.app/](https://railway-passenger-help-desk-website-five.vercel.app/)
* **Backend API (Render):** [https://railway-passenger-help-desk-website.onrender.com](https://railway-passenger-help-desk-website.onrender.com)
* **API Documentation (Swagger UI):** [https://railway-passenger-help-desk-website.onrender.com/docs](https://railway-passenger-help-desk-website.onrender.com/docs)

## ⚙️ Environment Variables

Create a `.env.local` file in `frontend/` (or configure in Vercel Project Settings):

```env
NEXT_PUBLIC_API_URL=https://railway-passenger-help-desk-website.onrender.com
```

*When running locally, it defaults to `http://localhost:8000`.*

## 🚀 Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📦 Production Build

```bash
npm run build
npm start
```

