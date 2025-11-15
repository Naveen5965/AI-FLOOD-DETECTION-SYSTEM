# Government of India Flood AI Prototype

This prototype pairs the uploaded RandomForest flood-risk model with a rules-driven response
playbook so NDMA/SDMA teams can run what-if simulations, surface explainable scores, and
trigger coordinated actions.

## Features

- ✅ Validated scenario intake for the 20 policy/environment features shared by MoWR.
- ✅ Automatic scaling + RandomForest inference using the supplied pickled artifacts.
- ✅ Risk banding (Low/Moderate/High/Severe) with a confidence heuristic derived from tree variance.
- ✅ Explainable outputs that list the top three drivers for each scenario using model feature importances.
- ✅ Response playbook that maps risk bands to multi-agency callouts (IMD, NDRF, NDMA, etc.).
- ✅ CLI for quick experimentation plus a FastAPI endpoint (`/assess`) for integration with national dashboards.
- ✅ Built-in assessment ledger (`/history`) that surfaces recent runs for dashboards or SITREPs.
- ✅ Interactive web console with real-time map visualization showing risk markers across India.
- ✅ Comprehensive coverage: 150+ districts across all 28 states and 8 union territories.

## Project layout

```text
flood_ai/
  artifact_loader.py   # handles loading of pickled feature names, scaler, and model
  input_schema.py      # Pydantic schema + validation helpers for district scenarios
  scoring.py           # wraps scaler + RandomForest for flood severity scoring
  response.py          # rule-based actions aligned to GoI command structure
  workflow.py          # combines scoring and response for end-to-end assessments
cli.py                 # command-line entry point
api.py                 # FastAPI service exposing POST /assess
sample_inputs/         # ready-to-use test payloads
requirements.txt
```

## Setup

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

> The artifacts (`flood_model.pkl`, `flood_scaler.pkl`, `feature_names.pkl`) are expected to stay in the project root. Override with `FLOOD_AI_ARTIFACT_DIR` if you relocate them.

## CLI usage

```powershell
python cli.py --input-file sample_inputs\pune_extreme_monsoon.json
```

Example response:

```json
{
  "risk": {
    "score": 68.12,
    "band": "High",
    "confidence": 93.4,
    "district": "Pune",
    "state": "Maharashtra",
    "timestamp": "2025-11-15T12:15:00Z",
    "drivers": [
      {"feature": "MonsoonIntensity", "score": 82, "impact": 9.6},
      {"feature": "PopulationScore", "score": 78, "impact": 5.3},
      {"feature": "Urbanization", "score": 74, "impact": 4.7}
    ]
  },
  "actions": {
    "NDRF": "Critical: Pre-position boats, divers, and medical teams within 2 hours",
    "Ministry of Jal Shakti": "Critical: Issue gate-operation advisories for interstate dams",
    "MoHFW": "Emergency: Deploy mobile health units and epidemic surveillance teams"
  }
}
```

## API usage

Run the service:

```powershell
uvicorn api:app --reload
```

Call the endpoint:

```powershell
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/assess -Body (Get-Content sample_inputs\pune_extreme_monsoon.json) -ContentType "application/json"
```

Fetch recent assessments:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/history?limit=5"
```

## Web console

Launch the FastAPI server, then serve the static site (any simple server works):

```powershell
uvicorn api:app --reload
python -m http.server 5500 --directory web
```

Open `http://localhost:5500` to access the Flood Intelligence Console. The site dynamically builds all 20 feature sliders, calls `POST /assess`, and visualizes risk, confidence, top drivers, and recommended actions. CORS is enabled by default for local development; tighten `allow_origins` in `api.py` before deploying to production.

## Testing / validation

A quick smoke test is to run the CLI with one of the sample payloads. For automated validation, add `pytest` scenarios that instantiate `ScenarioPayload` and assert the returned band.

> **Note on warnings**: The bundled model/scaler were trained with scikit-learn 1.6.x so loading them on 1.7.x triggers `InconsistentVersionWarning`. These are expected in this prototype and do not affect functionality.

## Next steps

- Wire IMD, CWC, and state alert channels via SMS/e-mail gateways.
- Add a data persistence layer (PostgreSQL/Azure Cosmos) for audit trails.
- Integrate SHAP/ELI5 for richer model explainability at the feature level.
