from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class OrderStatus(str, Enum):
    CREATED = "Created"
    CONFIRMED = "Confirmed"
    PACKED = "Packed"
    SHIPPED = "Shipped"
    OUT_FOR_DELIVERY = "Out For Delivery"
    DELIVERED = "Delivered"
    CANCELLED = "Cancelled"

class UserRole(str, Enum):
    ADMIN = "Admin"
    MANAGER = "Manager"
    STAFF = "Staff"

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    role: UserRole = UserRole.STAFF
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    profile_photo: Optional[str] = None

class UserResponse(UserBase):
    id: int
    profile_photo: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None

# Notification Schemas
class NotificationBase(BaseModel):
    message: str
    type: str
    is_read: bool = False

class NotificationCreate(NotificationBase):
    user_id: Optional[int] = None

class NotificationResponse(NotificationBase):
    id: int
    user_id: Optional[int]
    created_at: datetime
    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    sku: str
    price: float = Field(..., gt=0)
    quantity: int = Field(..., ge=0)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    quantity: Optional[int] = Field(None, ge=0)

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Customer Schemas
class CustomerBase(BaseModel):
    full_name: str
    email: EmailStr
    phone_number: str

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Order Schemas
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    product: ProductResponse
    class Config:
        from_attributes = True

class OrderStatusHistoryResponse(BaseModel):
    id: int
    status: OrderStatus
    timestamp: datetime
    changed_by: Optional[UserResponse] = None
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate]

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    status: OrderStatus
    created_at: datetime
    customer: CustomerResponse
    items: List[OrderItemResponse]
    history: List[OrderStatusHistoryResponse] = []
    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: OrderStatus

# Dashboard / Analytics Schemas
class ChartPoint(BaseModel):
    name: str
    value: float

class DashboardResponse(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    total_revenue: float
    revenue_chart_data: List[ChartPoint] = []
    low_stock_products: List[ProductResponse]
    recommendations: List[str]

class CustomerIntelligence(BaseModel):
    customer: CustomerResponse
    total_orders: int
    lifetime_value: float
    purchase_frequency_days: float

class ProductForecast(BaseModel):
    product: ProductResponse
    avg_daily_sales: float
    days_until_depletion: float
    suggested_reorder_qty: int
