from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from fastapi import Header, Request
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://flowforge:flowforge@localhost:5432/flowforge")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db(request: Request = None):
    db = SessionLocal()
    try:
        # Set org context for RLS if header present
        if request:
            org_id = request.headers.get("X-Org-Id")
            if org_id:
                db.execute(text(f"SET LOCAL app.org_id = '{org_id}'"))
                db.commit()
        yield db
    finally:
        db.close()


