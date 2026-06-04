import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'gamedealx.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Games table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT UNIQUE NOT NULL,
            genre TEXT NOT NULL,
            original_price REAL NOT NULL,
            current_price REAL NOT NULL,
            discount_percent REAL NOT NULL,
            rating REAL NOT NULL,
            store TEXT NOT NULL,
            deal_score REAL NOT NULL,
            deal_tier TEXT NOT NULL,
            image_url TEXT,
            url TEXT,
            last_updated TEXT NOT NULL
        )
    ''')
    
    # Scraper logs/runs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS scraper_runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            status TEXT NOT NULL,
            games_scraped INTEGER NOT NULL,
            log_messages TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

def save_games(games_list):
    """
    Saves or updates a list of games.
    Each game is a dict with keys matching table columns.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    now = datetime.utcnow().isoformat()
    inserted = 0
    updated = 0
    
    for game in games_list:
        # Calculate Deal Score:
        # Deal Score = discount_percent * 0.6 + rating * 8 + (100 - min(current_price/100, 100)) * 0.2
        # Let's keep it simple: discount is 0-100, rating is 0-5 (scaled to 0-100 if we multiply by 20, or let's use user's spec)
        # Formula: Discount % + (Rating * 10) + Popularity Weight (we can randomize or use store popularity, say Steam=10, GOG=8, Epic=9)
        discount = game.get('discount_percent', 0)
        rating = game.get('rating', 0)
        store = game.get('store', 'Steam')
        
        store_weight = 10 if store == 'Steam' else (9 if store == 'Epic Games' else 8)
        deal_score = min(100.0, discount * 0.6 + (rating * 6) + store_weight)
        
        # Tiers:
        if deal_score >= 80:
            deal_tier = 'S'
        elif deal_score >= 65:
            deal_tier = 'A'
        elif deal_score >= 50:
            deal_tier = 'B'
        else:
            deal_tier = 'C'
            
        try:
            cursor.execute('''
                INSERT INTO games (
                    title, genre, original_price, current_price, discount_percent, 
                    rating, store, deal_score, deal_tier, image_url, url, last_updated
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(title) DO UPDATE SET
                    genre=excluded.genre,
                    original_price=excluded.original_price,
                    current_price=excluded.current_price,
                    discount_percent=excluded.discount_percent,
                    rating=excluded.rating,
                    store=excluded.store,
                    deal_score=excluded.deal_score,
                    deal_tier=excluded.deal_tier,
                    image_url=excluded.image_url,
                    url=excluded.url,
                    last_updated=excluded.last_updated
            ''', (
                game['title'],
                game['genre'],
                game['original_price'],
                game['current_price'],
                game['discount_percent'],
                game['rating'],
                game['store'],
                deal_score,
                deal_tier,
                game.get('image_url', ''),
                game.get('url', ''),
                now
            ))
            if cursor.rowcount == 1:
                inserted += 1
            else:
                updated += 1
        except Exception as e:
            print(f"Error saving game {game.get('title')}: {e}")
            
    conn.commit()
    conn.close()
    return inserted, updated

def query_games(filters=None, limit=12, offset=0, sort_by='deal_score', sort_order='DESC'):
    """
    Query games with filters, sorting, and pagination.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM games WHERE 1=1"
    params = []
    
    if filters:
        if 'search' in filters and filters['search']:
            query += " AND title LIKE ?"
            params.append(f"%{filters['search']}%")
            
        if 'genre' in filters and filters['genre']:
            # Handle multiple genres (passed as a list or comma-separated string)
            genres = filters['genre']
            if isinstance(genres, str):
                genres = [g.strip() for g in genres.split(',') if g.strip()]
            if genres:
                genre_placeholders = ",".join(["?"] * len(genres))
                query += f" AND genre IN ({genre_placeholders})"
                params.extend(genres)
                
        if 'store' in filters and filters['store']:
            stores = filters['store']
            if isinstance(stores, str):
                stores = [s.strip() for s in stores.split(',') if s.strip()]
            if stores:
                store_placeholders = ",".join(["?"] * len(stores))
                query += f" AND store IN ({store_placeholders})"
                params.extend(stores)
                
        if 'max_price' in filters and filters['max_price'] is not None:
            query += " AND current_price <= ?"
            params.append(float(filters['max_price']))
            
        if 'min_discount' in filters and filters['min_discount'] is not None:
            query += " AND discount_percent >= ?"
            params.append(float(filters['min_discount']))
            
        if 'min_rating' in filters and filters['min_rating'] is not None:
            query += " AND rating >= ?"
            params.append(float(filters['min_rating']))
            
        if 'deal_tier' in filters and filters['deal_tier']:
            tiers = filters['deal_tier']
            if isinstance(tiers, str):
                tiers = [t.strip() for t in tiers.split(',') if t.strip()]
            if tiers:
                tier_placeholders = ",".join(["?"] * len(tiers))
                query += f" AND deal_tier IN ({tier_placeholders})"
                params.extend(tiers)

    # Count query for pagination
    count_query = query.replace("SELECT *", "SELECT COUNT(*)")
    cursor.execute(count_query, params)
    total_count = cursor.fetchone()[0]
    
    # Sorting
    allowed_sort_fields = ['deal_score', 'current_price', 'discount_percent', 'rating', 'title']
    if sort_by not in allowed_sort_fields:
        sort_by = 'deal_score'
    if sort_order.upper() not in ['ASC', 'DESC']:
        sort_order = 'DESC'
        
    query += f" ORDER BY {sort_by} {sort_order}"
    
    # Pagination
    query += " LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    games = [dict(row) for row in rows]
    conn.close()
    
    return {
        'games': games,
        'total': total_count,
        'limit': limit,
        'offset': offset
    }

def get_genres():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT genre FROM games ORDER BY genre")
    genres = [row[0] for row in cursor.fetchall() if row[0]]
    conn.close()
    return genres

def get_stores():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT store FROM games ORDER BY store")
    stores = [row[0] for row in cursor.fetchall() if row[0]]
    conn.close()
    return stores

def get_analytics():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Total stats
    cursor.execute('''
        SELECT 
            COUNT(*) as total_games,
            SUM(CASE WHEN discount_percent > 0 THEN 1 ELSE 0 END) as total_deals,
            AVG(current_price) as avg_price,
            MAX(discount_percent) as max_discount,
            MAX(rating) as max_rating
        FROM games
    ''')
    stats = dict(cursor.fetchone())
    
    # Handle potentially empty database
    if stats['total_games'] == 0:
        stats = {
            'total_games': 0,
            'total_deals': 0,
            'avg_price': 0,
            'max_discount': 0,
            'max_rating': 0,
            'best_rated_game': 'N/A'
        }
    else:
        # Find best rated game
        cursor.execute("SELECT title FROM games ORDER BY rating DESC, discount_percent DESC LIMIT 1")
        row = cursor.fetchone()
        stats['best_rated_game'] = row[0] if row else 'N/A'
        
    # Genre distribution
    cursor.execute("SELECT genre, COUNT(*) as count, AVG(current_price) as avg_price FROM games GROUP BY genre")
    genre_data = [dict(row) for row in cursor.fetchall()]
    
    # Store distribution
    cursor.execute("SELECT store, COUNT(*) as count, AVG(discount_percent) as avg_discount FROM games GROUP BY store")
    store_data = [dict(row) for row in cursor.fetchall()]
    
    # Price distribution bins: 0-500, 501-1000, 1001-2000, 2001-4000, 4001+
    price_bins = [
        {"name": "₹0 - ₹500", "min": 0, "max": 500},
        {"name": "₹501 - ₹1000", "min": 501, "max": 1000},
        {"name": "₹1001 - ₹2000", "min": 1001, "max": 2000},
        {"name": "₹2001 - ₹4000", "min": 2001, "max": 4000},
        {"name": "₹4001+", "min": 4001, "max": 999999}
    ]
    
    price_distribution = []
    for bin_info in price_bins:
        cursor.execute(
            "SELECT COUNT(*) FROM games WHERE current_price >= ? AND current_price <= ?",
            (bin_info['min'], bin_info['max'])
        )
        count = cursor.fetchone()[0]
        price_distribution.append({"range": bin_info['name'], "count": count})
        
    # Discount distribution
    discount_bins = [
        {"name": "0-20%", "min": 0, "max": 20},
        {"name": "21-40%", "min": 21, "max": 40},
        {"name": "41-60%", "min": 41, "max": 60},
        {"name": "61-80%", "min": 61, "max": 80},
        {"name": "81%+", "min": 81, "max": 100}
    ]
    discount_distribution = []
    for bin_info in discount_bins:
        cursor.execute(
            "SELECT COUNT(*) FROM games WHERE discount_percent >= ? AND discount_percent <= ?",
            (bin_info['min'], bin_info['max'])
        )
        count = cursor.fetchone()[0]
        discount_distribution.append({"range": bin_info['name'], "count": count})

    conn.close()
    
    return {
        'stats': stats,
        'genres': genre_data,
        'stores': store_data,
        'price_distribution': price_distribution,
        'discount_distribution': discount_distribution
    }

def clear_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM games")
    conn.commit()
    conn.close()

def log_scraper_run(status, games_scraped, logs):
    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    cursor.execute('''
        INSERT INTO scraper_runs (timestamp, status, games_scraped, log_messages)
        VALUES (?, ?, ?, ?)
    ''', (now, status, games_scraped, logs))
    conn.commit()
    conn.close()

def get_scraper_logs(limit=5):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM scraper_runs ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]
