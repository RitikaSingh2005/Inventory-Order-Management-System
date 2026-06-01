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
        if db.query(models.Product).first():
            return
        
        c1 = models.Customer(full_name="Alice Johnson", email="alice@example.com", phone_number="555-0101")
        c2 = models.Customer(full_name="Bob Smith", email="bob@example.com", phone_number="555-0102")
        db.add_all([c1, c2])
        
        p1 = models.Product(name="Wireless Headphones", sku="WH-001", price=99.99, quantity=50)
        p2 = models.Product(name="Mechanical Keyboard", sku="MK-002", price=129.50, quantity=30)
        p3 = models.Product(name="Gaming Mouse", sku="GM-003", price=59.99, quantity=100)
        p4 = models.Product(name="4K Monitor", sku="MON-004", price=399.00, quantity=10)
        p5 = models.Product(name="USB-C Hub", sku="USB-005", price=29.99, quantity=0)
        db.add_all([p1, p2, p3, p4, p5])
        
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
