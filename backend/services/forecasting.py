from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import models, schemas

def forecast_inventory(db: Session, product_id: int) -> schemas.ProductForecast:
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        return None

    # Calculate average daily sales over the last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    order_items = db.query(models.OrderItem).join(models.Order).filter(
        models.OrderItem.product_id == product_id,
        models.Order.created_at >= thirty_days_ago
    ).all()

    total_sold = sum(item.quantity for item in order_items)
    avg_daily_sales = total_sold / 30.0 if total_sold > 0 else 0.0

    days_until_depletion = float('inf')
    if avg_daily_sales > 0:
        days_until_depletion = product.quantity / avg_daily_sales

    suggested_reorder_qty = 0
    if days_until_depletion < 14: # Reorder if less than 14 days stock
        # Suggest enough stock for 30 days
        suggested_reorder_qty = int((avg_daily_sales * 30) - product.quantity)
        if suggested_reorder_qty < 0:
            suggested_reorder_qty = 0

    return schemas.ProductForecast(
        product=product,
        avg_daily_sales=round(avg_daily_sales, 2),
        days_until_depletion=round(days_until_depletion, 1) if days_until_depletion != float('inf') else 999.9,
        suggested_reorder_qty=suggested_reorder_qty
    )

def forecast_all_inventory(db: Session):
    products = db.query(models.Product).all()
    forecasts = []
    for p in products:
        f = forecast_inventory(db, p.id)
        if f:
            forecasts.append(f)
    return forecasts
