from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from parser import extract_text_from_pdf, clean_extracted_text

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
        
        return {
            "message": "File successfully uploaded and parsed", 
            "filename": file.filename, 
            "path": file_path,
            "parsed_text_preview": cleaned_text[:100] + "..."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
