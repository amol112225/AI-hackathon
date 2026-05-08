from sqlalchemy.orm import Session
from models.lead_model import Lead

def score_lead_message(db: Session, lead: Lead, message: str):
    """
    Scores lead based on keywords.
    earn, interested, how -> increase score
    later, not interested -> decrease score
    """
    msg_lower = message.lower()
    score_change = 0
    
    positive_keywords = ["earn", "interested", "how", "tell me more", "yes"]
    negative_keywords = ["later", "not interested", "no", "busy", "stop"]
    
    for word in positive_keywords:
        if word in msg_lower:
            score_change += 10
            
    for word in negative_keywords:
        if word in msg_lower:
            score_change -= 10
            
    # Update score
    lead.score += score_change
    
    # Cap score
    if lead.score > 100:
        lead.score = 100
    if lead.score < 0:
        lead.score = 0
        
    # Update classification
    if lead.score > 70:
        lead.classification = "HOT"
    elif lead.score >= 40:
        lead.classification = "WARM"
    else:
        lead.classification = "COLD"
        
    # Update followup flag
    if lead.classification == "WARM":
        lead.needs_followup = True
    else:
        lead.needs_followup = False
        
    db.commit()
    db.refresh(lead)
    return lead
