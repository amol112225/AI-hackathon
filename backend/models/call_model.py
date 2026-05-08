from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from database import Base
from pydantic import BaseModel
from typing import List
import datetime

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"))
    role = Column(String) # "user" or "assistant"
    message = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class MessageSchema(BaseModel):
    role: str
    message: str
    timestamp: datetime.datetime
    
    class Config:
        from_attributes = True

class SummaryResponse(BaseModel):
    key_points: List[str]
    objections: List[str]
    next_action: str
