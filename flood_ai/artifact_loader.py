"""Utilities for loading pre-trained artifacts shipped with the prototype."""

from __future__ import annotations

import os
import warnings
from functools import lru_cache
from pathlib import Path
from typing import Any, Sequence, cast

from joblib import load as joblib_load  # type: ignore[attr-defined]

from .surrogate import SurrogateRegressor

ARTIFACT_DIR_ENV = "FLOOD_AI_ARTIFACT_DIR"


def _default_artifact_dir() -> Path:
    return Path(__file__).resolve().parents[1]


def resolve_artifact_dir() -> Path:
    custom = os.getenv(ARTIFACT_DIR_ENV)
    if custom:
        custom_path = Path(custom).expanduser().resolve()
        if not custom_path.exists():
            raise FileNotFoundError(f"Artifact directory '{custom_path}' does not exist")
        return custom_path
    return _default_artifact_dir()


@lru_cache(maxsize=1)
def load_feature_names(path: Path | None = None) -> Sequence[str]:
    artifact_dir = path or resolve_artifact_dir()
    file_path = artifact_dir / "feature_names.pkl"
    if not file_path.exists():
        raise FileNotFoundError(f"Missing feature name artifact at {file_path}")
    raw_names = cast(Sequence[Any], joblib_load(file_path))
    if not isinstance(raw_names, (list, tuple)):
        raise ValueError("feature_names.pkl must contain a sequence of strings")
    normalized = [str(name) for name in raw_names]
    return normalized


@lru_cache(maxsize=1)
def load_scaler(path: Path | None = None) -> Any:
    artifact_dir = path or resolve_artifact_dir()
    scaler_path = artifact_dir / "flood_scaler.pkl"
    if not scaler_path.exists():
        raise FileNotFoundError(f"Missing scaler artifact at {scaler_path}")
    return joblib_load(scaler_path)


@lru_cache(maxsize=1)
def load_model(path: Path | None = None, force_surrogate: bool = True) -> Any:
    """Load the flood model, optionally forcing surrogate heuristic model.
    
    Args:
        path: Optional custom artifact directory
        force_surrogate: If True, always use surrogate model (default for prototype)
    """
    artifact_dir = path or resolve_artifact_dir()
    model_path = artifact_dir / "flood_model.pkl"
    
    # Use surrogate by default since trained model has quality issues
    if force_surrogate:
        warnings.warn(
            "Using surrogate heuristic scorer for demonstration. "
            "The original trained model produces constant predictions and needs retraining.",
            RuntimeWarning,
        )
        feature_names = list(load_feature_names())
        return SurrogateRegressor(feature_names)
    
    if not model_path.exists():
        raise FileNotFoundError(f"Missing model artifact at {model_path}")
    try:
        return joblib_load(model_path, mmap_mode="r")
    except (TypeError, MemoryError):
        try:
            return joblib_load(model_path)
        except MemoryError:
            warnings.warn(
                "Original flood model could not be loaded due to memory limits. "
                "Using surrogate heuristic scorer instead; deploy the official model "
                "on a machine with more RAM for production use.",
                RuntimeWarning,
            )
            feature_names = list(load_feature_names())
            return SurrogateRegressor(feature_names)

