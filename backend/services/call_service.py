from sqlalchemy.orm import Session
from models.lead_model import Lead

def start_all_calls(db: Session):
    """
    Simulates starting calls for all pending leads.
    Processes leads in priority order (latest first).
    """
    pending_leads = db.query(Lead).filter(Lead.call_status == "pending").order_by(Lead.created_at.desc()).all()
    
    for lead in pending_leads:
        lead.call_status = "ongoing"
        
    db.commit()
    return {"message": f"Started calls for {len(pending_leads)} leads", "leads_processed": len(pending_leads)}

def stop_all_calls(db: Session):
    """
    Simulates stopping all ongoing calls.
    """
    ongoing_leads = db.query(Lead).filter(Lead.call_status == "ongoing").all()
    
    for lead in ongoing_leads:
        lead.call_status = "completed"
        # Simulate WhatsApp message if lead needs follow up
        if lead.needs_followup:
            print(f"[SIMULATION] Sending WhatsApp message to WARM lead: {lead.phone}")
            
    db.commit()
    return {"message": f"Stopped calls for {len(ongoing_leads)} leads"}

def start_single_call(db: Session, lead_id: int):
    """
    Starts a call for a single lead.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        return {"error": "Lead not found"}
        
    lead.call_status = "ongoing"
    db.commit()
    return {"message": f"Started call for lead {lead_id}"}
