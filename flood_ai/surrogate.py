"""Lightweight heuristic model used when the full RandomForest cannot be loaded."""

from __future__ import annotations

import numpy as np

FEATURE_WEIGHTS = {
    "MonsoonIntensity": 0.18,
    "TopographyDrainage": -0.08,
    "RiverManagement": -0.09,
    "Deforestation": 0.10,
    "Urbanization": 0.12,
    "ClimateChange": 0.08,
    "DamsQuality": -0.06,
    "Siltation": 0.14,
    "AgriculturalPractices": 0.04,
    "Encroachments": 0.08,
    "IneffectiveDisasterPreparedness": 0.10,
    "DrainageSystems": -0.08,
    "CoastalVulnerability": 0.09,
    "Landslides": 0.07,
    "Watersheds": -0.05,
    "InfrastructureDecay": 0.08,
    "PopulationScore": 0.11,
    "WetlandLoss": 0.07,
    "InadequatePlanning": 0.10,
    "PoliticalFactors": 0.03,
}


class _StubEstimator:
    def __init__(self, offset: float):
        self.offset = offset

    def predict(self, sample: np.ndarray) -> np.ndarray:
        base = sample.mean(axis=1)
        # Return in 0-1 range to match real model output
        return np.clip((base + self.offset) / 100.0, 0, 1.0)


class SurrogateRegressor:
    def __init__(self, feature_order: list[str]):
        self.feature_order = feature_order
        self.estimators_ = [_StubEstimator(offset) for offset in (-5, 0, 5)]
        # approximate feature importances from the heuristic weights (absolute, normalized)
        weights = [abs(FEATURE_WEIGHTS.get(name, 0.0)) for name in feature_order]
        total = sum(weights) or 1.0
        import numpy as _np

        self.feature_importances_ = _np.array([w / total for w in weights])

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Predict flood risk scores using weighted heuristic.
        
        Returns scores in 0-1 range with realistic variation based on features.
        """
        weights = np.array([FEATURE_WEIGHTS.get(name, 0.0) for name in self.feature_order])
        
        # Weighted contribution from each feature (normalized to 0-1 scale)
        weighted = np.dot(X / 100.0, weights)
        
        # Base score from overall feature average
        baseline = X.mean(axis=1) / 100.0
        
        # Combine weighted and baseline (60% weighted, 40% baseline)
        combined = 0.6 * weighted + 0.4 * baseline
        
        # Apply slight non-linearity to spread scores better
        # High values get pushed higher, low values stay lower
        adjusted = combined + 0.15 * (combined - 0.5) ** 2
        
        # Clip to valid range 0-1
        return np.clip(adjusted, 0.1, 0.95)

