import os
from sqlalchemy.orm import Session
from database import engine, SessionLocal
import models
import auth
from datetime import datetime, timedelta
import random

def seed_db():
    print("Dropping all tables to reset schema...")
    models.Base.metadata.drop_all(bind=engine)
    print("Creating all tables...")
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # 1. Create Admin User
    admin_email = "admin@shopverse.com"
    hashed_pw = auth.get_password_hash("admin")
    admin = models.User(email=admin_email, hashed_password=hashed_pw, role=models.UserRole.ADMIN)
    db.add(admin)
    db.commit()
    db.refresh(admin)
    print(f"Created admin user: {admin_email}")
    
    notif = models.Notification(
        user_id=admin.id,
        message="Welcome to ShopVerse! Your database has been seeded with 15 products and 10 customers.",
        type="alert"
    )
    db.add(notif)
    db.commit()

    # 2. Add 25 Demo Products (Including Clothing, Shoes, Perfumes)
    products_data = [
        {"name": "Ultra HD Smart TV", "sku": "TV-4K-001", "price": 499.99, "quantity": 50},
        {"name": "Wireless Noise-Cancelling Headphones", "sku": "AUD-NC-102", "price": 199.50, "quantity": 120},
        {"name": "Mechanical Gaming Keyboard", "sku": "PER-KB-055", "price": 89.99, "quantity": 75},
        {"name": "Ergonomic Office Chair", "sku": "FUR-CH-099", "price": 145.00, "quantity": 0}, # Out of stock demo
        {"name": "Smartphone 14 Pro", "sku": "PHN-14P-999", "price": 999.99, "quantity": 30},
        {"name": "Bluetooth Portable Speaker", "sku": "AUD-SP-304", "price": 59.99, "quantity": 15},
        
        # New: Clothing
        {"name": "Premium Cotton T-Shirt", "sku": "CLO-TS-001", "price": 25.00, "quantity": 300},
        {"name": "Classic Denim Jacket", "sku": "CLO-DJ-002", "price": 85.00, "quantity": 40},
        {"name": "Winter Puffer Coat", "sku": "CLO-WC-003", "price": 120.00, "quantity": 15},
        {"name": "Athletic Yoga Pants", "sku": "CLO-YP-004", "price": 45.00, "quantity": 90},
        
        # New: Shoes
        {"name": "Men's Running Shoes", "sku": "SHO-MR-001", "price": 95.00, "quantity": 5}, # Low stock demo
        {"name": "Women's Leather Boots", "sku": "SHO-WL-002", "price": 150.00, "quantity": 25},
        {"name": "Casual Canvas Sneakers", "sku": "SHO-CS-003", "price": 55.00, "quantity": 110},
        {"name": "Formal Oxford Shoes", "sku": "SHO-FO-004", "price": 135.00, "quantity": 18},
        
        # New: Perfumes
        {"name": "Ocean Breeze Eau de Parfum", "sku": "PER-OB-001", "price": 89.99, "quantity": 60},
        {"name": "Midnight Rose Fragrance", "sku": "PER-MR-002", "price": 110.00, "quantity": 8}, # Low stock
        {"name": "Woodland Musk Cologne", "sku": "PER-WM-003", "price": 75.00, "quantity": 45},
        {"name": "Citrus Splash Body Mist", "sku": "PER-CS-004", "price": 29.99, "quantity": 150},
        
        # Miscellaneous
        {"name": "Minimalist Leather Wallet", "sku": "ACC-LW-005", "price": 35.00, "quantity": 110},
    ]

    db_products = []
    for p_data in products_data:
        p = models.Product(**p_data)
        db.add(p)
        db_products.append(p)
    db.commit()
    for p in db_products:
        db.refresh(p)
    print("Created 15 products.")

    # 3. Add 10 Demo Customers
    customers_data = [
        {"full_name": "Emma Johnson", "email": "emma.j@example.com", "phone_number": "555-0101"},
        {"full_name": "Liam Smith", "email": "liam.smith@example.com", "phone_number": "555-0102"},
        {"full_name": "Olivia Williams", "email": "olivia.w@example.com", "phone_number": "555-0103"},
        {"full_name": "Noah Brown", "email": "noah.b@example.com", "phone_number": "555-0104"},
        {"full_name": "Ava Jones", "email": "ava.j@example.com", "phone_number": "555-0105"},
        {"full_name": "William Garcia", "email": "william.g@example.com", "phone_number": "555-0106"},
        {"full_name": "Sophia Martinez", "email": "sophia.m@example.com", "phone_number": "555-0107"},
        {"full_name": "James Rodriguez", "email": "james.r@example.com", "phone_number": "555-0108"},
        {"full_name": "Isabella Hernandez", "email": "isabella.h@example.com", "phone_number": "555-0109"},
        {"full_name": "Benjamin Lopez", "email": "benjamin.l@example.com", "phone_number": "555-0110"},
    ]

    db_customers = []
    for c_data in customers_data:
        c = models.Customer(**c_data)
        db.add(c)
        db_customers.append(c)
    db.commit()
    for c in db_customers:
        db.refresh(c)
    print("Created 10 customers.")

    # 4. Generate Random Orders across the last 7 days to populate graphs
    print("Generating random orders for the past 7 days...")
    statuses = [
        models.OrderStatus.CREATED, models.OrderStatus.CONFIRMED,
        models.OrderStatus.PACKED, models.OrderStatus.SHIPPED,
        models.OrderStatus.DELIVERED, models.OrderStatus.CANCELLED
    ]
    
    for i in range(120): # Create 120 randomized orders for rich data
        customer = random.choice(db_customers)
        status = random.choices(statuses, weights=[10, 10, 10, 20, 45, 5])[0]
        
        # Randomize order date over the past 7 days
        days_ago = random.randint(0, 6)
        order_date = datetime.utcnow() - timedelta(days=days_ago, hours=random.randint(0, 23))

        o = models.Order(
            customer_id=customer.id, 
            total_amount=0, # Will calculate below
            status=status,
            created_at=order_date
        )
        db.add(o)
        db.flush()
        
        # Add 1 to 4 items per order
        num_items = random.randint(1, 4)
        total = 0
        order_products = random.sample(db_products, num_items)
        
        for p in order_products:
            qty = random.randint(1, 3)
            item = models.OrderItem(
                order_id=o.id,
                product_id=p.id,
                quantity=qty,
                unit_price=p.price
            )
            db.add(item)
            total += qty * p.price
            
        o.total_amount = total
    
    db.commit()
    db.close()
    print("Database seeded successfully with all demo data.")

if __name__ == "__main__":
    seed_db()
