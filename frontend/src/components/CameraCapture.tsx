import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, CheckCircle2, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { ApiService } from '../services/api';
import type { ValidationFeedback } from '../types';

interface CameraCaptureProps {
  onPhotoSelected: (photoUrl: string) => void;
  consentGiven: boolean;
  setConsentGiven: (c: boolean) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onPhotoSelected,
  consentGiven,
  setConsentGiven
}) => {
  const [mode, setMode] = useState<'upload' | 'camera'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validation, setValidation] = useState<ValidationFeedback | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setMode('camera');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1024 }, height: { ideal: 1024 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      alert("Unable to access camera. Please allow webcam permissions or upload a photo instead.");
      setMode('upload');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1024;
    canvas.height = videoRef.current.videoHeight || 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally for natural mirror feel
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      if (blob) {
        const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
        processFile(file);
      }
    }, 'image/jpeg', 0.95);

    stopCamera();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setIsValidating(true);
    setValidation(null);

    // Immediate client preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Call validation API
    const res = await ApiService.uploadCustomerPhoto(file);
    setValidation(res.validation);
    setIsValidating(false);

    if (res.validation.valid) {
      onPhotoSelected(res.url);
    }
  };

  const useDemoModel = () => {
    setPreviewUrl('/models/customer_demo.jpg');
    setValidation({
      valid: true,
      message: 'Salon test customer photo verified (sharp focus, centered frontal orientation).'
    });
    onPhotoSelected('/models/customer_demo.jpg');
  };

  const retakePhoto = () => {
    setPreviewUrl(null);
    setValidation(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (mode === 'camera') startCamera();
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '8px' }}>
          Step 1: Capture or Upload Your Portrait
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Please face forward with your hair visible. We use biometric boundary detection to preserve your exact facial features.
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
        <button
          className={`pill-tab ${mode === 'upload' ? 'active' : ''}`}
          onClick={() => { stopCamera(); setMode('upload'); }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Upload size={16} />
          <span>Upload Image</span>
        </button>

        <button
          className={`pill-tab ${mode === 'camera' ? 'active' : ''}`}
          onClick={startCamera}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Camera size={16} />
          <span>Use Web / Mobile Camera</span>
        </button>

        <button
          onClick={useDemoModel}
          className="pill-tab"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border-gold)' }}
        >
          <Sparkles size={16} color="var(--gold-accent)" />
          <span>Load Test Model Demo</span>
        </button>
      </div>

      {/* Visual Workspace: Camera or Upload */}
      <div style={{
        position: 'relative',
        background: '#0D0D11',
        borderRadius: '16px',
        overflow: 'hidden',
        minHeight: '380px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px dashed var(--border-subtle)',
        marginBottom: '24px'
      }}>
        {/* State A: Photo Previewing */}
        {previewUrl ? (
          <div style={{ position: 'relative', width: '100%', maxHeight: '480px', display: 'flex', justifyContent: 'center' }}>
            <img
              src={previewUrl}
              alt="Customer Portrait Preview"
              style={{ maxHeight: '460px', width: 'auto', borderRadius: '12px', objectFit: 'contain' }}
            />
            <button
              onClick={retakePhoto}
              className="btn-secondary"
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(8px)',
                padding: '8px 16px',
                fontSize: '0.85rem'
              }}
            >
              <RefreshCw size={14} />
              <span>Retake / Change Photo</span>
            </button>
          </div>
        ) : mode === 'camera' && cameraActive ? (
          /* State B: Live Camera Stream with Face Oval Guide */
          <div style={{ position: 'relative', width: '100%', height: '420px', display: 'flex', justifyContent: 'center' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
            />
            {/* Oval Face Guide */}
            <div className="camera-face-guide">
              <span style={{
                position: 'absolute',
                top: '-26px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '0.72rem',
                color: 'var(--gold-accent)',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap'
              }}>
                ALIGN FACE HERE
              </span>
            </div>

            <button
              onClick={captureCameraPhoto}
              className="btn-gold"
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '12px 28px'
              }}
            >
              <Camera size={18} />
              <span>Capture Photo</span>
            </button>
          </div>
        ) : (
          /* State C: Drag & Drop Upload Zone */
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="user"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(212, 175, 55, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: 'var(--gold-accent)'
            }}>
              <Upload size={28} />
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px' }}>
              Drag and drop your selfie or photo here
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Supports JPG, PNG, WEBP up to 10MB
            </div>
            <button className="btn-secondary" style={{ pointerEvents: 'none' }}>
              Select Photo from Device
            </button>
          </div>
        )}
      </div>

      {/* Validation Feedback Banner */}
      {isValidating && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 18px',
          borderRadius: '12px',
          background: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid var(--border-gold)',
          marginBottom: '20px'
        }}>
          <RefreshCw size={16} className="spin" color="var(--gold-accent)" />
          <span style={{ fontSize: '0.88rem' }}>
            Analyzing photo quality, face alignment, and illumination...
          </span>
        </div>
      )}

      {validation && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 18px',
          borderRadius: '12px',
          background: validation.valid ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${validation.valid ? 'rgba(74, 222, 128, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          marginBottom: '20px'
        }}>
          {validation.valid ? (
            <CheckCircle2 size={18} color="#4ADE80" />
          ) : (
            <AlertCircle size={18} color="#EF4444" />
          )}
          <span style={{ fontSize: '0.88rem', color: validation.valid ? '#4ADE80' : '#FCA5A5' }}>
            {validation.message}
          </span>
        </div>
      )}

      {/* Explicit GDPR & Privacy Consent Banner */}
      <div style={{
        padding: '16px',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <input
          type="checkbox"
          id="privacy-consent"
          checked={consentGiven}
          onChange={e => setConsentGiven(e.target.checked)}
          style={{ marginTop: '4px', accentColor: 'var(--gold-accent)', cursor: 'pointer', width: '16px', height: '16px' }}
        />
        <label htmlFor="privacy-consent" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer', lineHeight: 1.4 }}>
          <strong style={{ color: '#FFFFFF' }}>Privacy & Data Protection Consent: </strong>
          I explicitly consent to temporary AI processing of my photograph solely for virtual hairstyle simulation. 
          I understand my photo is stored ephemerally and automatically scrubbed after 24 hours, and I can delete it instantly at any time.
        </label>
      </div>
    </div>
  );
};
