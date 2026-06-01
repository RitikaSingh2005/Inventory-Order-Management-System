from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
from database import engine, get_db
import crud
import schemas
from routers import products, customers, orders, auth, analytics, notifications

models.Base.metadata.create_all(bind=engine)

def seed_db():
    from database import SessionLocal
    db = SessionLocal()
    try:
        # Customers
        if not db.query(models.Customer).first():
            db.add_all([
                models.Customer(full_name="Alice Johnson", email="alice@example.com", phone_number="555-0101"),
                models.Customer(full_name="Bob Smith", email="bob@example.com", phone_number="555-0102")
            ])
            db.commit()
            
        # Products
        if not db.query(models.Product).first():
            db.add_all([
                models.Product(name="Wireless Headphones", sku="WH-001", price=99.99, quantity=50),
                models.Product(name="Mechanical Keyboard", sku="MK-002", price=129.50, quantity=30),
                models.Product(name="Gaming Mouse", sku="GM-003", price=59.99, quantity=100),
                models.Product(name="4K Monitor", sku="MON-004", price=399.00, quantity=10),
                models.Product(name="USB-C Hub", sku="USB-005", price=29.99, quantity=0)
            ])
            db.commit()
            
        # Orders
        if not db.query(models.Order).first():
            c1 = db.query(models.Customer).filter_by(email="alice@example.com").first()
            p1 = db.query(models.Product).filter_by(sku="WH-001").first()
            p2 = db.query(models.Product).filter_by(sku="MK-002").first()
            
            if c1 and p1 and p2:
                o1 = models.Order(customer_id=c1.id, total_amount=(p1.price * 2) + p2.price, status=models.OrderStatus.CONFIRMED)
                db.add(o1)
                db.commit()
                
                oi1 = models.OrderItem(order_id=o1.id, product_id=p1.id, quantity=2, unit_price=p1.price)
                oi2 = models.OrderItem(order_id=o1.id, product_id=p2.id, quantity=1, unit_price=p2.price)
                db.add_all([oi1, oi2])
                db.commit()
                
    finally:
        db.close()

seed_db()

app = FastAPI(title="Inventory Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(auth.router)
app.include_router(analytics.router)
app.include_router(notifications.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
