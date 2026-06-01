from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import models, schemas

def get_customer_intelligence(db: Session, customer_id: int) -> schemas.CustomerIntelligence:
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        return None

    orders = db.query(models.Order).filter(models.Order.customer_id == customer_id).all()
    total_orders = len(orders)
    lifetime_value = sum(order.total_amount for order in orders)

    purchase_frequency_days = 0.0
    if total_orders > 1:
        first_order = min(order.created_at for order in orders)
        last_order = max(order.created_at for order in orders)
        days_between = (last_order - first_order).days
        purchase_frequency_days = days_between / (total_orders - 1)

    return schemas.CustomerIntelligence(
        customer=customer,
        total_orders=total_orders,
        lifetime_value=lifetime_value,
        purchase_frequency_days=round(purchase_frequency_days, 1)
    )

def generate_business_recommendations(db: Session):
    recommendations = []
    
    # 1. High value products running low
    low_stock = db.query(models.Product).filter(models.Product.quantity < 10).all()
    for p in low_stock:
        if p.price > 100:
            recommendations.append(f"High-value product '{p.name}' is critically low on stock ({p.quantity} left). Restock immediately.")
        else:
            recommendations.append(f"Product '{p.name}' is running low on stock.")

    # 2. Top Selling Product
    top_selling = db.query(
        models.OrderItem.product_id, 
        func.sum(models.OrderItem.quantity).label('total_qty')
    ).group_by(models.OrderItem.product_id).order_by(func.sum(models.OrderItem.quantity).desc()).first()
    
    if top_selling:
        top_product = db.query(models.Product).filter(models.Product.id == top_selling.product_id).first()
        recommendations.append(f"'{top_product.name}' is your best-selling product. Consider increasing marketing spend or bulk ordering.")

    # 3. Slow moving products (0 sales)
    all_products = db.query(models.Product).all()
    sold_product_ids = [item.product_id for item in db.query(models.OrderItem.product_id).distinct().all()]
    unsold_products = [p for p in all_products if p.id not in sold_product_ids]
    
    if unsold_products:
        recommendations.append(f"{len(unsold_products)} products have no sales. Consider a discount campaign to move dead inventory.")

    return recommendations

def get_executive_dashboard(db: Session) -> schemas.DashboardResponse:
    total_products = db.query(models.Product).count()
    total_customers = db.query(models.Customer).count()
    total_orders = db.query(models.Order).count()
    total_revenue = db.query(func.sum(models.Order.total_amount)).scalar() or 0.0
    low_stock_products = db.query(models.Product).filter(models.Product.quantity < 10).all()
    recommendations = generate_business_recommendations(db)

    # Calculate revenue for last 7 days
    revenue_chart_data = []
    today = datetime.utcnow().date()
    for i in range(6, -1, -1):
        target_date = today - timedelta(days=i)
        # Orders for this specific day
        daily_revenue = db.query(func.sum(models.Order.total_amount))\
            .filter(func.date(models.Order.created_at) == target_date).scalar() or 0.0
        revenue_chart_data.append({
            "name": f"Day {7-i}",
            "value": float(daily_revenue)
        })

    return schemas.DashboardResponse(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        total_revenue=total_revenue,
        revenue_chart_data=revenue_chart_data,
        low_stock_products=low_stock_products,
        recommendations=recommendations
    )
