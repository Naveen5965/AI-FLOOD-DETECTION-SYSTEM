"""Lightweight persistence for assessments using SQLite.

This module provides a tiny sync-backed API to store and retrieve
assessment JSON blobs. It keeps dependencies minimal and is intended
for prototyping; a production deployment should replace this with
PostgreSQL or another managed DB with proper migrations.
"""

from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Dict, Iterable, List

DB_PATH = Path(__file__).resolve().parents[1] / "assessments.db"


def _ensure_db(conn: sqlite3.Connection) -> None:
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            district TEXT,
            state TEXT,
            timestamp TEXT,
            payload TEXT
        )
        """
    )


def save_assessment(record: Dict) -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    try:
        _ensure_db(conn)
        conn.execute(
            "INSERT INTO assessments (district, state, timestamp, payload) VALUES (?, ?, ?, ?)",
            (record.get("risk", {}).get("district"), record.get("risk", {}).get("state"), record.get("risk", {}).get("timestamp"), json.dumps(record)),
        )
        conn.commit()
    finally:
        conn.close()


def list_assessments(limit: int = 100) -> List[Dict]:
    conn = sqlite3.connect(DB_PATH)
    try:
        _ensure_db(conn)
        cur = conn.execute("SELECT id, district, state, timestamp, payload FROM assessments ORDER BY id DESC LIMIT ?", (limit,))
        rows = cur.fetchall()
        results: List[Dict] = []
        for _id, district, state, timestamp, payload in rows:
            try:
                parsed = json.loads(payload)
            except Exception:
                parsed = {"raw": payload}
            results.append({"id": _id, "district": district, "state": state, "timestamp": timestamp, "assessment": parsed})
        return results
    finally:
        conn.close()

