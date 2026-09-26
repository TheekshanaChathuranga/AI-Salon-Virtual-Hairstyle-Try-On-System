# AI Salon Virtual Hairstyle Try-On System: REST API Specification

## Base URLs
* **Backend API Gateway:** `http://localhost:8000/api/v1`
* **ML Inference Microservice:** `http://localhost:8001/api/v1`

---

## 1. Customer Sessions & Consent

### Create Customer Session
* **POST** `/customers/session`
* **Description:** Initiates an anonymous customer try-on session with explicit GDPR/privacy consent.
* **Request:**
  ```json
  {
    "consent": true
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "session_id": "c7a83d42-2b31-419b-a3a8-48b598b0f27c",
    "session_token": "a1b2c3d4e5f6...64charToken",
    "consent_given": true,
    "created_at": "2026-09-26T15:00:00Z",
    "expires_at": "2026-09-27T15:00:00Z"
  }
  ```

---

## 2. Image Ingestion & Validation

### Upload Customer Photo
* **POST** `/images/upload`
* **Headers:** `Content-Type: multipart/form-data`
* **Payload:** `file: [binary image]`
* **Validation:** Enforces maximum size (10 MB), valid format (JPG/PNG/WEBP), single face detection, and blur/illumination checks.
* **Response (200 OK):**
  ```json
  {
    "image_id": "893c5be1-31cb-4670-8b4d-1763dd0bb129",
    "url": "/api/v1/images/893c5be1-31cb-4670-8b4d-1763dd0bb129.jpg",
    "filename": "893c5be1-31cb-4670-8b4d-1763dd0bb129.jpg",
    "size_bytes": 452819,
    "is_valid_face": true,
    "validation_message": "Photo passed quality and face detection checks."
  }
  ```

### Delete Photo (Instant Privacy Erasure)
* **DELETE** `/images/{filename}`
* **Description:** Immediately purges customer image from disk and database upon user request.
* **Response (200 OK):**
  ```json
  {
    "message": "Image permanently erased in compliance with privacy retention policy."
  }
  ```

---

## 3. Hairstyle Catalog

### List Hairstyles
* **GET** `/hairstyles`
* **Query Parameters:**
  * `category` (optional): `short` | `medium` | `long` | `special`
  * `length` (optional): `pixie` | `bob` | `shoulder` | `long`
  * `texture` (optional): `straight` | `wavy` | `curly` | `coily`
  * `search` (optional): string keyword search
* **Response (200 OK):** Array of `Hairstyle` objects.

---

## 4. Virtual Try-On Execution

### Submit Try-On Job
* **POST** `/try-on`
* **Request:**
  ```json
  {
    "session_token": "a1b2c3d4...",
    "hairstyle_id": "style-short-bob",
    "input_image_id_or_url": "/api/v1/images/customer.jpg",
    "selected_color": "blonde"
  }
  ```
* **Response (202 Accepted):**
  ```json
  {
    "id": "job-550e8400-e29b-41d4-a716-446655440000",
    "session_id": "c7a83d42...",
    "hairstyle_id": "style-short-bob",
    "selected_color": "blonde",
    "input_image_url": "/api/v1/images/customer.jpg",
    "output_image_url": "/api/v1/images/result_839a.jpg",
    "status": "COMPLETED",
    "model_name": "LocalVision-v1 [Seamless Poisson]",
    "processing_time_ms": 182,
    "created_at": "2026-09-26T15:01:00Z",
    "completed_at": "2026-09-26T15:01:01Z"
  }
  ```

---

## 5. Admin & Telemetry

### Admin Dashboard Stats
* **GET** `/admin/stats`
* **Response (200 OK):**
  ```json
  {
    "total_tryons": 148,
    "daily_tryons": 24,
    "popular_hairstyles": [
      { "name": "Chic Wavy Bob", "category": "short", "count": 64 },
      { "name": "Glossy Butterfly Cut", "category": "long", "count": 52 }
    ],
    "failed_generations": 2,
    "average_generation_time_ms": 185
  }
  ```
