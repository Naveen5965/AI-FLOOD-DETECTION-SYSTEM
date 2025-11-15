"""Command-line interface for the Flood AI prototype."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Dict

from flood_ai.input_schema import ScenarioPayload
from flood_ai.workflow import FloodAssessmentService


def load_payload(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def main() -> None:
    parser = argparse.ArgumentParser(description="Flood detection and response prototype")
    parser.add_argument(
        "--input-file",
        type=Path,
        required=True,
        help="Path to a JSON file matching the ScenarioPayload schema",
    )
    args = parser.parse_args()

    payload_dict = load_payload(args.input_file)
    scenario = ScenarioPayload(**payload_dict)
    assessment = FloodAssessmentService().assess(scenario)
    print(json.dumps(assessment.to_dict(), indent=2))


if __name__ == "__main__":
    main()

