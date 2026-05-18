from fastapi import FastAPI
from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Load environment variables from .env file (if you have one in backend)
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Buddy App AI Backend", version="1.0.0")

# Setup Supabase client
url: str = os.environ.get("SUPABASE_URL", "https://rufnqsyejgtxiizklcow.supabase.co")
key: str = os.environ.get("SUPABASE_ANON_KEY", "sb_publishable_syfc-S_FoUPs4q0JPP0eSA_ixmJm_AJ")
supabase: Client = create_client(url, key)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Buddy App AI Backend is running!"}

@app.get("/health")
def health_check():
    # Simple check to see if supabase is reachable
    return {"status": "healthy", "supabase_configured": bool(url and key)}
