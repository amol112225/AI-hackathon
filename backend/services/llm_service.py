import os
import json
from openai import OpenAI
from sqlalchemy.orm import Session
from models.lead_model import Lead
from services.memory_service import add_message, format_history_for_llm
from services.scoring_service import score_lead_message
from dotenv import load_dotenv

load_dotenv()

# Setup client dynamically based on .env
if os.getenv("GROQ_API_KEY"):
    client = OpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key=os.getenv("GROQ_API_KEY")
    )
    MODEL_NAME = "llama-3.1-8b-instant"  # Fast model on Groq
elif os.getenv("OPENAI_API_KEY") and os.getenv("OPENAI_API_KEY") != "ollama":
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    MODEL_NAME = "gpt-3.5-turbo"
else:
    # Connect to local Ollama instance
    client = OpenAI(
        base_url="http://localhost:11434/v1",
        api_key="ollama"
    )
    MODEL_NAME = "llama3"

def detect_language(text):
    text = text.lower()
    hindi_words = ["kya", "hai", "nahi", "haan", "mujhe", "sir", "toh", "kaise", "mera", "accha", "baat", "karna", "nahi"]
    
    for word in hindi_words:
        if word in text:
            return "Hinglish (mix of Hindi and English)"
    return "English"

def build_prompt(detected_language):

    return f"""
You are AP Hunter, an AI sales agent for Rupeezy AP Program.

The user is speaking in: {detected_language}
You MUST dynamically match their language.

Your ONLY goal:
Convince the lead to join Rupeezy as an Authorized Partner.

Main Benefits:
- Zero joining fee
- 100% brokerage share
- Daily payouts
- Dedicated RM support

Rules:
- Speak naturally like human caller
- Use Hinglish naturally
- Keep replies short (1-3 sentences)
- Always ask follow-up questions
- Handle objections naturally
- Never sound robotic
- Never answer unrelated questions
- Stay focused on Rupeezy AP Program

Objection Examples:

If user says:
"I already work with another broker"

Reply naturally like:
"That’s great sir. Aapko waha 100% brokerage aur daily payout milta hai kya?"

If user says:
"I don't have enough contacts"

Reply naturally like:
"Sir initially even 10–15 clients are enough to start."

If user says:
"Is Rupeezy trustworthy?"

Reply naturally like:
"Ji sir, Rupeezy already multiple partners ke saath kaam kar raha hai."

If user asks unrelated things:
Reply:
"Sir, main specifically Rupeezy AP Program ke baare mein assist karta hoon."

Your goal:
Build trust and convert the lead naturally.
"""

def generate_greeting(db: Session, lead: Lead):
    greeting_text = f"Hello, am I speaking with {lead.name}?"
    # Store AI greeting
    add_message(db, lead.id, role="assistant", message=greeting_text)
    return {"message": greeting_text}

def generate_response(db: Session, lead: Lead, user_message: str):
    # 1. Store user message in memory
    add_message(db, lead.id, role="user", message=user_message)
    
    # 2. Score lead based on user message
    score_lead_message(db, lead, user_message)
    
    # 3. Generate dynamic prompt with language detection
    language = detect_language(user_message)
    prompt = build_prompt(language)
    
    # 4. Retrieve conversation history
    messages = [{"role": "system", "content": prompt}]
    history = format_history_for_llm(db, lead.id)
    messages.extend(history)
    
    # 5. Call LLM directly without hardcoded keyword intercepts
    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            max_tokens=150,
            temperature=0.7
        )
        ai_response_text = response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error calling LLM: {str(e)}")
        fallback_msg = "Sir, meri aawaz aa rahi hai aapko?" if language == "Hinglish (mix of Hindi and English)" else "Are you able to hear me clearly?"
        ai_response_text = fallback_msg
    
    # 6. Store AI response
    add_message(db, lead.id, role="assistant", message=ai_response_text)
    
    return {
        "response": ai_response_text,
        "score": lead.score,
        "status": lead.classification
    }

def generate_summary(db: Session, lead_id: int):
    # Retrieve conversation history
    history = format_history_for_llm(db, lead_id)
    if not history:
        return {"key_points": [], "objections": [], "next_action": "No conversation found"}
    
    prompt = "Summarize the following conversation between a user and an AI agent (AP Hunter). "
    prompt += "Extract the key points discussed, any objections raised by the user, and the recommended next action for follow-up.\n\n"
    prompt += "Format your response as strict JSON with keys: 'key_points' (list of strings), 'objections' (list of strings), and 'next_action' (string).\n\n"
    prompt += "Conversation:\n"
    for msg in history:
        prompt += f"{msg['role']}: {msg['content']}\n"
        
    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            max_tokens=200,
            temperature=0.3
        )
        summary_data = json.loads(response.choices[0].message.content)
        return summary_data
    except Exception as e:
        return {"key_points": ["Error generating summary"], "objections": [str(e)], "next_action": "Check logs"}
