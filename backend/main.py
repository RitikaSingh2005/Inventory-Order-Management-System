from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
from database import engine, get_db
import crud
import schemas
from routers import products, customers, orders, auth, analytics, notifications

models.Base.metadata.create_all(bind=engine)

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
