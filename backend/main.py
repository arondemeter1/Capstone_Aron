import logging
from flask import Flask, jsonify
import requests
from datetime import datetime, timedelta
import time
import math
from flask import Flask, jsonify
from flask_cors import CORS, cross_origin


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)
CORS(app)

ALPHA_VANTAGE_API_KEY = 'PTZRDMMS8UYGPQ7G'
ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query?'

#historical_price = the price at which the stock was purchased
portfolio_data = {
    "AAPL": {"company_name": "Apple Inc.", "shares": 10, "historical_price": 174.46},  
    "AMZN": {"company_name": "Amazon.com, Inc.", "shares": 5, "historical_price": 125.96},  
    "NVDA": {"company_name": "NVIDIA Corporation", "shares": 8, "historical_price": 446.84},  
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

    for symbol, data in portfolio_data.items():
        current_price = fetch_price(symbol)
        if current_price is not None:
            shares_owned = data['shares']
            historical_price = data.get("historical_price")  #use hardcoded purchase price
            current_value = current_price * shares_owned
            initial_value = historical_price * shares_owned

            total_current_value += current_value
            total_initial_value += initial_value  

            roi = ((current_value - initial_value) / initial_value) * 100

            portfolio_performance[symbol] = {
                "company_name": data['company_name'],
                "current_price": current_price,
                "shares_owned": shares_owned,
                "initial_value": initial_value,
                "current_value": current_value,
                "roi": roi,
            }

    #calculates the percentage of the portfolio for each stock
    for symbol, perf in portfolio_performance.items():
        perf["percent_of_portfolio"] = (perf["current_value"] / total_current_value) * 100 if total_current_value else 0

    #calculates the overall portfolio ROI
    total_roi = ((total_current_value - total_initial_value) / total_initial_value) * 100 if total_initial_value else 0

    return jsonify({
        "total_portfolio_value": total_current_value,
        "portfolio_performance": portfolio_performance,
        "portfolio_ROI": total_roi  
    })

 
@app.route('/stock/<symbol>')
def stock_detail(symbol):
    if symbol not in portfolio_data:
        return jsonify({"error": "Stock not found in portfolio"}), 404

    current_price = fetch_price(symbol)
    if current_price is None:
        return jsonify({"message": "Investment values are currently updating"}), 503

    data = portfolio_data[symbol]
    shares_owned = data['shares']
    historical_price = data.get("historical_price")
    current_value = shares_owned * current_price
    initial_value = shares_owned * historical_price
    roi = ((current_value - initial_value) / initial_value) * 100

    monthly_prices = fetch_monthly_prices(symbol)

    return jsonify({
        "company_name": data['company_name'],
        "total_value_owned": current_value,
        "current_price": current_price,
        "historical_price": historical_price,
        "roi": roi,
        "monthly_prices": monthly_prices
    })

if __name__ == '__main__':
    app.run(debug=False)
