from pathlib import Path
import json

from flood_ai.input_schema import ScenarioPayload
from flood_ai.workflow import FloodAssessmentService


def test_assessment_runs():
    sample_path = Path(__file__).resolve().parents[1] / "sample_inputs" / "pune_extreme_monsoon.json"
    payload = json.loads(sample_path.read_text())
    scenario = ScenarioPayload(**payload)
    result = FloodAssessmentService().assess(scenario)
    assert result.risk.score >= 0
    assert result.risk.band in {band for band in result.risk.band.__class__}
    assert result.actions
    assert result.risk.drivers
    assert len(result.risk.drivers) <= 3


def test_history_records_assessments():
    sample_path = Path(__file__).resolve().parents[1] / "sample_inputs" / "pune_extreme_monsoon.json"
    payload = json.loads(sample_path.read_text())
    scenario = ScenarioPayload(**payload)
    service = FloodAssessmentService()
    service.assess(scenario)
    history = service.history(limit=5)
    assert len(history) == 1
    entry = history[0]
    assert entry["district"] == "Pune"

