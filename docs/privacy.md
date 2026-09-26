# Privacy, Data Protection & Image Retention Policy

## 1. Principles of Customer Privacy

Customer face photographs are sensitive biometric information. The **AI Salon Virtual Hairstyle Try-On System** adheres to a zero-trust, privacy-by-design architecture:

1. **Explicit Consent Required:**
   Before access is granted to device cameras or photo uploads, customers must actively check the consent box. Without consent, the backend API rejects all session creation requests with `400 Bad Request`.
2. **Ephemeral Storage & 24-Hour Auto-Purge:**
   * Customer images are saved under randomized UUID4 filenames (`uuid.uuid4()`), entirely decoupled from customer identity, email, or IP address.
   * `IMAGE_RETENTION_HOURS=24`: A background service automatically prunes and permanently deletes from disk all uploaded and generated photographs exceeding 24 hours.
3. **Immediate Customer Deletion Right:**
   * An explicit "Delete Photo Now" button is prominently displayed on the Before/After interface. Clicking it issues a `DELETE /api/v1/images/{filename}` request that erases the file from disk immediately.
4. **No Permanent Public Exposure:**
   * Customer uploads are served through authenticated or restricted endpoints and are never indexed by web crawlers or CDNs.
5. **No Image Data in Logs:**
   * Raw base64 image strings, file byte dumps, or image paths with PII are strictly prohibited from application logs.
6. **No Model Training on Customer Photos:**
   * Customer photos are never stored in training sets or used for model fine-tuning without explicit, separately signed enterprise agreements.
