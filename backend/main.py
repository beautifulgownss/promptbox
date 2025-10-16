import os
import time
from typing import Callable, Optional, Tuple

import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from openai import OpenAI
from pydantic import BaseModel

app = FastAPI()


class ABRequest(BaseModel):
    input: str
    variantA_id: str
    variantB_id: str


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

openai_client: Optional[OpenAI] = None
gemini_model: Optional[genai.GenerativeModel] = None

if OPENAI_API_KEY:
    openai_client = OpenAI(api_key=OPENAI_API_KEY)

if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
    gemini_model = genai.GenerativeModel("gemini-1.5-pro-latest")


def call_openai_model(prompt: str) -> Tuple[str, Optional[float], Optional[int]]:
    if not openai_client:
        raise RuntimeError("OpenAI client not configured.")

    start = time.perf_counter()
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
    )
    latency_ms = (time.perf_counter() - start) * 1000.0

    message = ""
    if response.choices:
        first_choice = response.choices[0]
        if first_choice.message and first_choice.message.content:
            message = first_choice.message.content.strip()

    tokens_used: Optional[int] = None
    usage = getattr(response, "usage", None)
    if usage is not None:
        tokens_used = getattr(usage, "total_tokens", None)

    return message, latency_ms, tokens_used


def call_gemini_model(prompt: str) -> Tuple[str, Optional[float], Optional[int]]:
    if not gemini_model:
        raise RuntimeError("Gemini client not configured.")

    start = time.perf_counter()
    response = gemini_model.generate_content(prompt)
    latency_ms = (time.perf_counter() - start) * 1000.0

    text = ""
    if hasattr(response, "text") and response.text:
        text = response.text.strip()

    tokens_used: Optional[int] = None
    usage = getattr(response, "usage_metadata", None)
    if usage is not None:
        tokens_used = getattr(usage, "total_token_count", None)
        if tokens_used is None:
            prompt_tokens = getattr(usage, "prompt_token_count", None) or 0
            candidate_tokens = getattr(usage, "candidates_token_count", None) or 0
            total = prompt_tokens + candidate_tokens
            tokens_used = total if total > 0 else None

    return text, latency_ms, tokens_used


def resolve_runner(variant_id: str) -> Callable[[str], Tuple[str, Optional[float], Optional[int]]]:
    normalized = (variant_id or "").strip().lower()

    if normalized in {"gpt", "openai", "gpt-4o-mini", "gpt4o-mini", "gpt4o"}:
        return call_openai_model
    if normalized in {"gemini", "google", "gemini-1.5-pro-latest", "gemini15"}:
        return call_gemini_model

    raise HTTPException(status_code=400, detail=f"Unsupported variant: {variant_id}")


def pick_winner(latency_a: Optional[float], latency_b: Optional[float]) -> str:
    if latency_a is None and latency_b is None:
        return "A"
    if latency_a is None:
        return "B"
    if latency_b is None:
        return "A"
    return "A" if latency_a <= latency_b else "B"


@app.post("/api/abtest")
def run_abtest(request: ABRequest):
    if not request.input.strip():
        raise HTTPException(status_code=400, detail="Input prompt text is required.")

    try:
        runner_a = resolve_runner(request.variantA_id)
    except HTTPException:
        runner_a = call_openai_model

    try:
        runner_b = resolve_runner(request.variantB_id)
    except HTTPException:
        runner_b = call_gemini_model

    try:
        response_a, latency_a, tokens_a = runner_a(request.input)
    except Exception as exc:
        response_a = f"Error generating response: {exc}"
        latency_a = None
        tokens_a = None

    try:
        response_b, latency_b, tokens_b = runner_b(request.input)
    except Exception as exc:
        response_b = f"Error generating response: {exc}"
        latency_b = None
        tokens_b = None

    winner = pick_winner(latency_a, latency_b)

    return {
        "responseA": response_a,
        "responseB": response_b,
        "metrics": {
            "latencyA": round(latency_a, 2) if latency_a is not None else None,
            "latencyB": round(latency_b, 2) if latency_b is not None else None,
            "tokensA": tokens_a,
            "tokensB": tokens_b,
            "winner": winner,
        },
    }
