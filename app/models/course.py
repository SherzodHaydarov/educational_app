from sqlalchemy import Column, DateTime, Float, Integer, String, Text
from sqlalchemy.sql import func

from app.db.database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    duration_weeks = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
