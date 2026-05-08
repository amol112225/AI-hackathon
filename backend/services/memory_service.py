from sqlalchemy.orm import Session
from models.call_model import Conversation
import datetime

def add_message(db: Session, lead_id: int, role: str, message: str):
    """Stores a message in the conversation history."""
    db_message = Conversation(
        lead_id=lead_id,
        role=role,
        message=message,
        timestamp=datetime.datetime.utcnow()
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_conversation_history(db: Session, lead_id: int):
    """Retrieves the full conversation history for a lead."""
    return db.query(Conversation).filter(Conversation.lead_id == lead_id).order_by(Conversation.timestamp.asc()).all()

def format_history_for_llm(db: Session, lead_id: int):
    """Formats history for OpenAI API."""
    history = get_conversation_history(db, lead_id)
    return [{"role": msg.role, "content": msg.message} for msg in history]
