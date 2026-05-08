from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import leads, calls, summary, transcript

# Create all database tables (Cloud-ready: creates tables if they don't exist)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AP Hunter AI Voice Agent", description="FastAPI Backend for AI Voice Agent System")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(leads.router, prefix="/leads", tags=["Leads"])
app.include_router(calls.router, prefix="/calls", tags=["Calls"])
app.include_router(transcript.router, prefix="/transcript", tags=["Transcript"])
app.include_router(summary.router, prefix="/summary", tags=["Summary"])

@app.get("/")
def read_root():
    return {"message": "Welcome to AP Hunter AI Voice Agent API"}
