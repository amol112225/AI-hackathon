# AI-for-Bharat

Autonomous Lead Conversion and Management System.

## Project Structure

- `backend/`: FastAPI server handling lead management, AI logic, and PostgreSQL database.
- `frontend/`: Vite + React application for the user interface.

## Getting Started

### Backend Setup
1. Navigate to the `backend` directory.
2. Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Configure your `DATABASE_URL` and `OPENAI_API_KEY` in `.env`.
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Technologies Used
- **Frontend**: React, Vite, Vanilla CSS.
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL (Cloud-ready), Ollama/OpenAI.
