# GameDealX AI 🎮🤖
Deploy Link : https://rasmaliadeal69x.vercel.app/
> Next-Gen 3D Cyberpunk Game Deals Aggregator and Price Analytics Platform.

GameDealX AI is a full-stack game deals scraper and market intelligence engine. It fetches price indices across various distribution storefronts, analyzes them using algorithmic Deal Score models, and presents metrics inside a premium futuristic dark/light theme dashboard inspired by Steam, Cyberpunk 2077, and Nvidia GeForce Experience.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Framer Motion (premium animations)
- **3D Graphics**: Lightweight Three.js WebGL (Interactive Particle Node Sphere)
- **State Management**: Zustand
- **Data Querying**: React Query (TanStack)
- **Data Visualization**: Recharts (animated Price distributions, Genre counts, Store shares)

### Backend
- **Framework**: Python 3.10 + Flask
- **Scraper**: BeautifulSoup4 + Requests
- **Data Processing**: Pandas + Openpyxl
- **Database**: SQLite (structured local index cache)

---

## 📂 Project Structure

```
Project Patel/
├── backend/
│   ├── app.py              # Flask API router endpoints
│   ├── database/
│   │   └── db_manager.py   # SQLite schema and SQL query helper functions
│   ├── scraper/
│   │   ├── seed_data.py    # High-fidelity seed games (60+ popular AAA titles)
│   │   └── scraper.py      # BS4 Scraper for live catalogs (GOG backup, seed blender)
│   ├── logs/
│   │   └── scraper.log     # Local diagnostic files
│   ├── requirements.txt    # Python dependencies manifest
│   └── Dockerfile          # Container instructions for Flask server
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx        # React client entry point
│   │   ├── App.tsx         # Unified layout router & header control
│   │   ├── types.ts        # Type declarations (Game, Analytics, Stats)
│   │   ├── index.css       # Core Tailwind directives + Cyberpunk custom keyframes
│   │   ├── hooks/
│   │   │   └── useStore.ts # Zustand global deck state (wishlist, compare deck, theme)
│   │   ├── utils/
│   │   │   └── api.ts      # Fetch adapter with 30s local memory cache
│   │   └── components/
│   │       ├── Controller3D.tsx    # Optimized WebGL 3D wireframe orb canvas
│   │       ├── LandingPage.tsx     # Animated CTA landing board
│   │       ├── Dashboard.tsx       # Stats headers, deals grid, comparison deck
│   │       ├── GameCard.tsx        # Neon glowing game card
│   │       ├── Filters.tsx         # Range sliders, stores, and genre badges
│   │       ├── Analytics.tsx       # Recharts dashboards
│   │       └── AdminPanel.tsx      # Terminal logger, scraper trigger, export downloaders
│   ├── tailwind.config.js  # Theme variables (neon colors, custom shadows)
│   ├── postcss.config.js   # PostCSS compilation adapter
│   ├── index.html          # Shell container with Orbitron and Rajdhani Google Fonts
│   ├── package.json        # Frontend NPM configurations
│   └── Dockerfile          # Production Nginx container instructions
│
└── docker-compose.yml      # Orchestration setup for full-stack run
```

---

## ⚡ Setup & Launch Instructions

### Option A: Standard Local Execution (Recommended)

#### 1. Start Flask Backend
Ensure you have Python 3.10+ installed.
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Flask server (starts on http://localhost:5000)
python app.py
```
> **Note**: On startup, if the local SQLite database is empty, the system automatically performs an initial seed load to index 60+ popular AAA titles, ensuring the application is visually fully loaded right out of the box!

#### 2. Start Vite Frontend
Ensure you have Node.js 22+ installed.
```bash
# Navigate to frontend directory in a separate terminal
cd frontend

# Install package modules
npm install

# Start Vite local dev server (starts on http://localhost:5173)
npm run dev
```

---

### Option B: Docker Compose Deployment
Compile and run both frontend and backend automatically using Docker containers.
```bash
# From the project root workspace directory containing docker-compose.yml
docker-compose up --build
```
- **Frontend Dashboard**: Open http://localhost:3000
- **Backend API**: Accessible at http://localhost:5000

---

## 🔌 API Route Reference

- `GET /api/games`: Fetch paginated, searchable, sorted, and filtered lists of game deals.
  - Parameters: `search`, `genre`, `store`, `max_price`, `min_discount`, `min_rating`, `deal_tier`, `sort_by`, `sort_order`, `limit`, `offset`.
- `GET /api/best-deals`: Returns S-Tier and A-Tier deals based on computed Deal Score.
- `GET /api/genres`: List of all unique genres present in the catalog.
- `GET /api/stores`: List of storefront distribution networks active in database.
- `GET /api/analytics`: Returns price metrics, averages, store count ratios, and price distributions.
- `GET /api/recommendations`: AI recommendation generator matching rating and discount weights.
- `POST /api/scrape/run`: Initiates background scraping threads.
- `GET /api/scrape/status`: Check runner operation state ('IDLE', 'RUNNING', 'SUCCESS') and fetches live console logs.
- `GET /api/export`: Returns stream attachment exports for `format=csv` or `format=excel`.
- `GET /api/health`: Base health check.

---

## ⚙ Deal Score AI Calculation Rules
The Deal Score quantifies price value metrics:
$$\text{Deal Score} = (\text{Discount Percent} \times 0.6) + (\text{Rating} \times 6) + \text{Store Weight}$$
- **S Tier**: Deal Score $\ge 80$ (Elite Deal)
- **A Tier**: Deal Score $\ge 65$ (Great Discount)
- **B Tier**: Deal Score $\ge 50$ (Good Deal)
- **C Tier**: Deal Score $< 50$ (Average Value)
