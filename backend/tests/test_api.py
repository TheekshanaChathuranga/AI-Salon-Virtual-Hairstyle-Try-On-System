import os
import sys
from fastapi.testclient import TestClient

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.database import Base, engine, SessionLocal
from app.services.seed_data import seed_database

client = TestClient(app)

def setup_module():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    db.close()

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_customer_session_creation():
    # Negative test: without consent
    res_no_consent = client.post("/api/v1/customers/session", json={"consent": False})
    assert res_no_consent.status_code == 400

    # Positive test: with consent
    res_consent = client.post("/api/v1/customers/session", json={"consent": True})
    assert res_consent.status_code == 201
    data = res_consent.json()
    assert "session_token" in data
    assert data["consent_given"] is True

def test_hairstyles_catalog():
    # Fetch all
    response = client.get("/api/v1/hairstyles")
    assert response.status_code == 200
    styles = response.json()
    assert len(styles) >= 8

    # Filter by category 'short'
    res_short = client.get("/api/v1/hairstyles?category=short")
    assert res_short.status_code == 200
    short_styles = res_short.json()
    assert all(s["category"] == "short" for s in short_styles)

    # Filter by category 'long'
    res_long = client.get("/api/v1/hairstyles?category=long")
    assert res_long.status_code == 200
    long_styles = res_long.json()
    assert all(s["category"] == "long" for s in long_styles)

def test_admin_stats():
    response = client.get("/api/v1/admin/stats")
    assert response.status_code == 200
    stats = response.json()
    assert "total_tryons" in stats
    assert "popular_hairstyles" in stats

if __name__ == "__main__":
    setup_module()
    test_health()
    test_customer_session_creation()
    test_hairstyles_catalog()
    test_admin_stats()
    print("All backend API tests passed successfully!")
