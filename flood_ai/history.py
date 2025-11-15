"""In-memory assessment ledger for quick situational awareness dashboards."""

from __future__ import annotations

from collections import deque
from dataclasses import dataclass, asdict
from datetime import datetime
from typing import Deque, Dict, List

from .scoring import FloodRiskResult


@dataclass
class HistoryEntry:
    timestamp: datetime
    district: str
    state: str
    score: float
    band: str
    confidence: float

    def to_dict(self) -> Dict[str, str | float]:
        payload = asdict(self)
        payload["timestamp"] = self.timestamp.isoformat()
        return payload


class HistoryLedger:
    def __init__(self, capacity: int = 20):
        self.capacity = capacity
        self._entries: Deque[HistoryEntry] = deque(maxlen=capacity)

    def add(self, result: FloodRiskResult) -> HistoryEntry:
        entry = HistoryEntry(
            timestamp=result.scenario.timestamp,
            district=result.scenario.district,
            state=result.scenario.state,
            score=result.score,
            band=result.band.value,
            confidence=result.confidence,
        )
        self._entries.appendleft(entry)
        return entry

    def list(self, limit: int | None = None) -> List[Dict[str, str | float]]:
        entries = list(self._entries)
        if limit:
            entries = entries[:limit]
        return [entry.to_dict() for entry in entries]

