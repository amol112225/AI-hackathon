from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.call_model import SummaryResponse
from services.llm_service import generate_summary
from models.lead_model import Lead

router = APIRouter()

@router.get("/{lead_id}", response_model=SummaryResponse)
def get_lead_summary(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    summary = generate_summary(db, lead_id)
    return summary
