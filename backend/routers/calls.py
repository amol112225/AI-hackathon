from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models.lead_model import Lead
from services.call_service import start_all_calls, stop_all_calls, start_single_call
from services.llm_service import generate_response, generate_greeting, generate_summary

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/start")
def start_calls(db: Session = Depends(get_db)):
    """Start AI calls for all pending leads."""
    result = start_all_calls(db)
    return result

@router.post("/stop")
def stop_calls(db: Session = Depends(get_db)):
    """Stop all ongoing calls."""
    result = stop_all_calls(db)
    return result

@router.post("/start/{lead_id}")
def start_call(lead_id: int, db: Session = Depends(get_db)):
    """Start call for a specific lead and return greeting."""
    result = start_single_call(db, lead_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
        
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    greeting = generate_greeting(db, lead)
    return {"message": "Call started", "greeting": greeting["message"]}

@router.post("/{lead_id}/chat")
def chat_with_lead(lead_id: int, request: ChatRequest, db: Session = Depends(get_db)):
    """Simulate user chatting with AI for an ongoing call."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    if lead.call_status != "ongoing":
        raise HTTPException(status_code=400, detail="Call is not ongoing for this lead")
        
    response = generate_response(db, lead, request.message)
    return response

@router.post("/{lead_id}/end")
def end_single_call(lead_id: int, db: Session = Depends(get_db)):
    """End a single call and return summary."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    lead.call_status = "completed"
    
    if lead.classification == "WARM":
        lead.needs_followup = True
        print(f"[SIMULATION] Sending WhatsApp message to WARM lead: {lead.phone}")
    else:
        lead.needs_followup = False
        
    db.commit()
    
    summary = generate_summary(db, lead_id)
    return {
        "final_score": lead.score,
        "status": lead.classification,
        "summary": summary
    }
