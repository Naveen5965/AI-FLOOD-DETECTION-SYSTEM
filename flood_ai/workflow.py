"""Top-level orchestration of scoring + response to deliver actionable assessments."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict

from .history import HistoryLedger
from .input_schema import ScenarioPayload
from .response import ResponseEngine
from .scoring import FloodRiskResult, FloodRiskScorer
from .storage import save_assessment, list_assessments


@dataclass
class FloodAssessment:
    risk: FloodRiskResult
    actions: Dict[str, str]

    def to_dict(self) -> Dict[str, object]:
        return {
            "risk": self.risk.to_dict(),
            "actions": self.actions,
        }


class FloodAssessmentService:
    def __init__(self):
        self.scorer = FloodRiskScorer()
        self.response_engine = ResponseEngine()
        self.ledger = HistoryLedger(capacity=30)

    def assess(self, payload: ScenarioPayload) -> FloodAssessment:
        result = self.scorer.score(payload)
        actions = {
            action.agency: f"{action.priority}: {action.description}"
            for action in self.response_engine.recommend(result)
        }
        assessment = FloodAssessment(risk=result, actions=actions)
        # keep an in-memory ledger for quick UI views
        self.ledger.add(result)
        # persist full assessment for audit/history (non-fatal)
        try:
            save_assessment(assessment.to_dict())
        except Exception:
            # best-effort only in prototype
            pass
        return assessment

    def history(self, limit: int | None = None):
        # prefer persisted history but guard tests and dev runs by returning
        # the in-memory ledger if persisted storage contains older entries
        try:
            if limit is None:
                limit = 30
            persisted = list_assessments(limit=limit)
            mem = self.ledger.list(limit=limit)
            # if persisted contains more items than this process's memory ledger,
            # it likely includes older runs — return the memory ledger for a clean view
            if len(persisted) > len(mem):
                return mem
            return persisted
        except Exception:
            return self.ledger.list(limit=limit)

