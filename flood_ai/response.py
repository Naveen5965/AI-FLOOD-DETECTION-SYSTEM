"""Rule-based response orchestration tuned for Indian disaster-management workflows."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List

from .scoring import FloodRiskResult, RiskBand


@dataclass
class ResponseAction:
    agency: str
    priority: str
    description: str


class ResponseEngine:
    def __init__(self):
        self.playbook: Dict[RiskBand, List[ResponseAction]] = {
            RiskBand.LOW: [
                ResponseAction(
                    agency="IMD",
                    priority="Routine",
                    description="Continue synoptic monitoring and share 6-hourly advisories",
                ),
                ResponseAction(
                    agency="State Water Resources",
                    priority="Routine",
                    description="Audit local embankments; prep de-silting teams",
                ),
            ],
            RiskBand.MODERATE: [
                ResponseAction(
                    agency="SDMA",
                    priority="High",
                    description="Activate district EOCs and ensure mock evacuation drill readiness",
                ),
                ResponseAction(
                    agency="CWC",
                    priority="High",
                    description="Increase telemetry frequency for upstream reservoirs",
                ),
            ],
            RiskBand.HIGH: [
                ResponseAction(
                    agency="NDRF",
                    priority="Critical",
                    description="Pre-position boats, divers, and medical teams within 2 hours",
                ),
                ResponseAction(
                    agency="Ministry of Jal Shakti",
                    priority="Critical",
                    description="Issue gate-operation advisories for interstate dams",
                ),
            ],
            RiskBand.SEVERE: [
                ResponseAction(
                    agency="Cabinet Committee on Security",
                    priority="Emergency",
                    description="Coordinate airlift assets and inter-state resource pooling",
                ),
                ResponseAction(
                    agency="NDMA",
                    priority="Emergency",
                    description="Broadcast multi-lingual evacuation orders via SANCHAR network",
                ),
            ],
        }

    def recommend(self, result: FloodRiskResult) -> List[ResponseAction]:
        base_actions = list(self.playbook[result.band])
        # Add contextual note for densely populated districts
        if result.scenario.PopulationScore > 70 and result.band in {RiskBand.HIGH, RiskBand.SEVERE}:
            base_actions.append(
                ResponseAction(
                    agency="MoHFW",
                    priority="Emergency",
                    description="Deploy mobile health units and epidemic surveillance teams",
                )
            )
        return base_actions

