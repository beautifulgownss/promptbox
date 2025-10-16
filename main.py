from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uuid
from datetime import datetime

app = FastAPI(title="PromptBox API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage
prompts_db = []
templates_db = [
    {
        "id": "1",
        "name": "Marketing Email",
        "category": "Business",
        "description": "Create engaging marketing emails",
        "template": "Write a marketing email for {product} that highlights {key_benefits}. The target audience is {audience} and the call to action should be {cta}.",
        "variables": [
            {"name": "product", "type": "text", "required": True, "description": "Name of the product or service"},
            {"name": "key_benefits", "type": "text", "required": True, "description": "Main benefits to highlight"},
            {"name": "audience", "type": "text", "required": False, "description": "Target audience"},
            {"name": "cta", "type": "text", "required": True, "description": "Call to action"}
        ]
    }
]

class PromptCreate(BaseModel):
    title: str
    content: str
    tags: List[str] = []

@app.get("/")
async def root():
    return {"message": "PromptBox API is running"}

@app.get("/prompts/")
async def get_prompts():
    return prompts_db

@app.post("/prompts/")
async def create_prompt(prompt: PromptCreate):
    new_prompt = {
        "id": str(uuid.uuid4()),
        "title": prompt.title,
        "content": prompt.content,
        "tags": prompt.tags,
        "created_at": datetime.now().isoformat()
    }
    prompts_db.append(new_prompt)
    return new_prompt

@app.get("/templates")
async def get_templates():
    return templates_db

@app.post("/test/")
async def run_test(test_request: dict):
    # Mock implementation
    results = []
    for variation in test_request["variations"]:
        results.append({
            "variation_name": variation["name"],
            "prompt_content": variation["content"],
            "llm_response": f"Mock response for '{test_request['test_input']}' using {variation['name']}",
            "model": "gemini-pro",
            "latency": 0.5
        })
    return {"results": results}

@app.get("/prompts/{prompt_id}/versions")
async def get_prompt_versions(prompt_id: str):
    return []

@app.post("/prompts/{prompt_id}/versions")
async def create_prompt_version(prompt_id: str, version_data: dict):
    return {"message": "Version created successfully"}
