from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from fastapi import Header, Request
import os
from dotenv import load_dotenv

load_dotenv()

# Use SQLite for local development to avoid PostgreSQL auth issues
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./flowforge_runner.db")

# For SQLite, we need to use check_same_thread=False
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db(request: Request = None):
    """
    Database dependency for FastAPI.
    Can be used directly or with Request parameter.
    """
    db = SessionLocal()
    try:
        # Set org context for RLS if header present
        if request:
            org_id = request.headers.get("X-Org-Id")
            if org_id:
                try:
                    db.execute(text(f"SET LOCAL app.org_id = '{org_id}'"))
                    db.commit()
                except Exception:
                    # SQLite doesn't support SET LOCAL, ignore
                    pass
        yield db
    finally:
        db.close()


