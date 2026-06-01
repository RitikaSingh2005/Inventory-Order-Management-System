from sqlalchemy.orm import Session
from fastapi import HTTPException
import models
import schemas

def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_product_by_sku(db: Session, sku: str):
    return db.query(models.Product).filter(models.Product.sku == sku).first()

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product: schemas.ProductUpdate):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    
    update_data = product.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
        
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product

def get_customer(db: Session, customer_id: int):
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()

def get_customer_by_email(db: Session, email: str):
    return db.query(models.Customer).filter(models.Customer.email == email).first()

def get_customers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Customer).offset(skip).limit(limit).all()

def create_customer(db: Session, customer: schemas.CustomerCreate):
    db_customer = models.Customer(**customer.model_dump())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def delete_customer(db: Session, customer_id: int):
    db_customer = get_customer(db, customer_id)
    if db_customer:
        db.delete(db_customer)
        db.commit()
    return db_customer

def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def get_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Order).offset(skip).limit(limit).all()

def create_order(db: Session, order: schemas.OrderCreate):
    customer = get_customer(db, order.customer_id)
    if not customer:
        raise HTTPException(status_code=400, detail="Customer not found")

    total_amount = 0.0
    db_order = models.Order(customer_id=order.customer_id, total_amount=0)
    db.add(db_order)
    db.flush() # To get order ID

    for item in order.items:
        product = get_product(db, item.product_id)
        if not product:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Product with ID {item.product_id} not found")
        
        if product.quantity < item.quantity:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Insufficient stock for product '{product.name}' (SKU: {product.sku}). Available: {product.quantity}, Requested: {item.quantity}")
        
        product.quantity -= item.quantity
        item_price = product.price
        total_amount += (item_price * item.quantity)
        
        db_order_item = models.OrderItem(
            order_id=db_order.id,
            product_id=product.id,
            quantity=item.quantity,
            unit_price=item_price
        )
        db.add(db_order_item)

    db_order.total_amount = total_amount
    db.commit()
    db.refresh(db_order)
    return db_order

def delete_order(db: Session, order_id: int):
    db_order = get_order(db, order_id)
    if db_order:
        for item in db_order.items:
            product = get_product(db, item.product_id)
            if product:
                product.quantity += item.quantity
        db.delete(db_order)
        db.commit()
    return db_order

def get_dashboard_stats(db: Session):
    total_products = db.query(models.Product).count()
    total_customers = db.query(models.Customer).count()
    total_orders = db.query(models.Order).count()
    low_stock_products = db.query(models.Product).filter(models.Product.quantity < 10).all()
    
    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_products": low_stock_products
    }
