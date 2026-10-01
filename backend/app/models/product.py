import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Integer, BigInteger, Boolean, DateTime, Text, Float, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base


class ProductCategory(Base):
    __tablename__ = "product_categories"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    name_en: Mapped[str] = mapped_column(String(100), nullable=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    icon: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    products: Mapped[List["Product"]] = relationship("Product", back_populates="category_rel")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    title_fa: Mapped[str] = mapped_column(String(255), nullable=False)
    title_en: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    category_id: Mapped[str] = mapped_column(String(50), ForeignKey("product_categories.id"), nullable=False)
    brand: Mapped[str] = mapped_column(String(100), nullable=False)
    model_year: Mapped[int] = mapped_column(Integer, default=2026)
    sport: Mapped[str] = mapped_column(String(30), default="PADEL")  # PADEL, TENNIS
    level: Mapped[str] = mapped_column(String(30), default="PRO")  # BEGINNER, INTERMEDIATE, ADVANCED, PRO

    # Financials (in Tomans)
    original_price: Mapped[int] = mapped_column(BigInteger, nullable=False)
    discount_percent: Mapped[int] = mapped_column(Integer, default=0)
    price: Mapped[int] = mapped_column(BigInteger, nullable=False)
    stock: Mapped[int] = mapped_column(Integer, default=0)

    # Status Flags
    is_in_stock: Mapped[bool] = mapped_column(Boolean, default=True)
    is_new: Mapped[bool] = mapped_column(Boolean, default=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Social & Media
    rating: Mapped[float] = mapped_column(Float, default=5.0)
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    primary_image: Mapped[str] = mapped_column(String(500), nullable=False)

    # Descriptions
    description_fa: Mapped[str] = mapped_column(Text, nullable=False)
    description_en: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Technical Specifications & Features
    specs: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    technologies: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    category_rel: Mapped["ProductCategory"] = relationship("ProductCategory", back_populates="products")
    images: Mapped[List["ProductImage"]] = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")


class ProductImage(Base):
    __tablename__ = "product_images"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id: Mapped[str] = mapped_column(String(100), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    alt_text: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    product: Mapped["Product"] = relationship("Product", back_populates="images")


class ShopOrder(Base):
    __tablename__ = "shop_orders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tracking_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    customer_name: Mapped[str] = mapped_column(String(150), nullable=False)
    customer_phone: Mapped[str] = mapped_column(String(30), nullable=False)
    customer_address: Mapped[str] = mapped_column(Text, nullable=False)
    postal_code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    city: Mapped[str] = mapped_column(String(50), default="تهران")

    # Financials (in Tomans)
    total_amount: Mapped[int] = mapped_column(BigInteger, nullable=False)
    discount_amount: Mapped[int] = mapped_column(BigInteger, default=0)
    shipping_fee: Mapped[int] = mapped_column(BigInteger, default=0)
    payable_amount: Mapped[int] = mapped_column(BigInteger, nullable=False)

    payment_method: Mapped[str] = mapped_column(String(30), default="GATEWAY")  # WALLET, GATEWAY
    payment_status: Mapped[str] = mapped_column(String(30), default="PENDING")  # PENDING, PAID, FAILED, REFUNDED
    order_status: Mapped[str] = mapped_column(String(30), default="NEW")  # NEW, PROCESSING, SHIPPED, DELIVERED, CANCELLED

    payment_tracking_code: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    shipping_tracking_code: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    admin_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items: Mapped[List["ShopOrderItem"]] = relationship("ShopOrderItem", back_populates="order", cascade="all, delete-orphan")


class ShopOrderItem(Base):
    __tablename__ = "shop_order_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id: Mapped[str] = mapped_column(String(36), ForeignKey("shop_orders.id", ondelete="CASCADE"), nullable=False)
    product_id: Mapped[str] = mapped_column(String(100), ForeignKey("products.id"), nullable=False)
    product_title: Mapped[str] = mapped_column(String(255), nullable=False)
    unit_price: Mapped[int] = mapped_column(BigInteger, nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    total_price: Mapped[int] = mapped_column(BigInteger, nullable=False)

    order: Mapped["ShopOrder"] = relationship("ShopOrder", back_populates="items")
