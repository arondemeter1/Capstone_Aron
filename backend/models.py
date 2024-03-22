from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'USERS'
    ID = db.Column(db.Integer, primary_key=True)
    NAME = db.Column(db.String(100), nullable=False)
    HASHED_PASSWORD = db.Column(db.String(255), nullable=False)

    def dict(self):
        return {
            'ID': self.ID,
            'NAME': self.NAME,
            'HASHED_PASSWORD': self.HASHED_PASSWORD
        }

class Stock(db.Model):
    __tablename__ = 'STOCKS'  
    ID = db.Column(db.Integer, primary_key=True)
    USER_ID = db.Column(db.Integer, db.ForeignKey('USERS.ID'), nullable=False)
    SYMBOL = db.Column(db.String(10), nullable=False)
    SHARES = db.Column(db.Integer, nullable=False)
    PURCHASE_PRICE = db.Column(db.Float, nullable=False)

    USER = db.relationship('User', backref=db.backref('stocks', lazy=True))

    def dict(self):
        return {
            'ID': self.ID, 
            'USER_ID': self.USER_ID,
            'SYMBOL': self.SYMBOL,
            'SHARES': self.SHARES,
            'PURCHASE_PRICE': self.PURCHASE_PRICE
        }
