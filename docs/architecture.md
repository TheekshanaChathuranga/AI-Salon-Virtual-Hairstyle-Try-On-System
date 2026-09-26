# AI Salon Virtual Hairstyle Try-On System: System Architecture Document

## 1. High-Level Architecture Overview

The **AI Salon Virtual Hairstyle Try-On System** is structured as an enterprise-grade, microservice-oriented application designed to handle compute-intensive neural network inference, asynchronous job orchestration, salon catalog management, and privacy-compliant customer image handling.

```
                      +------------------------------------+
                      |     Salon Customer / Mobile Web    |
                      |    (React + Vite + Tailwind CSS)   |
                      +-----------------+------------------+
                                        |
                                        | HTTPS / REST / Upload
                                        v
                      +-----------------+------------------+
                      |         Reverse Proxy              |
                      |            (Nginx)                 |
                      +-----------------+------------------+
                                        |
                   +--------------------+--------------------+
                   |                                         |
                   v                                         v
    +------------------------------+          +------------------------------+
    |         Backend API          |          |      Static Asset / CDN      |
    |      (Python FastAPI)        |          |    (Uploads, Hairstyle Lib)  |
    +--------------+---------------+          +------------------------------+
                   |
         +---------+---------+
         |                   |
         v                   v
+-----------------+ +-------------------+
|   PostgreSQL    | |  Encrypted Object |
| (Metadata/Jobs) | |  Storage (Disk/S3)|
+-----------------+ +-------------------+
         |
         | Internal Async Job Dispatch / HTTP
         v
+-----------------------------------------------------------+
|               ML Inference Microservice                   |
|                   (Python FastAPI)                        |
|                                                           |
|  +-----------------------------------------------------+  |
|  |             Preprocessing & Validation              |  |
|  |  - OpenCV Face & Landmark Detection (Haar/DNN)      |  |
|  |  - Quality Check (Blur, Illumination, Multi-Face)  |  |
|  |  - Crop, Align & Normalization                      |  |
|  +---------------------------+-------------------------+  |
|                              |                            |
|  +---------------------------v-------------------------+  |
|  |            Hairstyle Transfer Abstraction           |  |
|  |                                                     |  |
|  |  +--------------------+   +----------------------+  |  |
|  |  | HairFastGANAdapter |   |  StableHairAdapter   |  |  |
|  |  +--------------------+   +----------------------+  |  |
|  |  +--------------------+   +----------------------+  |  |
|  |  | LocalVisionAdapter |   | RemoteWorkerAdapter  |  |  |
|  |  +--------------------+   +----------------------+  |  |
|  +---------------------------+-------------------------+  |
|                              |                            |
|  +---------------------------v-------------------------+  |
|  |           Post-processing & Color Blending          |  |
|  |  - Hair Region Mask Extraction                      |  |
|  |  - LAB/HSV Hair Color Grading Engine                |  |
|  |  - Poisson Boundary Blending & Sharpening           |  |
|  +-----------------------------------------------------+  |
+-----------------------------------------------------------+
```

---

## 2. Component Breakdown

### 2.1 Frontend Application (`/frontend`)
* **Technology:** React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons, Canvas API.
* **Key Modules:**
  * **Interactive Camera & Upload Module:** Supports device camera streaming with an intuitive face positioning guide oval, file upload, file validation, and real-time client-side preview.
  * **Hairstyle Catalog Explorer:** Categorized by length (Short, Medium, Long), occasion (Bridal, Party, Trendy), texture (Curly, Wavy, Straight).
  * **Color Palette Selector:** Hair dye shade selector (Natural Black, Dark Brown, Honey Blonde, Burgundy, Rose Gold, Auburn, Silver Ash, Custom Hex).
  * **Interactive Before/After Comparison:** Dual-view modes:
    1. Smooth slider comparison (drag divider).
    2. Side-by-side synchronized zoom/pan.
    3. Fullscreen modal.
  * **Salon Booking CTA & Share:** Download high-resolution lookbook card, generate consultation QR/link for the stylist.
  * **Admin Dashboard (`/admin`):** Catalog CRUD, try-on job analytics, latency metrics, error telemetry.

### 2.2 Backend API Gateway (`/backend`)
* **Technology:** Python FastAPI, SQLAlchemy, Pydantic v2, Alembic, Uvicorn.
* **Responsibilities:**
  * Customer anonymous session management (cookie / UUID token-based).
  * Secure image upload validation (magic bytes verification, dimension constraints, virus/executable check).
  * Hairstyle catalog database CRUD and filtering.
  * Asynchronous Try-On job orchestration (state machine: `QUEUED` -> `PROCESSING` -> `COMPLETED` / `FAILED`).
  * Auto-expiry retention cleanup service (cron-based purging of customer photos past `IMAGE_RETENTION_HOURS=24`).
  * Admin authentication (JWT with bcrypt password hashing).

### 2.3 ML Inference Microservice (`/ml-service`)
* **Technology:** Python 3.10+, PyTorch, Torchvision, OpenCV, NumPy, Pillow.
* **Responsibilities:**
  * **Face Detection & Image Validation Pipeline:**
    * Checks if at least one face is present.
    * Rejects multiple primary faces.
    * Evaluates Laplacian variance for blur detection (`variance > 100`).
    * Evaluates luminance histogram to reject underexposed/overexposed photos.
    * Evaluates yaw/pitch angle to ensure frontal or near-frontal orientation.
  * **Modular Adapter Layer:**
    * Implements `HairstyleTransferModel` base class.
    * `HairFastGANAdapter`: High-speed StyleGAN2 FS-space inversion & generation for dedicated GPU nodes.
    * `StableHairAdapter`: Diffusion-based two-stage generation for complex unaligned poses.
    * `LocalVisionAdapter`: High-precision facial landmark alignment, hair mask segmentation, alpha compositing, and HSV/LAB color manipulation (enabling standalone local testing, CPU fallback, and edge deployment).
  * **Color Adjustment Engine:**
    * Disentangles hair transfer from hair coloration.
    * Applies realistic hair tinting via luminance-preserving color transforms in CIELAB color space.

---

## 3. Database Schema (PostgreSQL)

```sql
-- Hairstyles Catalog
CREATE TABLE hairstyles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'short', 'medium', 'long', 'special'
    length VARCHAR(50) NOT NULL,   -- 'pixie', 'bob', 'shoulder', 'long'
    texture VARCHAR(50) NOT NULL,  -- 'straight', 'wavy', 'curly', 'coily'
    reference_image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500) NOT NULL,
    tags JSONB DEFAULT '[]',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Anonymous Customer Sessions
CREATE TABLE customer_sessions (
    id VARCHAR(36) PRIMARY KEY,
    session_token VARCHAR(128) UNIQUE NOT NULL,
    consent_given BOOLEAN DEFAULT FALSE,
    consent_timestamp TIMESTAMP WITH TIME ZONE,
    ip_hash VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Virtual Try-On Jobs
CREATE TABLE tryon_jobs (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) REFERENCES customer_sessions(id) ON DELETE CASCADE,
    hairstyle_id VARCHAR(36) REFERENCES hairstyles(id) ON DELETE SET NULL,
    selected_color VARCHAR(30), -- 'natural_black', 'blonde', etc.
    input_image_path VARCHAR(500) NOT NULL,
    output_image_path VARCHAR(500),
    status VARCHAR(20) NOT NULL, -- 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'
    model_name VARCHAR(50) NOT NULL,
    processing_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL -- for automatic deletion
);

-- Admin Users
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System & Audit Logs
CREATE TABLE system_logs (
    id BIGSERIAL PRIMARY KEY,
    level VARCHAR(10) NOT NULL,
    service VARCHAR(30) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Privacy, Security & Data Retention Architecture

1. **Explicit Customer Consent:**
   * Before opening the camera or accepting photo upload, the customer must check a consent box agreeing to temporary AI processing for virtual try-on.
2. **Ephemeral File Storage:**
   * Customer photos are saved with cryptographically secure random UUIDs (`uuid.uuid4()`), never with user-provided filenames.
   * Uploaded and generated images are strictly isolated in a private directory with no direct public indexing.
   * Background cleaner task runs hourly and removes any file older than `IMAGE_RETENTION_HOURS` (default: 24h).
   * Customer can click "Delete My Photo Now", instantly scrubbing input and output images from disk and database.
3. **No Image Logging:**
   * File bytes and base64 strings are explicitly masked from application logs. Only metadata (`job_id`, `latency_ms`, `resolution`) is logged.
4. **Input Sanitization:**
   * Uploads are verified via Pillow/OpenCV image header inspection.
   * Non-image MIME types, SVG (which can contain embedded JavaScript), and executables are rejected with HTTP 415.
   * Max upload payload restricted to 10 MB.

---

## 5. Deployment & Container Topology

```yaml
services:
  nginx:
    ports: ["80:80", "443:443"]
    depends_on: [frontend, backend]

  frontend:
    build: ./frontend
    expose: ["3000"]

  backend:
    build: ./backend
    expose: ["8000"]
    environment:
      - DATABASE_URL=postgresql://salon:salonpass@postgres:5432/salondb
      - ML_SERVICE_URL=http://ml-service:8001
      - IMAGE_RETENTION_HOURS=24
    depends_on: [postgres, ml-service]

  ml-service:
    build: ./ml-service
    expose: ["8001"]
    environment:
      - MODEL_ADAPTER=hairfastgan # or localvision, stablehair
      - DEVICE=cuda # or cpu
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
```
