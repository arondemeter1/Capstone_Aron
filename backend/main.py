import logging
import requests
from flask import Flask, request, session, redirect, url_for, jsonify
import hashlib
from datetime import datetime, timedelta
import time
import math
from flask import Flask, jsonify
from flask_cors import CORS, cross_origin
import oracledb
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.pool import NullPool
from models import db, User, Stock

#configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

#initialize the Flask app and CORS
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
app.secret_key = '83h9137JXHUENRyxyx(=:dfclL:)'

#oracle database credentials
un = 'ADMIN'
pw = 'Capstonemcsbt2024'
dsn = '''(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.eu-madrid-1.oraclecloud.com))(connect_data=(service_name=g2c8731f47ad2d5_qkcekul2ibiuv723_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))'''


pool = oracledb.create_pool(user=un, password=pw, dsn=dsn)
#update the SQLALCHEMY_DATABASE_URI to use oracle+oracledb dialect
app.config['SQLALCHEMY_DATABASE_URI'] = 'oracle+oracledb://'
    
    #ADMIN:Capstonemcsbt2024@'
    #'adb.eu-madrid-1.oraclecloud.com:1522/'
    #'g2c8731f47ad2d5_qkcekul2ibiuv723_high.adb.oraclecloud.com?ssl_server_cert_dn="CN=adb.eu-madrid-1.oraclecloud.com,OU=Oracle ADB MADRID,O=Oracle Corporation,L=Redwood City,ST=California,C=US"'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
#here
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'creator': pool.acquire,
    'poolclass': NullPool
}
app.config['SQLALCHEMY_ECHO'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

# Initialize SQLAlchemy with the current Flask app
#db.init_app(app)

#define a simple password hashing function
def hash_value(password):
    return hashlib.sha1(password.encode()).hexdigest()


ALPHA_VANTAGE_API_KEY = 'PTZRDMMS8UYGPQ7G'
ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query?'

#historical_price = the price at which the stock was purchased
#portfolio_data = {
#    "AAPL": {"company_name": "Apple Inc.", "shares": 10, "historical_price": 174.46},  
#    "AMZN": {"company_name": "Amazon.com, Inc.", "shares": 5, "historical_price": 125.96},  
#    "NVDA": {"company_name": "NVIDIA Corporation", "shares": 8, "historical_price": 446.84},  
#}

#added it back as with the oracle db it is not working
users_database = {
    'arondemeter': hash_value('happy')
}

def fetch_price(symbol):
    """Fetches the most recent price for a given symbol."""
    params = {
        'function': 'GLOBAL_QUOTE',
        'symbol': symbol,
        'apikey': ALPHA_VANTAGE_API_KEY,
    }
    response = requests.get(ALPHA_VANTAGE_BASE_URL, params=params)
    if response.status_code == 200:
        data = response.json()
        price_info = data.get("Global Quote", {})
        logging.info(f"Successfully fetched price for {symbol}: {price_info.get('05. price', 'N/A')}")
        return float(price_info.get("05. price", 0))
    else:
        logging.error(f"Error fetching recent data for {symbol}: HTTP {response.status_code}, Response: {response.text}")
    return None


def fetch_monthly_prices(symbol):
    """Fetches monthly closing prices for the last 12 months for a given stock symbol."""
    params = {
        'function': 'TIME_SERIES_MONTHLY',
        'symbol': symbol,
        'apikey': ALPHA_VANTAGE_API_KEY
    }
    response = requests.get(ALPHA_VANTAGE_BASE_URL, params=params)
    if response.ok:
        data = response.json()
        time_series = data.get('Monthly Time Series', {})
        monthly_prices = [{ "date": date, "close": info['4. close'] } for date, info in sorted(time_series.items(), reverse=True)[:12]]
        return monthly_prices
    return []

@app.route('/')
def index():
    total_current_value = 0
    total_initial_value = 0
    portfolio_performance = {}

    stocks = Stock.query.all()
    
    for stock in stocks:
        symbol = stock.SYMBOL
        current_price = fetch_price(symbol)
        
        company_name, _ = fetch_company_name(symbol)

        if current_price is not None and company_name is not None:
            shares_owned = stock.SHARES
            historical_price = stock.PURCHASE_PRICE
            current_value = current_price * shares_owned
            initial_value = historical_price * shares_owned
            total_current_value += current_value
            total_initial_value += initial_value

            roi = ((current_value - initial_value) / initial_value) * 100

            portfolio_performance[symbol] = {
                "company_name": company_name,
                "current_price": current_price,
                "shares_owned": shares_owned,
                "initial_value": initial_value,
                "current_value": current_value,
                "roi": roi,
            }

    # Calculates the percentage of the portfolio for each stock
    for symbol, perf in portfolio_performance.items():
        perf["percent_of_portfolio"] = (perf["current_value"] / total_current_value) * 100 if total_current_value else 0

    # Calculates the overall portfolio ROI
    total_roi = ((total_current_value - total_initial_value) / total_initial_value) * 100 if total_initial_value else 0

    return jsonify({
        "total_portfolio_value": total_current_value,
        "portfolio_performance": portfolio_performance,
        "portfolio_ROI": total_roi  
    })

def fetch_company_name(symbol):
    """Fetches the company name for a given stock symbol."""
    search_response = requests.get(
        f"https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords={symbol}&apikey={ALPHA_VANTAGE_API_KEY}")
    if search_response.status_code == 200:
        search_data = search_response.json()
        company_name = search_data.get('bestMatches', [{}])[0].get('2. name', 'Unknown')
        return company_name, None  # Return a tuple with two elements
    return None, None  # Return a tuple with two elements


 
@app.route('/stock/<symbol>')
def stock_detail(symbol):
    # Query the stock information from the database
    stock = Stock.query.filter_by(SYMBOL=symbol).first()
    
    if stock is None:
        return jsonify({"error": "Stock not found in portfolio"}), 404

    current_price = fetch_price(symbol)
    if current_price is None:
        return jsonify({"message": "Investment values are currently updating"}), 503
    
    # Assuming the company name needs to be fetched dynamically as the model doesn't contain it
    company_name, _ = fetch_company_name(symbol)
    
    # Use database information instead of hardcoded data
    shares_owned = stock.SHARES
    historical_price = stock.PURCHASE_PRICE
    current_value = shares_owned * current_price
    initial_value = shares_owned * historical_price
    roi = ((current_value - initial_value) / initial_value) * 100

    monthly_prices = fetch_monthly_prices(symbol)

    return jsonify({
        "company_name": company_name,  # Fetched dynamically
        "total_value_owned": current_value,
        "current_price": current_price,
        "historical_price": historical_price,
        "roi": roi,
        "monthly_prices": monthly_prices
    })


#as the oracle db version is somewhy not working
#@app.route('/login', methods=['POST'])
#def login():
    #data = request.json
    #username = data.get('username')  # The name entered by the user in the frontend.
    #password = data.get('password')

    # Hash the provided password
    #hashed_password = hashlib.sha1(password.encode()).hexdigest()
    
    # Query the database for the user with the given name
    #user = User.query.filter_by(name=username).first()
    
    #if user and user.hashed_password == hashed_password:
        # The passwords match
        #session['username'] = username
        #return jsonify({'status': 'success'}), 200
    #else:
        # The user does not exist or password does not match
        #return jsonify({'status': 'fail', 'message': 'Invalid username or password'}), 401

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password']
    hashed_password = hash_value(password)
    
    if username in users_database and users_database[username] == hashed_password:
        session['username'] = username
        return jsonify({'status': 'success'}), 200
    else:
        return jsonify({'status': 'fail', 'message': 'Invalid username or password'}), 401

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('username', None)  #remove the user from the session
    return jsonify({'message': 'Logged out successfully'}), 200


if __name__ == '__main__':
    app.run(debug=True)