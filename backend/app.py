from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import sys
import threading
import pandas as pd
import io
from datetime import datetime

# Adjust path to import database and scraper modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from database import db_manager
from scraper import scraper

app = Flask(__name__)
# Enable CORS for local react development
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Global status tracking for scraping thread
scraper_status = {
    "status": "IDLE",
    "last_run": None,
    "games_scraped": 0,
    "logs": [],
    "error": None
}
scraper_lock = threading.Lock()

# Initialize Database on startup
db_manager.init_db()
# Perform an initial seeding run if database is empty
try:
    stats = db_manager.get_analytics()
    if stats['stats']['total_games'] == 0:
        print("Database is empty on start. Running initial seed database load...")
        scraper.run_scraper(use_live=False)
except Exception as e:
    print(f"Error seeding database on startup: {e}")

def run_scraper_async():
    global scraper_status
    with scraper_lock:
        scraper_status["status"] = "RUNNING"
        scraper_status["error"] = None
        scraper_status["logs"] = ["Scraper started asynchronously..."]
        
    try:
        # Run with live enabled
        result = scraper.run_scraper(use_live=True)
        
        with scraper_lock:
            scraper_status["status"] = "SUCCESS" if result["status"] == "SUCCESS" else "FAILED"
            scraper_status["games_scraped"] = result.get("games_scraped", 0)
            scraper_status["last_run"] = datetime.utcnow().isoformat()
            scraper_status["logs"] = result.get("logs", [])
            if result["status"] == "FAILED":
                scraper_status["error"] = result.get("error", "Unknown error occurred")
    except Exception as e:
        with scraper_lock:
            scraper_status["status"] = "FAILED"
            scraper_status["error"] = str(e)
            scraper_status["logs"].append(f"Fatal scraper thread exception: {e}")

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected"
    })

@app.route('/api/games', methods=['GET'])
def get_games():
    # Extraction of query parameters
    search = request.args.get('search', '')
    genre = request.args.get('genre', '')
    store = request.args.get('store', '')
    max_price = request.args.get('max_price', None)
    min_discount = request.args.get('min_discount', None)
    min_rating = request.args.get('min_rating', None)
    deal_tier = request.args.get('deal_tier', '')
    
    # Pagination
    limit = int(request.args.get('limit', 12))
    offset = int(request.args.get('offset', 0))
    
    # Sorting
    sort_by = request.args.get('sort_by', 'deal_score')
    sort_order = request.args.get('sort_order', 'DESC')
    
    filters = {}
    if search: filters['search'] = search
    if genre: filters['genre'] = genre
    if store: filters['store'] = store
    if max_price is not None: filters['max_price'] = float(max_price)
    if min_discount is not None: filters['min_discount'] = float(min_discount)
    if min_rating is not None: filters['min_rating'] = float(min_rating)
    if deal_tier: filters['deal_tier'] = deal_tier
    
    try:
        result = db_manager.query_games(
            filters=filters,
            limit=limit,
            offset=offset,
            sort_by=sort_by,
            sort_order=sort_order
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/best-deals', methods=['GET'])
def get_best_deals():
    try:
        # S and A Tier deals are considered the "best deals"
        result = db_manager.query_games(
            filters={'deal_tier': 'S,A'},
            limit=12,
            sort_by='deal_score',
            sort_order='DESC'
        )
        return jsonify(result['games'])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/genres', methods=['GET'])
def get_genres():
    try:
        genres = db_manager.get_genres()
        return jsonify(genres)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/stores', methods=['GET'])
def get_stores():
    try:
        stores = db_manager.get_stores()
        return jsonify(stores)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    try:
        analytics = db_manager.get_analytics()
        return jsonify(analytics)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    try:
        # The AI recommendation engine scores games by a blend of rating and discount.
        # It picks top games which have rating >= 4.2 and discount >= 30% or deal_score >= 60.
        # If user passes preferred genres, we prioritize them.
        preferred_genres = request.args.get('genres', '')
        
        filters = {
            'min_rating': 4.0,
            'min_discount': 25.0
        }
        if preferred_genres:
            filters['genre'] = preferred_genres
            
        result = db_manager.query_games(
            filters=filters,
            limit=6,
            sort_by='deal_score',
            sort_order='DESC'
        )
        # Fallback if no matching recommendations
        if not result['games']:
            result = db_manager.query_games(
                filters={},
                limit=6,
                sort_by='deal_score',
                sort_order='DESC'
            )
            
        return jsonify(result['games'])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/scrape/run', methods=['POST'])
def trigger_scrape():
    global scraper_status
    
    with scraper_lock:
        if scraper_status["status"] == "RUNNING":
            return jsonify({"status": "ALREADY_RUNNING", "message": "Scraper is currently running."}), 409
            
    # Start the scraper in a background thread
    thread = threading.Thread(target=run_scraper_async)
    thread.daemon = True
    thread.start()
    
    return jsonify({
        "status": "RUNNING",
        "message": "Scraper triggered successfully in the background."
    })

@app.route('/api/scrape/status', methods=['GET'])
def get_scrape_status():
    global scraper_status
    with scraper_lock:
        # Get latest scraper run from database as fallback for logs
        db_logs = db_manager.get_scraper_logs(limit=1)
        db_run = db_logs[0] if db_logs else None
        
        status_info = {
            "status": scraper_status["status"],
            "last_run": scraper_status["last_run"] or (db_run["timestamp"] if db_run else None),
            "games_scraped": scraper_status["games_scraped"] or (db_run["games_scraped"] if db_run else 0),
            "error": scraper_status["error"],
            # If current state logs are empty, load from db log
            "logs": scraper_status["logs"] or (db_run["log_messages"].split('\n') if db_run and db_run["log_messages"] else [])
        }
        return jsonify(status_info)

@app.route('/api/export', methods=['POST'])
def export_data():
    try:
        export_format = request.json.get('format', 'csv') if request.is_json else request.args.get('format', 'csv')
        
        # Query all games
        result = db_manager.query_games(limit=1000)
        games_df = pd.DataFrame(result['games'])
        
        if games_df.empty:
            return jsonify({"error": "No data available to export"}), 400
            
        # Reorder and rename columns for readability
        columns_mapping = {
            'title': 'Game Title',
            'genre': 'Genre',
            'store': 'Store Name',
            'original_price': 'Original Price (INR)',
            'current_price': 'Current Price (INR)',
            'discount_percent': 'Discount (%)',
            'rating': 'Rating (Stars)',
            'deal_score': 'Deal Score',
            'deal_tier': 'Deal Tier',
            'url': 'Store URL',
            'last_updated': 'Last Updated (UTC)'
        }
        
        # Filter columns to only what we need
        existing_cols = [c for c in columns_mapping.keys() if c in games_df.columns]
        games_df = games_df[existing_cols].rename(columns={c: columns_mapping[c] for c in existing_cols})
        
        if export_format == 'excel':
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                games_df.to_excel(writer, sheet_name='Game Deals', index=False)
            output.seek(0)
            return send_file(
                output,
                mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                as_attachment=True,
                download_name=f'GameDealX_Deals_{datetime.utcnow().strftime("%Y%m%d")}.xlsx'
            )
        else: # Default is CSV
            output = io.StringIO()
            games_df.to_csv(output, index=False)
            output.seek(0)
            mem = io.BytesIO()
            mem.write(output.getvalue().encode('utf-8'))
            mem.seek(0)
            return send_file(
                mem,
                mimetype='text/csv',
                as_attachment=True,
                download_name=f'GameDealX_Deals_{datetime.utcnow().strftime("%Y%m%d")}.csv'
            )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
