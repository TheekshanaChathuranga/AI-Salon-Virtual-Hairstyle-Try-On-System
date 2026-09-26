import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Download,
  Share2,
  Maximize2,
  Columns,
  SplitSquareVertical,
  Scissors,
  Trash2,
  Calendar,
  Sparkles,
  CheckCircle2,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Hairstyle } from '../types';

interface BeforeAfterSliderProps {
  originalUrl: string;
  resultUrl: string;
  hairstyle: Hairstyle;
  selectedColorName?: string;
  onTryAnother: () => void;
  onDeletePhoto: () => void;
  onBookStylist: () => void;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  originalUrl,
  resultUrl,
  hairstyle,
  selectedColorName,
  onTryAnother,
  onDeletePhoto,
  onBookStylist
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Trigger celebration confetti on mount
  useEffect(() => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#D4AF37', '#F3E5AB', '#FFFFFF']
    });
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedX = Math.max(0, Math.min(x, rect.width));
    const percentage = (clampedX / rect.width) * 100;
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3000);
  };

  const handleDownloadLookbook = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark luxury card backdrop
    ctx.fillStyle = '#0A0A0D';
    ctx.fillRect(0, 0, 1200, 700);

    // Header Branding
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 24px Playfair Display, serif';
    ctx.fillText('ATELIER COIFFURE • VIRTUAL TRY-ON LOOKBOOK', 50, 50);

    ctx.fillStyle = '#9E9EA8';
    ctx.font = '16px Outfit, sans-serif';
    ctx.fillText(`Style: ${hairstyle.name}  |  Shade: ${selectedColorName || 'Original Studio Tone'}`, 50, 80);

    // Draw images
    const imgOriginal = new Image();
    imgOriginal.crossOrigin = 'anonymous';
    imgOriginal.src = originalUrl;

    const imgResult = new Image();
    imgResult.crossOrigin = 'anonymous';
    imgResult.src = resultUrl;

    let loaded = 0;
    const checkDraw = () => {
      loaded++;
      if (loaded === 2) {
        ctx.drawImage(imgOriginal, 50, 110, 520, 520);
        ctx.drawImage(imgResult, 630, 110, 520, 520);

        // Labels
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(60, 580, 160, 36);
        ctx.fillRect(640, 580, 180, 36);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Outfit, sans-serif';
        ctx.fillText('ORIGINAL LOOK', 75, 604);
        ctx.fillStyle = '#D4AF37';
        ctx.fillText('AI SALON PREVIEW', 655, 604);

        // Download trigger
        const link = document.createElement('a');
        link.download = `atelier_salon_${hairstyle.id}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.click();
      }
    };

    imgOriginal.onload = checkDraw;
    imgResult.onload = checkDraw;
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px 0' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--gold-accent)" />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 600 }}>Your AI Hairstyle Transformation</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {hairstyle.name} • {selectedColorName || 'Natural Tone'} (Facial Identity 100% Preserved)
          </p>
        </div>

        {/* View Mode & Utility Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className={`pill-tab ${viewMode === 'slider' ? 'active' : ''}`}
            onClick={() => setViewMode('slider')}
            title="Interactive Slider Mode"
          >
            <SplitSquareVertical size={16} />
          </button>

          <button
            className={`pill-tab ${viewMode === 'side-by-side' ? 'active' : ''}`}
            onClick={() => setViewMode('side-by-side')}
            title="Side-by-Side Mode"
          >
            <Columns size={16} />
          </button>

          <button
            className="pill-tab"
            onClick={() => setIsFullscreen(true)}
            title="Fullscreen Modal"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      {viewMode === 'slider' ? (
        <div
          ref={containerRef}
          className="before-after-container glass-panel"
          style={{ width: '100%', height: '560px', cursor: 'ew-resize' }}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleMouseMove}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onTouchMove={handleTouchMove}
        >
          {/* AFTER Image (Full container) */}
          <img
            src={resultUrl}
            alt="AI Result"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              background: '#0D0D11'
            }}
          />

          {/* BEFORE Image (Clipped by slider position) */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: `${sliderPosition}%`,
            overflow: 'hidden',
            borderRight: '2px solid rgba(255, 255, 255, 0.9)'
          }}>
            <img
              src={originalUrl}
              alt="Customer Original"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: containerRef.current?.offsetWidth || '100%',
                height: '100%',
                objectFit: 'contain',
                background: '#0D0D11'
              }}
            />
            {/* Before Badge */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(8px)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.04em'
            }}>
              BEFORE (ORIGINAL)
            </div>
          </div>

          {/* After Badge */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.9), rgba(170, 130, 10, 0.9))',
            color: '#0A0A0D',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '0.04em'
          }}>
            AFTER (AI SALON)
          </div>

          {/* Slider Divider Bar and Handle */}
          <div
            className="slider-divider"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="slider-handle">
              <SplitSquareVertical size={18} />
            </div>
          </div>
        </div>
      ) : (
        /* Side by Side Mode */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '16px', position: 'relative' }}>
            <div style={{
              position: 'absolute',
              top: '28px',
              left: '28px',
              background: 'rgba(0,0,0,0.7)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 600
            }}>
              CUSTOMER ORIGINAL
            </div>
            <img
              src={originalUrl}
              alt="Original"
              style={{ width: '100%', height: '480px', objectFit: 'contain', borderRadius: '12px' }}
            />
          </div>

          <div className="glass-panel-gold" style={{ padding: '16px', position: 'relative' }}>
            <div style={{
              position: 'absolute',
              top: '28px',
              left: '28px',
              background: 'var(--gold-accent)',
              color: '#0A0A0D',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 700
            }}>
              AI SALON PREVIEW
            </div>
            <img
              src={resultUrl}
              alt="Result"
              style={{ width: '100%', height: '480px', objectFit: 'contain', borderRadius: '12px' }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '28px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Left Side: Try Another & Book */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-gold" onClick={onBookStylist}>
            <Calendar size={18} />
            <span>Book This Hairstyle</span>
          </button>

          <button className="btn-secondary" onClick={onTryAnother}>
            <Scissors size={18} />
            <span>Try Another Style</span>
          </button>
        </div>

        {/* Right Side: Download, Share, Privacy Erase */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={handleDownloadLookbook} title="Download Lookbook Card">
            <Download size={16} />
            <span>Download Card</span>
          </button>

          <button className="btn-secondary" onClick={handleShare} title="Share Link">
            {shareSuccess ? <CheckCircle2 size={16} color="#4ADE80" /> : <Share2 size={16} />}
            <span>{shareSuccess ? 'Link Copied!' : 'Share'}</span>
          </button>

          <button
            onClick={onDeletePhoto}
            title="Erase my photo from salon server immediately"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#F87171',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              padding: '12px 18px',
              borderRadius: '30px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem'
            }}
          >
            <Trash2 size={15} />
            <span>Delete Photo Now</span>
          </button>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {isFullscreen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.95)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px'
        }}>
          <button
            onClick={() => setIsFullscreen(false)}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={24} />
          </button>
          <img
            src={resultUrl}
            alt="Fullscreen AI Result"
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '12px' }}
          />
        </div>
      )}
    </div>
  );
};
