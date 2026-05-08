from sqlalchemy import Column, Integer, String, Boolean, DateTime
from database import Base
from pydantic import BaseModel
from typing import Optional
import datetime

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String, index=True, unique=True)
    language = Column(String, nullable=True)
    
    # Call System Status
    call_status = Column(String, default="pending") # pending, ongoing, completed
    
    # Scoring & Classification
    score = Column(Integer, default=50) # Starting neutral score
    classification = Column(String, default="UNKNOWN") # HOT > 70, WARM 40-70, COLD < 40
    needs_followup = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class LeadCreate(BaseModel):
    name: str
    phone: str
    language: Optional[str] = "English"

class LeadResponse(LeadCreate):
    id: int
    call_status: str
    score: int
    classification: str
    needs_followup: bool

    class Config:
        from_attributes = True
