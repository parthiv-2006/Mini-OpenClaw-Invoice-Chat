from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from parser import extract_text_from_pdf, clean_extracted_text
from rag import build_query_engine

app = FastAPI(title="Mini-Moltbot Backend")

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure temp directory exists
os.makedirs("temp", exist_ok=True)

# Global state to hold our active RAG brain
app.state.query_engine = None

@app.get("/")
def read_root():
    return {"message": "Welcome to Mini-Moltbot Backend"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    
    file_path = f"temp/{file.filename}"
    try:
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
            
        print(f"--- File saved to {file_path}. Initiating text extraction... ---")
        
        # Phase 2: Extract and Clean Text
        raw_text = extract_text_from_pdf(file_path)
        cleaned_text = clean_extracted_text(raw_text)
        
        print("--- Extracted and Cleaned Text ---")
        print(cleaned_text[:500] + "..." if len(cleaned_text) > 500 else cleaned_text)
        print("-----------------------------------")
        
        # Phase 3: Build the RAG Query Engine
        print("--- Building AI Brain ---")
        try:
            app.state.query_engine = build_query_engine(cleaned_text)
        except Exception as e:
            # Catch the missing API key error specifically so the frontend doesn't crash on Phase 1/2
            print(f"FAILED TO BUILD AI BRAIN: {e}")
            return {
                "message": "File parsed but AI failed to initialize (Missing API Key?)",
                "filename": file.filename,
                "error": str(e)
            }
        
        return {
            "message": "File successfully uploaded, parsed, and AI initialized!", 
            "filename": file.filename, 
            "path": file_path,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
