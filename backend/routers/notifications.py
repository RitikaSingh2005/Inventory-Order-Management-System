from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import schemas, auth, models

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
    dependencies=[Depends(auth.get_current_user)]
)

@router.get("/", response_model=List[schemas.NotificationResponse])
def get_notifications(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Return user-specific and global (user_id = null) notifications
    return db.query(models.Notification).filter(
        (models.Notification.user_id == current_user.id) | (models.Notification.user_id == None)
    ).order_by(models.Notification.created_at.desc()).all()

@router.put("/{notification_id}/read")
def mark_as_read(notification_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    notif = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"status": "success"}

@router.delete("/{notification_id}")
def delete_notification(notification_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    notif = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if notif:
        db.delete(notif)
        db.commit()
    return {"status": "deleted"}
