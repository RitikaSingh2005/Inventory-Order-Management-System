from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas, auth, models
from database import get_db

router = APIRouter(
    prefix="/orders",
    tags=["orders"],
    dependencies=[Depends(auth.require_role([models.UserRole.ADMIN, models.UserRole.MANAGER, models.UserRole.STAFF]))]
)

@router.post("/", response_model=schemas.OrderResponse, status_code=201)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_order = crud.create_order(db=db, order=order)
    # Add history
    history = models.OrderStatusHistory(
        order_id=db_order.id,
        status=models.OrderStatus.CREATED,
        changed_by_id=current_user.id
    )
    db.add(history)
    db.commit()
    db.refresh(db_order)
    return db_order

@router.get("/", response_model=List[schemas.OrderResponse])
def read_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    orders = crud.get_orders(db, skip=skip, limit=limit)
    return orders

@router.get("/{order_id}", response_model=schemas.OrderResponse)
def read_order(order_id: int, db: Session = Depends(get_db)):
    db_order = crud.get_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order

@router.put("/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(order_id: int, status_update: schemas.OrderStatusUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_order = crud.get_order(db, order_id=order_id)
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db_order.status = status_update.status
    history = models.OrderStatusHistory(
        order_id=db_order.id,
        status=status_update.status,
        changed_by_id=current_user.id
    )
    db.add(history)
    db.commit()
    db.refresh(db_order)
    return db_order

@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    db_order = crud.delete_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"detail": "Order deleted and stock restored"}
