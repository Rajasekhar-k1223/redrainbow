"""
CORS verification tests.
Run: pytest tests/test_cors.py -v
"""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app, raise_server_exceptions=False)

ORIGIN = "http://localhost:5174"


def test_preflight_returns_cors_header():
    """Browser sends OPTIONS before POST; response must include ACAO header."""
    res = client.options(
        "/auth/token",
        headers={
            "Origin": ORIGIN,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert res.headers.get("access-control-allow-origin") == ORIGIN, (
        f"Expected ACAO header '{ORIGIN}', got: {res.headers.get('access-control-allow-origin')}"
    )
    assert res.status_code in (200, 204)


def test_actual_request_returns_cors_header():
    """A real POST (bad creds) must still carry ACAO header – not just preflight."""
    res = client.post(
        "/auth/token",
        data={"username": "nobody", "password": "wrong"},
        headers={"Origin": ORIGIN},
    )
    assert res.headers.get("access-control-allow-origin") == ORIGIN, (
        f"Expected ACAO header '{ORIGIN}', got: {res.headers.get('access-control-allow-origin')}"
    )


def test_unlisted_origin_is_blocked():
    """Requests from an unknown origin must NOT receive an ACAO header."""
    evil_origin = "http://evil.example.com"
    res = client.options(
        "/auth/token",
        headers={
            "Origin": evil_origin,
            "Access-Control-Request-Method": "POST",
        },
    )
    acao = res.headers.get("access-control-allow-origin", "")
    assert acao != evil_origin, (
        f"Security issue: ACAO header should not allow '{evil_origin}'"
    )


def test_health_cors_header():
    """/health should also return CORS header for cross-origin monitoring."""
    res = client.get("/health", headers={"Origin": ORIGIN})
    assert res.headers.get("access-control-allow-origin") == ORIGIN
    assert res.json() == {"status": "ok"}
