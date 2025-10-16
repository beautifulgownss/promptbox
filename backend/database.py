from sqlalchemy import create_engine, Column, String, Text, DateTime, ForeignKey, JSON, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
import os

DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Prompt(Base):
    __tablename__ = "prompts"
    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    tags = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship to versions
    versions = relationship("PromptVersion", back_populates="prompt", cascade="all, delete-orphan")

class PromptVersion(Base):
    __tablename__ = "prompt_versions"
    id = Column(String, primary_key=True, index=True)
    prompt_id = Column(String, ForeignKey("prompts.id"))
    version_number = Column(Integer)
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    note = Column(Text)  # Optional note about what changed
    
    # Relationship back to prompt
    prompt = relationship("Prompt", back_populates="versions")

class TestRun(Base):
    __tablename__ = "test_runs"
    id = Column(String, primary_key=True, index=True)
    prompt_id = Column(String, ForeignKey("prompts.id"))
    input_text = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

Base.metadata.create_all(bind=engine)
