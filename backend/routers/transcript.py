from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.call_model import MessageSchema
from services.memory_service import get_conversation_history
from models.lead_model import Lead

router = APIRouter()

@router.get("/{lead_id}", response_model=List[MessageSchema])
def get_lead_transcript(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    history = get_conversation_history(db, lead_id)
    return history
