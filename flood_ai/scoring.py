"""Risk scoring logic built on top of pre-trained ML artifacts."""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from statistics import pstdev
from typing import Dict, Sequence

import numpy as np
import pandas as pd
from numpy.typing import NDArray

from .artifact_loader import load_feature_names, load_model, load_scaler
from .input_schema import ScenarioPayload
from .surrogate import SurrogateRegressor


Vector = NDArray[np.float64]


class RiskBand(str, Enum):
    LOW = "Low"
    MODERATE = "Moderate"
    HIGH = "High"
    SEVERE = "Severe"


@dataclass
class FloodRiskResult:
    score: float
    band: RiskBand
    confidence: float
    feature_order: Sequence[str]
    scenario: ScenarioPayload
    drivers: Sequence[Dict[str, float]]

    def to_dict(self) -> Dict[str, object]:
        return {
            "score": round(self.score, 2),
            "band": self.band.value,
            "confidence": round(self.confidence, 2),
            "district": self.scenario.district,
            "state": self.scenario.state,
            "timestamp": self.scenario.timestamp.isoformat(),
            "drivers": self.drivers,
        }


class FloodRiskScorer:
    def __init__(self):
        self.feature_names: list[str] = list(load_feature_names())
        self.scaler = load_scaler()
        self.model = load_model()
        self.uses_surrogate = isinstance(self.model, SurrogateRegressor)
        self.feature_importances = getattr(self.model, "feature_importances_", None)
        # Model outputs 0-1 range, so thresholds should match
        self.thresholds: Dict[RiskBand, tuple[float, float]] = {
            RiskBand.LOW: (0, 0.25),
            RiskBand.MODERATE: (0.25, 0.50),
            RiskBand.HIGH: (0.50, 0.75),
            RiskBand.SEVERE: (0.75, 1.01),
        }

    def _band_for_score(self, score: float) -> RiskBand:
        for band, (low, high) in self.thresholds.items():
            if low <= score < high:
                return band
        return RiskBand.SEVERE

    def _confidence(self, sample: Vector) -> float:
        estimators = getattr(self.model, "estimators_", None)
        if not estimators:
            return 0.65
        tree_scores = [est.predict(sample)[0] for est in estimators]
        return max(0.0, 100.0 - pstdev(tree_scores))

    def _drivers(self, vector: Vector) -> Sequence[Dict[str, float]]:
        if self.feature_importances is None:
            return []
        importances = np.asarray(self.feature_importances)
        if importances.size != vector.size:
            return []
        baseline = 50.0
        contributions = importances * np.abs(vector - baseline)
        top_idx = np.argsort(contributions)[::-1][:3]
        drivers: list[Dict[str, float]] = []
        for idx in top_idx:
            if contributions[idx] <= 0:
                continue
            drivers.append(
                {
                    "feature": self.feature_names[idx],
                    "score": round(float(vector[idx]), 2),
                    "impact": round(float(contributions[idx]), 2),
                }
            )
        return drivers

    def score(self, scenario: ScenarioPayload) -> FloodRiskResult:
        vector: Vector = np.asarray(scenario.vector(self.feature_names), dtype=float)
        if self.uses_surrogate:
            sample = vector.reshape(1, -1)
            prediction = float(self.model.predict(sample)[0])
            confidence = self._confidence(sample)
        else:
            frame = pd.DataFrame([vector], columns=list(self.feature_names))
            scaled = self.scaler.transform(frame)
            prediction = float(self.model.predict(scaled)[0])
            confidence = self._confidence(scaled)
        band = self._band_for_score(prediction)
        drivers = self._drivers(vector)
        return FloodRiskResult(
            score=prediction,
            band=band,
            confidence=confidence,
            feature_order=self.feature_names,
            scenario=scenario,
            drivers=drivers,
        )

