"""FastAPI service exposing the flood assessment pipeline."""

from __future__ import annotations

import os
from pathlib import Path
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse

from flood_ai.input_schema import ScenarioPayload
from flood_ai.workflow import FloodAssessmentService

app = FastAPI(title="GoI Flood AI Prototype", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
service = FloodAssessmentService()

# Mount the static web UI at root (development convenience)
web_dir = Path(__file__).parent / "web"
app.mount("/static", StaticFiles(directory=str(web_dir)), name="static")


@app.get("/")
async def root_index():
    return RedirectResponse(url="/static/home.html")


@app.post("/assess")
async def assess(payload: ScenarioPayload):
    return service.assess(payload).to_dict()


@app.get("/history")
async def history(limit: int | None = Query(default=10, ge=1, le=30)):
    return {"items": service.history(limit=limit)}

