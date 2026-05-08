from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.lead_model import Lead, LeadCreate, LeadResponse
from utils.csv_parser import parse_leads_csv

router = APIRouter()

@router.post("/upload-csv", response_model=dict)
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    content = await file.read()
    leads_data = parse_leads_csv(content)
    
    added_count = 0
    for lead_data in leads_data:
        # Check if phone already exists
        existing = db.query(Lead).filter(Lead.phone == lead_data['phone']).first()
        if not existing:
            new_lead = Lead(**lead_data)
            db.add(new_lead)
            added_count += 1
            
    db.commit()
    return {"message": "CSV uploaded successfully", "leads_added": added_count}

@router.post("/add", response_model=LeadResponse)
def add_lead(lead: LeadCreate, db: Session = Depends(get_db)):
    existing = db.query(Lead).filter(Lead.phone == lead.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="Lead with this phone number already exists")
        
    new_lead = Lead(**lead.model_dump())
    db.add(new_lead)
    db.commit()
    db.refresh(new_lead)
    return new_lead

@router.get("/", response_model=List[LeadResponse])
def get_leads(db: Session = Depends(get_db)):
    leads = db.query(Lead).all()
    return leads
