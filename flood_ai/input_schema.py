"""Scenario definition and validation logic."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict, Sequence

from pydantic import BaseModel, ConfigDict, Field

FEATURE_DESC = """Each feature is expected to be a normalized score between 0 and 100 "\
"capturing structural, climatic, and governance factors defined by the Govt. of India."""


class ScenarioPayload(BaseModel):
    MonsoonIntensity: float = Field(..., ge=0, le=100, description=FEATURE_DESC)
    TopographyDrainage: float = Field(..., ge=0, le=100)
    RiverManagement: float = Field(..., ge=0, le=100)
    Deforestation: float = Field(..., ge=0, le=100)
    Urbanization: float = Field(..., ge=0, le=100)
    ClimateChange: float = Field(..., ge=0, le=100)
    DamsQuality: float = Field(..., ge=0, le=100)
    Siltation: float = Field(..., ge=0, le=100)
    AgriculturalPractices: float = Field(..., ge=0, le=100)
    Encroachments: float = Field(..., ge=0, le=100)
    IneffectiveDisasterPreparedness: float = Field(..., ge=0, le=100)
    DrainageSystems: float = Field(..., ge=0, le=100)
    CoastalVulnerability: float = Field(..., ge=0, le=100)
    Landslides: float = Field(..., ge=0, le=100)
    Watersheds: float = Field(..., ge=0, le=100)
    DeterioratingInfrastructure: float = Field(..., ge=0, le=100)
    PopulationScore: float = Field(..., ge=0, le=100)
    WetlandLoss: float = Field(..., ge=0, le=100)
    InadequatePlanning: float = Field(..., ge=0, le=100)
    PoliticalFactors: float = Field(..., ge=0, le=100)

    district: str = Field(..., description="Administrative district or region code")
    state: str = Field(..., description="State/UT name for routing")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(str_strip_whitespace=True)

    def vector(self, ordered_features: Sequence[str]) -> Sequence[float]:
        payload = self.model_dump()
        return [float(payload[name]) for name in ordered_features]


