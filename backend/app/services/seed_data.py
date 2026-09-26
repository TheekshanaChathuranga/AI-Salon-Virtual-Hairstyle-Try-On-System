"""
Database Seeding Script for Salon Hairstyle Catalog.
Populates standard salon categories: Short, Medium, Long, Special.
"""

from sqlalchemy.orm import Session
from app.models import Hairstyle, User

DEFAULT_HAIRSTYLES = [
    # --- Short ---
    {
        "id": "style-short-bob",
        "name": "Chic Wavy Bob",
        "description": "Textured side-parted modern bob with soft natural waves.",
        "category": "short",
        "length": "bob",
        "texture": "wavy",
        "reference_image_url": "/static/hairstyles/blonde_bob.jpg",
        "thumbnail_url": "/static/hairstyles/blonde_bob.jpg",
        "tags": ["trendy", "modern", "low-maintenance", "blonde"],
        "active": True
    },
    {
        "id": "style-short-pixie",
        "name": "Classic Pixie Cut",
        "description": "Bold, elegant short pixie cropped close to the temples with textured crown.",
        "category": "short",
        "length": "pixie",
        "texture": "straight",
        "reference_image_url": "/static/hairstyles/blonde_bob.jpg",
        "thumbnail_url": "/static/hairstyles/blonde_bob.jpg",
        "tags": ["bold", "sharp", "timeless", "summer"],
        "active": True
    },
    {
        "id": "style-short-curly",
        "name": "Curly French Bob",
        "description": "Chin-length textured curly bob with playful volume and curtain framing.",
        "category": "short",
        "length": "bob",
        "texture": "curly",
        "reference_image_url": "/static/hairstyles/blonde_bob.jpg",
        "thumbnail_url": "/static/hairstyles/blonde_bob.jpg",
        "tags": ["bouncy", "vintage", "volume"],
        "active": True
    },
    # --- Medium ---
    {
        "id": "style-med-wolf",
        "name": "Signature Wolf Cut",
        "description": "Edgy medium-length shag with choppy crown layers and wispy face-framing strands.",
        "category": "medium",
        "length": "shoulder",
        "texture": "wavy",
        "reference_image_url": "/static/hairstyles/blonde_bob.jpg",
        "thumbnail_url": "/static/hairstyles/blonde_bob.jpg",
        "tags": ["rocker", "youthful", "layered"],
        "active": True
    },
    {
        "id": "style-med-curtain",
        "name": "Curtain Layered Lob",
        "description": "Sophisticated shoulder-skimming long bob featuring gentle curtain layers.",
        "category": "medium",
        "length": "shoulder",
        "texture": "straight",
        "reference_image_url": "/static/hairstyles/blonde_bob.jpg",
        "thumbnail_url": "/static/hairstyles/blonde_bob.jpg",
        "tags": ["effortless", "face-flattering", "versatile"],
        "active": True
    },
    # --- Long ---
    {
        "id": "style-long-butterfly",
        "name": "Glossy Butterfly Cut",
        "description": "Cascading multi-tiered layers with sweeping butterfly wings and voluminous body.",
        "category": "long",
        "length": "long",
        "texture": "wavy",
        "reference_image_url": "/static/hairstyles/auburn_long.jpg",
        "thumbnail_url": "/static/hairstyles/auburn_long.jpg",
        "tags": ["glamorous", "full-volume", "burgundy", "viral"],
        "active": True
    },
    {
        "id": "style-long-curly",
        "name": "Cascading Mermaid Curls",
        "description": "Dramatic waist-length defined spiraled curls with luminous shine.",
        "category": "long",
        "length": "long",
        "texture": "curly",
        "reference_image_url": "/static/hairstyles/auburn_long.jpg",
        "thumbnail_url": "/static/hairstyles/auburn_long.jpg",
        "tags": ["dramatic", "romantic", "red-carpet"],
        "active": True
    },
    # --- Special ---
    {
        "id": "style-spec-bridal",
        "name": "Romantic Bridal Updo",
        "description": "Intricate softly pinned bridal crown chignon with romantic loose tendrils.",
        "category": "special",
        "length": "shoulder",
        "texture": "wavy",
        "reference_image_url": "/static/hairstyles/auburn_long.jpg",
        "thumbnail_url": "/static/hairstyles/auburn_long.jpg",
        "tags": ["bridal", "wedding", "formal", "couture"],
        "active": True
    },
    {
        "id": "style-spec-party",
        "name": "Hollywood Glamour Waves",
        "description": "High-shine side-swept retro red carpet wave styling.",
        "category": "special",
        "length": "long",
        "texture": "wavy",
        "reference_image_url": "/static/hairstyles/auburn_long.jpg",
        "thumbnail_url": "/static/hairstyles/auburn_long.jpg",
        "tags": ["evening", "glam", "vip", "retro"],
        "active": True
    }
]

def seed_database(db: Session):
    # Check if hairstyles already seeded
    existing_count = db.query(Hairstyle).count()
    if existing_count == 0:
        for item in DEFAULT_HAIRSTYLES:
            h = Hairstyle(**item)
            db.add(h)
        db.commit()
        print(f"[Seed] Successfully seeded {len(DEFAULT_HAIRSTYLES)} catalog hairstyles.")

    # Create default admin user if none exists
    admin_exists = db.query(User).filter(User.email == "admin@salon.ai").first()
    if not admin_exists:
        admin_user = User(
            id="admin-001",
            email="admin@salon.ai",
            password_hash="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW", # bcrypt 'admin123'
            role="admin"
        )
        db.add(admin_user)
        db.commit()
        print("[Seed] Seeded default admin user (admin@salon.ai).")
