from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import schemas, auth, models
from services import forecasting, analytics

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
    dependencies=[Depends(auth.require_role([models.UserRole.ADMIN, models.UserRole.MANAGER]))]
)

@router.get("/dashboard", response_model=schemas.DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    return analytics.get_executive_dashboard(db)

@router.get("/forecast", response_model=List[schemas.ProductForecast])
def get_inventory_forecasts(db: Session = Depends(get_db)):
    return forecasting.forecast_all_inventory(db)

@router.get("/customer-intelligence/{customer_id}", response_model=schemas.CustomerIntelligence)
def get_customer_insight(customer_id: int, db: Session = Depends(get_db)):
    intel = analytics.get_customer_intelligence(db, customer_id)
    if not intel:
        raise HTTPException(status_code=404, detail="Customer not found")
    return intel
