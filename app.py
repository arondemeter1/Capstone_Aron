from flask import Flask, render_template, jsonify
import requests

app = Flask(__name__)

ALPHA_VANTAGE_API_KEY = ''
ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query?'

portfolio_data = {
    "AAPL": {"company_name": "Apple Inc.", "percent_of_portfolio": 20, "value": 20000},
    "AMZN": {"company_name": "Amazon.com, Inc.", "percent_of_portfolio": 20, "value": 20000},
    "NFLX": {"company_name": "Netflix, Inc.", "percent_of_portfolio": 20, "value": 20000},
    "GOOGL": {"company_name": "Alphabet Inc.", "percent_of_portfolio": 20, "value": 20000},
    "NVDA": {"company_name": "NVIDIA Corporation", "percent_of_portfolio": 20, "value": 20000},
}

@app.route('/')
def index():
    total_value = sum(stock['value'] for stock in portfolio_data.values())
    return render_template('index.html', portfolio_data=portfolio_data, total_value=total_value)

@app.route('/stock/<symbol>')
def stock_detail(symbol):
    if symbol not in portfolio_data:
        return "Stock not found in portfolio", 404

    #fetch current price using GLOBAL_QUOTE
    current_price_response = requests.get(f"{ALPHA_VANTAGE_BASE_URL}function=GLOBAL_QUOTE&symbol={symbol}&apikey={ALPHA_VANTAGE_API_KEY}")
    #fetch the last 12 months with TIME_SERIES_MONTHLY
    historical_data_response = requests.get(f"{ALPHA_VANTAGE_BASE_URL}function=TIME_SERIES_MONTHLY&symbol={symbol}&apikey={ALPHA_VANTAGE_API_KEY}")

    if current_price_response.ok and historical_data_response.ok:
        current_price_data = current_price_response.json()
        historical_data = historical_data_response.json()

        current_price = current_price_data.get("Global Quote", {}).get("05. price", "N/A")
 
        monthly_data = historical_data.get("Monthly Time Series", {})
        historical_prices = [
            {"date": date, "close": values["4. close"]}
            for date, values in sorted(monthly_data.items(), reverse=True)[:12]
        ]

        return render_template('stock_detail.html',
                               company_name=portfolio_data[symbol]['company_name'],
                               symbol=symbol,
                               current_price=current_price,
                               historical_prices=historical_prices)
    else:
        return "Error fetching data from Alpha Vantage", 500


if __name__ == '__main__':
    app.run(debug=True)
