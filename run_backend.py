import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.main import app
from app.core.config import settings

if __name__ == "__main__":
    import uvicorn
    print(f"Starting Railway Passenger Help Desk API on http://{settings.HOST}:{settings.PORT}")
    uvicorn.run("app.main:app", host="127.0.0.1", port=settings.PORT, reload=True)

